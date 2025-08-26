//Import external libraries
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
//Import internal libraries, css and images
import "../styles/index.css";
import "../styles/common.css";
import { nextPage, previousPage, showTrips } from '../services/showTrips'
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
import filterIcon from "../../public/images/filter-green.png";
import searchIcon from "../../public/images/search-green.png";
import notFollowed from "../../public/images/follow-green.png"
import notFollowedWhite from "../../public/images/follow-white.png"
import followed from "../../public/images/user-white.png"

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to get the users
function travelers() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [usersFiltered, setUsersFiltered] = useState([]);
    const [usersSliced, setUsersSliced] = useState([]);
    const [filter, setFilter] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [previous, setPrevious] = useState(false);
    const [next, setNext] = useState(false);
    const [maxPages, setMaxPages] = useState('');
    const [orderByOpen, setOrderByOpen] = useState(false);
    const [changeFilter, setChangeFilter] = useState('');
    const [usersSaved, setUsersSaved] = useState(false);
    const [showMessage, setShowMessage] = useState('users');
    //Get the url
    const url = new URL(window.location.href);
    //Get the params
    const page = parseInt(url.searchParams.get('page')) || 1;
    const sortParam = url.searchParams.get('sort') || 'all-users';
    const search = url.searchParams.get('search') || '';
    //Save the states
    const [navPage, setNavPage] = useState(page);
    const [sort, setSort] = useState(sortParam);
    const [searchName, setSearchName] = useState(search);
    const [followIcon, setFollowIcon] = useState([])

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
        const filterParam = url.searchParams.get('filter') || 'all-users';
        const search = url.searchParams.get('search') || '';
        //Save the state
        setNavPage(page);
        setFilter(filterParam);
        setSearchName(search);
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
                //Save user id
                const json = await res.json();
                const user = json.user_id;
                setUserId(user);
            }
            //If there is an error catch it
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        checkAuth();
    }, [])
    //When user checked get the data
    useEffect(() => {
        const manageUsersToShow = async () => {
            if (searchName)
                handleSearchByName();
            else if (filter)
                changeFilterUser(filter);
            else
                getUsers();
        }
        manageUsersToShow();
    }, [])
    //When users defined filter
    useEffect(() => {
        if (filter === 'all-users')
            handleFilterByAllUsers();
        else if (filter === 'followed' && sort !== 'followed')
            handleFilterByFollowedUsers();

    }, [users])
    //When somebody click somewhere and the order by menu is open, close it
    useEffect(() => {
        //When a click anywhere check if it's open
        document.addEventListener('click', handleCloseOrderBy);
        return () => {
            document.removeEventListener('click', handleCloseOrderBy);
        };
    }, [orderByOpen]);
    //Go to next page
    async function handleNextPage() {
        await nextPage(navPage, maxPages, setNext, setPrevious, usersFiltered, setUsersSliced, url);
    }
    //Go to previous page
    async function handlePreviousPage() {
        await previousPage(navPage, maxPages, usersFiltered, setUsersSliced, setPrevious, setNext, url);
    }
    //When get the users remove theirself
    useEffect(() => {
        if (usersSaved) {
            //If user is logged in delete their user
            let copy = [...users];
            if (userId !== '' && users.length > 0) {
                copy = users.filter((user) => user._id !== userId)
            }
            //Save an array with users if followed followed, else notFollowed
            copy.map((user, index) => {
                if (user.followers.includes(userId))
                    copy[index].followed = followed;
                else
                    copy[index].followed = notFollowed;
            })
            setUsers(copy);
        }
        setUsersSaved(false)
    }, [usersSaved, userId])
    //Get users
    const getUsers = async () => {
        try {
            //Fetch the api to get all users
            const res = await fetch(`${backendUrl}/api/users/`)
            //If it's okay update the state of the users
            if (!res.ok) {
                setErrorMessage('Error getting the users');
            }
            else {
                //Get the json and save the state
                const json = await res.json();
                const data = json.data;
                setUsers(data);
                //Finally save the state users have been added (if not there will be a loop in the useeffect)
                setUsersSaved(true);
            }
        }
        //Catch the error
        catch (err) {
            console.error('Error getting users: ', err);
            setErrorMessage('Error getting the users');
        }
    };
    //Function to close order by
    function handleCloseOrderBy() {
        //If open close it
        if (orderByOpen) {
            setOrderByOpen(false);
        }
    }
    //Show all users
    function handleFilterByAllUsers() {
        try {
            setUsersFiltered(users);
            //Show trips
            showTrips(users, 'all-users', setInfoMessage, setMaxPages, setNext, setPrevious, setUsersSliced, changeFilter, sort, navPage, url, showMessage);
        }
        //Catch the error
        catch (err) {
            console.error('Error filtering all users: ', err);
            setErrorMessage('Error filtering the users');
        }
    }
    function handleFilterByFollowedUsers() {
        const filtered = users.filter((user) => user.followed == followed)
        setUsersFiltered(filtered);
        showTrips(filtered, 'followed', setInfoMessage, setMaxPages, setNext, setPrevious, setUsersSliced, changeFilter, sort, navPage, url, showMessage);
    }
    //Change the order
    function changeFilterUser(filtering) {
        if (filtering === 'all-users' && filter !== 'all-users')
            handleFilterByAllUsers();
        else if (filtering === 'followed' && sort !== 'followed')
            handleFilterByFollowedUsers();
    }
    //Search a trip that contains this name
    async function handleSearchByName(e) {
        //Don't reload the page and change to state change filter (do it by hand)
        if (e) {
            e.preventDefault();
            setChangeFilter(true);
        }
        //If is empty show all users change show messag to change info message in case is searching for all users or specific
        if (!searchName) {
            setShowMessage('users')
            getUsers();
            url.searchParams.delete('search');
            window.history.pushState(null, '', url.toString());
            return;
        }
        //Search users with the searchName used
        try {
            setShowMessage('users-search')
            const body = { usename: searchName, first_name: searchName, second_name: searchName }
            //fetch the search with the body send it
            const res = await fetch(`${backendUrl}/api/users/general-search`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            //If the result is not ok, send a message
            if (!res.ok) {
                throw new Error('Unexpected Error');
            }
            //Get the json and save the state
            const json = await res.json();
            setUsers(json.data);
            //Save in the url
            if (searchName) {
                url.searchParams.set('search', searchName);
                window.history.pushState(null, '', url.toString());
            }
            //Save the state of trips
            setUsersSaved(true);
        }
        catch (err) {
            console.error('Error searching a user: ', err);
            setErrorMessage('Unexpected Error')
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Handle follow a user
    async function handleFollowUser(e, travelerId, index) {
        //Prevent to click in bigger div
        e.stopPropagation();
        try {
            //Call the function to follow a traveler
            await followUser(travelerId, followed, usersSliced, setUsersSliced, index);
        }
        catch (err) {
            console.error('Error following a user: ', err);
            alert('Unexpected error');
        }
    }
    //Handle follow a user
    async function handleUnfollowUser(e, travelerId, index) {
        //Prevent to click in bigger div
        e.stopPropagation();
        try {
            //Call the function to unfollow a traveler
            await unfollowUser(travelerId, notFollowedWhite, usersSliced, setUsersSliced, index);
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
                <title>myTrip - Travelers</title>
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
                    <div className="top-content-centered md:gap-[20px] gap-[10px]">
                        <form className="top-content-centered" onSubmit={(e) => handleSearchByName(e)}>
                            <div className='border rounded-[10px] bg-[#ECE7E2] md:w-[500px] w-[300px] md:h-[52px] h-[42px] p-[10px] md:p-[20px] flex flex-row justify-between gap-[5px] items-center'>
                                <input className='transparent-input md:w-[430px] w-[250px]' placeholder={`Look for a Traveler`}
                                    value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                                <button type='submit'><img src={searchIcon} className='w-[25px] h-[25px] md:w-[30px] md:h-[30px] rounded-full p-[5px] clickable bg-[#ECE7E2]' /> </button>
                            </div>
                        </form>
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
                        <div className='flex flex-row justify-between items-center gap-[20px]'>
                            <h1 className="text-3xl font-bold text-[#004643] md:text-[30px] text-[20px]">Travelers</h1>
                            {isLoggedIn && <div className="relative inline-block">
                                {!menuOpen && <div className='clickable rounded-full p-[5px] bg-[#ECE7E2]'><img title='Filter' src={filterIcon} className='w-[30px] h-[30px]' onClick={(e) => {
                                    /*Prevent default and allow click it instead of the document page*/
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOrderByOpen(!orderByOpen)
                                }}></img></div>}
                                {orderByOpen && (
                                    <div className='shadow-md text-[16px] bg-[#f3f1ef] rounded-[10px] absolute top-full right-0 mt-2 w-[150px] z-[999]'>
                                        <div className={`${filter === 'all-users' ? 'pointer-events-none filter brightness-[80%]' : ''} w-[100%] p-[5px] rounded-tl-[10px] rounded-tr-[10px] clickable bg-[#f3f1ef]`} onClick={(e) => {
                                            /*Prevent default and allow click it instead of the document page*/
                                            e.preventDefault();
                                            e.stopPropagation();
                                            /*Close the oreder menu*/
                                            handleCloseOrderBy();
                                            /*Change order*/
                                            changeFilterUser('all-users');
                                        }}>
                                            <p>All Users</p>
                                        </div>
                                        <div className={`${filter === 'followed' ? 'pointer-events-none filter brightness-[80%]' : ''} w-[100%] p-[5px] rounded-bl-[10px] rounded-br-[10px] clickable bg-[#f3f1ef]`} onClick={(e) => {
                                            /*Prevent default and allow click it instead of the document page*/
                                            e.preventDefault();
                                            e.stopPropagation();
                                            /*Close the oreder menu*/
                                            handleCloseOrderBy();
                                            /*Change order*/
                                            changeFilterUser('followed');
                                        }}>
                                            <p>Followed</p>
                                        </div>
                                    </div>
                                )}
                            </div>}
                        </div>
                        <div className='places'>
                            {usersSliced.map((user, index) => (

                                <div className='place clickable border rounded-[10px] border-white' onClick={() => {
                                    {/*
                                                navigate(`/users/${user._id}`)*/}
                                }}>
                                    <div className={`place-content md:flex-row ${index % 2 === 0 ?  'flex-col' : 'flex-col-reverse'}`}
                                        onClick={() => navigate(`/travelers/${user._id}`)}>
                                        {/*If index is even image will be in the left, if it's odd, the opposite*/}
                                        {index % 2 === 0 &&
                                            <div className="left-place md:w-[50%] w-[100%]">
                                                <img className="place-image aspect-square md:w-[400px] w-[300px] rounded-full" src={user.avatar} />
                                            </div>
                                        }
                                        <div className="right-place flex gap-[5px] md:w-[50%] w-[100%]">
                                            <h1 className="text-[#004643] md:text-[50px] text-[30px]">{user.username}</h1>
                                            <h2 className="text-[#004643] md:text-[30px] text-[16px]">{user.first_name} {user.second_name}</h2>
                                            <p>{user.description}</p>
                                            {isLoggedIn && (user.followed == notFollowed || user.followed == notFollowedWhite) && <button className='green-border-button w-[100px] h-[30px] flex flex-row gap-[5px] justify-center'
                                                onMouseEnter={() => {
                                                    const copy = [...users];
                                                    copy[index].followed = notFollowedWhite;
                                                    setUsers(copy);
                                                }}
                                                onMouseLeave={() => {
                                                    const copy = [...users];
                                                    copy[index].followed = notFollowed;
                                                    setUsers(copy);
                                                }}
                                                onClick={(e) => handleFollowUser(e, user._id, index)}
                                            >
                                                Follow
                                                <img className='w-[15px] h-[15px]' src={user.followed}></img>
                                            </button>}
                                            {isLoggedIn && user.followed == followed && <button className='green-button w-[100px] h-[30px] flex flex-row gap-[5px] justify-center'
                                                onClick={(e) => handleUnfollowUser(e, user._id, index)}
                                            >
                                                Followed
                                                <img className='w-[15px] h-[15px]' src={user.followed}></img>
                                            </button>}
                                        </div>
                                        {index % 2 !== 0 &&
                                            <div className="left-place md:w-[50%] w-[100%]">
                                                <img className="place-image aspect-square md:w-[400px] w-[300px] rounded-full" src={user.avatar} />
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
export default travelers;