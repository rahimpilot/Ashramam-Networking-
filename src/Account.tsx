import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Wait for the auth session to resolve before rendering (avoids a
  // "Not logged in" flash on cold start)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/';
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto 100px auto', padding: '2rem', background: '#fffdf8', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="/newlogo.svg" alt="Logo" style={{ height: 48, marginBottom: 24 }} />
      <h2 className="iv-display" style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#9a6b3f' }}>Welcome!</h2>
      {authLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', margin: 0 }}><strong>Email:</strong> {user.email}</p>
            <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}><strong>UID:</strong> {user.uid}</p>
          </div>
          <div style={{ marginBottom: 24, width: '100%' }}>
            <div style={{ background: '#ece3d0', borderRadius: 8, padding: 12, textAlign: 'center', color: '#333' }}>
              <strong>Profile Info</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#666' }}>More features coming soon!</p>
            </div>
          </div>
          <button onClick={goToProfile} style={{ marginBottom: 12, padding: '10px 32px', borderRadius: 8, background: '#9333ea', color: '#fffdf8', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Profile</button>
          <button onClick={handleLogout} style={{ padding: '10px 32px', borderRadius: 8, background: 'linear-gradient(to right, #9a6b3f, #9333ea)', color: '#fffdf8', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Logout</button>
        </>
      ) : (
        <p>Not logged in.</p>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Account;
