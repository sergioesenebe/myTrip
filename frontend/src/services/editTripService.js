//Import functions
import { validImage, deleteImage, handleUploadImage } from '../services/uploadService';
import React from 'react';
//Get default value for place
const defaultPlace = "https://res.cloudinary.com/drmjf3gno/image/upload/v1752859323/default-place_c1ehq5.jpg";

//Function to check if the format is valid and update the trip image
export async function addTripImage(file, tripImageRef, setTripFile, setTripImage, setDisplayDeleteButton) {
    try {
        //Call function to check if is valid
        await validImage(file, tripImageRef);
        //Take the image
        setTripFile(file);
        //Create a local URL
        const url = URL.createObjectURL(file);
        //Upload image to trip Image
        setTripImage(url);
        //Show delete button
        setDisplayDeleteButton(true);
    }
    //Catch and show the error
    catch (err) {
        throw new Error(err.message);
    }
}
//Function to check if the format is valid and update the place image
export async function addPlaceImage(file, index, tripImageRef, places, setPlaces) {
    try {
        //Call function to check if is valid
        await validImage(file, tripImageRef);
        //Create a local URL
        const url = URL.createObjectURL(file);
        //Take the image
        handlePlaceChange(index, 'file', file, places, setPlaces);
        //Upload image to trip Image
        handlePlaceChange(index, 'image', url, places, setPlaces);
        //Show delete button
        handlePlaceChange(index, 'placeImageDeleteButton', true, places, setPlaces);
    }
    //Catch and show the error
    catch (err) {
        throw new Error(err.message);
    }
}
//Function to change value of a place
export function handlePlaceChange(index, field, value, places, setPlaces) {
    //Copy the array
    const updatedPlaces = [...places];
    //Change the value
    updatedPlaces[index][field] = value;
    //Update the places state
    setPlaces(updatedPlaces);
}
//Function to delete the image when button clicked
export async function deleteTripImage(tripImageRef, setTripImage, setTripFile, setDisplayDeleteButton) {
    try {
        //Remove the image from the ref
        await deleteImage(tripImageRef);
        //Return to default user avatar
        setTripImage('https://res.cloudinary.com/drmjf3gno/image/upload/v1753346706/default-country_hxzjcd.jpg');
        setTripFile('');
        //Remove the button to delete
        setDisplayDeleteButton(false);
    }
    catch (err) {
        throw new Error(err.message);
    }
}
//Function to add an empty place
export function addEmptyPlace(placeImageRefs, setPlaces) {
    ///Create a Ref for the image
    placeImageRefs.current.push(React.createRef());
    //Set a place
    setPlaces((prevItems) => [...prevItems, { name: '', description: '', file: '', image: defaultPlace, placeImageDeleteButton: false }]);
}
//Function to delete a place
export function deletePlace(index, places, placeImageRefs, setPlaces, imagesToDelete, setImagesToDelete) {
    //In edit a trip update the array to delete the images in case that they are in cloudinary
    if (imagesToDelete) {
        if (places[index].image.includes('cloudinary')) {
            const newImagesToDelete = [...imagesToDelete]
            newImagesToDelete.push(places[index].image)
            setImagesToDelete(newImagesToDelete)
        }
    }
    //Copy the array and filter by the index to delete place and placeImageRefs
    const updatedPlaces = places.filter((_, i) => i !== index);
    const newRefs = placeImageRefs.current.filter((_, i) => i !== index);
    //Update the places state and placeImageRefs
    setPlaces(updatedPlaces);
    placeImageRefs.current = newRefs;
}
//Function to delete the image when button clicked
export async function deletePlaceImage(index, placeImageRefs, places, setPlaces) {
    try {
        //Remove the image from the ref
        await deleteImage(placeImageRefs.current[index]);
        //Return to default image
        handlePlaceChange(index, 'file', '', places, setPlaces);
        handlePlaceChange(index, 'image', defaultPlace, places, setPlaces);
        //Remove the button to delete
        handlePlaceChange(index, 'placeImageDeleteButton', false, places, setPlaces);
    }
    catch (err) {
        throw new Error(err.message);
    }
}
