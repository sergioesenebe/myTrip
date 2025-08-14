//Import external libraries
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

//Import internal libraries
const connectToDB = require('../config/db');
const authenticateJWT = require('../middlewares/auth');
const Trip = require('../models/Trips');

//Route for upload a trip
router.post('/', authenticateJWT, async (req, res) => {
    //Try catch, to take the errors
    try {
        //Connect to the database
        await connectToDB();
        //Check if name of the trip, country and the city, have been added
        if (!req.body.name || req.body.name.trim() === '' || !req.body.country || req.body.country.trim() === '' || !req.body.city || req.body.city.trim() === '') {
            return res.status(400).json({ message: 'Please make sure to fill in all fields' });
        }
        //Check if name of the trip, country and the city, have been added
        const { name = '', country = '', city = '', description = '' } = req.body;
        if (name.length > 150 || country.length > 100 || city.length > 120 || description.length > 2000) {
            return res.status(400).json({ message: 'Please ensure that you do not add data that is too long' });
        }
        //By default there is an empty array of places
        const places = [];
        //Cehck if it's a valid Array, if not return a message
        if (!Array.isArray(req.body.places)) {
            return res.status(400).json({ message: 'Places must be an array' });
        }
        //Check if there aren't an empty name and save the data
        for (const place of req.body.places) {
            if (!place.name || place.name.trim() === '')
                return res.status(400).json({ message: 'Please make sure to fill in all place fields' });
            places.push({
                name: place.name.trim() || '',
                image: place.image.trim() || '',
                description: place.description.trim() || ''
            })
        }
        //Insert the new Trip
        const newTrip = new Trip({
            name: req.body.name.trim(),
            country: req.body.country.trim(),
            city: req.body.city.trim(),
            image: req.body.image.trim(),
            description: req.body.description.trim(),
            writer: req.user.id,
            places: places,
        });
        //Save the trip
        await newTrip.save();
        //Show a message
        return res.status(201).json({ message: 'Trip created' });
    }
    //Catch the error and send a message
    catch (err) {
        console.error('Error uploading a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})

//Router to get the three most interesting trips
router.get('/interesting', async (req, res) => {
    try {
        //Connect to the database
        await connectToDB();
        //Get the three trips with more likes
        const interestingTrips = await Trip.aggregate([
            { $addFields: { likesCount: { $size: '$likes' } } },
            { $sort: { likesCount: -1 } },
            { $limit: 3 }
        ])
        //If there is no interesting trips return a message
        if (interestingTrips.length === 0)
            return res.status(200).json({ message: 'There is not interesting trips', data: [] })
        //Return the trips
        return res.status(200).json({ data: interestingTrips })
    }
    //Handle the error and return a message
    catch (err) {
        console.error('Error getting interesting trips: ', err);
        return res.status(500).json({ message: 'Unexpected error' })
    }
})

//Router to get the three most interesting users
router.get('/interesting-users', async (req, res) => {
    try {
        //Connect to the database
        await connectToDB();
        //Get the three trips with more likes
        const interestingUsers = await Trip.aggregate([
            { $addFields: { likesCount: { $size: "$likes" } } },
            { $group: { _id: "$writer", totalLikes: { $sum: "$likesCount" } } },
            { $lookup: { from: "users", localField: "_id", foreignField: '_id', as: "user" } },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0, user_id: "user._id",
                    username: "$user.username",
                    first_name: "$user.first_name",
                    second_name: "$user.second_name",
                    avatar: "$user.avatar",
                    totalLikes: 1
                }
            },
            { $sort: { totalLikes: -1 } },
            { $limit: 3 }
        ])
        //If there is no interesting trips return a message
        if (interestingUsers.length === 0)
            return res.status(200).json({ message: 'There is not interesting users', data: [] })
        //Return the trips
        return res.status(200).json({ data: interestingUsers })
    }
    //Handle the error and return a message
    catch (err) {
        console.error('Error getting interesting trips: ', err);
        return res.status(500).json({ message: 'Unexpected error' })
    }
})

//Get all trips
router.get('/', async (req, res) => {
    try {
        //Connect to database
        await connectToDB();
        //Get all trips with user info
        const trendingTrips = await Trip.aggregate([
            {
                $addFields: {
                    likesCount: { $size: '$likes' }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "writer",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    name: 1,
                    country: 1,
                    city: 1,
                    image: 1,
                    description: 1,
                    likes: 1,
                    likesCount: 1,
                    created_date: 1,
                    places: 1,
                    writer: 1,
                    username: "$user.username",
                    avatar: "$user.avatar"
                }
            },
            {
                $sort: { created_date: -1 }
            }
        ])
        //If there is no liked trips return a message
        if (trendingTrips.length === 0)
            return res.status(200).json({ message: 'There are not trips', data: [] })
        return res.status(201).json({ data: trendingTrips })
    }
    catch (err) {
        console.error('Error getting the hot trips: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Get a trip that match criteria
router.post('/search', async (req, res) => {
    try {
        //Connect to the database
        await connectToDB();
        //If there is not a name, a city or a country, return a 400
        if (!req.body.name && !req.body.city && !req.body.country && !req.body.writer)
            return res.status(400).send({ message: 'Please add at list one filter' })
        //Save the query
        const query = {};
        if (req.body.name)
            query.name = { $regex: req.body.name, $options: 'i' };
        if (req.body.city)
            query.city = req.body.city;
        if (req.body.country)
            query.country = req.body.country;
        if (req.body.writer)
            query.writer = new mongoose.Types.ObjectId(req.body.writer);
        //Do the query with the options
        const trips = await Trip.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "writer",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    name: 1,
                    country: 1,
                    city: 1,
                    image: 1,
                    description: 1,
                    likesCount: 1,
                    created_date: 1,
                    places: 1,
                    writer: 1,
                    username: "$user.username",
                    avatar: "$user.avatar"
                }
            },
        ]);
        if (trips.length > 0)
            return res.status(200).json({ data: trips });
        else
            return res.status(200).json({ message: 'There are not trips', data: [] })
    }
    //Catch the error
    catch (err) {
        console.error('Error getting a specific trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' })
    }
})
//Get all user trips
router.get('/my-trips', authenticateJWT, async (req, res) => {
    try {
        //Get the id
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Connect to database
        await connectToDB();
        //Get all trips with user info
        const myTrips = await Trip.aggregate([
            {
                $match: { writer: id }
            },
            {
                $addFields: {
                    likesCount: { $size: '$likes' }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "writer",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    country: 1,
                    city: 1,
                    image: 1,
                    description: 1,
                    likesCount: 1,
                    created_date: 1,
                    places: 1,
                    writer: 1,
                    username: "$user.username",
                    avatar: "$user.avatar"
                }
            },
            {
                $sort: { created_date: -1 }
            }
        ])
        //If there is no liked trips return a message
        if (myTrips.length === 0)
            return res.status(200).json({ message: 'There are not trips', data: [] })
        return res.status(200).json({ data: myTrips })
    }
    catch (err) {
        console.error('Error getting the trips: ', err);
        return res.status(500).json({ message: `Unexpected error` });
    }
})
//Get a specific trip
router.get('/my-trips/:id', authenticateJWT, async (req, res) => {
    try {
        //If there is no id of the trip return a message
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add an id' })
        //Get the id of the trip
        const id = new mongoose.Types.ObjectId(req.params.id);
        //Get the userid
        const writerId = new mongoose.Types.ObjectId(req.user.id);
        //Connect to the database
        await connectToDB();
        //Find a trip with this id
        const trip = await Trip.aggregate([
            {
                $match: {
                    _id: id,
                    writer: writerId,
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "writer",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    name: 1,
                    country: 1,
                    city: 1,
                    image: 1,
                    description: 1,
                    likesCount: 1,
                    places: 1,
                    created_date: 1,
                    writer: 1,
                    username: "$user.username",
                    avatar: "$user.avatar"
                }
            }
        ]);
        //If there is not a trip with this id return a message
        if (!trip)
            return res.status(404).json({ message: 'Trip not founded', data: [] })
        //Return the data
        return res.status(200).json({ data: trip });
    }
    catch (err) {
        console.error('Error getting a specific trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Route for update a trip
router.put('/my-trips/:id', authenticateJWT, async (req, res) => {
    //Try catch, to take the errors
    try {
        //Connect to the database
        await connectToDB();
        //Check if name of the trip, country and the city, have been added
        const { name = '', country = '', city = '', description = '' } = req.body;
        if (name.length > 150 || country.length > 100 || city.length > 120 || description.length > 2000) {
            return res.status(400).json({ message: 'Please ensure that you do not add data that is too long' });
        }
        //Add all the data to a body
        const body = {};
        //Check if name of the trip, country and the city, have been added
        if (req.body.name)
            body.name = req.body.name.trim();
        if (req.body.country)
            body.country = req.body.country.trim();
        if (req.body.city)
            body.city = req.body.city.trim();
        if (req.body.image)
            body.image = req.body.image.trim();
        if (req.body.description)
            body.description = req.body.description.trim();
        if (req.body.places) {
            //Check if it's a valid Array, if not return a message
            if (!Array.isArray(req.body.places)) {
                return res.status(400).json({ message: 'Places must be an array' });
            }
            //By default there is an empty array of places
            const places = [];
            //Check if there aren't an empty name and save the data
            for (const place of req.body.places) {
                if (!place.name || place.name.trim() === '')
                    return res.status(400).json({ message: 'Please make sure to fill in all place fields' });
                places.push({
                    name: place.name.trim() || '',
                    image: place.image.trim() || '',
                    description: place.description.trim() || ''
                })
            }
            body.places = places;
        }
        //Get the id of the trip
        const id = new mongoose.Types.ObjectId(req.params.id);
        //Get the userid
        const writerId = new mongoose.Types.ObjectId(req.user.id);
        //Update the trip
        await Trip.updateOne(
            {
                _id: id,
                writer: writerId
            },
            {
                $set: body
            }
        )
        //Show a message
        return res.status(201).json({ message: 'Trip updated' });
    }
    //Catch the error and send a message
    catch (err) {
        console.error('Error uploading a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Route for delete a trip
router.delete('/my-trips/:id', authenticateJWT, async (req, res) => {
    //Try catch, to take the errors
    try {
        //Connect to the database
        await connectToDB();
        //Get the id of the trip
        const id = new mongoose.Types.ObjectId(req.params.id);
        //Get the userid
        const writerId = new mongoose.Types.ObjectId(req.user.id);
        //Update the trip
        await Trip.deleteOne(
            {
                _id: id,
                writer: writerId
            }
        )
        //Show a message
        return res.status(201).json({ message: 'Trip deleted' });
    }
    //Catch the error and send a message
    catch (err) {
        console.error('Error deleting a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Follow a trip
router.put('/like/:id', authenticateJWT, async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add the id of the trip you want to like' })
        //Get the id of the followed user
        const likedId = new mongoose.Types.ObjectId(req.params.id);
        //Get the id of the  user
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Connect to the database
        await connectToDB();
        //Update user followed
        const liked = await Trip.updateOne(
            { _id: likedId },
            {
                $addToSet: {
                    likes: id
                }
            }
        );
        if (liked.matchedCount === 0)
            return res.status(404).json({ data: 'Trip not found' });
        if (liked.modifiedCount === 0)
            return res.status(409).json({ data: 'Trip already liked' });
        //Return the data
        return res.status(201).json({ data: 'Trip Liked' });
    }
    catch (err) {
        console.error('Error liking a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Unlike a trip
router.delete('/unlike/:id', authenticateJWT, async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add the id of the trip you want to unlike' })
        //Get the id of the followed user
        const unLikedId = new mongoose.Types.ObjectId(req.params.id);
        //Get the id of the  user
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Connect to the database
        await connectToDB();
        //Update user followed
        const unLiked = await Trip.updateOne(
            { _id: unLikedId },
            {
                $pull: {
                    likes: id
                }
            }
        );
        if (unLiked.matchedCount === 0)
            return res.status(404).json({ data: 'Trip not found' });
        if (unLiked.modifiedCount === 0)
            return res.status(409).json({ data: 'Trip was not liked' });
        //Return the data
        return res.status(200).json({ data: 'Trip unliked' });
    }
    catch (err) {
        console.error('Error unliking a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})

//Get a specific trip
router.get('/:id', async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add an id' })
        //Get the id
        const id = new mongoose.Types.ObjectId(req.params.id);
        //Connect to the database
        await connectToDB();
        //Find a trip with this id
        const trip = await Trip.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "writer",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    name: 1,
                    country: 1,
                    city: 1,
                    image: 1,
                    description: 1,
                    likesCount: 1,
                    places: 1,
                    created_date: 1,
                    writer: 1,
                    likes: 1,
                    username: "$user.username",
                    avatar: "$user.avatar"
                }
            }
        ]);
        //If there is not a trip with this id return a message
        if (!trip)
            return res.status(404).json({ message: 'Trip not founded', data: [] })
        //Return the data
        return res.status(200).json({ data: trip });
    }
    catch (err) {
        console.error('Error getting a specific trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})



//Exports the module
module.exports = router;