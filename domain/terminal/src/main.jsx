// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import App from './AppEnhanced.jsx';
import { AccessibilityProvider } from './components/AccessibilityProvider.jsx';
import './i18n'; // Initialize i18n
import './index.css';

// Performance telemetry with Web Vitals
// Removed deprecated web-vitals functions

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          '[SW] Service Worker registered successfully:',
          registration.scope
        );

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('[SW] New service worker available');
                // Show update notification to user
                if (
                  confirm(
                    'New version available! Click OK to refresh and use the latest version.'
                  )
                ) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('[SW] Service Worker registration failed:', error);
      });
  });
}

// 🧠 Debug overlay to confirm React + Tailwind are mounted correctly
const DebugOverlay = () => (
  <div
    style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,255,255,0.15)',
      border: '1px solid #0ff',
      padding: '6px 10px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#0ff',
      zIndex: 9999,
      borderRadius: '6px',
      pointerEvents: 'none',
    }}
  >
    🧠 React + Tailwind Active
  </div>
);

// ✅ Mount React App safely
const rootEl = document.getElementById('root');

if (!rootEl) {
  console.error('❌ No #root element found in index.html');
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <App />
        <DebugOverlay />
      </AccessibilityProvider>
    </QueryClientProvider>
  );

  console.log('✅ RinaWarp React app mounted successfully');
}
