import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { cacheUtils } from './utils/cacheUtils';

// Make cache utils available globally for debugging
if (process.env.NODE_ENV === 'development') {
  window.cacheUtils = cacheUtils;

  // Add development helpers
  window.clearAllCaches = () => cacheUtils.forceClearAllCaches();
  window.cacheStats = () => cacheUtils.getCacheStats();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
