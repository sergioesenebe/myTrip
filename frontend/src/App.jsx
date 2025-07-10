//Import React Library
import React from 'react';
import { Routes, Route } from 'react-router-dom';

//Import internal libraries
import SignUp from './pages/SignUp';

//App function
function App() {
  //Return Routes
  return (
    <>
      <Routes>
        <Route path='/signUp' element={<SignUp />} />
      </Routes>
    </>
  )
}
//Export App
export default App;