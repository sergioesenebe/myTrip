//Import external libraries
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
//Import internal libraries, css and images
import "../styles/index.css";
import "../styles/common.css";
import "../styles/trips.css";
//Import images
import logo from "../../public/images/logo.png";
import logoNavBar from "../../public/images/mytrip-text-logo-nav-bar.png";
import menuIcon from "../../public/images/menu-white.png";
import closeIcon from "../../public/images/close-white.png";
import esenebeLogo from "../../public/images/esenebe-logo.png";
import loadingGif from "../../public/images/loading.gif";
import likeIcon from "../../public/images/like-green.png"
import likedIcon from "../../public/images/liked-green.png"
import saveIcon from "../../public/images/save-green.png"
import savedIcon from "../../public/images/saved-green.png"

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to upload a trip
function uploadTrip() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [tripName, setTripName] = useState('');
    const [tripDescription, setTripDescription] = useState('');
    const [tripImageUrl, setTripImageUrl] = useState('');
    const [tripCountry, setTripCountry] = useState('');
    const [tripCity, setTripCity] = useState('');
    const [places, setPlaces] = useState([]);
    const [writer, setWriter] = useState([]);
    const [writerId, setWriterId] = useState('');
    const [writerAvatar, setWriterAvatar] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [likes, setLikes] = useState([]);
    const [likesCount, setLikesCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likeImg, setLikeImg] = useState(likeIcon);
    const [saveImg, setSaveImg] = useState(saveIcon);

    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);
    //Define navigate
    const navigate = useNavigate();
    //Get the trip id
    const { tripId } = useParams();

    //Get trip info
    useEffect(() => {
        const getTrips = async () => {
            try {
                //Get the specific trip
                const res = await (fetch(`${backendUrl}/api/trips/${tripId}`))
                if (!res.ok) {
                    setIsLoggedIn(false);
                    return;
                }
                setIsLoggedIn(true)
                //Save info
                const json = await res.json();
                const data = json.data[0];
                setTripName(data.name);
                setTripDescription(data.description);
                setTripImageUrl(data.image);
                setTripCountry(data.country);
                setTripCity(data.city);
                setPlaces(data.places);
                setWriter(data.username);
                setWriterId(data.writer);
                setWriterAvatar(data.avatar);
                setLikes(data.likes)
                setLikesCount(data.likes.length)
            }
            //Catch any error
            catch (err) {
                console.error('Error getting a specific trip: ', err);
                setErrorMessage('Error Getting the trip');
            }
        }
        getTrips();
    }, [])
    //Check if user has liked
    useEffect(() => {
        if (userId !== '' && likes.length > 0 && likes.includes(userId)) {
            setLiked(likes.includes(userId));
            setLikeImg(likedIcon);
        }
    }, [userId, likes])
    //Check if is logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/auth/check-auth`, { credentials: 'include' })
                //If it's logged in save the state
                if (!res.ok) {
                    setIsLoggedIn(false);
                }
                else
                    setIsLoggedIn(true);
                //If it's their trip, navegate to edit trip
                const json = await res.json();
                setUserId(json.user_id);
                if (writerId === json.user_id) {
                    navigate(`/edittrip/${tripId}`)
                }
            }
            //If there is 
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        if (writerId !== '')
            checkAuth();
    }, [writerId])
    //Get user saved trips
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/users/me`, { credentials: 'include' })
                //If it's logged in save the state
                if (!res.ok) {
                    alert('Unexpected error getting your saved trips')
                }
                //Check if 
                const json = await res.json();
                const savedTrips = json.data[0].saved_trips;
                if (savedTrips.includes(tripId)) {
                    setSaveImg(savedIcon);
                    setSaved(true);
                }
            }
            //If there is 
            catch (err) {
                console.error('Error getting user info: ', err);
            }
        }
        if (userId && userId !== '' && tripId && tripId !== '')
            getUser();
    }, [userId, tripId])
    //Function to like a trip
    async function handleLike() {
        try {
            const res = await fetch(`${backendUrl}/api/trips/like/${tripId}`, {
                //Select the method, and credentials
                method: 'PUT',
                credentials: 'include'
            })
            //If response is not ok return a message
            if (!res.ok) {
                const json = await res.json();
                throw new Error(res.message);
            }
            //Unlike and change icon
            setLiked(true);
            setLikeImg(likedIcon);
            setLikesCount(likesCount + 1);
        }
        //If there is an error catch it
        catch (err) {
            console.error('Error liking a trip: ', err);
            throw new Error(err);
        }
    }
    //Function to unlike a trip
    async function handleUnlike() {
        try {
            const res = await fetch(`${backendUrl}/api/trips/unlike/${tripId}`, {
                //Select the method, and credentials
                method: 'DELETE',
                credentials: 'include'
            })
            //If response is not ok return a message
            if (!res.ok) {
                const json = await res.json();
                alert(res.message);
            }
            //Unlike and change icon
            setLiked(false);
            setLikeImg(likeIcon);
            setLikesCount(likesCount - 1);
        }
        //If there is an error catch it
        catch (err) {
            console.error('Error unliking a trip: ', err);
            alert('Error unliking a trip');
        }
    }
    //Function to save a trip
    async function handleSave() {
        try {
            const res = await fetch(`${backendUrl}/api/users/save/${tripId}`, {
                //Select the method, and credentials
                method: 'PUT',
                credentials: 'include'
            })
            //If response is not ok return a message
            if (!res.ok) {
                const json = await res.json();
                throw new Error(res.message);
            }
            //Unsave and change icon
            setSaved(true);
            setSaveImg(savedIcon);
        }
        //If there is an error catch it
        catch (err) {
            console.error('Error saving a trip: ', err);
            throw new Error(err);
        }
    }
    //Function to unlike a trip
    async function handleUnsave() {
        try {
            const res = await fetch(`${backendUrl}/api/users/unsave/${tripId}`, {
                //Select the method, and credentials
                method: 'DELETE',
                credentials: 'include'
            })
            //If response is not ok return a message
            if (!res.ok) {
                const json = await res.json();
                alert(res.message);
            }
            //Unlike and change icon
            setSaved(false);
            setSaveImg(saveIcon);
        }
        //If there is an error catch it
        catch (err) {
            console.error('Error unsaving a trip: ', err);
            alert('Error unsaving a trip');
        }
    }
    //DOM
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>myTrip - Trip</title>
                <link rel="icon" href={logo} />
            </Helmet>
            <main className='bg-[#ECE7E2]'>
                <div className="top-green-img-section" style={{ backgroundImage: `url(${tripImageUrl})` }}>
                    <nav className="top-nav-bar">
                        <img className="logo-top-left" src={logoNavBar} />
                        <button id="menu-button" type='button'
                            className="md:hidden w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => { setMenuOpen(true) }}>
                            <img src={menuIcon} />
                        </button>
                        {/*Links visibles in desktop*/}
                        <div className="nav-bar-links hidden md:flex gap-12">
                            <Link to={'/'} className="nav-bar-link">Home</Link>
                            <Link to={'/trips'} className="nav-bar-link"><u>Trips</u></Link>
                            <Link to={'/travelers'} className="nav-bar-link">Travelers</Link>
                            {isLoggedIn && (<Link to={'/mytrips'} className="nav-bar-link">My Trips</Link>)}
                            {isLoggedIn && (<Link to={'/savedtrips'} className="nav-bar-link">Saved Trips</Link>)}
                            {isLoggedIn && (<Link to='/myprofile' className="nav-bar-link">My Profile</Link>)}
                            {!isLoggedIn && (<Link to={'/login'} className="nav-bar-link">Log In</Link>)}
                            {!isLoggedIn && (<Link to={'/signup'} className="nav-bar-link">Sign Up</Link>)}
                        </div>
                    </nav>
                    <div className="trip-info min-h-[150px] md:min-h-[250px] md:gap-[20px] gap-[10px]">
                        {/*Links visibles in mobile, here to show it above the trip info*/}
                        {menuOpen && (<div id="mobile-menu"
                            className="fixed inset-0 z-[999] bg-[#004643] flex flex-col items-center justify-center gap-6 text-lg md:hidden">
                            <button id="close-menu" type='button' className="absolute top-4 right-4">
                                <img src={closeIcon}
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
                            {isLoggedIn && (<Link to={'/savedtrips'}
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Saved
                                Trips</Link>)}
                            {isLoggedIn && (<Link to='/myprofile'
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">My
                                Profile</Link>)}
                            {!isLoggedIn && (<Link to={'/login'}
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Log In</Link>)}
                            {!isLoggedIn && (<Link to={'/signup'}
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Sign Up</Link>)}
                        </div>)}
                        <div>
                            <h1 className="text-white text-[30px] md:text-[50px] trip-name" >{tripName}</h1>
                            <p className="text-white text-[12px] md:text-[16px] trip-description">{tripDescription}</p>
                        </div>
                        <div >
                            <p className="text-white">{tripCountry}, {tripCity}</p>
                        </div>
                        <div className='flex flex-row gap-[10px] items-center'>
                            <img src={writerAvatar} className='w-[50px] h-[50px] border border-white rounded-full clickable' onClick={(e) => { e.preventDefault(); navigate(`/travelers/${writerId}`) }} />
                            <p className='text-[16px]'>{writer}</p>
                        </div>
                    </div>
                </div>
                <div id="trip-places" className='flex flex-col gap-[20px]'>
                    <h1 className="font-bold text-[#004643] md:text-[30px] text-[20px]">Places to Visit</h1>
                    <div className="places">
                        {places.length > 0 ? places.map((place, index) => (
                            <div className="place" key={index}>
                                <div className={`place-content md:flex-row ${index % 2 === 0 ? 'flex-col-reverse' : 'flex-col'}`}>
                                    {/*If index is even image will be in the left, if it's odd, the opposite*/}
                                    {index % 2 === 0 &&
                                        <div className="left-place md:w-[50%] w-[100%]">
                                            <img className="place-image h-[150px] w-[185px] md:w-[500px] md:h-[400px]" src={place.image} />
                                        </div>
                                    }
                                    <div className="right-place flex gap-[15px] md:w-[50%] w-[100%]">
                                        <div>
                                            <h1 required className="text-[#004643] md:text-[50px] text-[30px]">{place.name}</h1>
                                            <p >{place.description}</p>
                                        </div>
                                    </div>
                                    {index % 2 !== 0 &&
                                        <div className="left-place md:w-[50%] w-[100%]">
                                            <img className="place-image h-[150px] w-[185px] md:w-[500px] md:h-[400px]" src={place.image} />
                                        </div>
                                    }
                                </div>
                            </div>
                        ))
                            : <p className='text-centered'>Looks like there are no places yet.</p>
                        }
                        {errorMessage && (
                            <p className="error-message">{errorMessage}</p>
                        )}
                        <div className='md:w-[80%] w-[100%] flex flex-row items-center'>
                            <p className='text-[16px] text-[#004643]'>{likesCount}</p>
                            {!liked && isLoggedIn && <button
                                onMouseEnter={() => setLikeImg(likedIcon)}
                                onMouseLeave={() => setLikeImg(likeIcon)}
                                onClick={() => handleLike()}
                            ><img title='Like' className='w-[50px] h-[50px]' src={likeImg} /></button>}
                            {liked && isLoggedIn && <button
                                onMouseEnter={() => setLikeImg(likeIcon)}
                                onMouseLeave={() => setLikeImg(likedIcon)}
                                onClick={() => handleUnlike()}
                            ><img title='Unlike' className='w-[50px] h-[50px]' src={likeImg} /></button>}
                            {!isLoggedIn && <button className='pointer-events-none'><img alt='Like' className='w-[50px] h-[50px]' src={likeIcon} /></button>}
                            {!saved && isLoggedIn && <button
                                onMouseEnter={() => setSaveImg(savedIcon)}
                                onMouseLeave={() => setSaveImg(saveIcon)}
                                onClick={() => handleSave()}
                            ><img title='Save' className='w-[55px] h-[55px]' src={saveImg} /></button>}
                            {saved && isLoggedIn && <button
                                onMouseEnter={() => setSaveImg(saveIcon)}
                                onMouseLeave={() => setSaveImg(savedIcon)}
                                onClick={() => handleUnsave()}
                            ><img title='Unsave' className='w-[55px] h-[55px]' src={saveImg} /></button>}
                        </div>

                    </div>
                </div>
            </main>
            <footer className='p-[25px] md:p-[50px]'>
                <div className="footer-branding">
                    <img className="esenebe-footer-log" src={esenebeLogo} />
                </div>
                <div className="footer-contact gap-[10px] md:gap-[25px] justify-end text-[10px] md:text-[16px]">
                    <a href="https://www.esenebe.com">About Me</a>
                    <a href="https://github.com/sergioesenebe">GitHub</a>
                    <a href="https://www.linkedin.com/in/sergionbonet">LinkedIn</a>
                    <a href="mailto:sergio.nunez@esenebe.com">sergio.nunez@esenebe.com</a>
                </div>
            </footer>
        </>
    )
}

//Export module
export default uploadTrip;