//Import external libraries
const jwt = require('jsonwebtoken');

//Get the JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

//Function to authenticate the token
function authenticateJWT(req, res, next) {
    //Get token from session
    const token = req.cookies.token;
    //If there is no token return a 401
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    //Verify the token
    try {
        //Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        //Attach user data to request
        req.user = decoded;
        //Continue to next middleware
        next();
    } 
    //Catch the error and return a message
    catch (err) {
        console.error('Error getting the code: ', err);
        return res.status(401).json({message: 'Invalid token'})
    }
}

//Export the middleware
module.exports = authenticateJWT;