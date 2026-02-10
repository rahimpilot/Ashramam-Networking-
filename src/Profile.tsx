import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile: React.FC = () => {
  const user = auth.currentUser;
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const ref = doc(db, 'profiles', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || '');
          setLocation(data.location || '');
          setBio(data.bio || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (user) {
      await setDoc(doc(db, 'profiles', user.uid), {
        name,
        location,
        bio,
        email: user.email
      });
      setMessage('Profile saved!');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#2563eb' }}>Edit Profile</h2>
      {user ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Name
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
          </label>
          <label>
            Location
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
          </label>
          <label>
            Bio
            <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4, minHeight: 60 }} />
          </label>
          <label>
            Email
            <input type="email" value={user.email || ''} disabled style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee', marginTop: 4, background: '#f3f4f6', color: '#888' }} />
          </label>
          <a href="https://www.ashramamvibes.com/reset-password" style={{ color: '#9333ea', fontWeight: 500, marginBottom: 8 }}>Change Password</a>
          <button type="submit" disabled={loading} style={{ padding: '10px 32px', borderRadius: 8, background: 'linear-gradient(to right, #2563eb, #9333ea)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Save</button>
          {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
        </form>
      ) : (
        <p>Not logged in.</p>
      )}
    </div>
  );
};

export default Profile;
