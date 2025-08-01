//Get the backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to Upload a image
export async function uploadImage(imageFile, folder) {
    //Take the data
    const formData = new FormData();
    formData.append('image', imageFile);
    //POST the image in the API
    const response = await fetch(`${backendUrl}/api/image/upload?folder=${folder}`, {
        method: 'POST',
        body: formData
    });
    //Take the errors
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    //Take and return the data
    const data = await response.json();
    return data;
}
//Check if image is valid
export function validImage(file, ref) {
    //Save valid formats
    const valideTypes = ['image/png', 'image/jpeg'];
    if (!valideTypes.includes(file.type)) {
        //Delete the uploaded image
        if (ref.current) {
            ref.current.value = '';
        }
        //Throw an error
        throw new Error('Only PNG, JPG or JPEG images are allowed');
    }
}
//Delete image from the page
export function deleteImage(ref) {
    try {
        if (ref.current) {
            ref.current.value = '';
        }
    }
    catch (err) {
        throw new Error('Error deleting the image')
    }
}
//Function to upload image
export async function handleUploadImage(image, imageUrl, folder) {
    //If there is no image uploaded return null
    if (!image || image == '') return imageUrl;
    //Try to Upload the image
    try {
        //Call the function to POST the image and upload it to Cloudinary
        const response = await uploadImage(image, folder);
        //Return the url
        return response.url;
    }
    //Catch posible errors
    catch (err) {
        console.error('Error Uploading the image: ', err);
        throw new Error('Error updating the image');
    }
}

//Function to delete an image
export async function handleDeleteImage(imageUrl) {
    //If there is no image uploaded return null
    if (!imageUrl || imageUrl == '') {
        throw new Error('Please add an image url');
    }
    try {
        //Try to get the path split to get just path not url
        const split = imageUrl.split('/myTrip/');
        const path = split[1];
        //Remove the extension
        const withoutExtArray = path.split('.');
        let image = withoutExtArray[0];
        //Add myTrip to start
        image = 'myTrip/' + image;
        if (!image) {
            console.error('Error deleting the image');
            throw new Error('Error deleting the image');
        }
        //Call the function to delete the in Cloudinary
        await fetch(`${backendUrl}/api/image/delete`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: image,
            })
        });

    }
    //Catch posible errors
    catch (err) {
        console.error('Error deleting the image: ', err);
        throw new Error('Error deleting the image');
    }

}