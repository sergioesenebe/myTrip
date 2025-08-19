import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
//Import internal libraries, css and images
import { validImage, deleteImage, handleUploadImage, handleDeleteImage } from '../services/uploadService';
import "../styles/index.css";
import "../styles/common.css";

//Import images
import logo from "../../public/images/logo.png";
import logoNavBar from "../../public/images/mytrip-text-logo-nav-bar.png";
import menuIcon from "../../public/images/menu-white.png";
import closeIcon from "../../public/images/close-white.png";
import esenebeLogo from "../../public/images/esenebe-logo.png";
import loadingGif from "../../public/images/loading.gif";
import backgroundImage from "../../public/images/budapest-background.jpg"
//Get the default user avatar url
const defaultUser = "https://res.cloudinary.com/drmjf3gno/image/upload/v1752485544/default-user_qq6fjc.png";

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to upload a trip
function uploadTrip() {
    //Define states
    const [menuOpen, setMenuOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [updateDataErrorMessage, setUpdateDataErrorMessage] = useState("");
    const [updateDataSuccessMessage, setUpdateDataSuccessMessage] = useState("");
    const [updatePasswordErrorMessage, setUpdatePasswordErrorMessage] = useState("");
    const [updatePasswordSuccessMessage, setUpdatePasswordSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [displayDeleteButton, setDisplayDeleteButton] = useState(false);
    const [currentFirstName, setCurrentFirstName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [currentSecondName, setCurrentSecondName] = useState('');
    const [secondName, setSecondName] = useState('');
    const [currentUsername, setCurrentUsername] = useState('');
    const [username, setUsername] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [email, setEmail] = useState('');
    const [currentDescription, setCurrentDescription] = useState('');
    const [description, setDescription] = useState('');
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatar, setAvatar] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    //Define Avatar reference
    const avatarRef = useRef();
    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);
    const timeOutIdPass = useRef(null);
    //Define navigate
    const navigate = useNavigate();

    //Check if is logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/auth/check-auth`, { credentials: 'include' })
                //If it's not logged in save the state
                if (!res.ok) {
                    setIsLoggedIn(false);
                    return;
                }
                setIsLoggedIn(true)
            }
            //If there is an error catch it
            catch (err) {
                console.error('Error verifying the session: ', err);
            }
        }
        checkAuth();
    }, [])
    //Get actual user info
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const user = await fetch(`${backendUrl}/api/users/me`, { credentials: 'include' })
                //Update info
                if (!user) {
                    console.error('Error getting user info: ', err);
                    //Show the error
                    setErrorMessage('Error getting user info');
                }
                //Take the json with the data and update states of current data
                const json = await user.json();
                const data = json.data[0];
                setCurrentFirstName(data.first_name);
                setCurrentSecondName(data.second_name);
                setCurrentUsername(data.username);
                setCurrentEmail(data.email);
                if (data.description)
                    setCurrentDescription(data.description);
                else
                    setCurrentDescription('Add a Description')
                setAvatarUrl(data.avatar)
                setCurrentAvatarUrl(data.avatar);
                if (data.avatar !== defaultUser)
                    setDisplayDeleteButton(true);
            }
            //Catch the error
            catch (err) {
                console.error('Error getting user info: ', err);
                //Show the error
                setErrorMessage('Error getting user info');
            }
        }
        getUserInfo();
    }, [])
    //Function to update the data
    async function handleUpdateData(e) {
        //Prevent reload page 
        e.preventDefault();
        try {
            //Delete messages
            setUpdateDataSuccessMessage('');
            setUpdateDataErrorMessage('');
            //Check if at least one field have been added
            if (!username && !email && !firstName && !secondName && !avatarUrl && avatarUrl === currentAvatarUrl) {
                //Show a message
                setUpdateDataErrorMessage('Please make sure to fill at least one field')
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setUpdateDataErrorMessage(''), timeOutId.current = null }, 10000);
                return;
            }
            //Save the state that is loading
            setIsLoading(true);
            //Save the fetch body
            const body = {};
            if (firstName)
                body.first_name = firstName;
            if (secondName)
                body.second_name = secondName;
            if (username)
                body.username = username;
            if (email)
                body.email = email;
            if (description)
                body.description = description;
            if (avatarUrl && avatarUrl !== currentAvatarUrl) {
                //Get the avatar
                const newAvatarUrl = await handleUploadImage(avatar, avatarUrl, 'avatars');
                setAvatarUrl(newAvatarUrl);
                body.avatar = newAvatarUrl;
            }

            const res = await fetch(`${backendUrl}/api/users/me`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            //in case of error
            if (!res.ok) {
                //Show a message
                const json = await res.json();
                const error = json.message;
                setUpdateDataErrorMessage(error);
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setUpdateDataErrorMessage(''), timeOutId.current = null }, 10000);
                return;
            }
            //Delete data and update current data
            if (firstName) {
                setCurrentFirstName(firstName);
                setFirstName('')
            }
            if (secondName) {
                setCurrentSecondName(secondName)
                setSecondName('');
            }
            if (username) {
                setCurrentUsername(username);
                setUsername('');
            }
            if (email) {
                setCurrentEmail(email);
                setEmail('');
            }
            if (description) {
                setCurrentDescription(description);
                setDescription('')
            }
            if (avatarUrl && avatarUrl !== currentAvatarUrl) {
                //Delete in cloudinary the old image
                if (currentAvatarUrl !== defaultUser) {
                    await handleDeleteImage(currentAvatarUrl);
                }
                setCurrentAvatarUrl(body.avatar);
            }
            //Show a success message
            setUpdateDataSuccessMessage('Data successfully changed')
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setUpdateDataSuccessMessage(''), timeOutId.current = null }, 10000);
        }
        //Catch possible errors
        catch (err) {
            console.error('Error updating the data: ', err);
            //Show a message
            setUpdateDataErrorMessage('Error updating the data')
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setUpdateDataErrorMessage(''), timeOutId.current = null }, 10000);
        }
        //Finally save state for loading
        finally {
            setIsLoading(false);
        }
    }
    //Function to update data
    async function handleUpdatePassword(e) {
        //Prevent default
        e.preventDefault();
        try {
            //Delete messages
            setUpdatePasswordSuccessMessage('');
            setUpdatePasswordErrorMessage('');
            //Check if at least one field have been added
            if (!password && !confirmPassword) {
                //Show a message
                setUpdatePasswordErrorMessage('Please make sure to fill all fields')
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutIdPass.current) clearTimeout(timeOutIdPass.current);
                timeOutIdPass.current = setTimeout(() => { setUpdateDataErrorMessage(''), timeOutIdPass.current = null }, 10000);
                return;
            }
            const body = {
                password: password,
                confirm_password: confirmPassword
            };

            const res = await fetch(`${backendUrl}/api/users/me`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            //in case of error
            if (!res.ok) {
                //Show a message
                const json = await res.json();
                const error = json.message;
                setUpdatePasswordErrorMessage(error);
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutIdPass.current) clearTimeout(timeOutIdPass.current);
                timeOutIdPass.current = setTimeout(() => { setUpdatePasswordErrorMessage(''), timeOutIdPass.current = null }, 10000);
                return;
            }
            //Delete password and confirm password
            setPassword('');
            setConfirmPassword('');
            //Show a success message
            setUpdatePasswordSuccessMessage('Password successfully changed')
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutIdPass.current) clearTimeout(timeOutIdPass.current);
            timeOutIdPass.current = setTimeout(() => { setUpdatePasswordSuccessMessage(''), timeOutIdPass.current = null }, 10000);
        }
        //Catch possible errors
        catch (err) {
            console.error('or updating the pas: ', err);
            //Show a message
            setUpdatePasswordErrorMessage('Error updating the password')
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setUpdatePasswordErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Function to check if the format is valid and update the image
    async function handleImage(e) {
        try {
            //Remove old messages
            setErrorMessage('');
            //Get file
            const file = e.target.files[0];
            //Call function to check if is valid
            await validImage(file, avatarRef);
            //Take the image
            setAvatar(file);
            //Create a local URL
            const url = URL.createObjectURL(file);
            //Upload image to avatar
            setAvatarUrl(url);
            //Show delete button
            setDisplayDeleteButton(true);
        }
        //Catch and show the error
        catch (err) {
            console.error('No Valid Type: ', err);
            setUpdateDataErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setUpdateDataErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Delete the avatar image
    async function handleDeleteAvatar() {
        try {
            //Remove the image from the ref
            await deleteImage(avatarRef);
            //Return to default user avatar
            setAvatarUrl(defaultUser);
            setAvatar('');
            //Remove the button to delete
            setDisplayDeleteButton(false);
        }
        catch (err) {
            console.error('Error deleting the image: ', err);
            setUpdateDataErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setUpdateDataErrorMessage(''), timeOutId.current = null }, 10000);

        }
    }
    //Function to handle logout
    async function handleLogOut() {
        try {
            const res = await fetch(`${backendUrl}/api/auth/logout`, { credentials: 'include' });
            navigate('/');
        }
        //If there is an error catch it
        catch (err) {
            console.error('Error loggin out: ', err);
        }
    }

    //DOM
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>myTrip - My Profile</title>
                <link rel="icon" href={logo} />
            </Helmet>
            {isLoading && (<div className="loading"><img src={loadingGif}></img>Loading...</div>)}
            {isLoggedIn === false && (<div className="notLoggedIn"><h1>You're not logged in</h1><p>Please <Link className='link' to={'/login'}>Log In</Link> to access this page.</p></div>)}
            {!isLoading && isLoggedIn && (
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
                                    <Link to={'/'} className="nav-bar-link">Home</Link>
                                    <Link to={'/trips'} className="nav-bar-link">Trips</Link>
                                    <Link to={'/travelers'} className="nav-bar-link">Travelers</Link>
                                    <Link to='/mytrips' className="nav-bar-link">My Trips</Link>
                                    <Link to={'/savedtrips'} className="nav-bar-link">Saved Trips</Link>
                                    <Link to='/myprofile' className="nav-bar-link"><u>My Profile</u></Link>
                                </div>
                            </nav>
                            {/*Links visibles in mobile, here to show it above the trip info*/}
                            {menuOpen && (<div id="mobile-menu"
                                className="fixed inset-0 z-[999] bg-[#004643] text-[#ECE7E2] flex flex-col items-center justify-center gap-6 text-lg md:hidden">
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
                            <div className='top-content-centered'>
                                <h1>Manage Your Profile</h1>
                                <p>Update your personal information and change your password, to keep your account up to date.</p>
                            </div>
                        </div>
                        <div className='p-[20px] flex flex-col gap-[50px]'>
                            <form onSubmit={(e) => handleUpdateData(e)}>
                                <h1 className="text-3xl font-bold text-[#004643]">Update Data</h1>
                                <table className='md:w-[60%] w-[100%] border-separate border-spacing-y-[10px] text-[16px]'>
                                    <tr>
                                        <td className='w-[200px]'><label htmlFor='first-name'>First Name</label></td>
                                        <td><input id='first-name' className='editable-input black-input' type='text' maxLength={50} placeholder={currentFirstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td className='w-[200px]'><label htmlFor='second-name'>Second Name</label></td>
                                        <td><input id='second-name' className='editable-input black-input' type='text' maxLength={50} placeholder={currentSecondName} value={secondName} onChange={(e) => setSecondName(e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td className='w-[200px]'><label htmlFor='username'>Username</label></td>
                                        <td><input id='username' className='editable-input black-input' type='text' maxLength={30} placeholder={currentUsername} value={username} onChange={(e) => setUsername(e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td className='w-[200px]'><label htmlFor='email'>Email</label></td>
                                        <td><input id='email' className='editable-input black-input' type='email' maxLength={254} placeholder={currentEmail} value={email} onChange={(e) => setEmail(e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td className='w-[200px] flex items-start'><label htmlFor='description'>Description</label></td>
                                        <td><textarea id='description' className='editable-textarea black-input' type='text' maxLength={160} placeholder={currentDescription} rows='3' value={description} onChange={(e) => setDescription(e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td className='w-[200px] flex items-start'><p>Avatar</p></td>
                                        <td>
                                            <div className='flex flex-col justify-center w-fit'>
                                                <img className='avatar clickable' src={avatarUrl} onClick={() => avatarRef.current && avatarRef.current.click()} />
                                                <input className="input-auth" ref={avatarRef} id='avatar' type='file' accept='image/png, image/jpg, image/jpeg'
                                                    style={{ display: 'none' }} onChange={handleImage} />
                                                {displayDeleteButton && (
                                                    <button className='red-border-button p-[0px] w-[100px] text-[12px]' type='button' onClick={handleDeleteAvatar} >Delete</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                {updateDataErrorMessage && (
                                    <p className="text-left error-message">{updateDataErrorMessage}</p>
                                )}
                                {updateDataSuccessMessage && !updateDataErrorMessage && (
                                    <p className="text-left text-[#004643CC]">{updateDataSuccessMessage}</p>
                                )}
                                <button className='green-button w-[160px]' type='submit'>Update Data</button>
                            </form>
                            <form onSubmit={e => handleUpdatePassword(e)}>
                                <h1 className="text-3xl font-bold text-[#004643]">Update Password</h1>
                                <table className='md:w-[60%] w-[100%] border-separate border-spacing-y-[10px] text-[16px]'>
                                    <tr>
                                        <td className='w-[200px]'><label htmlFor='first-name'>Password</label></td>
                                        <td><input type='password' required id='first-name' className='editable-input black-input' placeholder='Min. 8 characters, 1 lowercase and 1 uppercase' value={password} onChange={(e) => setPassword(e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td className='w-[200px]'><label htmlFor='second-name'>Confirm Password</label></td>
                                        <td><input type='password' required id='second-name' className='editable-input black-input' placeholder='Repeat your new password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></td>
                                    </tr>
                                </table>
                                {updatePasswordErrorMessage && (
                                    <p className="text-left error-message">{updatePasswordErrorMessage}</p>
                                )}
                                {updatePasswordSuccessMessage && !updatePasswordErrorMessage && (
                                    <p className="text-left text-[#004643CC]">{updatePasswordSuccessMessage}</p>
                                )}
                                <button type='submit' className='green-button w-[160px]'>Update Password</button>
                            </form>
                            <div>
                                <h1 className="text-3xl font-bold text-[#004643]">Log Out</h1>
                                <p className='text-[16px]'>End your current session</p>
                                <button type='submit' className='red-border-button w-[160px]' onClick={handleLogOut}>Log Out</button>
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
            )}
        </>
    )
}

//Export module
export default uploadTrip;