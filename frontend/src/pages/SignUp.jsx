//Import external Library
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
//Import internal libraries, css and images
import { uploadImage, validImage } from '../services/uploadService';
import '../styles/common.css';
import '../styles/auth.css';
import logo from '../../public/images/mytrip-logo-text.png';
import defaultUser from '../../public/images/default-user.png'

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
    //Define Avatar reference
    const avatarRef = useRef();
    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);
    //Function to fetch the sign in
    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const avatarUrl = await handleUploadAvatar();
            const response = await fetch(`${backendUrl}/api/auth/register`, {
                //Select the method, header and body with user data
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: email,
                    first_name: firstName,
                    second_name: secondName,
                    avatar: avatarUrl
                })
            })
            //If there is an error show it
            if (!response.ok) {
                const message = await response.text();
                setErrorMessage(message);
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
            //If everything was ok, say it
            else {
                setErrorMessage('User created');
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
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
    }
    //Function to upload avatar image
    async function handleUploadAvatar() {
        //If there is no image uploaded return null
        if (!avatar || avatar == '') return null;
        //Try to Upload the avatar image
        try {
            //Call the function to POST the image and upload it to Cloudinary
            const response = await uploadImage(avatar, 'avatars');
            //Return the url
            return response.url;
        }
        //Catch posible errors
        catch (err) {
            console.error('Error Uploading the avatar image: ', err);
            throw new Error('Error updating the avatar image');
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
            console.log(displayDeleteButton);
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
    return (
        <>
            <div className="auth-left">
                <h1 className="auth-title">Sign Up</h1>
                <form onSubmit={handleSignUp}>
                    <div className="inputs">
                        <div className="field">
                            <label htmlFor='username'>Username</label>
                            <input id='username' type='text' placeholder='Ex. johndoe02' value={username} maxLength={30} required onChange={(e) => { setUsername(e.target.value) }} />
                        </div>
                        <div className="field">
                            <label htmlFor='email'>Email</label>
                            <input id='email' type='email' placeholder='johndoe@example.com' value={email} required maxLength={254} onChange={(e) => { setEmail(e.target.value) }} />
                        </div>
                    </div>
                    <div className="inputs">
                        <div className="field">
                            <label htmlFor='firstName'>First Name</label>
                            <input id='firstName' type='text' placeholder='John' value={firstName} required maxLength={50} onChange={(e) => { setFirstName(e.target.value) }} />
                        </div>
                        <div className="field">
                            <label htmlFor='secondName'>Second Name</label>
                            <input id='secondName' type='text' placeholder='Doe' value={secondName} required maxLength={50} onChange={(e) => { setSecondName(e.target.value) }} />
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor='password'>Password</label>
                        <input id='password' type='password' placeholder='Min. 8 characters, 1 lowercase and 1 uppercase' value={password} required onChange={(e) => { setPassword(e.target.value) }} />
                    </div>
                    <label htmlFor='avatar'>Avatar</label>
                    <img className='avatar clickable' src={avatarUrl} alt="Avatar" onClick={() => avatarRef.current && avatarRef.current.click()} />
                    <input ref={avatarRef} id='avatar' type='file' accept='image/png, image/jpg, image/jpeg'
                        style={{ display: 'none' }} onChange={handleImage}></input>
                    {displayDeleteButton && (<button className='red-border-button' type='button'>Delete</button>)}
                    {errorMessage && (<p className="error-message">{errorMessage}</p>)};
                    <div className="buttons">
                        <button className="green-border-button">Log in</button>
                        <button className='green-button' type='submit'>Sign Up</button>
                    </div>
                    <p>Continue without log in? <Link className='link' to="home.html">Home</Link></p>
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
    )
}

//Export the module
export default SignUp;