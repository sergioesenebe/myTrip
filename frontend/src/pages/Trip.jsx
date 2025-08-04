//Import external libraries
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
//Import internal libraries, css and images
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

//Function to upload a trip
function uploadTrip() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [tripName, setTripName] = useState('');
    const [tripDescription, setTripDescription] = useState('');
    const [tripImageUrl, setTripImageUrl] = useState('');
    const [tripCountry, setTripCountry] = useState('');
    const [tripCity, setTripCity] = useState('');
    const [places, setPlaces] = useState([]);
    const [writer, setWriter] = useState([]);
    const [writerId, setWriterId] = useState([]);
    const [writerAvatar, setWriterAvatar] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

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
                    setErrorMessage('Error getting the trip');
                    return;
                }
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
            }
            //Catch any error
            catch (err) {
                console.error('Error getting a specific trip: ', err);
                setErrorMessage('Error Getting the trip');
            }
        }
        getTrips();
    }, [])
    //Check if is logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/auth/check-auth`, { credentials: 'include' })
                //If it's logged in save the state
                if (!res.ok) {
                    setIsLoggedIn(false);
                }
                //If it's their trip, navegate to edit trip
                const json = await res.json();
                if (writerId === json.user_id ){
                    console.log('writer id: ', writerId);
                    console.log('user id: ', json.user_id);
                    navigate(`/edittrip/${tripId}`)
                }
            }
            //If there is 
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        checkAuth();
    }, [writerId])
    //DOM
    return (
        <>
            {isLoading && (<div className="loading"><img src={loadingGif}></img>Loading...</div>)}
            <>
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
                                <a className="nav-bar-link">Travelers</a>
                                <Link to={'/mytrips'} className="nav-bar-link">My Trips</Link>
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
                                <a href="#"
                                    className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Travelers</a>
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
                            <div>
                                <h1 className="text-white text-[50px] trip-name" >{tripName}</h1>
                                <p className="text-white text-[16px] trip-description">{tripDescription}</p>
                            </div>
                            <div >
                                <p className="text-white">{tripCountry}, {tripCity}</p>
                            </div>
                            <div className='flex flex-row gap-[10px] items-center'>
                                <img src={writerAvatar} className='w-[35px] h-[35px] border border-white rounded-full clickable' />
                                <p>{writer}</p>
                            </div>
                        </div>
                    </div>
                    <div id="trip-places" className='flex flex-col gap-[20px]'>
                        <h1 className="text-3xl font-bold text-[#004643]">Places to Visit</h1>
                        <div className="places">
                            {places.length > 0 ? places.map((place, index) => (
                                <div className="place" key={index}>
                                    <div className="place-content">
                                        {/*If index is even image will be in the left, if it's odd, the opposite*/}
                                        {index % 2 === 0 &&
                                            <div className="left-place">
                                                <img className="place-image" src={place.image} />
                                            </div>
                                        }
                                        <div className="right-place">
                                            <div>
                                                <h1 required className="text-[#004643] text-[50px] place-name">{place.name}</h1>
                                                <p className="text-[16px] place-description" >{place.description}</p>
                                            </div>
                                        </div>
                                        {index % 2 !== 0 &&
                                            <div className="left-place">
                                                <img className="place-image" src={place.image} />
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
                        </div>
                    </div>
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
        </>
    )
}

//Export module
export default uploadTrip;