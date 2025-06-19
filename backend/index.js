const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello world!'));

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


app.listen(3000, () => console.log('Server running on port 3000'));
