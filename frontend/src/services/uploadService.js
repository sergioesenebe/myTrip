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
