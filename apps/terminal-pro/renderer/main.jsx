import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

// Create React root and render the app
const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
