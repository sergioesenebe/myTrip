//Import external libraries
const mongoose = require('mongoose');
require('dotenv').config();

//Get mongo uri from env
const uri = process.env.MONGO_URI;

//Connect to DB
const connectToDB = async() => {
    try {
        await mongoose.connect(uri, {dbName: 'myTrip'});
    }
    catch (err) {
        console.error('Error connecting with mongoDB, ', err);
    }
}
//Export the connection
module.exports = connectToDB;