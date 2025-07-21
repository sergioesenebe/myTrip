//Import external libraries
const express = require('express');
const router = express.Router();

//Import internal libraries
const connectToDB = require('../config/db');
const authenticateJWT = require('../middlewares/auth');
const Trip = require('../models/Trips')

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
                name: place.name || '',
                image: place.image || '',
                description: place.description || ''
            })
        }
        //Insert the new Trip
        const newTrip = new Trip({
            name: req.body.name,
            country: req.body.country,
            city: req.body.city,
            image: req.body.image,
            description: req.body.description,
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
router.get('/interesting-trips', async (req,res) => {
    try {
        //Connect to the database
        await connectToDB();
        //Get the three trips with more likes
        const interestingTrips = await Trip.aggregate([
            {$addFields: {likesCount: {$size: '$likes'}}},
            {$sort:{likesCount: -1}},
            {$limit: 3}
        ])
        //If there is no interesting trips return a message
        if (interestingTrips.length === 0)
            return res.status(200).json({message: 'There is not interesting trips', data:[]})
        //Return the trips
        return res.status(200).json({data: interestingTrips})
    }
    //Handle the error and return a message
    catch (err) {
        console.error('Error getting interesting trips: ', err);
        return res.status(500).json({message: 'Unexpected error'})
    }
})

//Router to get the three most interesting users
router.get('/interesting-users', async (req,res) => {
    try {
        //Connect to the database
        await connectToDB();
        //Get the three trips with more likes
        const interestingUsers = await Trip.aggregate([
            {$addFields: {likesCount: {$size: "$likes"}}},
            {$group: {_id:"$writer", totalLikes: {$sum: "$likesCount"}}},
            {$lookup: {from: "users", localField: "_id", foreignField: '_id', as: "user"}},
            {$unwind: "$user"},
            {$project: {
                _id: 0, user_id:"user._id",
                username: "$user.username",
                first_name: "$user.first_name",
                second_name: "$user.second_name",
                avatar: "$user.avatar",
                totalLikes: 1
            }},
            {$sort: {totalLikes: -1}},
            {$limit: 3}
        ])
        //If there is no interesting trips return a message
        if (interestingUsers.length === 0)
            return res.status(200).json({message: 'There is not interesting users', data:[]})
        //Return the trips
        return res.status(200).json({data: interestingUsers})
    }
    //Handle the error and return a message
    catch (err) {
        console.error('Error getting interesting trips: ', err);
        return res.status(500).json({message: 'Unexpected error'})
    }
})

//Exports the module
module.exports = router;