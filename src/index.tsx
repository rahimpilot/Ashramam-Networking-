import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// Initialize PWA service
import './pwaService';

// Hide loading screen when React is ready
const hideLoadingScreen = () => {
  // A page (e.g. Residents) may keep the boot screen up until its own
  // data is ready, so pull-to-refresh shows a single logo.
  if ((window as any).__keepBootScreen) return;
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide loading screen after React renders
setTimeout(hideLoadingScreen, 500);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
