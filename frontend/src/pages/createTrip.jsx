//Import external libraries
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
//Import internal libraries, css and images
import { validImage, deleteImage, handleUploadImage } from '../services/uploadService';
import "../styles/index.css";
import "../styles/common.css";
import "../styles/tripedit.css";
//Import images
import logoNavBar from "../../public/images/mytrip-text-logo-nav-bar.png";
import menuIcon from "../../public/images/menu-white.png";
import closeIcon from "../../public/images/close-white.png";
import esenebeLogo from "../../public/images/esenebe-logo.png";
import loadingGif from "../../public/images/loading.gif";


//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;
//Get the default place image url
const defaultPlace = "https://res.cloudinary.com/drmjf3gno/image/upload/v1752859323/default-place_c1ehq5.jpg";

//Function to upload a trip
function uploadTrip() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [tripName, setTripName] = useState('');
    const [tripDescription, setTripDescription] = useState('');
    const [tripImage, setTripImage] = useState('');
    const [tripCountry, setTripCountry] = useState('');
    const [tripCity, setTripCity] = useState('');
    const [places, setPlaces] = useState([]);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [tripImageUrl, setTripImageUrl] = useState('');
    const [displayDeleteButton, setDisplayDeleteButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);
    //Define trip image reference
    const tripImageRef = useRef();
    //Define place image reference
    const placeImageRefs = useRef([]);

    //Create a Trip
    const handleCreateTrip = async (e) => {
        //Remove old messages
        setErrorMessage('');;
        //Prevent default
        e.preventDefault();
        try {
            setIsLoading(true);
            //Upload the Trip Image to Cloudinary and save the url
            const newTripImageUrl = await handleUploadImage(tripImage, tripImageUrl, 'trips');
            setTripImageUrl(newTripImageUrl);
            //Set the payload to upload the trip (without the places)
            const tripPayload = {
                name: tripName,
                country: tripCountry,
                city: tripCity,
                image: newTripImageUrl,
                description: tripDescription,
                places: [],
            }
            //Use for ... of to use await correctly
            for (const [index, place] of places.entries()) {
                //Upload the Place Image to Cloudinary and save the url
                const newPlaceImage = await handleUploadImage(place.image, place.imageUrl, 'places');
                handlePlaceChange(index, 'imageUrl', newPlaceImage);
                const newPlace = {
                    name: place.name,
                    image: newPlaceImage,
                    description: place.description,
                }
                tripPayload.places.push(newPlace);
            }
            //Fetch the create trip
            const response = await fetch(`${backendUrl}/api/trip/`, {
                //Select the method, header and body with the trip data
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(tripPayload),
            })
            //If there is an error show it
            if (!response.ok) {
                const data = await response.json();
                const message = data.message;
                setErrorMessage(message);
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
            else {
                //Show that the trip was created
                setErrorMessage('Trip Created');
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
        }
        catch (err) {
            console.error('Error creatting the trip: ', err);
            setErrorMessage('Unexpected Error');
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        } finally {
            setIsLoading(false);
        }
    }

    //Get all countries with an API
    useEffect(() => {
        //Use GET request to fetch country data
        fetch("https://countriesnow.space/api/v0.1/countries")
            .then((response) => {
                //Throw an error if response is not ok
                if (!response.ok) {
                    throw new Error("Error getting the countries");
                }
                //Parse the json body
                return response.json();
            })
            .then((data) => {
                //Set countries with fetched data
                setCountries(data.data);
            })
            .catch((err) => {
                //Log the error and set the message in state
                console.error("Error getting the countries: ", err);
                setErrorMessage("Could not load countries");
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            })
    }, [])
    //Get all cities by a country
    const handleCountryChange = (e) => {
        //Save the state for the trip
        const selectedCountry = e.target.value;
        setTripCountry(selectedCountry);
        //Use GET request to fetch country data
        fetch("https://countriesnow.space/api/v0.1/countries/cities", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            //Specify a json body with the country
            body: JSON.stringify({
                country: selectedCountry
            })
        })
            .then((response) => {
                //Throw an error if response is not ok
                if (!response.ok) {
                    throw new Error("Error getting the cities");
                }
                //Parse the json body
                return response.json();
            })
            .then((data) => {
                //Set countries with fetched data
                setCities(data.data);
            })
            .catch((err) => {
                //Log the error and set the message in state
                console.error("Error getting the citties: ", err);
                setErrorMessage("Could not load cities");
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            })
    }
    //Function to check if the format is valid and update the trip image
    async function handleTripImage(e) {
        try {
            //Get file
            const file = e.target.files[0];
            //Call function to check if is valid
            await validImage(file, tripImageRef);
            //Take the image
            setTripImage(file);
            //Create a local URL
            const url = URL.createObjectURL(file);
            //Upload image to trip Image
            setTripImageUrl(url);
            //Show delete button
            setDisplayDeleteButton(true);
        }
        //Catch and show the error
        catch (err) {
            console.error('No Valid Type: ', err);
            setErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Function to check if the format is valid and update the place image
    async function handlePlaceImage(index, e) {
        try {
            //Get file
            const file = e.target.files[0];
            //Call function to check if is valid
            await validImage(file, tripImageRef);
            //Create a local URL
            const url = URL.createObjectURL(file);
            //Take the image
            handlePlaceChange(index, 'image', file);
            //Upload image to trip Image
            handlePlaceChange(index, 'imageUrl', url);
            //Show delete button
            handlePlaceChange(index, 'placeImageDeleteButton', true);
        }
        //Catch and show the error
        catch (err) {
            console.error('No Valid Type: ', err);
            setErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Function to delete the image when button clicked
    async function handleDeleteTripImage() {
        try {
            //Remove the image from the ref
            await deleteImage(tripImageRef);
            //Return to default user avatar
            setTripImageUrl('');
            setTripImage('');
            //Remove the button to delete
            setDisplayDeleteButton(false);
        }
        catch (err) {
            console.error('Error deleting the image: ', err);
            setErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);

        }
    }
    //Function to add an empty place
    function addEmptyPlace() {
        ///Create a Ref for the image
        placeImageRefs.current.push(React.createRef());
        //Set a pplace
        setPlaces((prevItems) => [...prevItems, { name: '', description: '', image: '', imageUrl: defaultPlace, placeImageDeleteButton: false }]);
    }
    //Function to change value of a place
    function handlePlaceChange(index, field, value) {
        //Copy the array
        const updatedPlaces = [...places];
        //Change the value
        updatedPlaces[index][field] = value;
        //Update the places state
        setPlaces(updatedPlaces);
    }
    //Function to delete a place
    function handleDeletePlace(index) {
        //Copy the array and filter by the index to delete place and placeImageRefs
        const updatedPlaces = places.filter((_, i) => i !== index);
        const newRefs = placeImageRefs.current.filter((_, i) => i !== index);
        //Update the places state and placeImageRefs
        setPlaces(updatedPlaces);
        placeImageRefs.current = newRefs;
    }
    //Function to delete the image when button clicked
    async function handleDeletePlaceImage(index) {
        try {
            //Remove the image from the ref
            await deleteImage(placeImageRefs.current[index]);
            //Return to default user avatar
            handlePlaceChange(index, 'image', '');
            handlePlaceChange(index, 'imageUrl', defaultPlace);
            //Remove the button to delete
            handlePlaceChange(index, 'placeImageDeleteButton', false);
        }
        catch (err) {
            console.error('Error deleting the image: ', err);
            setErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);

        }
    }
    //DOM
    return (
        <>
            {isLoading && (<div className="loading"><img src={loadingGif}></img>Loading...</div>)}
            {!isLoading && (
                <>
                    <main>
                        <form onSubmit={handleCreateTrip}>
                            <div className="top-green-img-section" style={{ backgroundImage: `url(${tripImageUrl})` }}>
                                <nav className="top-nav-bar">
                                    <img className="logo-top-left" src={logoNavBar} />
                                    <button id="menu-button" type='button'
                                        className="md:hidden w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => { setMenuOpen(true) }}>
                                        <img src={menuIcon} />
                                    </button>
                                    {/*Links visibles in desktop*/}
                                    <div className="nav-bar-links hidden md:flex gap-4">
                                        <a className="nav-bar-link">Home</a>
                                        <a className="nav-bar-link">Trips</a>
                                        <a className="nav-bar-link">Travelers</a>
                                        <a className="nav-bar-link"><u>My Trips</u></a>
                                        <a className="nav-bar-link">Saved Trips</a>
                                        <a className="nav-bar-link">My Profile</a>
                                    </div>
                                </nav>
                                <div className="trip-info">
                                    {/*Links visibles in mobile, here to show it above the trip info*/}
                                    {menuOpen && (<div id="mobile-menu"
                                        className="fixed inset-0 z-[999] bg-[#004643] flex flex-col items-center justify-center gap-6 text-lg md:hidden">
                                        <button id="close-menu" type='button' className="absolute top-4 right-4">
                                            <img src={closeIcon} alt="Close Menu"
                                                className="w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => { setMenuOpen(false) }} />
                                        </button>
                                        <a href="#"
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Home</a>
                                        <a href="#"
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Trips</a>
                                        <a href="#"
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Travelers</a>
                                        <a href="#"
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">My
                                            Trips</a>
                                        <a href="#"
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Saved
                                            Trips</a>
                                        <a href="#"
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">My
                                            Profile</a>
                                    </div>)}
                                    <div className="editable">
                                        <input required className="editable-input trip-name white-input" value={tripName} placeholder="Trip Name" onChange={(e) => setTripName(e.target.value)} />
                                    </div>
                                    <div className="editable">
                                        <textarea className="editable-textarea trip-description white-input" rows={3}
                                            placeholder="Trip Description" value={tripDescription} onChange={(e) => setTripDescription(e.target.value)} />
                                    </div>
                                    <div className="selections">
                                        <label htmlFor="country">Country</label>
                                        <select required className="white-select" id="country" name="country" value={tripCountry} onChange={(e) => handleCountryChange(e)}>
                                            <option value='' disabled >Select a Country</option>
                                            {countries.map(c => (
                                                <option key={c.iso2} value={c.country}>{c.country}</option>
                                            ))}
                                        </select>
                                        <label htmlFor="city">City</label>
                                        <select required className="white-select" id="city" name="city" value={tripCity} onChange={(e) => setTripCity(e.target.value)}>
                                            <option value='' disabled>Select a City</option>
                                            {tripCountry && (<option value='Whole Country'>Whole Country</option>)}
                                            {cities.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input className="input-auth" ref={tripImageRef} id='trip-image' type='file' accept='image/png, image/jpg, image/jpeg'
                                        style={{ display: 'none' }} onChange={handleTripImage}></input>

                                    <div className="flex flex-row items-center gap-5 w-[min-content]">
                                        <button className="white-border-button update-image-button" type='button' onClick={() => tripImageRef.current && tripImageRef.current.click()}>Update Trip Image</button>
                                        {displayDeleteButton && (
                                            <button className='red-button update-image-button' type='button' onClick={handleDeleteTripImage}>Delete Trip Image</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="trip-places">
                                <h1 className="text-3xl font-bold text-[#004643] mb-4">Places to Visit</h1>
                                <div className="places">
                                    {places.map((place, index) => (
                                        <div className="place" key={index}>
                                            <div className="place-content">
                                                {/*If index is even image will be in the left, if it's odd, the opposite*/}
                                                {index % 2 === 0 &&
                                                    <div className="left-place">
                                                        <input className="input-auth" ref={placeImageRefs.current[index]} id='place-image' type='file' accept='image/png, image/jpg, image/jpeg'
                                                            style={{ display: 'none' }} onChange={(e) => handlePlaceImage(index, e)}></input>
                                                        <img className="place-image clickable" src={place.imageUrl} onClick={() => placeImageRefs.current[index] && placeImageRefs.current[index].current.click()} />
                                                        {place.placeImageDeleteButton && (
                                                            <button className='red-border-button update-image-button p-0' type='button' onClick={() => handleDeletePlaceImage(index)}>Delete Image</button>
                                                        )}
                                                    </div>
                                                }
                                                <div className="right-place">
                                                    <div className="editable">
                                                        <input required className="editable-input place-name green-input" placeholder="Place Name"
                                                            value={place.name} onChange={(e) => handlePlaceChange(index, 'name', e.target.value)} />
                                                    </div>
                                                    <div className="editable">
                                                        <textarea className="editable-textarea place-description black-input" rows={5}
                                                            placeholder="Place Description" value={place.description} onChange={(e) => handlePlaceChange(index, 'description', e.target.value)} />
                                                    </div>
                                                </div>
                                                {index % 2 !== 0 &&
                                                    <div className="left-place">
                                                        <input className="input-auth" ref={placeImageRefs.current[index]} id='place-image' type='file' accept='image/png, image/jpg, image/jpeg'
                                                            style={{ display: 'none' }} onChange={(e) => handlePlaceImage(index, e)}></input>
                                                        <img className="place-image clickable" src={place.imageUrl} onClick={() => placeImageRefs.current[index] && placeImageRefs.current[index].current.click()} />
                                                        {place.placeImageDeleteButton && (
                                                            <button className='red-border-button update-image-button p-0' type='button' onClick={() => handleDeletePlaceImage(index)}>Delete Image</button>
                                                        )}
                                                    </div>
                                                }
                                            </div>
                                            <button className="red-border-button delete-place-button" type='button' onClick={() => handleDeletePlace(index)}>Delete Place</button>
                                        </div>

                                    ))}
                                    <button className="green-border-button add-place-button" type='button' onClick={addEmptyPlace}>Add Place</button>
                                    {errorMessage && (
                                        <p className="error-message">{errorMessage}</p>
                                    )}
                                    <div className="cancel-save-buttons">
                                        <Link to={'/login'}><button className="red-border-button" type='button'>Cancel</button></Link>
                                        <button className="green-button" type='submit'>Save Trip</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </main>
                    <footer>
                        <div className="footer-branding">
                            <img className="esenebe-footer-log" src={esenebeLogo} />
                            <p>Learning by building real projects</p>
                        </div>
                        <div className="footer-contact">
                            <a href="https://www.esenebe.com">About Me</a>
                            <a href="https://github.com/sergioesenebe">GitHub</a>
                            <a href="https://www.linkedin.com/in/sergionbonet">Linkedin</a>
                            <a href="mailto:sergio.nunez@esenebe.com">sergio.nunez@esenebe.com</a>
                        </div>
                    </footer>
                </>
            )}
        </>
    )
}

//Export module
export default uploadTrip;