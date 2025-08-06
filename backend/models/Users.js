//Import mongoose library
const mongoose = require('mongoose');

//Schema for Users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxlength: 30,
        description: "Username to identify the user",
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 72,
        required: true,
        description: "User's encrypted password"
    },
    email: {
        type: String,
        required: true,
        maxlength: 100,
        description: "User's email",
        unique: true
    },
    first_name: {
        type: String,
        required: true,
        maxlength: 50,
        description: "User's first name"
    },
    second_name: {
        type: String,
        required: true,
        maxlength: 50,
        description: "User's second name"
    },
    description: {
        type: String,
        maxlength: 160,
        description: "User's description"
    },
    avatar: {
        type: String,
        required: false,
        description: "User's avatar (URL)",
        default: 'https://res.cloudinary.com/drmjf3gno/image/upload/v1752485544/default-user_qq6fjc.png'
    },
    following: {
        type: [String],
        description: "Arrays of usernames followed by the user"
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        description: "Arrays of usernames that follows the user"
    }
});

//Export the module
module.exports = mongoose.model('User', userSchema);