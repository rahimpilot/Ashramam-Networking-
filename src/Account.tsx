import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { getProfilePhoto } from './profilePhotos';

export interface ProfileData {
  name: string;
  location: string;
  bio: string;
}

/** Pure presentational profile card — also used by the visual-verification
 *  preview route with mock data (the route itself is removed before commit). */
export const ProfileCard: React.FC<{
  profile: ProfileData | null;
  email: string | null;
  displayName: string;
  photoUrl: string | null;
  onEdit: () => void;
  onSignOut: () => void;
}> = ({ profile, email, displayName, photoUrl, onEdit, onSignOut }) => {
  const initial = (displayName || '?').charAt(0).toUpperCase();
  const hasProfile = !!(profile && (profile.name || profile.location || profile.bio));
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = !!photoUrl && !imgFailed;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="iv-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
        {showPhoto ? (
          <img
            src={photoUrl as string}
            alt={displayName}
            onError={() => setImgFailed(true)}
            style={{
              width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
              margin: '0 auto 12px auto', display: 'block'
            }}
          />
        ) : (
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5b9bd5, #4a86c8)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 700, margin: '0 auto 12px auto',
            fontFamily: "'Marcellus', Georgia, serif"
          }}>
            {initial}
          </div>
        )}
        <h2 style={{
          fontSize: 24, fontWeight: 400, color: '#1c2733', margin: '0 0 4px 0',
          fontFamily: "'Marcellus', Georgia, serif", letterSpacing: '0.3px'
        }}>
          {displayName || 'Member'}
        </h2>
        {profile?.location ? (
          <p style={{ margin: '0 0 12px 0', color: '#7a8ba0', fontSize: 14 }}>
            📍 {profile.location}
          </p>
        ) : null}
        {profile?.bio ? (
          <p style={{ margin: '0 0 4px 0', color: '#3d4b5c', fontSize: 15, lineHeight: 1.65 }}>
            {profile.bio}
          </p>
        ) : null}
        {!hasProfile ? (
          <p style={{ margin: '0 0 4px 0', color: '#7a8ba0', fontSize: 14 }}>
            Your profile is empty — tell the group a little about yourself.
          </p>
        ) : null}
        {email ? (
          <>
            <div style={{ borderTop: '1px solid #e6e9f0', margin: '16px 0 12px 0' }} />
            <p style={{ margin: 0, color: '#7a8ba0', fontSize: 14 }}>
              ✉️ {email}
            </p>
          </>
        ) : null}
        <button
          onClick={onEdit}
          style={{
            marginTop: 20, width: '100%', padding: '12px', borderRadius: 10,
            background: 'linear-gradient(to right, #5b9bd5, #4a86c8)', color: '#ffffff',
            fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontFamily: "'Marcellus', Georgia, serif", letterSpacing: '0.3px'
          }}
        >
          Edit Profile
        </button>
      </div>
      <button
        onClick={onSignOut}
        style={{
          marginTop: 16, width: '100%', padding: '12px', borderRadius: 10,
          background: '#ffffff', color: '#c0392b', fontWeight: 600,
          border: '1px solid #eec9c9', cursor: 'pointer', fontSize: '1rem',
          fontFamily: "'Marcellus', Georgia, serif", letterSpacing: '0.3px'
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
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

  // Load the member's profile info (name, location, bio) from Firestore
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const snap = await getDoc(doc(db, 'profiles', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name || '',
            location: data.location || '',
            bio: data.bio || ''
          });
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/';
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || '';

  return (
    <div className="iv-page iv-page-narrow" style={{ paddingTop: '24px', paddingBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <img src="/newlogo.svg" alt="Ashramam" style={{ height: 40, opacity: 0.9 }} />
      </div>
      {authLoading || profileLoading ? (
        <p style={{ textAlign: 'center', color: '#7a8ba0' }}>Loading your profile…</p>
      ) : user ? (
        <ProfileCard
          profile={profile}
          email={user.email}
          displayName={displayName}
          photoUrl={getProfilePhoto(user.email || '')}
          onEdit={goToProfile}
          onSignOut={handleLogout}
        />
      ) : (
        <p style={{ textAlign: 'center', color: '#7a8ba0' }}>Not logged in.</p>
      )}

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div className="iv-dock-spacer" />
      <BottomNavigation />
    </div>
  );
};

export default Account;
