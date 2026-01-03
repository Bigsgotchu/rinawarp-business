import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/main.css';
// Initialize the application
const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}
const root = createRoot(container);
// Render the main application
root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
// Performance monitoring
if (process.env.NODE_ENV === 'development') {
    console.log('🚀 RinaWarp Terminal Pro renderer initialized');
}
// Error boundary for the entire application
window.addEventListener('error', (event) => {
    console.error('🚨 Unhandled error in renderer:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection in renderer:', event.reason);
});
