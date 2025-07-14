//Import external libraries
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

//Import internal libraries
const connectToDB = require('../config/db');
const User = require('../models/Users');

//Get the JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

//Post for register a user
router.post('/register', async (req, res) => {
    try {
        //Connect to the DB
        connectToDB();
        //Check if all data have been added
        if (!req.body.username || !req.body.password || !req.body.email || !req.body.first_name || !req.body.second_name) {
            return res.status(400).send('Please make sure to fill in all fields');
        }
        //Check if username or email exists
        const usernameExists = await User.findOne({ username: req.body.username });
        const emailExists = await User.findOne({ email: req.body.email });
        if (usernameExists) {
            return res.status(400).send('Username already in use');
        }
        if (emailExists) {
            return res.status(400).send('Email already in use');
        }
        //Check if the password has the restrictions
        const password = req.body.password;
        //Get if has a number, uppercas and lowercase
        const hasNumber = /\d/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password)
        //If not compliant return
        if (password.length < 8 || !hasNumber || !hasUpperCase || !hasLowerCase) {
            return res.status(400).send('Password must have at least 8 characters, less than 72, one number, one uppercase and one lower case letter');
        }
        //Generate a hash password using bcrypt with a salt (10 rounds)
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(req.body.password, salt);
        //Insert the user
        const newUser = new User({
            username: req.body.username,
            password: hashPassword,
            email: req.body.email,
            first_name: req.body.first_name,
            second_name: req.body.second_name,
            avatar: req.body.avatar
        });
        await newUser.save();
        //Create the payload
        const payload = {
            id: newUser._id
        };
        //Generate the token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        //Save it as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            //secure: true, //Work with https
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
            //sameSite: 'strict' //Prevent CSRF
        });
        res.status(201).send('User created');
    }
    //Catch the errors and send it
    catch (err) {
        console.error('Error in the register: ', err);
        return res.status(500).send('Internal server error')
    }
})

//Post for login
router.post('/login', async (req, res) => {
    try {
        //Connect to the database
        connectToDB();
        //Check if username and password have been add it
        if (!req.body.username || !req.body.password)
            return res.status(400).send('Please make sure to fill in all fields');
        //Check if the user already exists
        const user = await User.findOne({ username: req.body.username })
        if (!user)
            return res.status(404).send("Username does not exist");
        //Check if the password is correct
        const passwordMatch = await bcryptjs.compare(req.body.password, user.password);
        if (!passwordMatch)
            return res.status(404).send('Password is not correct')
        //If everything is okay, generate a token and return a 200 status
        //Create a payload
        const payload = {
            id: user._id,
            username: user.username
        };
        //Generate a token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        //Save it as cookie
        res.cookie('token', token, {
            httpOnly: true,
            //secure: true, //Work with https
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
            //sameSite: 'strict', //Prevent CSRF
        })
        //Return a success status
        return res.status(200).send('Login succesful')
    }
    //Catch the errors and send it
    catch (err) {
        console.error('Error in the Log in: ', err);
        return res.status(500).send('Internal server error');
    }
})

//Export the router
module.exports = router;