//Import external libraries
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
//Import internal libraries, css and images
import "../styles/index.css";
import "../styles/common.css";
import { sortByMostDetailed, sortByLikes, sortByNewest, showTrips, nextPage, previousPage, searchTrip, getCountries, getCities } from '../services/showTrips'
import { followUser, unfollowUser } from '../services/userActionsService';
//Import images
import logo from "../../public/images/logo.png";
import logoNavBar from "../../public/images/mytrip-text-logo-nav-bar.png";
import menuIcon from "../../public/images/menu-white.png";
import closeIcon from "../../public/images/close-white.png";
import esenebeLogo from "../../public/images/esenebe-logo.png";
import backgroundImage from "../../public/images/budapest-background.jpg";
import previousIcon from "../../public/images/previous.png";
import nextIcon from "../../public/images/next.png";
import previousNonClickableIcon from "../../public/images/previous-non-clickable.png";
import nextNonClickableIcon from "../../public/images/next-non-clickable.png";
import orderByIcon from "../../public/images/order-by-green.png";
import searchIcon from "../../public/images/search-green.png";
import notFollowedGreen from "../../public/images/follow-green.png"
import notFollowed from "../../public/images/follow-white.png"
import followed from "../../public/images/user-green.png"

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to upload a trip
function travelerTrip() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [userId, setUserId] = useState(null);
    const [traveler, setTraveler] = useState('');
    const [followedByUser, setFollowedByUser] = useState(notFollowed)
    const [trips, setTrips] = useState([]);
    const [tripsSorted, setTripsSorted] = useState([]);
    const [tripsSliced, setTripsSliced] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [previous, setPrevious] = useState(false);
    const [next, setNext] = useState(false);
    const [maxPages, setMaxPages] = useState('');
    const [orderByOpen, setOrderByOpen] = useState(false);
    const [searchByLocation, setSearchByLocation] = useState(false);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [changeFilter, setChangeFilter] = useState('');
    const [showMessage, setShowMessage] = useState('traveler')
    //Get the url
    const url = new URL(window.location.href);
    //Get the trip id
    const { travelerId } = useParams();
    //Get the params
    const page = parseInt(url.searchParams.get('page')) || 1;
    const sortParam = url.searchParams.get('sort') || 'most-liked';
    const country = url.searchParams.get('search-country') || '';
    const city = url.searchParams.get('search-city') || '';
    const trip = url.searchParams.get('search-trip') || '';
    //Save the states
    const [navPage, setNavPage] = useState(page);
    const [sort, setSort] = useState(sortParam);
    const [searchCountry, setSearchCountry] = useState(country);
    const [searchCity, setSearchCity] = useState(city);
    const [searchName, setSearchName] = useState(trip);

    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);
    //Define navigate
    const navigate = useNavigate();

    //Reload when go back
    useEffect(() => {
        const handlePopState = () => {
            window.location.reload();
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
    //Every time the searchParams change, save it
    useEffect(() => {
        //Get the params
        const page = parseInt(url.searchParams.get('page')) || 1;
        const sortParam = url.searchParams.get('sort') || 'newest';
        const country = url.searchParams.get('search-country') || '';
        const city = url.searchParams.get('search-city') || '';
        const trip = url.searchParams.get('search-trip') || '';
        //Save the state
        setNavPage(page);
        setSort(sortParam);
        setSearchCountry(country);
        setSearchCity(city);
        setSearchName(trip);
    }, [url.searchParams.toString()]);
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
                    setIsLoggedIn(true)
                //If user is the same than the traveler go to my trips
                //Save user id
                const json = await res.json();
                const user = json.user_id;
                setUserId(user);
                if (user === travelerId)
                    navigate('/mytrips');
            }
            //If there is an error catch it
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        checkAuth();
    }, [])
    //Get User info
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/users/${travelerId}`)
                const json = await res.json();
                const travelUser = json.data[0];
                setTraveler(travelUser);
                //Save if the user follows the traveler
                if (travelUser.followers.includes(userId))
                    setFollowedByUser(followed)
            }
            //If there is an error catch it
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        if (userId !== null)
            getUserInfo()
    }, [userId])
    //When create the DOM get the data
    useEffect(() => {
        const manageTripsToShow = async () => {
            if (searchName)
                handleSearchByName();
            else if (searchCity && searchCountry)
                handleSearchByCountryCity();
            else
                getTrips();
        }
        manageTripsToShow();
    }, [])
    //When trips defined order by sort
    useEffect(() => {
        if (sort === 'most-detailed')
            handleSortByMostDetailed()
        else if (sort === 'most-liked')
            handleSortByMostLikes();
        else
            handleSortByNewest()
    }, [trips])
    //When somebody click somewhere and the order by menu is open, close it
    useEffect(() => {
        //When a click anywhere check if it's open
        document.addEventListener('click', handleCloseOrderBy);
        return () => {
            document.removeEventListener('click', handleCloseOrderBy);
        };
    }, [orderByOpen]);
    //Get all countries with an API
    useEffect(() => {
        async function handleGetCountries() {
            try {
                await getCountries(setCountries);
                //If country already selected call handle country change and save the sate to show the location filter
                if (country) {
                    handleCountryChange(country);
                    setSearchByLocation(true);
                }
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
    //Order by most detailed
    async function handleSortByMostDetailed() {
        try {
            const sorted = await sortByMostDetailed(trips)
            //Save the state
            setTripsSorted(sorted);
            //Show trips
            showTrips(sorted, 'most-detailed', setInfoMessage, setMaxPages, setNext, setPrevious, setTripsSliced, changeFilter, sort, navPage, url, showMessage);
        }
        //Catch the error
        catch (err) {
            console.error('Error sorting most detailed trips: ', err);
            setErrorMessage('Error sorting the trips');
        }

    }
    //Order By Likes
    async function handleSortByMostLikes() {
        try {
            const sorted = await sortByLikes(trips);
            //Save the state
            setTripsSorted(sorted);
            //Show trips
            showTrips(sorted, 'most-liked', setInfoMessage, setMaxPages, setNext, setPrevious, setTripsSliced, changeFilter, sort, navPage, url, showMessage);

        }
        //Catch the error
        catch (err) {
            console.error('Error sorting most liked trips: ', err);
            setErrorMessage('Error sorting the trips');
        }

    }
    //Order By Created Dates
    async function handleSortByNewest() {
        try {
            const sorted = await sortByNewest(trips)
            //Save the state
            setTripsSorted(sorted);
            //Show trips
            showTrips(sorted, 'newest', setInfoMessage, setMaxPages, setNext, setPrevious, setTripsSliced, changeFilter, sort, navPage, url, showMessage);
        }
        //Catch the error
        catch (err) {
            console.error('Error sorting newest trips: ', err);
            setErrorMessage('Error sorting the trips');
        }

    }
    //Go to next page
    async function handleNextPage() {
        await nextPage(navPage, maxPages, setNext, setPrevious, tripsSorted, setTripsSliced, url);
    }
    //Go to previous page
    async function handlePreviousPage() {
        await previousPage(navPage, maxPages, tripsSorted, setTripsSliced, setPrevious, setNext, url);
    }
    //Get trips
    const getTrips = async () => {
        try {
            const body = { writer: travelerId };
            //Fetch the api to get all trips
            const res = await fetch(`${backendUrl}/api/trips/search`, {
                //Select the method, header and body with the trip data
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(body),
            })
            //If it's okay update the state of the trips
            if (!res.ok) {
                setErrorMessage('Error getting the trips');
            }
            else {
                //Get the json and save the state
                const json = await res.json();
                setTrips(json.data);
            }
        }
        //Catch the error
        catch (err) {
            console.error('Error getting trips: ', err);
            setErrorMessage('Error getting the trips');
        }
    };
    //Function to close order by
    function handleCloseOrderBy() {
        //If open close it
        if (orderByOpen) {
            setOrderByOpen(false);
        }
    }
    //Change the order
    function changeOrder(order) {
        if (order === 'most-detailed' && sort !== 'most-detailed')
            handleSortByMostDetailed();
        else if (order === 'most-liked' && sort !== 'most-liked')
            handleSortByMostLikes();
        else if (order === 'newest' && sort !== 'newest')
            handleSortByNewest();
    }
    //Get all cities by a country
    async function handleCountryChange(selectedCountry) {
        setSearchCountry(selectedCountry);
        //If is selected any country return
        if (selectedCountry === 'Any Country') {
            setCities([]);
            return;
        }
        try {
            await getCities(selectedCountry, setCities)
            if (city)
                handleSearchByCountryCity();
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
    //Search a trip that contains this name
    async function handleSearchByName(e) {
        //Don't reload the page and change to state change filter (do it by hand)
        if (e) {
            e.preventDefault();
            setChangeFilter(true);
        }

        //Remove search city and country just in case
        url.searchParams.delete('search-country');
        url.searchParams.delete('search-city');
        window.history.pushState(null, '', url.toString());
        //If is empty show all trips
        if (!searchName) {
            getTrips();
            setShowMessage('traveler');
            url.searchParams.delete('search-trip');
            window.history.pushState(null, '', url.toString());
            return;
        }
        try {
            setShowMessage(false);
            const body = { name: searchName, writer: travelerId }
            searchTrip(url, body, setTrips)
        }
        catch (err) {
            console.error('Error searching a trip: ', err);
            setErrorMessage('Unexpected Error')
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Search a trip by the country or city
    async function handleSearchByCountryCity(e) {
        //Don't reload the page and change to state change filter (do it by hand)
        if (e) {
            e.preventDefault();
            setChangeFilter(true);
            setChangeFilter(true);
        }
        //Remove search city and country just in case
        url.searchParams.delete('search-country');
        url.searchParams.delete('search-city');
        url.searchParams.delete('search-trip');
        window.history.pushState(null, '', url.toString());
        //If is selected any country get all the trips
        if (searchCountry === 'Any Country') {
            url.searchParams.delete('search-country');
            url.searchParams.delete('search-city');
            url.searchParams.delete('search-trip');
            window.history.pushState(null, '', url.toString());
            setShowMessage('traveler');
            setSearchCity('');
            setSearchCountry('');
            getTrips();
            return;
        }
        //Remove the search trip just in case
        url.searchParams.delete('search-trip');
        window.history.pushState(null, '', url.toString());
        //If there is no country show an alert
        if (!searchCountry) {
            alert('Please add a country');
            return;
        }
        const body = { country: searchCountry, writer: travelerId }
        //Define the body (country and city or just city)
        if (searchCity && searchCity !== 'Any City') {
            body.city = searchCity;
        }
        if (searchCity === 'Any City') {
            url.searchParams.set('search-city', 'Any City');
            window.history.pushState(null, '', url.toString());
        }
        try {
            setShowMessage(false);
            searchTrip(url, body, setTrips)
        }
        catch (err) {
            console.error('Error searching a trip: ', err);
            setErrorMessage('Unexpected Error')
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Handle follow a user
    async function handleFollowUser(e) {
        //Prevent to click in bigger div
        e.stopPropagation();
        try {
            //Call the function to follow a traveler
            await followUser(travelerId);
            setFollowedByUser(followed);
        }
        catch (err) {
            console.error('Error following a user: ', err);
            alert('Unexpected error');
        }
    }
    //Handle follow a user
    async function handleUnfollowUser(e) {
        //Prevent to click in bigger div
        e.stopPropagation();
        try {
            //Call the function to unfollow a traveler
            await unfollowUser(travelerId);
            setFollowedByUser(notFollowedGreen);
        }
        catch (err) {
            console.error('Error following a user: ', err);
            alert('Unexpected error');
        }
    }

    //DOM
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>myTrip - Traveler</title>
                <link rel="icon" href={logo} />
            </Helmet>
            <main className='bg-[#ECE7E2]'>
                <div className="top-green-img-section" style={{ backgroundImage: `url(${backgroundImage})` }}>
                    <nav className="top-nav-bar">
                        <img className="logo-top-left" src={logoNavBar} />
                        <button id="menu-button" type='button'
                            className="md:hidden w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={(e) => {
                                /*Prevent default and allow click it instead of the document page*/
                                e.preventDefault();
                                e.stopPropagation();
                                handleCloseOrderBy();
                                setMenuOpen(true)
                            }}>
                            <img src={menuIcon} />
                        </button>
                        {/*Links visibles in desktop*/}
                        <div className="nav-bar-links hidden md:flex gap-12">
                            <Link to={'/'} className="nav-bar-link">Home</Link>
                            <Link to={'/trips'} className="nav-bar-link">Trips</Link>
                            <Link to={'/travelers'} className="nav-bar-link"><u>Travelers</u></Link>
                            {isLoggedIn && (<Link to={'/mytrips'} className="nav-bar-link">My Trips</Link>)}
                            {isLoggedIn && (<Link to={'/savedtrips'} className="nav-bar-link">Saved Trips</Link>)}
                            {isLoggedIn && (<Link to='/myprofile' className="nav-bar-link">My Profile</Link>)}
                            {!isLoggedIn && (<Link to={'/login'} className="nav-bar-link">Log In</Link>)}
                            {!isLoggedIn && (<Link to={'/signup'} className="nav-bar-link">Sign Up</Link>)}
                        </div>
                    </nav>
                    <div className="top-content-centered min-h-[150px] md:min-h-[250px] md:gap-[20px] gap-[10px]">
                        <div className='flex md:flex-row flex-col justify-center items-center gap-[20px] w-[100%] md:w-[60%]'>
                            <img className='place-image aspect-square md:w-[300px] w-[200px] rounded-full' src={traveler.avatar} />
                            <div className='flex flex-col gap-[10px]'>
                                <h1 className="text-white text-[30px] md:text-[50px]">{traveler.username}</h1>
                                <h2 className='text-white md:text-[30px] text-[16px]'>{traveler.first_name} {traveler.second_name}</h2>
                                <span>{traveler.description}</span>
                                {isLoggedIn && (followedByUser == notFollowed || followedByUser == notFollowedGreen) && <button className='white-border-button w-[100px] h-[30px] flex flex-row gap-[5px] justify-center'
                                    onMouseEnter={() => {
                                        setFollowedByUser(notFollowedGreen);
                                    }}
                                    onMouseLeave={() => {
                                        setFollowedByUser(notFollowed)
                                    }}
                                    onClick={(e) => handleFollowUser(e)}
                                >
                                    Follow
                                    <img className='w-[15px] h-[15px]' src={followedByUser}></img>
                                </button>}
                                {isLoggedIn && followedByUser == followed && <button className='white-button w-[100px] h-[30px] flex flex-row gap-[5px] justify-center'
                                    onClick={(e) => handleUnfollowUser(e)}
                                >
                                    Followed
                                    <img className='w-[15px] h-[15px]' src={followedByUser}></img>
                                </button>}
                            </div>
                        </div>
                        {/*Links visibles in mobile, here to show it above the trip info*/}
                        {menuOpen && (<div id="mobile-menu"
                            className="fixed inset-0 z-[999] bg-[#004643] flex flex-col items-center justify-center gap-6 text-lg md:hidden">
                            <button id="close-menu" type='button' className="absolute top-4 right-4">
                                <img src={closeIcon} alt="Close Menu"
                                    className="w-6 h-6 sm:w-8 sm:h-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={(e) => {
                                        /*Prevent default and allow click it instead of the document page*/
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMenuOpen(false);
                                    }} />
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
                    </div>
                </div>
                <div id='trip-places' className="flex flex-col gap-[50px]">
                    <div className='flex flex-col gap-[20px]'>
                        <div className='grid grid-cols-3 items-top'>
                            <h1 className="font-bold text-[#004643] md:text-[30px] text-[20px]">Trips</h1>
                            {!menuOpen && <div className='justify-self-center flex flex-col gap-[5px] items-center justify-center pt-[10px]'>
                                {!searchByLocation && <form className="top-content-centered p-[0px]" onSubmit={(e) => handleSearchByName(e)}>
                                    <div className='border border-[#00464366] border-[1px] rounded-[10px] bg-[#ECE7E2] w-[150px] md:w-[275px] h-[30px] pt-[1px] pb-[1px] flex flex-row justify-between items-center'>
                                        <input className='transparent-input w-[115px] md:w-[215px] pl-[5px]' placeholder={`Look for a Trip`}
                                            value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                        <button type='submit'><img src={searchIcon} className='w-[25px] h-[25px] rounded-full p-[5px] clickable bg-[#ECE7E2]' /> </button>
                                    </div>
                                </form>}
                                {searchByLocation && <form className="top-content-centered p-[0px]" onSubmit={(e) => handleSearchByCountryCity(e)}>
                                    <div className='border border-[#00464366] border-[1px] rounded-[10px] bg-[#ECE7E2] w-[150px] md:w-[275px] h-[30px] pt-[1px] pb-[1px] flex flex-row justify-between items-center'>
                                        <select required className="green-select text-black w-[60px] md:w-[118px] ml-[5px] mr-[5px]" id="country" name="country" value={searchCountry} onChange={(e) => handleCountryChange(e.target.value)}>
                                            <option value='' disabled >Country</option>
                                            <option value='Any Country'>Any Country</option>
                                            {countries.map(c => (
                                                <option key={c.iso2} value={c.country}>{c.country}</option>
                                            ))}
                                        </select>
                                        <select required={searchCountry !== 'Any Country'} className="green-select text-black w-[55px] md:w-[118px] ml-[5px] mr-[5px]" id="city" name="city" value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
                                            <option value='' disabled>City</option>
                                            {searchCountry && searchCountry !== 'Any Country' && (<option value='Whole Country'>Whole Country</option>)}
                                            {searchCountry && searchCountry !== 'Any Country' && (<option value='Any City'>Any City</option>)}
                                            {cities.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <button type='submit'><img src={searchIcon} className='w-[25px] h-[25px] p-[5px] rounded-full clickable bg-[#ECE7E2]' /></button>
                                    </div>
                                </form>}
                                <div className='rounded-[10px] border-[#00464366] border-[1px] bg-[#ECE7E2] w-[100px] flex flex-row items-center'>
                                    <div className={`${!searchByLocation ? 'bg-[#00464366] text-[#ECE7E2] pointer-events-none' : 'text-[#004643] bg-[#ECE7E2] hover:cursor-pointer hover:bg-[00464366]'} border-0 flex justify-center w-[50px] rounded-tl-[10px] rounded-bl-[10px]`}
                                        onClick={() => setSearchByLocation(false)}>
                                        Trip</div>
                                    <div className={`${searchByLocation ? 'bg-[#00464366] text-[#ECE7E2] pointer-events-none' : 'text-[#004643] bg-[#ECE7E2] hover:cursor-pointer hover:bg-[00464366]'} border-0 flex justify-center w-[50px] rounded-tr-[10px] rounded-br-[10px]`}
                                        onClick={() => setSearchByLocation(true)}>
                                        Place</div>
                                </div>
                            </div>}
                            <div className="justify-self-end relative inline-block">
                                {!menuOpen && <div className='clickable rounded-full p-[5px] bg-[#ECE7E2]'><img title='Sort' src={orderByIcon} className='w-[30px] h-[30px]' onClick={(e) => {
                                    /*Prevent default and allow click it instead of the document page*/
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOrderByOpen(!orderByOpen)
                                }}></img></div>}
                                {orderByOpen && (
                                    <div className='shadow-md text-[16px] bg-[#f3f1ef] rounded-[10px] absolute top-full right-0 mt-2 w-[150px] z-[999]'>
                                        <div className={`${sort === 'most-liked' ? 'pointer-events-none filter brightness-[80%]' : ''} w-[100%] p-[5px] rounded-tl-[10px] rounded-tr-[10px] clickable bg-[#f3f1ef]`} onClick={(e) => {
                                            /*Prevent default and allow click it instead of the document page*/
                                            e.preventDefault();
                                            e.stopPropagation();
                                            /*Close the oreder menu*/
                                            handleCloseOrderBy();
                                            /*Change order*/
                                            changeOrder('most-liked');
                                        }}>
                                            <p>Most Liked</p>
                                        </div>
                                        <div className={`${sort === 'newest' ? 'pointer-events-none filter brightness-[80%]' : ''} w-[100%] p-[5px] clickable bg-[#f3f1ef]`} onClick={(e) => {
                                            /*Prevent default and allow click it instead of the document page*/
                                            e.preventDefault();
                                            e.stopPropagation();
                                            /*Close the oreder menu*/
                                            handleCloseOrderBy();
                                            /*Change order*/
                                            changeOrder('newest');
                                        }}>
                                            <p>Newest</p>
                                        </div>
                                        <div className={`${sort === 'most-detailed' ? 'pointer-events-none filter brightness-[80%]' : ''} w-[100%] p-[5px] rounded-bl-[10px] rounded-br-[10px] clickable bg-[#f3f1ef]`} onClick={(e) => {
                                            /*Prevent default and allow click it instead of the document page*/
                                            e.preventDefault();
                                            e.stopPropagation();
                                            /*Close the oreder menu*/
                                            handleCloseOrderBy();
                                            /*Change order*/
                                            changeOrder('most-detailed');
                                        }}>
                                            <p>Most Detailed</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='places'>
                            {tripsSliced.map((trip, index) => (
                                <div className='place clickable border rounded-[10px] border-white' onClick={() => {
                                    navigate(`/trips/${trip._id}`)
                                }}>
                                    <div className={`place-content md:flex-row ${index % 2 === 0 ? 'flex-col-reverse' : 'flex-col'}`}>
                                        {/*If index is even image will be in the left, if it's odd, the opposite*/}
                                        {index % 2 === 0 &&
                                            <div className="left-place md:w-[50%] w-[100%]">
                                                <img className="place-image h-[150px] w-[185px] md:w-[500px] md:h-[400px]" src={trip.image} />
                                            </div>
                                        }
                                        <div className="right-place flex gap-[15px] md:w-[50%] w-[100%]">
                                            <h1 required className="text-[#004643] md:text-[50px] text-[30px]">{trip.name}</h1>
                                            <p>{trip.description}</p>
                                            <p>{trip.country}, {trip.city}</p>
                                        </div>
                                        {index % 2 !== 0 &&
                                            <div className="left-place md:w-[50%] w-[100%]">
                                                <img className="place-image h-[150px] w-[185px] md:w-[500px] md:h-[400px]" src={trip.image} />
                                            </div>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {errorMessage && (
                        <p className="error-message">{errorMessage}</p>
                    )}
                    {infoMessage && !errorMessage && (
                        <p className='text-center'>{infoMessage}</p>
                    )}
                    <div className='flex flex-row gap-[10px] items-center justify-center'>
                        <img src={previous ? previousIcon : previousNonClickableIcon} className={`w-[20px] h-[20px] ${previous ? 'hover:cursor-pointer' : 'pointer-events-none'}`} onClick={handlePreviousPage} />
                        <span>{navPage}</span>
                        <img src={next ? nextIcon : nextNonClickableIcon} className={`w-[20px] h-[20px] ${next ? 'hover:cursor-pointer' : 'pointer-events-none'}`} onClick={handleNextPage} />
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
export default travelerTrip;