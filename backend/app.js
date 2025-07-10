//Import external libraries
const express = require('express');
const app = express();
const cors = require('cors');
//Import internal libraries
const authRoutes = require('./routes/authRoutes');
const uploadRoute = require('./routes/uploadRoute')

//Define variables
const port = 3060;
//Middleware to parse JSON bodies
app.use(express.json());

// Allow CORS for all the origins
app.use(cors());

//Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/image", uploadRoute);

//Global error handler
app.use((err, req, res, next) => {
    console.error('Internal error, ', err);
    res.status(500).send('Internal server error');
})

//Route handler for GET request to root (/)
app.get('/', (req, res) => {
    res.send('Inside the server');
});

//Listening port
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
})