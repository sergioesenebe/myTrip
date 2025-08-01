//Import external libraries
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
//Import internal libraries, css and images
import "../styles/index.css";
import "../styles/common.css";
import { sortByMostDetailed, sortByLikes, sortByNewest, showTrips } from '../services/showTrips'
//Import images
import logoNavBar from "../../public/images/mytrip-text-logo-nav-bar.png";
import menuIcon from "../../public/images/menu-white.png";
import closeIcon from "../../public/images/close-white.png";
import esenebeLogo from "../../public/images/esenebe-logo.png";
import loadingGif from "../../public/images/loading.gif";
import backgroundImage from "../../public/images/budapest-background.jpg";
import previousIcon from "../../public/images/previous.png";
import nextIcon from "../../public/images/next.png";
import previousNonClickableIcon from "../../public/images/previous-non-clickable.png";
import nextNonClickableIcon from "../../public/images/next-non-clickable.png";
import orderByIcon from "../../public/images/order-by-green.png";
import searchIcon from "../../public/images/search-green.png";


//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to upload a trip
function trips() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [changeFilter, setChangeFilter] = useState('');
    //Get the url
    const url = new URL(window.location.href);
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


    //Every time the searchParams change, save it
    useEffect(() => {
        //Get the params
        const page = parseInt(url.searchParams.get('page')) || 1;
        const sortParam = url.searchParams.get('sort') || 'most-liked';
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
            }
            //If there is an error catch it
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        checkAuth();
    }, [])
    //Order by most detailed
    async function handleSortByMostDetailed() {
        try {
            const sorted = await sortByMostDetailed(trips)
            //Save the state
            setTripsSorted(sorted);
            //Show trips
            showTrips(sorted, 'most-detailed', setInfoMessage, setMaxPages, setNext, setPrevious, setTripsSliced, sort, navPage, url, window);
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
            showTrips(sorted, 'most-liked', setInfoMessage, setMaxPages, setNext, setPrevious, setTripsSliced, sort, navPage, url, window);

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
            showTrips(sorted, 'newest', setInfoMessage, setMaxPages, setNext, setPrevious, setTripsSliced, sort, navPage, url, window);
        }
        //Catch the error
        catch (err) {
            console.error('Error sorting newest trips: ', err);
            setErrorMessage('Error sorting the trips');
        }

    }
    //When create the DOM get the data
    useEffect(() => {
        const manageTripsToShow = async () => {
            if (searchName)
                handleSearchByTrip();
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
        else if (sort === 'newest')
            handleSortByNewest()
        else
            handleSortByMostLikes();
    }, [trips])
    //Go to next page
    function nextPage() {
        if (navPage <= maxPages) {
            //Save the start of the pages
            const start = navPage * 6;
            //Save the trips sliced (Will be shown)
            const sliced = tripsSorted.slice(start, start + 6);
            setTripsSliced(sliced);
            //If next page is greater or equal than maxPages next will be false
            if (navPage + 1 >= maxPages)
                setNext(false);
            //If actual page is 1 previous will be true
            if (navPage === 1)
                setPrevious(true);
            //Go to the top of the trips
            document.getElementById('trip-places').scrollIntoView({ behavior: 'smooth' });
            //Update page in the url
            url.searchParams.set('page', navPage + 1);
            window.history.pushState(null, '', url.toString());
        }
    }
    //Get trips
    const getTrips = async () => {
        try {
            //Fetch the api to get all trips
            const res = await fetch(`${backendUrl}/api/trips/`)
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
    //Go to previous page
    function previousPage() {
        if (navPage >= 1) {
            //Save the start of the pages
            const end = (navPage - 1) * 6;
            //Save the trips sliced (Will be shown)
            const sliced = tripsSorted.slice(end - 6, end);
            setTripsSliced(sliced);
            //If previous page is smaller or equal than 1 previous will be false
            if (navPage - 1 <= 1)
                setPrevious(false);
            //If next page is maxPages next will be true
            if (navPage === maxPages)
                setNext(true);
            //Go to the top of the trips
            document.getElementById('trip-places').scrollIntoView({ behavior: 'smooth' });
            //Update page in the url
            url.searchParams.set('page', navPage - 1);
            window.history.pushState(null, '', url.toString());
        }
    }
    //Function to close order by
    function handleCloseOrderBy() {
        //If open close it
        if (orderByOpen) {
            setOrderByOpen(false);
        }
    }
    //When somebody click somewhere and the order by menu is open, close it
    useEffect(() => {
        //When a click anywhere check if it's open
        document.addEventListener('click', handleCloseOrderBy);
        return () => {
            document.removeEventListener('click', handleCloseOrderBy);
        };
    }, [orderByOpen]);
    //Change the order
    function changeOrder(order) {
        if (order === 'most-detailed' && sort !== 'most-detailed')
            handleSortByMostDetailed();
        else if (order === 'most-liked' && sort !== 'most-liked')
            handleSortByMostLikes();
        else if (order === 'newest' && sort !== 'newest')
            handleSortByNewest();
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
                if (country) {
                    //If is selected any country return
                    if (country === 'Any Country') {
                        return;
                    }
                    //Else show the cities
                    setSearchByLocation(true);
                    handleCountryChange(country);
                }
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
    const handleCountryChange = (selectedCountry) => {
        setSearchCountry(selectedCountry);
        //If is selected any country return
        if (selectedCountry === 'Any Country') {
            setCities([]);
            return;
        }
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
    //Search a trip that contains this name
    async function handleSearchByTrip(e) {
        //Don't reload the page and change to state change filter (do it by hand)
        if (e) {
            e.preventDefault();
            setChangeFilter(true);
        }
        //Remove search city and country just in case
        url.searchParams.delete('search-country');
        url.searchParams.delete('search-city');
        window.history.pushState(null, '', url.toString());
        try {
            //If is empty show all trips
            if (!searchName) {
                getTrips();
                url.searchParams.delete('search-trip');
                window.history.pushState(null, '', url.toString());
                return;
            }
            const res = await fetch(`${backendUrl}/api/trips/search`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    name: searchName
                })
            })
            //If the result is not ok, send a message
            if (!res.ok) {
                setErrorMessage('Unexpected Error')
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
                return;
            }
            //Get the json and save the state
            const json = await res.json();
            setTrips(json.data);
            //Save in the url
            url.searchParams.set('search-trip', searchName);
            window.history.pushState(null, '', url.toString());
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
        //If is selected any country get all the trips
        if (searchCountry === 'Any Country') {
            if (e)
                e.preventDefault();
            url.searchParams.delete('search-country');
            url.searchParams.delete('search-city');
            url.searchParams.delete('search-trip');
            window.history.pushState(null, '', url.toString());
            getTrips();
            return;
        }
        //Don't reload the page and change to state change filter (do it by hand)
        if (e) {
            e.preventDefault();
            setChangeFilter(true);
        }
        //Remove the search city just in case
        url.searchParams.delete('search-trip');
        window.history.pushState(null, '', url.toString());
        try {
            if (!searchCountry) {
                alert('Please add a country');
                return;
            }
            const body = { country: searchCountry }
            //Define the body (country and city or just city)
            if (searchCity && searchCity !== 'Any City') {
                body.city = searchCity;
            }
            const res = await fetch(`${backendUrl}/api/trips/search`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            //If the result is not ok, send a message
            if (!res.ok) {
                setErrorMessage('Unexpected Error')
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
                return;
            }
            //Get the json and save the state
            const json = await res.json();
            setTrips(json.data);
            //Save in the url
            url.searchParams.set('search-country', searchCountry);
            url.searchParams.set('search-city', searchCity);
            window.history.pushState(null, '', url.toString());
        }
        catch (err) {
            console.error('Error searching a trip: ', err);
            setErrorMessage('Unexpected Error')
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
                                    <Link to={'/trips'} className="nav-bar-link"><u>Trips</u></Link>
                                    <a className="nav-bar-link">Travelers</a>
                                    {isLoggedIn && (<Link to={'/mytrips'} className="nav-bar-link">My Trips</Link>)}
                                    {isLoggedIn && (<Link to={''} className="nav-bar-link">Saved Trips</Link>)}
                                    {isLoggedIn && (<Link to='/myprofile' className="nav-bar-link">My Profile</Link>)}
                                    {!isLoggedIn && (<Link to={'/login'} className="nav-bar-link">Log In</Link>)}
                                    {!isLoggedIn && (<Link to={'/signup'} className="nav-bar-link">Sign Up</Link>)}
                                </div>
                            </nav>
                            <div className="top-content-centered">
                                {!searchByLocation && <form className="top-content-centered" onSubmit={(e) => handleSearchByTrip(e)}>
                                    <div className='border rounded-[10px] bg-[#ECE7E2] w-[500px] h-[52px] p-[10px] flex flex-row justify-between gap-[5px] items-center'>
                                        <input className='transparent-input w-[430px]' placeholder={`Look for a Trip`}
                                            value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                        <button type='submit'><img src={searchIcon} className='w-[30px] h-[30px] rounded-full p-[5px] clickable bg-[#ECE7E2]' /> </button>
                                    </div>
                                </form>}
                                {searchByLocation && <form className="top-content-centered" onSubmit={(e) => handleSearchByCountryCity(e)}>
                                    <div className='border rounded-[10px] bg-[#ECE7E2] w-[500px] h-[52px] p-[10px] flex flex-row justify-between items-center gap-[5px]'>
                                        <select required className="green-select text-black w-[215px]" id="country" name="country" value={searchCountry} onChange={(e) => handleCountryChange(e.target.value)}>
                                            <option value='' disabled >Select a Country</option>
                                            <option value='Any Country'>Any Country</option>
                                            {countries.map(c => (
                                                <option key={c.iso2} value={c.country}>{c.country}</option>
                                            ))}
                                        </select>
                                        <select required={searchCountry !== 'Any Country'} className="green-select text-black w-[215px]" id="city" name="city" value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
                                            <option value='' disabled>Select a City</option>
                                            {searchCountry && searchCountry !== 'Any Country' && (<option value='Whole Country'>Whole Country</option>)}
                                            {searchCountry && searchCountry !== 'Any Country' && (<option value='Any City'>Any City</option>)}
                                            {cities.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <button type='submit'><img src={searchIcon} className='w-[30px] h-[30px] p-[5px] rounded-full clickable bg-[#ECE7E2]' /></button>
                                    </div>
                                </form>}
                                <p className='text-[#ECE7E2]'>Search By</p>
                                <div className='rounded-[10px] bg-[#ECE7E2] w-[300px] flex flex-row items-center'>
                                    <div className={`${!searchByLocation ? 'bg-[#00464366] text-[#ECE7E2] pointer-events-none' : 'text-[#004643] bg-[#ECE7E2] hover:cursor-pointer hover:bg-[00464366]'} border-0 flex justify-center w-[150px] p-[5px] rounded-tl-[10px] rounded-bl-[10px]`}
                                        onClick={() => setSearchByLocation(false)}>
                                        Trip</div>
                                    <div className={`${searchByLocation ? 'bg-[#00464366] text-[#ECE7E2] pointer-events-none' : 'text-[#004643] bg-[#ECE7E2] hover:cursor-pointer hover:bg-[00464366]'} border-0 flex justify-center w-[150px] p-[5px] rounded-tr-[10px] rounded-br-[10px]`}
                                        onClick={() => setSearchByLocation(true)}>
                                        Country and City</div>
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
                            </div>
                        </div>
                        <div id='trip-places' className="flex flex-col gap-[50px]">
                            <div className='flex flex-col gap-[20px]'>
                                <div className='flex flex-row justify-between items-center'>
                                    <h1 className="text-3xl font-bold text-[#004643]">Trips</h1>
                                    <div className="relative inline-block">
                                        {!menuOpen && <div className='clickable rounded-full p-[5px] bg-[#ECE7E2]'><img src={orderByIcon} className='w-[30px] h-[30px]' onClick={(e) => {
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
                                        <div className='place clickable border rounded-[10px] border-white' onClick={() => { navigate(`/trips/${trip._id}`) }}>
                                            <div className='place-content'>
                                                {/*If index is even image will be in the left, if it's odd, the opposite*/}
                                                {index % 2 === 0 &&
                                                    <div className="left-place">
                                                        <img className="place-image h-[300px] w-[500px] md:h-[400px]" src={trip.image} />
                                                    </div>
                                                }
                                                <div className="right-place flex gap-[15px]">
                                                    <h1 required className="place-name text-[#004643]" placeholder="Place Name">{trip.name}</h1>
                                                    <p className="place-description"
                                                        placeholder="Place Description">{trip.description}</p>
                                                    <p>{trip.country}, {trip.city}</p>
                                                    <div className='flex flex-row gap-[10px] items-center'>
                                                        <img src={trip.avatar} className='w-[35px] h-[35px] border border-white rounded-full' />
                                                        <p>{trip.username}</p>
                                                    </div>
                                                </div>
                                                {index % 2 !== 0 &&
                                                    <div className="left-place">
                                                        <img className="place-image h-[300px] w-[500px] md:h-[400px]" src={trip.image} />
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
                            {infoMessage && (
                                <p className='text-center'>{infoMessage}</p>
                            )}
                            <div className='flex flex-row gap-[10px] items-center justify-center'>
                                <img src={previous ? previousIcon : previousNonClickableIcon} className={`w-[20px] h-[20px] ${previous ? 'hover:cursor-pointer' : 'pointer-events-none'}`} onClick={previousPage} />
                                <span>{navPage}</span>
                                <img src={next ? nextIcon : nextNonClickableIcon} className={`w-[20px] h-[20px] ${next ? 'hover:cursor-pointer' : 'pointer-events-none'}`} onClick={nextPage} />
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
        </>
    )
}

//Export module
export default trips;