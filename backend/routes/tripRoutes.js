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

//Exports the module
module.exports = router;