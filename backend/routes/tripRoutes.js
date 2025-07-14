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
        await connectToDB;
        //Check if name of the trip and the city, have been added
        if (!req.body.name || !req.body.city) {
            return res.status(400).send('Please make sure to fill in all fields');
        }
        const places = Array.isArray(req.body.places)
            ? req.body.places.map(place => ({
                name: place.name || '',
                image: place.image || '',
                description: place.description || ''
            }))
            : [];
        //Insert the new Trip
        const newTrip = new Trip({
            name: req.body.name,
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
        return res.status(500).send('Unexpected error');
    }
})

//Exports the module
module.exports = router;