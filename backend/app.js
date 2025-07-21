//Import external libraries
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
//Import internal libraries
const authRoutes = require('./routes/authRoutes');
const uploadRoute = require('./routes/uploadRoute')
const tripRoutes = require('./routes/tripRoutes');

//Define variables
const port = 3060;
//Middleware to parse JSON bodies
app.use(express.json());
//To work with cookies
app.use(cookieParser());

// Allow CORS for frontend the origins
app.use(cors({
    origin: 'http://192.168.49.2:31384',
    credentials: true
}));

//Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/image", uploadRoute);
app.use("/api/trips", tripRoutes);

//Global error handler
app.use((err, req, res, next) => {
    console.error('Internal error, ', err);
    res.status(500).send('Internal server error');
})

//Route handler for GET request to root (/)
app.get('/', (req, res) => {
    res.send('Inside the server');
});

//In case of not found send a message
app.use((req,res) => {
    res.status(404).json({message: 'Endpoint not found'})
})

//Listening port
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
})