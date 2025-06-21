//Import Express Framework
const express = require('express');
//Create an Express instance
const app = express();
//Route handler for GET request to root (/)
app.get('/', (req, res) => res.send('Hello world!'));
//Import mongoose to interact with mongodb
const mongoose = require('mongoose');
//Connect to mongodb with the uri defined in the environment
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
//Start the express server on port 3000 and log a message
app.listen(3000, () => console.log('Server running on port 3000'));
