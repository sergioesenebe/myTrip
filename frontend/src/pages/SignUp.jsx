//Import external Library
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//Import internal libraries, pages, css and images
import { deleteImage, uploadImage, validImage, handleUploadImage } from '../services/uploadService';
import '../styles/common.css';
import '../styles/auth.css';
import logo from '../../public/images/mytrip-logo-text.png';
import loadingGif from "../../public/images/loading.gif";

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;
//Get the default user avatar url
const defaultUser = "https://res.cloudinary.com/drmjf3gno/image/upload/v1752485544/default-user_qq6fjc.png";

//Function to sign up
function SignUp() {
    //Define states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(defaultUser);
    const [displayDeleteButton, setDisplayDeleteButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    //Define Avatar reference
    const avatarRef = useRef();
    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);
    //Define navigate
    const navigate = useNavigate();

    //Function to fetch the sign in
    const handleSignUp = async (e) => {
        //Prevent Default
        e.preventDefault();
        try {
            //Save the state that is loading
            setIsLoading(true);
            //Get the avatar
            const newAvatarUrl = await handleUploadImage(avatar, avatarUrl, 'avatars');
            setAvatarUrl(newAvatarUrl);
            //Define the payload 
            const userPayload = {
                username: username,
                password: password,
                email: email,
                first_name: firstName,
                second_name: secondName,
                avatar: newAvatarUrl,
            };
            //Fetch the register
            const response = await fetch(`${backendUrl}/api/auth/register`, {
                //Select the method, header and body with user data
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userPayload)
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
            //If everything was ok, say it
            else {
                navigate('/');
            }


        }
        //Catch the error and show the message
        catch (err) {
            console.error('Error creating the user, ', err);
            setErrorMessage('Unexpected error');
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
        //Finally save state that is not loading 
        finally {
            setIsLoading(false);
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
            setErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
        }
    }
    //Function to delete the image when button clicked
    async function handleDeleteImage() {
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
            setErrorMessage(err.message);
            //If there is a time out clear it and show a message for 10 seconds
            if (timeOutId.current) clearTimeout(timeOutId.current);
            timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);

        }
    }
    return (
        <>
            <style>{`
                #root {
                    display: flex;
                    flex-direction: row;
                    }
                @media (max-width: 1024px) {
                    #root {
                        justify-content: center;
                        align-items: center;
                        background-color: #004643CC;
                    }
                }`
            }</style>
            {isLoading && (<div className="loading"><img src={loadingGif}></img>Loading...</div>)}
            {!isLoading && (
                <>
                    <div className="auth-left">
                        <h1 className="auth-title">Sign Up</h1>
                        <form className="form-auth" onSubmit={handleSignUp}>
                            <div className="inputs">
                                <div className="field">
                                    <label htmlFor='username'>Username</label>
                                    <input className="input-auth" id='username' type='text' placeholder='e.g., johndoe02' value={username} maxLength={30} required onChange={(e) => { setUsername(e.target.value) }} />
                                </div>
                                <div className="field">
                                    <label htmlFor='email'>Email</label>
                                    <input className="input-auth" id='email' type='email' placeholder='e.g., johndoe@example.com' value={email} required maxLength={254} onChange={(e) => { setEmail(e.target.value) }} />
                                </div>
                            </div>
                            <div className="inputs">
                                <div className="field">
                                    <label htmlFor='firstName'>First Name</label>
                                    <input className="input-auth" id='firstName' type='text' placeholder='e.g., John' value={firstName} required maxLength={50} onChange={(e) => { setFirstName(e.target.value) }} />
                                </div>
                                <div className="field">
                                    <label htmlFor='secondName'>Second Name</label>
                                    <input className="input-auth" id='secondName' type='text' placeholder='e.g., Doe' value={secondName} required maxLength={50} onChange={(e) => { setSecondName(e.target.value) }} />
                                </div>
                            </div>
                            <div className="field">
                                <label htmlFor='password'>Password</label>
                                <input className="input-auth" id='password' type='password' placeholder='Min. 8 characters, 1 lowercase and 1 uppercase' value={password} required onChange={(e) => { setPassword(e.target.value) }} />
                            </div>
                            <label htmlFor='avatar'>Avatar</label>
                            <img className='avatar clickable' src={avatarUrl} alt="Avatar" onClick={() => avatarRef.current && avatarRef.current.click()} />
                            <input className="input-auth" ref={avatarRef} id='avatar' type='file' accept='image/png, image/jpg, image/jpeg'
                                style={{ display: 'none' }} onChange={handleImage}></input>
                            {displayDeleteButton && (
                                <button className='red-border-button' type='button' onClick={handleDeleteImage}>Delete</button>
                            )}
                            {errorMessage && (
                                <p className="error-message">{errorMessage}</p>
                            )}
                            <div className="buttons">
                                <Link to={'/login'} className='link-button'><button className="green-border-button" type='button'>Log in</button></Link>
                                <button className='green-button' type='submit'>Sign Up</button>
                            </div>
                            <p>Continue without log in? <Link className='link' to={'/'}>Home</Link></p>
                        </form >
                    </div >
                    <div className="auth-right">
                        <div className="auth-message">
                            <img src={logo} className="logo-text" />
                            <h1>Travel better together</h1>
                            <h3>Upload your journeys and save the best trips from the community.</h3>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

//Export the module
export default SignUp;
