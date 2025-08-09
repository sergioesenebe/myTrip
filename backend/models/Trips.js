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
        description: "Photo of the trip (URL)",
        default: "https://res.cloudinary.com/drmjf3gno/image/upload/v1752859323/default-place_c1ehq5.jpg"
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
    country: {
        type: String,
        required: true,
        description: "Country where trip is done"
    },
    city: {
        type: String,
        required: true,
        description: "City where trip is done"
    },
    image: {
        type: String,
        description: "Photo of the trip (URL)",
        default: "https://res.cloudinary.com/drmjf3gno/image/upload/v1753346706/default-country_hxzjcd.jpg"
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
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        description: "Arrays of username that likes the trip"
    }
})

//Export the module
module.exports = mongoose.model('Trip', tripSchema);