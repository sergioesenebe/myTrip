//Import React Library
import React from 'react';
import { Routes, Route } from 'react-router-dom';

//Import internal libraries
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import CreateTrip from './pages/CreateTrip';
import Home from './pages/Home'
import Trips from './pages/Trips'
import Trip from './pages/Trip'
import MyProfile from './pages/MyProfile'
import MyTrips from './pages/MyTrips'
//Import Tailwind library
import './styles/index.css'

//App function
function App() {
  //Return Routes
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<LogIn />} />
        <Route path='/createtrip' element={<CreateTrip />} />
        <Route path='/trips' element={<Trips />} />
        <Route path='/trips/:tripId' element={<Trip />} />
        <Route path='/myprofile' element={<MyProfile />} />
        <Route path='/mytrips' element={<MyTrips />} />
      </Routes>
    </>
  )
}
//Export App
export default App;