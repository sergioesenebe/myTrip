import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//Import internal libraries, css
import "../styles/index.css";
import "../styles/common.css";

//Import images
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

//Function
function myTrips(){
    console.log('a');
}
//Export module
export default myTrips;