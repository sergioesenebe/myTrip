//Import external libraries
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
//Import internal libraries, css and images
import "../styles/common.css";
import "../styles/auth.css";
import logo from '../../public/images/mytrip-logo-text.png';

//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to log in
function logIn() {
    //Define states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    //Define a timeOutId to know if there is some one running
    const timeOutId = useRef(null);

    //Handle the login with the backend
    const handleLogIn = async (e) => {
        //Prevent Default
        e.preventDefault();
        try {
            //Fetch the register
            const response = await fetch(`${backendUrl}/api/auth/login`, {
                //Select method, header and body
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            //Get the error
            if (!response.ok) {
                const message = await response.text();
                setErrorMessage(message);
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
            //If everything was ok, say it
            else {
                setErrorMessage('User Logged In');
                //If there is a time out clear it and show a message for 10 seconds
                if (timeOutId.current) clearTimeout(timeOutId.current);
                timeOutId.current = setTimeout(() => { setErrorMessage(''), timeOutId.current = null }, 10000);
            }
        }
        //Catch the error and show it
        catch (err) {
            setErrorMessage('Unexpected error');

        }
    }
    //Return the DOM
    return (
        <>
            <div className="auth-left" >
                <h1 className="auth-title">Log In</h1>
                <form onSubmit={handleLogIn} style={{ gap: '30px' }}>
                    <div className="field">
                        <label htmlFor='username'>Username</label>
                        <input id='username' type='text' placeholder='Your username' value={username} maxLength={30} required onChange={(e) => { setUsername(e.target.value) }} />
                    </div>
                    <div className="field">
                        <label htmlFor='password'>Password</label>
                        <input id='password' type='password' placeholder='Your passsword' value={password} required onChange={(e) => { setPassword(e.target.value) }} />
                    </div>
                    {errorMessage && (
                        <p className="error-message">{errorMessage}</p>
                    )}
                    <div className="buttons">
                        <Link to={'/signup'} className='link-button'><button className="green-border-button" type='button'>Sign Up</button></Link>
                        <button className='green-button' type='submit'>Log In</button>
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

//Export page
export default logIn;