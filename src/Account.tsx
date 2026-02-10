import React from 'react';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

const Account: React.FC = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/';
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="/newlogo.svg" alt="Logo" style={{ height: 48, marginBottom: 24 }} />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#2563eb' }}>Welcome!</h2>
      {user ? (
        <>
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', margin: 0 }}><strong>Email:</strong> {user.email}</p>
            <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}><strong>UID:</strong> {user.uid}</p>
          </div>
          <div style={{ marginBottom: 24, width: '100%' }}>
            <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 12, textAlign: 'center', color: '#333' }}>
              <strong>Profile Info</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#666' }}>More features coming soon!</p>
            </div>
          </div>
          <button onClick={goToProfile} style={{ marginBottom: 12, padding: '10px 32px', borderRadius: 8, background: '#9333ea', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Profile</button>
          <button onClick={handleLogout} style={{ padding: '10px 32px', borderRadius: 8, background: 'linear-gradient(to right, #2563eb, #9333ea)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Logout</button>
        </>
      ) : (
        <p>Not logged in.</p>
      )}
    </div>
  );
};

export default Account;
