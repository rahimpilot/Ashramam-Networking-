import React from 'react';
import { auth } from './firebase';

const Account: React.FC = () => {
  const user = auth.currentUser;
  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Welcome to Your Account</h2>
      {user ? (
        <>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>UID:</strong> {user.uid}</p>
        </>
      ) : (
        <p>Not logged in.</p>
      )}
    </div>
  );
};

export default Account;
