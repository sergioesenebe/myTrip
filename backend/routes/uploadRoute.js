//Import external libraries
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary');
const router = express.Router();
const streamifier = require('streamifier');

//Get the variables for cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

//Configure Cloudinary
cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
})

//Set up multer for handling files upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//POST the image
router.post('/upload', upload.single('image'), (req, res) => {
    //If there is no file send an error
    if (!req.file) {
        return res.status(400).json({ message:'There is no image'});
    }
    //Take the folder (if is one allowed)
    const allowedFolders = ['avatars', 'places', 'trips'];
    const requestedFoler = req.query.folder || ''; //If undefined will take an empty string
    const folder = allowedFolders.includes(requestedFoler) 
        ? `myTrip/${requestedFoler}` 
        : 'myTrip/others';
    //Upload image to Cloudinary using stream, take the folder and select the allowed formats
    const stream = cloudinary.v2.uploader.upload_stream({
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png']
    },
        (error, result) => {
            //If there is an error send a 500 message
            if (error) {
                console.error('Error Uploading the photo: ', error);
                return res.status(500).json({ message:'Error uploading the photo'});
            }
            //If there is an OK message, send a message, the url and public_id
            res.status(200).json({
                message: 'Upload successful',
                url: result.secure_url,
                public_id: result.public_id
            });
        }
    );
    //Convert the image into a readable steam and pipes to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(stream);
});

//Export the route
module.exports = router;