//Import mongoose library
const mongoose = require('mongoose');

//Schema for the places
const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        description: "Name of the place"
    },
    image: {
        type: String,
        description: "Photo of the trip (URL)"
    },
    description: {
        type: String,
        description: "Short description of the trip",
    }

})

//Schema for Trips
const tripSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        description: "Name of the trip"
    },
    city: {
        type: String,
        required: true,
        description: "City where trip is done"
    },
    image: {
        type: String,
        description: "Photo of the trip (URL)"
    },
    description: {
        type: String,
        description: "Short description of the trip"
    },
    writer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        description: "Trip's writter"
    },
    places: {
        type: [placeSchema],
        description: "Collections of all the places (name, photo, description)"
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: [String],
        default: [],
        description: "Arrays of username that likes the trip"
    }
})

//Export the module
module.exports = mongoose.model('Trip', tripSchema);