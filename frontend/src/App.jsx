//Import React Library
import React from 'react';
import { Routes, Route } from 'react-router-dom';

//Import internal libraries
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';

//App function
function App() {
  //Return Routes
  return (
    <>
      <Routes>
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<LogIn />} />
      </Routes>
    </>
  )
}
//Export App
export default App;