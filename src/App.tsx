
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import AdminPanel from './AdminPanel';
import Account from './Account';
import Profile from './Profile';
import Dashboard from './Dashboard';
import Stories from './Stories';
import Residents from './Residents';
import Hangout from './Hangout';
import BottomNavigation from './BottomNavigation';

// App Content component that can use location hook
const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/hangout" element={<Hangout />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/account" element={<Account />} />
        </Routes>      {/* Bottom Navigation - only show on main app pages */}
      {location.pathname !== '/' &&
       location.pathname !== '/admin' &&
       location.pathname !== '/profile' && (
        <BottomNavigation />
      )}
    </div>
  );
};

function App() {
  // PWA Error Boundary
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Handle PWA errors
    const handleError = (error: ErrorEvent) => {
      console.error('PWA Error:', error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('PWA Unhandled Promise Rejection:', event);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Debug PWA mode
    console.log('App starting - PWA mode:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('App starting - Location:', window.location.href);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8f9fa'
      }}>
        <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ App Error</h1>
        <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
          Something went wrong. Please try refreshing the app.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🔄 Refresh App
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || ''}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
