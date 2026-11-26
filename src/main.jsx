/**
 * main.jsx — Application entry point.
 *
 * Mounts the root <App /> component into the DOM node with id="root".
 * React.StrictMode is enabled to surface potential problems during
 * development (double-invokes effects, warns about deprecated APIs).
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
