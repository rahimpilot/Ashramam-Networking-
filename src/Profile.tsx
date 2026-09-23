import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import BottomNavigation from './BottomNavigation';

const Profile: React.FC = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewEmail = searchParams.get('user');
  const viewName = searchParams.get('name');
  const isOtherUser = !!viewEmail && viewEmail.toLowerCase() !== (user?.email || '').toLowerCase();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [otherProfile, setOtherProfile] = useState<{ name: string; location: string; bio: string } | null>(null);
  const [otherLoading, setOtherLoading] = useState(false);
  const [otherMissing, setOtherMissing] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setResetSent(false);
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
    } catch (e) {
      console.error('Password reset failed', e);
      setResetError('Could not send the reset email. Please try again.');
    }
  };

  useEffect(() => {
    if (user && !isOtherUser) {
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
  }, [user, isOtherUser]);

  useEffect(() => {
    if (isOtherUser && viewEmail) {
      const fetchOther = async () => {
        setOtherLoading(true);
        setOtherMissing(false);
        try {
          const snap = await getDocs(collection(db, 'profiles'));
          const target = viewEmail.toLowerCase();
          let found: { name: string; location: string; bio: string } | null = null;
          snap.forEach(d => {
            const data = d.data();
            if (typeof data.email === 'string' && data.email.toLowerCase() === target) {
              found = {
                name: data.name || viewName || '',
                location: data.location || '',
                bio: data.bio || ''
              };
            }
          });
          if (found) {
            setOtherProfile(found);
          } else {
            setOtherMissing(true);
          }
        } catch (e) {
          console.error('Error fetching profile for', viewEmail, e);
          setOtherMissing(true);
        }
        setOtherLoading(false);
      };
      fetchOther();
    }
  }, [isOtherUser, viewEmail, viewName]);

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

  const cardStyle: React.CSSProperties = {
    maxWidth: 400,
    margin: '2rem auto',
    padding: '2rem',
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.10)'
  };

  if (isOtherUser) {
    const displayName = otherProfile?.name || viewName || viewEmail || '';
    const initial = (displayName || '?').charAt(0).toUpperCase();
    return (
      <div style={cardStyle}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#4a86c8', fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: '1rem', fontSize: 15 }}
        >
          ← Back
        </button>
        {otherLoading ? (
          <p style={{ color: '#7a8ba0' }}>Loading profile…</p>
        ) : otherMissing ? (
          <div>
            <h2 className="iv-display" style={{ fontSize: '1.6rem', fontWeight: 600, color: '#5b9bd5', marginBottom: '0.5rem' }}>{displayName}</h2>
            <p style={{ color: '#7a8ba0' }}>This member hasn't set up a profile yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 84, height: 84, borderRadius: '50%',
              background: 'linear-gradient(135deg, #5b9bd5, #4a86c8)',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 700
            }}>
              {initial}
            </div>
            <h2 className="iv-display" style={{ fontSize: '1.8rem', fontWeight: 600, color: '#1c2733', margin: '0.5rem 0 0 0' }}>{displayName}</h2>
            {otherProfile?.location ? (
              <p style={{ margin: 0, color: '#7a8ba0', fontSize: 14 }}>📍 {otherProfile.location}</p>
            ) : null}
            {otherProfile?.bio ? (
              <p style={{ margin: '0.5rem 0 0 0', color: '#3d4b5c', fontSize: 15, lineHeight: 1.6 }}>{otherProfile.bio}</p>
            ) : null}
          </div>
        )}
        {/* Spacer so content isn't hidden behind the bottom nav */}
        <div style={{ height: '80px' }} />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h2 className="iv-display" style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem', color: '#5b9bd5' }}>Edit Profile</h2>
      {user ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Name
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bccfdd', marginTop: 4 }} />
          </label>
          <label>
            Location
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bccfdd', marginTop: 4 }} />
          </label>
          <label>
            Bio
            <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bccfdd', marginTop: 4, minHeight: 60 }} />
          </label>
          <label>
            Email
            <input type="email" value={user.email || ''} disabled style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee', marginTop: 4, background: '#d8e6f2', color: '#888' }} />
          </label>
          <button
            type="button"
            onClick={handleChangePassword}
            style={{ background: 'none', border: 'none', padding: 0, color: '#4a86c8', fontWeight: 500, marginBottom: 8, cursor: 'pointer', fontSize: 15, textAlign: 'left', textDecoration: 'underline' }}
          >
            Change Password
          </button>
          {resetSent && <div style={{ color: 'green', fontSize: 13 }}>Reset email sent — check your inbox.</div>}
          {resetError && <div style={{ color: '#b91c1c', fontSize: 13 }}>{resetError}</div>}
          <button type="submit" disabled={loading} style={{ padding: '10px 32px', borderRadius: 8, background: 'linear-gradient(to right, #5b9bd5, #4a86c8)', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Save</button>
          {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
        </form>
      ) : (
        <p>Not logged in.</p>
      )}
      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '80px' }} />
      <BottomNavigation />
    </div>
  );
};

export default Profile;
