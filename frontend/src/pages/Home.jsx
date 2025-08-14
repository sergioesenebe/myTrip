//Import external libraries
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//Import internal libraries, css and images
import "../styles/index.css";
import "../styles/common.css";
//Import images
import logoNavBar from "../../public/images/mytrip-text-logo-nav-bar.png";
import menuIcon from "../../public/images/menu-white.png";
import closeIcon from "../../public/images/close-white.png";
import esenebeLogo from "../../public/images/esenebe-logo.png";
import backgroundImage from "../../public/images/budapest-background.jpg"
import citiesMap from "../../public/images/cities-map.png"
import countriesMap from "../../public/images/countries-map.png"
import trendingTrips from "../../public/images/trending-trips.jpg"

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to upload a trip
function home() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [interestingTrips, setInterestingTrips] = useState([]);
    const [interestingUsers, setInterestingUsers] = useState([]);
    const [errorMessageTrips, setErrorMessageTrips] = useState('');
    const [errorMessageUsers, setErrorMessageUsers] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    //Set navigate
    const navigate = useNavigate();


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
    //Get the three most interesting trips
    useEffect(() => {
        const interestingTrips = async () => {
            try {
                //Fetch the api to get interesting trips
                const res = await fetch(`${backendUrl}/api/trips/interesting`)
                //If it's okay update the state of the interesting trips
                if (!res.ok) {
                    setErrorMessageTrips('Error getting the trips');
                }
                else {
                    //Get the json and save the state
                    const json = await res.json();
                    setInterestingTrips(json.data);
                }
            }
            //Catch the error
            catch (err) {
                console.error('Error getting interesting trips: ', err);
                setErrorMessageTrips('Error getting the trips');
            }
        };
        interestingTrips();
    }, [])
    //Get the three most interesting users
    useEffect(() => {
        const interestingUsers = async () => {
            try {
                //Fetch the api to get interesting users
                const res = await fetch(`${backendUrl}/api/trips/interesting-users`)
                //If it's okay update the state of the interesting users
                if (!res.ok) {
                    setErrorMessageUsers('Error getting the users');
                }
                else {
                    //Get the json and save the state
                    const json = await res.json();
                    setInterestingUsers(json.data);
                }
            }
            //Catch the error
            catch (err) {
                console.error('Error getting interesting users: ', err);
                setErrorMessageUsers('Error getting the users');
            }
        };
        interestingUsers();
    }, [])
    //DOM
    return (
        <>
            <main className='bg-[#ECE7E2]'>
                <div className="top-green-img-section" style={{ backgroundImage: `url(${backgroundImage})` }}>
                    <nav className="top-nav-bar">
                        <img className="logo-top-left" src={logoNavBar} />
                        <button id="menu-button" type='button'
                            className="md:hidden w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => { setMenuOpen(true) }}>
                            <img src={menuIcon} />
                        </button>
                        {/*Links visibles in desktop*/}
                        <div className="nav-bar-links hidden md:flex gap-12">
                            <Link to={'/'} className="nav-bar-link"><u>Home</u></Link>
                            <Link to={'/trips'} className="nav-bar-link">Trips</Link>
                            <Link to={'/travelers'} className="nav-bar-link">Travelers</Link>
                            {isLoggedIn && (<Link to={'/mytrips'} className="nav-bar-link">My Trips</Link>)}
                            {isLoggedIn && (<Link to={'/savedtrips'} className="nav-bar-link">Saved Trips</Link>)}
                            {isLoggedIn && (<Link to='/myprofile' className="nav-bar-link">My Profile</Link>)}
                            {!isLoggedIn && (<Link to={'/login'} className="nav-bar-link">Log In</Link>)}
                            {!isLoggedIn && (<Link to={'/signup'} className="nav-bar-link">Sign Up</Link>)}
                        </div>
                    </nav>
                    <div className="top-content-centered">
                        <h1>Welcome to myTrip</h1>
                        <p>Explore curated travel routes from real adventurers.<br />Find inspiration to plan your next adventure.</p>
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
                            {isLoggedIn && (<Link to={'/savedtrips'}
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Saved
                                Trips</Link>)}
                            {isLoggedIn && (<Link to='/myprofile' href="#"
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">My
                                Profile</Link>)}
                            {!isLoggedIn && (<Link to={'/login'}
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Log In</Link>)}
                            {!isLoggedIn && (<Link to={'/signup'}
                                className="w-full text-center py-4 hover:bg-[#ECE7E2] hover:text-[#004643] transition-colors duration-200">Sign Up</Link>)}
                        </div>)}
                    </div>
                </div>
                <div id='trip-places' className="flex flex-col gap-[50px]">
                    <div className='flex flex-col gap-[20px]'>
                        <h1 className="text-3xl font-bold text-[#004643]">Interesting Trips</h1>
                        {errorMessageTrips && (
                            <p className="error-message">{errorMessageTrips}</p>
                        )}
                        <div className='flex flex-row items-center justify-center'>
                            {interestingTrips.map(trip => (
                                <div className='flex flex-col gap-[10px] w-1/3 items-center justify-center'>
                                    <img className="w-[400px] h-[300px] md:h-[500px] place-image clickable" src={trip.image} onClick={() => { navigate(`/trips/${trip._id}`) }} />
                                    <p className='text-[16px]'>{trip.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col gap-[20px]'>
                        <h1 className="text-3xl font-bold text-[#004643]">Interesting Travellers</h1>
                        {errorMessageUsers && (
                            <p className="error-message">{errorMessageUsers}</p>
                        )}
                        <div className='flex flex-row items-center justify-center'>
                            {interestingUsers.map(user => (
                                <div className='flex flex-col gap-[10px] w-1/3 items-center justify-center'>
                                    <img className="w-[300px] aspect-square place-image clickable rounded-full" src={user.avatar} />
                                    <p className='text-[16px]'>{user.username}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#004643] mb-4">Explore</h1>
                        <div className='flex flex-row items-center justify-center'>
                            <div className='flex flex-col gap-[10px] w-1/3 items-center justify-center'>
                                <img className="w-[400px] aspect-square place-image clickable" src={countriesMap} />
                                <p className='text-[16px]'>Countries</p>
                            </div>
                            <div className='flex flex-col gap-[10px] w-1/3 items-center justify-center'>
                                <img className="w-[400px] aspect-square place-image clickable" src={citiesMap} />
                                <p className='text-[16px]'>Cities</p>
                            </div>
                            <div className='flex flex-col gap-[10px] w-1/3 items-center justify-center'>
                                <img className="w-[400px] aspect-square place-image clickable" src={trendingTrips} />
                                <p className='text-[16px]'>Trending Trips</p>
                            </div>
                        </div>
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
    )
}

//Export module
export default home;