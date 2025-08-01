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
//Get user info that is logged
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
                    _id: 1,
                    username: 1,
                    email: 1,
                    first_name: 1,
                    second_name: 1,
                    description: 1,
                    avatar: 1,
                    following: 1
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
                    following: 1
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