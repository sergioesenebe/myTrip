//Import React
import React from 'react';
//Import ReactDOM to render react components in the DOM
import ReactDOM from 'react-dom/client';
//Import main App component
import App from './App';

//Render in root the App component
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> 
  </React.StrictMode>
);