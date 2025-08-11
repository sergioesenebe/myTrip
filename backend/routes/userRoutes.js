//Import external libraries
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

//Import internal libraries
const connectToDB = require('../config/db');
const authenticateJWT = require('../middlewares/auth');
const Users = require('../models/Users');

//Update user data logged in
router.put('/me', authenticateJWT, async (req, res) => {
    //Try catch, to take the errors
    try {
        //Check if at least one field have been added
        if (!req.body.username && !req.body.email && !req.body.first_name && !req.body.second_name && !req.body.description && !req.body.avatar && !req.body.password) {
            return res.status(400).json({ message: 'Please make sure to fill at least one field' })
        }
        await connectToDB();
        //Save the body
        let body = {};
        if (req.body.username) {
            //Check if username is in use
            if (req.body.username !== req.user.username) {
                const usernameExists = await Users.findOne({ username: req.body.username });
                if (usernameExists)
                    return res.status(400).json({ message: 'Username already in use' })
            }
            body.username = req.body.username;
        }
        if (req.body.email) {
            //Check if email is in use
            if (req.body.email !== req.user.email) {
                const emailExists = await Users.findOne({ email: req.body.email });
                if (emailExists)
                    return res.status(400).json({ message: 'Email already in use' })
            }
            body.email = req.body.email;
        }
        if (req.body.first_name)
            body.first_name = req.body.first_name;
        if (req.body.second_name)
            body.second_name = req.body.second_name;
        if (req.body.description)
            body.description = req.body.description;
        if (req.body.avatar)
            body.avatar = req.body.avatar;
        if (req.body.password) {
            //Check if the password has the restrictions
            const password = req.body.password;
            //Get if has a number, uppercas and lowercase
            const hasNumber = /\d/.test(password);
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password)
            //If not compliant return
            if (password.length < 8 || !hasNumber || !hasUpperCase || !hasLowerCase)
                return res.status(400).json({ message: 'Password must have at least 8 characters, less than 72, one number, one uppercase and one lower case letter' });
            //if password doesn't match with the confirm password return a message
            if (password !== req.body.confirm_password)
                return res.status(400).json({ message: 'Passwords do not match' });
            //Generate a hash password using bcrypt with a salt (10 rounds)
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(req.body.password, salt);
            //Save in the body
            body.password = hashPassword;
        }
        //Get the id
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Update the user with the id
        await Users.updateOne(
            {
                _id: id,
            },
            {
                $set: body
            }
        )
        return res.status(201).json({ message: 'User updated' });
    }
    //Catch the error and send a message
    catch (err) {
        console.error('Error uploading a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }

})
//Get users that is logged info
router.get('/me', authenticateJWT, async (req, res) => {
    try {
        //Get the id
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Connect to the database
        await connectToDB();
        //Find a user with this id
        const user = await Users.aggregate([
            { $match: { _id: id } },
            {
                $project: {
                    username: 1,
                    email: 1,
                    first_name: 1,
                    second_name: 1,
                    description: 1,
                    avatar: 1,
                    following: 1,
                    followers: 1,
                    saved_trips: 1,
                }
            }
        ]);
        //If there is not a user with this id return a message
        if (!user)
            return res.status(404).json({ message: 'User not founded', data: [] })
        //Return the data
        return res.status(200).json({ data: user });
    }
    catch (err) {
        console.error('Error getting a specific user: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Get all users info
router.get('/', async (req, res) => {
    try {
        //Connect to the database
        await connectToDB();
        //Find a user with this id
        const users = await Users.aggregate([
            { $addFields: { followersCount: { $size: '$followers' } } },
            { $sort: { followersCount: -1 } },
            {
                $project: {
                    username: 1,
                    email: 1,
                    first_name: 1,
                    second_name: 1,
                    description: 1,
                    avatar: 1,
                    following: 1,
                    followers: 1,
                    followersCount: 1,
                }
            }
        ]);
        //If there is not a user with this id return a message
        if (!users)
            return res.status(200).json({ message: 'No users founded', data: users });
        //Return the data
        return res.status(200).json({ data: users });
    }
    catch (err) {
        console.error('Error getting a specific user: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Get a trip that match criteria
router.post('/general-search', async (req, res) => {
    try {
        //Connect to the database
        await connectToDB();
        //If there is not a name, a city or a country, return a 400
        if (!req.body.username && !req.body.first_name && !req.body.second_name)
            return res.status(400).send({ message: 'Please add at list one filter' })
        //Save the query
        const query = [];
        if (req.body.username)
            query.push({ username: { $regex: req.body.username, $options: 'i' } });
        if (req.body.first_name)
            query.push({ first_name: { $regex: req.body.first_name, $options: 'i' } });
        if (req.body.second_name)
            query.push({ second_name: { $regex: req.body.second_name, $options: 'i' } });
        //Do the query with the options
        const users = await Users.aggregate([
            { $match: { $or: query } },
            { $addFields: { followersCount: { $size: '$followers' } } },
            { $sort: { followersCount: -1 } },
            {
                $project: {
                    username: 1,
                    email: 1,
                    first_name: 1,
                    second_name: 1,
                    description: 1,
                    avatar: 1,
                    following: 1,
                    followers: 1,
                    followersCount: 1,
                }
            }
        ]);
        if (users.length > 0)
            return res.status(200).json({ data: users });
        else
            return res.status(200).json({ message: 'There are not users', data: [] })
    }
    //Catch the error
    catch (err) {
        console.error('Error getting a specific user: ', err);
        return res.status(500).json({ message: 'Unexpected error' })
    }
})
//Follow a user user
router.put('/follow/:id', authenticateJWT, async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add the id of the traveler you want to follow' })
        //Get the id of the followed user
        const followedId = new mongoose.Types.ObjectId(req.params.id);
        //Get the id of the  user
        const id = new mongoose.Types.ObjectId(req.user.id);
        console.log('id: ', id);
        console.log('req user: ', req.user.id);
        //Connect to the database
        await connectToDB();
        //Update user followed
        const follow = await Users.updateOne(
            { _id: followedId },
            {
                $addToSet: {
                    followers: id
                }
            }
        );
        const followUser = await Users.updateOne(
            { _id: id },
            {
                $addToSet: {
                    following: followedId
                }
            }
        );

        if (follow.matchedCount === 0 || followUser.matchedCount === 0)
            return res.status(404).json({ data: 'Traveler not found' });
        if (follow.modifiedCount === 0 || followUser.modifiedCount === 0)
            return res.status(409).json({ data: 'Traveler already followed' });
        //Return the data
        return res.status(201).json({ data: 'Traveler Followed' });
    }
    catch (err) {
        console.error('Error following a traveler: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Unfollow a user user
router.delete('/unfollow/:id', authenticateJWT, async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add the id of the traveler you want to unfollow' })
        //Get the id of the followed user
        const unfollowedId = new mongoose.Types.ObjectId(req.params.id);
        //Get the id of the  user
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Connect to the database
        await connectToDB();
        //Update user followed
        const unfollow = await Users.updateOne(
            { _id: unfollowedId },
            {
                $pull: {
                    followers: id
                }
            }
        );
        const unfollowUser = await Users.updateOne(
            { _id: id },
            {
                $pull: {
                    following: unfollowedId
                }
            }
        );
        if (unfollow.matchedCount === 0 || unfollowUser.matchedCount === 0)
            return res.status(404).json({ data: 'Traveler not found' });
        if (unfollow.modifiedCount === 0 || unfollowUser.modifiedCount === 0)
            return res.status(409).json({ data: 'Traveler was not followed' });
        //Return the data
        return res.status(200).json({ data: 'Traveler Unfollowed' });
    }
    catch (err) {
        console.error('Error unfollowing a traveler: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Save a trip
router.put('/save/:id', authenticateJWT, async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add the id of the trip you want to save' })
        //Get the id of the followed user
        const saveId = new mongoose.Types.ObjectId(req.params.id);
        //Get the id of the  user
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Connect to the database
        await connectToDB();
        //Update user followed
        const saved = await Users.updateOne(
            { _id: id },
            {
                $addToSet: {
                    saved_trips: saveId
                }
            }
        );
        if (saved.matchedCount === 0)
            return res.status(404).json({ data: 'Trip not found' });
        if (saved.modifiedCount === 0)
            return res.status(409).json({ data: 'Trip already saved' });
        //Return the data
        return res.status(201).json({ data: 'Trip saved' });
    }
    catch (err) {
        console.error('Error saving a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Unsave a trip
router.delete('/unsave/:id', authenticateJWT, async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add the id of the trip you want to unsave' })
        //Get the id of the followed user
        const unsaveId = new mongoose.Types.ObjectId(req.params.id);
        //Get the id of the  user
        const id = new mongoose.Types.ObjectId(req.user.id);
        //Connect to the database
        await connectToDB();
        //Update user followed
        const unsaved = await Users.updateOne(
            { _id: id },
            {
                $pull: {
                    saved_trips: unsaveId
                }
            }
        );
        if (unsaved.matchedCount === 0)
            return res.status(404).json({ data: 'Trip not found' });
        if (unsaved.modifiedCount === 0)
            return res.status(409).json({ data: 'Trip was not saved' });
        //Return the data
        return res.status(200).json({ data: 'Trip unsaved' });
    }
    catch (err) {
        console.error('Error unsaving a trip: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})
//Get all user trips
router.get('/my-saved-trips', authenticateJWT, async (req, res) => {
    try {
        //Get the id
        const id = new mongoose.Types.ObjectId(req.user.id);
        console.log('ID: ', id);
        //Connect to database
        await connectToDB();
        //Get all trips with user info
        const savedTrips = await Users.findById(id).populate({
            path: 'saved_trips',
            populate: {
                path: 'writer',
                select: 'username avatar'
            }
        })
            .select('saved_trips');
        //If there is no liked trips return a message
        if (savedTrips.length === 0)
            return res.status(200).json({ message: 'There are not saved trips', data: [] })
        return res.status(200).json({ data: savedTrips })
    }
    catch (err) {
        console.error('Error getting the saved trips: ', err);
        return res.status(500).json({ message: `Unexpected error` });
    }
})
//search a user saved trips
router.post('/my-saved-trips/search', authenticateJWT, async (req, res) => {
    try {
        //Get the id
        const id = new mongoose.Types.ObjectId(req.user.id);
        console.log('ID: ', id);
        //Connect to database
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
        //Get all trips with user info
        const savedTrips = await Users.findById(id).populate({
            path: 'saved_trips',
            match: query,
            populate: {
                path: 'writer',
                select: 'username avatar'
            }
        })
            .select('saved_trips');
        //If there is no liked trips return a message
        if (savedTrips.length === 0)
            return res.status(200).json({ message: 'There are not saved trips', data: [] })
        return res.status(200).json({ data: savedTrips })
    }
    catch (err) {
        console.error('Error getting the saved trips: ', err);
        return res.status(500).json({ message: `Unexpected error` });
    }
})

//Get a specific user
router.get('/:id', async (req, res) => {
    try {
        if (!req.params.id)
            return res.status(400).send({ message: 'Please add an id' })
        //Get the id
        const id = new mongoose.Types.ObjectId(req.params.id);
        //Connect to the database
        await connectToDB();
        //Find a user with this id
        const user = await Users.aggregate([
            { $match: { _id: id } },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    first_name: 1,
                    second_name: 1,
                    description: 1,
                    avatar: 1,
                    following: 1,
                    followers: 1,
                }
            }
        ]);
        //If there is not a user with this id return a message
        if (!user)
            return res.status(404).json({ message: 'User not founded', data: [] })
        //Return the data
        return res.status(200).json({ data: user });
    }
    catch (err) {
        console.error('Error getting a specific user: ', err);
        return res.status(500).json({ message: 'Unexpected error' });
    }
})

//Export the router
module.exports = router;