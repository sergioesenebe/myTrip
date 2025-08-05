//Import external libraries
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
//Import internal libraries, css and images
import { handleUploadImage, handleDeleteImage } from '../services/uploadService';
import { addTripImage, addPlaceImage, handlePlaceChange, deleteTripImage, addEmptyPlace, deletePlace, deletePlaceImage } from '../services/editTripService';
import { getCountries, getCities } from '../services/showTrips'
import "../styles/index.css";
import "../styles/common.css";
import "../styles/trips.css";
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
const defaultTripImage = 'https://res.cloudinary.com/drmjf3gno/image/upload/v1753346706/default-country_hxzjcd.jpg';

//Function to upload a trip
function editTrip() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [tripName, setTripName] = useState('');
    const [tripDescription, setTripDescription] = useState('');
    const [tripFile, setTripFile] = useState('');
    const [tripCountry, setTripCountry] = useState('');
    const [tripCity, setTripCity] = useState('');
    const [places, setPlaces] = useState([]);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [tripImage, setTripImage] = useState(defaultTripImage);
    const [displayDeleteButton, setDisplayDeleteButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isTheirTrip, setIsTheirTrip] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [imagesToDelete, setImagesToDelete] = useState([]);

    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);
    //Define trip image reference
    const tripImageRef = useRef();
    //Define place image reference
    const placeImageRefs = useRef([]);
    //Define navigate
    const navigate = useNavigate();
    //Get the trip id
    const { tripId } = useParams();


    //Check if is logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/auth/check-auth`, { credentials: 'include' })
                //If it's logged in save the state
                if (!res.ok) {
                    setIsLoggedIn(false);
                }
            }
            //If there is 
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        checkAuth();
    }, [])
    //Get trip info
    useEffect(() => {
        const getTrip = async () => {
            try {
                //Get the specific trip
                const res = await fetch(`${backendUrl}/api/trips/my-trips/${tripId}`, { credentials: 'include' })
                if (!res.ok) {
                    setErrorMessage('Error getting the trip');
                    return;
                }
                //Save info
                const json = await res.json();
                const data = json.data[0];
                //If there is no trip, it's because it's not their trip, so don't show the page
                if (!data) {
                    setIsTheirTrip(false);
                    return;
                }
                setTripName(data.name);
                setTripDescription(data.description);
                setTripImage(data.image);
                if (data.image !== defaultTripImage)
                    setDisplayDeleteButton(true);
                setTripCountry(data.country);
                setTripCity(data.city);
                setPlaces(data.places);
                if (data.places) {
                    data.places.map((place) => {
                        if (place.image !== defaultPlace)
                            place.placeImageDeleteButton = true;
                        placeImageRefs.current.push(React.createRef());
                    })
                }
            }
            //Catch any error
            catch (err) {
                console.error('Error getting a specific trip: ', err);
                setErrorMessage('Error Getting the trip');
            }
        }
        getTrip();
    }, [])
    //Get all countries with an API
    useEffect(() => {
        async function handleGetCountries() {
            try {
                await getCountries(setCountries);
            }
            catch (err) {
                //Log the error and set the message in state
                console.error("Error getting the countries: ", err);
                setErrorMessage("Could not load countries");
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
        }
        //Call async function
        handleGetCountries();
    }, [])
    //Edit a Trip
    async function handleEditTrip(e) {
        //Remove old messages
        setErrorMessage('');;
        //Prevent default
        e.preventDefault();
        try {
            setIsLoading(true);
            let newTripImage = tripImage;
            //Upload the Trip Image to Cloudinary (if it has change it) and save the url
            if (tripFile) {
                newTripImage = await handleUploadImage(tripFile, tripImage, 'trips');
                setTripImage(newTripImage);
            }
            //Set the payload to upload the trip (without the places)
            const tripPayload = {
                name: tripName,
                country: tripCountry,
                city: tripCity,
                image: newTripImage,
                description: tripDescription,
                places: [],
            }
            //Use for ... of to use await correctly
            for (const [index, place] of places.entries()) {
                let newPlaceImage = place.image;
                //Upload the Trip Image to Cloudinary (if it has change it) and save the url
                if (place.file) {
                    newPlaceImage = await handleUploadImage(place.file, place.image, 'places');
                    handlePlaceChange(index, 'image', newPlaceImage, places, setPlaces);
                }
                const newPlace = {
                    name: place.name,
                    image: newPlaceImage,
                    description: place.description,
                }
                tripPayload.places.push(newPlace);
            }
            //Fetch the update trip
            const response = await fetch(`${backendUrl}/api/trips/my-trips/${tripId}`, {
                //Select the method, header and body with the trip data
                method: 'PUT',
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
                //Delete all images
                imagesToDelete.map((image) => { handleDeleteImage(image) });
                //Navigate to mytrips 
                navigate('/mytrips');
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
        }
        catch (err) {
            console.error('Error updating the trip: ', err);
            setErrorMessage('Unexpected Error');
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        } finally {
            setIsLoading(false);
        }
    }
    //Delete a Trip
    async function handleDeleteTrip(e) {
        //Remove old messages
        setErrorMessage('');;
        //Prevent default
        e.preventDefault();
        //Show a confirm message if is not sure, return
        const sure = confirm('Are you sure that you want to delete the whole trip?');
        if (!sure) return
        try {
            setIsLoading(true);
            //Fetch the delete trip
            const response = await fetch(`${backendUrl}/api/trips/my-trips/${tripId}`, {
                //Select the method, header and body with the trip data
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            })
            //If there is an error show it
            if (!response.ok) {
                setErrorMessage('Error deleting the trip');
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
            else {
                //Delete all images
                if (tripImage.includes('https://res.cloudinary.com/')) {
                    handleDeleteImage(tripImage)
                }
                places.map((place) => {
                    if (place.image.includes('https://res.cloudinary.com/')) {
                        handleDeleteImage(place.image)
                    }
                });
                //Navigate to mytrips 
                navigate('/mytrips');
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
        }
        catch (err) {
            console.error('Error updating the trip: ', err);
            setErrorMessage('Unexpected Error');
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        } finally {
            setIsLoading(false);
        }
    }
    //Get all cities by a country
    function handleCountryChange(selectedCountry) {
        //Save the state for the trip
        setTripCountry(selectedCountry);
        try {
            //Get the sities for this country
            getCities(selectedCountry, setCities)
        }
        catch (err) {
            //Log the error and set the message in state
            console.error("Error getting the citties: ", err);
            setErrorMessage("Could not load cities");
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Function to check if the format is valid and update the trip image
    async function handleTripImage(file) {
        try {
            await addTripImage(file, tripImageRef, setTripFile, setTripImage, setDisplayDeleteButton);
        }
        //Catch and show the error
        catch (err) {
            console.error('Error updating trip image: ', err);
            alert(err);
        }
    }
    //Function to check if the format is valid and update the place image
    async function handlePlaceImage(file, index) {
        try {
            await addPlaceImage(file, index, tripImageRef, places, setPlaces);
        }
        //Catch and show the error
        catch (err) {
            console.error('Error updating trip image: ', err);
            alert(err);
        }
    }
    //Function to delete the image when button clicked
    async function handleDeleteTripImage() {
        try {
            //If is in cloudinary, add to the array to delete it
            if (tripImage.includes('https://res.cloudinary.com/')) {
                const newImagesToDelete = [...imagesToDelete]
                newImagesToDelete.push(tripImage)
                setImagesToDelete(newImagesToDelete)
            }
            await deleteTripImage(tripImageRef, setTripImage, setTripFile, setDisplayDeleteButton);
        }
        catch (err) {
            console.error('Error deleting the image: ', err);
            alert('Error deleting the image');
        }
    }
    //Function to delete the image when button clicked
    async function handleDeletePlaceImage(index) {
        try {
            if (places[index].image.includes('https://res.cloudinary.com/')) {
                const newImagesToDelete = [...imagesToDelete]
                newImagesToDelete.push(places[index].image)
                setImagesToDelete(newImagesToDelete)
            }
            await deletePlaceImage(index, placeImageRefs, places, setPlaces)
        }
        catch (err) {
            console.error('Error deleting the image: ', err);
            alert('Error deleting the image');
        }
    }
    //DOM
    return (
        <>
            {isLoading && (<div className="loading"><img src={loadingGif}></img>Loading...</div>)}
            {!isLoggedIn && (<div className="notLoggedIn"><h1>You're not logged in</h1><p>Please <Link className='link' to={'/login'}>Log In</Link> to access this page.</p></div>)}
            {isLoggedIn && !isTheirTrip && (<div className="notLoggedIn"><h1>You can't edit this trip</h1><p> Return to <Link className='link' to={'/trips'}>Trips</Link> to continue searching for interesting travel ideas</p></div>)}
            {!isLoading && isLoggedIn && isTheirTrip && (
                <>
                    <main className='bg-[#ECE7E2]'>
                        <form onSubmit={handleEditTrip}>
                            <div className="top-green-img-section" style={{ backgroundImage: `url(${tripImage})` }}>
                                <nav className="top-nav-bar">
                                    <img className="logo-top-left" src={logoNavBar} />
                                    <button id="menu-button" type='button'
                                        className="md:hidden w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => { setMenuOpen(true) }}>
                                        <img src={menuIcon} />
                                    </button>
                                    {/*Links visibles in desktop*/}
                                    <div className="nav-bar-links hidden md:flex gap-12">
                                        <Link to={'/'} className="nav-bar-link">Home</Link>
                                        <Link to={'/trips'} className="nav-bar-link">Trips</Link>
                                        <Link to={'/travelers'} className="nav-bar-link">Travelers</Link>
                                        <Link to='/mytrips' className="nav-bar-link"><u>My Trips</u></Link>
                                        <a className="nav-bar-link">Saved Trips</a>
                                        <Link to='/myprofile' className="nav-bar-link">My Profile</Link>
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
                                        <Link to={'/'}
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Home</Link>
                                        <Link to={'/trips'}
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Trips</Link>
                                        <Link to={'/travelers'}
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Travelers</Link>
                                        {isLoggedIn && (<Link to={'/mytrips'}
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">My
                                            Trips</Link>)}
                                        {isLoggedIn && (<a href="#"
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Saved
                                            Trips</a>)}
                                        {isLoggedIn && (<Link to='/myprofile'
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">My
                                            Profile</Link>)}
                                        {!isLoggedIn && (<Link to={'/login'}
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Log In</Link>)}
                                        {!isLoggedIn && (<Link to={'/signup'}
                                            className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Sign Up</Link>)}
                                    </div>)}
                                    <div className="flex justify-between w-[100%] items-center">
                                        <input required className="editable-input trip-name white-input md:w-[60%] w-[100%]" value={tripName} placeholder="Trip Name" onChange={(e) => setTripName(e.target.value)} />
                                        <button type='button' className='red-button w-[160px] h-[50px]' onClick={(e) => {handleDeleteTrip(e)}}>Delete Whole Trip</button>
                                    </div>
                                    <div className="editable">
                                        <textarea className="editable-textarea trip-description white-input" rows={3}
                                            placeholder="Trip Description" value={tripDescription} onChange={(e) => setTripDescription(e.target.value)} />
                                    </div>
                                    <div className="selections">
                                        <label htmlFor="country">Country</label>
                                        <select required className="white-select" id="country" name="country" value={tripCountry} onChange={(e) => handleCountryChange(e.target.value)}>
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
                                        style={{ display: 'none' }} onChange={e => handleTripImage(e.target.files[0])}></input>

                                    <div className="flex flex-row items-center gap-5 w-[min-content]">
                                        <button className="white-border-button update-image-button " type='button' onClick={() => tripImageRef.current && tripImageRef.current.click()}>Update Trip Image</button>
                                        {displayDeleteButton && (
                                            <button className='red-button update-image-button' type='button' onClick={handleDeleteTripImage}>Delete Trip Image</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div id="trip-places" className='flex flex-col gap-[20px]'>
                                <h1 className="text-3xl font-bold text-[#004643]">Places to Visit</h1>
                                <div className="places">
                                    {places.map((place, index) => (
                                        <div className="place" key={index}>
                                            <div className="place-content">
                                                {/*If index is even image will be in the left, if it's odd, the opposite*/}
                                                {index % 2 === 0 &&
                                                    <div className="left-place">
                                                        <input className="input-auth" ref={placeImageRefs.current[index]} id='place-image' type='file' accept='image/png, image/jpg, image/jpeg'
                                                            style={{ display: 'none' }} onChange={(e) => handlePlaceImage(e.target.files[0], index)}></input>
                                                        <img className="place-image clickable" src={place.image} onClick={() => placeImageRefs.current[index] && placeImageRefs.current[index].current.click()} />
                                                        {place.placeImageDeleteButton && (
                                                            <button className='red-border-button update-image-button p-0' type='button' onClick={() => handleDeletePlaceImage(index)}>Delete Image</button>
                                                        )}
                                                    </div>
                                                }
                                                <div className="right-place">
                                                    <div className="editable">
                                                        <input required className="editable-input place-name green-input" placeholder="Place Name"
                                                            value={place.name} onChange={(e) => handlePlaceChange(index, 'name', e.target.value, places, setPlaces)} />
                                                    </div>
                                                    <div className="editable">
                                                        <textarea className="editable-textarea place-description black-input" rows={5}
                                                            placeholder="Place Description" value={place.description} onChange={(e) => handlePlaceChange(index, 'description', e.target.value, places, setPlaces)} />
                                                    </div>
                                                </div>
                                                {index % 2 !== 0 &&
                                                    <div className="left-place">
                                                        <input className="input-auth" ref={placeImageRefs.current[index]} id='place-image' type='file' accept='image/png, image/jpg, image/jpeg'
                                                            style={{ display: 'none' }} onChange={(e) => handlePlaceImage(e.target.files[0], index)}></input>
                                                        <img className="place-image clickable" src={place.image} onClick={() => placeImageRefs.current[index] && placeImageRefs.current[index].current.click()} />
                                                        {place.placeImageDeleteButton && (
                                                            <button className='red-border-button update-image-button p-0' type='button' onClick={() => handleDeletePlaceImage(index)}>Delete Image</button>
                                                        )}
                                                    </div>
                                                }
                                            </div>
                                            <button className="red-border-button delete-place-button" type='button' onClick={() =>
                                                deletePlace(index, places, placeImageRefs, setPlaces, imagesToDelete, setImagesToDelete)}>Delete Place</button>
                                        </div>

                                    ))}
                                    <button className="green-border-button add-place-button" type='button' onClick={() => addEmptyPlace(placeImageRefs, setPlaces)}>Add Place</button>
                                    {errorMessage && (
                                        <p className="error-message">{errorMessage}</p>
                                    )}
                                    <div className="cancel-save-buttons">
                                        <Link to={'/mytrips'}><button className="red-border-button" type='button'>Cancel</button></Link>
                                        <button className="green-button" type='submit'>Update Trip</button>
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
export default editTrip;