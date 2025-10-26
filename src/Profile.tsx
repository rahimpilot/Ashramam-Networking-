import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';

// Admin-controlled profile picture mapping
const getProfilePicture = (email: string, name: string) => {
  const profilePictureMap: { [key: string]: string } = {
    // Add user email mappings here - controlled by admin
    'raimu456@gmail.com': '/raimu.jpg',
    'hyder.mohamed@gmail.com': '/hyder.JPG',
    'mzmhmd@gmail.com': '/bruno.png',
    'nias.ahamad@gmail.com': '/nias.jpg',
    'mshanir@gmail.com': '/shanir.jpeg',
    'niaznasu@gmail.com': '/niaz.jpeg',
    'riaz986@gmail.com': '/riaz',
    'anaskallur@gmail.com': '/anas.jpg',
    'mailmohasinali@gmail.com': '/appan.JPG',
    // Add more mappings as needed
  };

  // Check if user has a custom profile picture
  if (profilePictureMap[email.toLowerCase()]) {
    return profilePictureMap[email.toLowerCase()];
  }

  // Return null for default avatar
  return null;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Check if this is a first-time user
  const isFirstTime = new URLSearchParams(location.search).get('firstTime') === 'true';
  
  // Check if viewing another user's profile
  const viewedUserEmail = new URLSearchParams(location.search).get('user');
  const viewedUserName = new URLSearchParams(location.search).get('name');
  const isViewingOtherUser = viewedUserEmail && viewedUserEmail !== user?.email;

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (!currentUser) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  
  // Personal Info
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [intellectual, setIntellectual] = useState('');
  const [umrah, setUmrah] = useState('');
  const [funLover, setFunLover] = useState('');
  
  // Privacy & Preferences
  const [profileComplete, setProfileComplete] = useState(0);
  
  // UI State
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Password Change State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error'>('success');

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [name, city, country, bio, intellectual, umrah, funLover];
    const filledFields = fields.filter(field => field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const ref = doc(db, 'profiles', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            setName(data.name || '');
            setCity(data.city || '');
            setCountry(data.country || '');
            setBio(data.bio || '');
            setIntellectual(data.intellectual || '');
            setUmrah(data.umrah || '');
            setFunLover(data.funLover || '');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    setProfileComplete(calculateProfileCompletion());
  }, [name, city, country, bio, intellectual, umrah, funLover]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (user) {
      try {
        await setDoc(doc(db, 'profiles', user.uid), {
          // Personal Info
          name,
          city,
          country,
          bio,
          intellectual,
          umrah,
          funLover,
          
          // System fields
          email: user.email,
          lastUpdated: new Date().toISOString(),
          profileCompletion: calculateProfileCompletion()
        });
        
        setMessage('Profile updated successfully! 🎉');
        setMessageType('success');
        
        // If this is a first-time user and profile is now complete, redirect to dashboard
        if (isFirstTime && calculateProfileCompletion() === 100) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000); // Give user time to see success message
        }
      } catch (error) {
        setMessage('Error saving profile. Please try again.');
        setMessageType('error');
        console.error('Error saving profile:', error);
      }
    }
    setLoading(false);
    
    // Clear message after 3 seconds
    if (!isFirstTime || calculateProfileCompletion() !== 100) {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setPasswordLoading(true);
    setPasswordMessage('');
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordMessage('Password reset email sent! Check your inbox for instructions.');
      setPasswordMessageType('success');
    } catch (error: any) {
      setPasswordMessage('Error sending password reset email. Please try again.');
      setPasswordMessageType('error');
      console.error('Password reset error:', error);
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setPasswordMessage(''), 5000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      setPasswordMessageType('error');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters long.');
      setPasswordMessageType('error');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMessage('');
    
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setPasswordMessage('Password changed successfully! 🔒');
      setPasswordMessageType('success');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setPasswordMessage('Current password is incorrect.');
      } else if (error.code === 'auth/weak-password') {
        setPasswordMessage('New password is too weak. Please choose a stronger password.');
      } else {
        setPasswordMessage('Error changing password. Please try again.');
      }
      setPasswordMessageType('error');
      console.error('Password change error:', error);
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setPasswordMessage(''), 5000);
    }
  };

  const goBack = () => {
    if (isFirstTime) {
      // For first-time users, check if profile is complete before allowing navigation
      if (calculateProfileCompletion() === 100) {
        navigate('/dashboard');
      } else {
        // Show a warning that profile must be completed
        setMessage('Please complete all profile fields before proceeding.');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    } else {
      navigate('/account');
    }
  };

  const renderTabButton = (tabId: string, label: string, icon: string) => (
    <button
      onClick={() => setActiveTab(tabId)}
      style={{
        padding: window.innerWidth <= 768 ? '8px 12px' : '12px 20px',
        border: 'none',
        background: activeTab === tabId ? '#2563eb' : 'transparent',
        color: activeTab === tabId ? '#fff' : '#64748b',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
        fontWeight: activeTab === tabId ? 600 : 500,
        display: 'flex',
        alignItems: 'center',
        gap: window.innerWidth <= 768 ? '4px' : '8px',
        transition: 'all 0.2s ease',
        flex: window.innerWidth <= 480 ? '1' : 'none',
        justifyContent: 'center',
        minWidth: window.innerWidth <= 480 ? 'auto' : 'fit-content'
      }}
    >
      <span style={{ fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem' }}>{icon}</span>
      {window.innerWidth <= 480 ? '' : label}
    </button>
  );

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '1rem' 
      }}>
        <div style={{ 
          background: '#ffffff', 
          borderRadius: 20, 
          padding: '2rem', 
          textAlign: 'center', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔒</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#000000', 
            margin: '0 0 1rem 0' 
          }}>
            Access Denied
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#64748b', 
            margin: '0 0 1.5rem 0' 
          }}>
            Please log in to access your profile.
          </p>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: '#000000',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              transition: 'all 0.2s ease'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#ffffff',
      padding: window.innerWidth <= 768 ? '1rem 0.5rem' : '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: 800, 
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '0 0.5rem' : '0'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: window.innerWidth <= 768 ? 16 : 20, 
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem', 
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem',
            flexWrap: window.innerWidth <= 480 ? 'wrap' : 'nowrap',
            gap: window.innerWidth <= 480 ? '0.5rem' : '0'
          }}>
            <button onClick={goBack} style={{ 
              background: 'rgba(255,255,255,0.8)', 
              border: '2px solid #e5e7eb',
              borderRadius: 12, 
              width: isFirstTime ? 'auto' : 40, 
              height: 40, 
              color: '#374151', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: isFirstTime ? '0.9rem' : '1.2rem',
              fontWeight: isFirstTime ? 600 : 'normal',
              padding: isFirstTime ? '0 12px' : '0',
              transition: 'all 0.2s ease'
            }}>
              {isFirstTime ? '📝 Continue to Dashboard' : '←'}
            </button>
            
            <img src="/newlogo.svg" alt="Logo" style={{ 
              height: window.innerWidth <= 768 ? 36 : 48,
              order: window.innerWidth <= 480 ? -1 : 0,
              width: window.innerWidth <= 480 ? '100%' : 'auto',
              maxWidth: window.innerWidth <= 480 ? '120px' : 'none',
              margin: window.innerWidth <= 480 ? '0 auto 0.5rem auto' : '0',
              flex: window.innerWidth <= 480 ? 'none' : '0 0 auto'
            }} />
            
            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? '1.8rem' : '2.2rem', 
              fontWeight: 700, 
              margin: 0, 
              color: '#000000',
              textAlign: 'center',
              flex: 1,
              order: window.innerWidth <= 480 ? 1 : 0
            }}>
              {isFirstTime ? 'Welcome! Complete Your Profile' : 'Profile Settings'}
            </h1>

            <div style={{ 
              width: 40,
              order: window.innerWidth <= 480 ? 2 : 0
            }}></div>
          </div>

          {isFirstTime && (
            <div style={{ 
              background: '#ffffff', 
              border: '2px solid #000000', 
              borderRadius: 12, 
              padding: 16, 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '1rem', 
                color: '#000000', 
                margin: 0,
                fontWeight: 600
              }}>
                🎉 Welcome to Ashramam! Please complete your profile information below to get started.
              </p>
            </div>
          )}

          <p style={{ 
            fontSize: '1rem', 
            color: '#64748b', 
            margin: 0,
            textAlign: 'center'
          }}>
            {isFirstTime ? 'Fill out all the required fields to join the community' : 'Manage your personal information and account settings'}
          </p>
        </div>

        {/* Profile Summary Card */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: window.innerWidth <= 768 ? 16 : 20, 
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem', 
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: window.innerWidth <= 768 ? '1rem' : '1.5rem',
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
            textAlign: window.innerWidth <= 480 ? 'center' : 'left'
          }}>
            <div style={{ 
              width: window.innerWidth <= 768 ? 120 : 150, 
              height: window.innerWidth <= 768 ? 120 : 150, 
              borderRadius: '50%', 
              border: '3px solid #e5e7eb',
              flexShrink: 0,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {(() => {
                const displayEmail = isViewingOtherUser ? viewedUserEmail : user?.email;
                const displayName = isViewingOtherUser ? viewedUserName : name;
                
                return displayEmail && displayName && getProfilePicture(displayEmail, displayName) ? (
                  <img 
                    src={getProfilePicture(displayEmail, displayName)!} 
                    alt={displayName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div style="
                            width: 100%;
                            height: 100%;
                            background: #f3f4f6;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: ${window.innerWidth <= 768 ? '3rem' : '4rem'};
                            color: #9ca3af;
                          ">
                            ${displayName ? displayName.charAt(0).toUpperCase() : '👤'}
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: window.innerWidth <= 768 ? '3rem' : '4rem',
                    color: '#9ca3af'
                  }}>
                    {displayName ? displayName.charAt(0).toUpperCase() : '👤'}
                  </div>
                );
              })()}
            </div>
            
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ 
                fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.5rem', 
                fontWeight: 600, 
                margin: '0 0 0.5rem 0',
                color: '#000000'
              }}>
                {isViewingOtherUser ? viewedUserName : (name || 'Complete Your Profile')}
              </h2>
              <p style={{ 
                fontSize: '0.95rem', 
                color: '#64748b', 
                margin: '0 0 0.75rem 0'
              }}>
                {isViewingOtherUser ? viewedUserEmail : user.email}
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                flexWrap: 'wrap',
                justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start'
              }}>
                <div style={{ 
                  background: profileComplete >= 80 ? '#dcfce7' : profileComplete >= 50 ? '#fef3c7' : '#fef2f2',
                  color: profileComplete >= 80 ? '#166534' : profileComplete >= 50 ? '#92400e' : '#991b1b',
                  border: `1px solid ${profileComplete >= 80 ? '#16a34a' : profileComplete >= 50 ? '#f59e0b' : '#dc2626'}`,
                  borderRadius: 20, 
                  padding: '0.25rem 0.75rem', 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {profileComplete}% Complete
                </div>
                {(city || country) && (
                  <div style={{ 
                    background: '#f3f4f6',
                    color: '#374151',
                    borderRadius: 20, 
                    padding: '0.25rem 0.75rem', 
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap'
                  }}>
                    📍 {[city, country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: window.innerWidth <= 768 ? 16 : 20, 
          padding: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('personal')}
              style={{
                background: activeTab === 'personal' ? '#000000' : 'transparent',
                color: activeTab === 'personal' ? '#ffffff' : '#64748b',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              👤 Personal Info
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              style={{
                background: activeTab === 'privacy' ? '#000000' : 'transparent',
                color: activeTab === 'privacy' ? '#ffffff' : '#64748b',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              🔒 Account Security
            </button>
          </div>
        </div>

        {/* Content Area - Only show for own profile */}
        {!isViewingOtherUser && (
          <form onSubmit={handleSave}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: window.innerWidth <= 768 ? 16 : 20, 
            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem', 
            marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 600, 
                  marginBottom: '1.5rem', 
                  color: '#000000', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  👤 Personal Information
                </h3>
                

              
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>Full Name *</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Enter your full name"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        fontSize: '1rem', 
                        transition: 'border-color 0.2s', 
                        outline: 'none' 
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>City</label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      placeholder="Enter your city"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        fontSize: '1rem', 
                        transition: 'border-color 0.2s', 
                        outline: 'none' 
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>Country</label>
                    <input 
                      type="text" 
                      value={country} 
                      onChange={e => setCountry(e.target.value)} 
                      placeholder="Enter your country"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        fontSize: '1rem', 
                        transition: 'border-color 0.2s', 
                        outline: 'none' 
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>ബുദ്ധിജീവി ആണോ?</label>
                    <select 
                      value={intellectual} 
                      onChange={e => setIntellectual(e.target.value)} 
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        fontSize: '1rem', 
                        transition: 'border-color 0.2s', 
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">തിരഞ്ഞെടുക്കുക...</option>
                      <option value="അതെ">അതെ</option>
                      <option value="അല്ല">അല്ല</option>
                      <option value="ചിലപ്പോളൊഴൊക്കെ">ചിലപ്പോളൊഴൊക്കെ</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>ഉംറ ചെയ്തിട്ടുണ്ടോ?</label>
                    <select 
                      value={umrah} 
                      onChange={e => setUmrah(e.target.value)} 
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        fontSize: '1rem', 
                        transition: 'border-color 0.2s', 
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">തിരഞ്ഞെടുക്കുക...</option>
                      <option value="ഉണ്ട്">ഉണ്ട്</option>
                      <option value="ഇല്ല">ഇല്ല</option>
                      <option value="വെളിപ്പെടുത്താൻ ആഗ്രഹിക്കുന്നില്ല">വെളിപ്പെടുത്താൻ ആഗ്രഹിക്കുന്നില്ല</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>ഉല്ലാസം ഇഷ്ടമാണോ?</label>
                    <select 
                      value={funLover} 
                      onChange={e => setFunLover(e.target.value)} 
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        fontSize: '1rem', 
                        transition: 'border-color 0.2s', 
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">തിരഞ്ഞെടുക്കുക...</option>
                      <option value="അതെ">അതെ</option>
                      <option value="പിന്നല്ല">പിന്നല്ല</option>
                      <option value="ഉറപ്പല്ലേ">ഉറപ്പല്ലേ</option>
                      <option value="മാൻ എനിക്കിഷ്ടാണേ">മാൻ എനിക്കിഷ്ടാണേ</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>
                      Bio or നിങ്ങളുടെ ചരിത്രം. വളരെ കുറച്ചു വാക്കുകളിൽ ലളിതമായി തള്ളാതെ എഴുതുക. (Hyder and Marzook can contact the admin if you need more space)
                    </label>
                    <textarea 
                      value={bio} 
                      onChange={e => setBio(e.target.value)} 
                      placeholder="വളരെ കുറച്ചു വാക്കുകളിൽ നിങ്ങളെ കുറിച്ച് എഴുതുക..."
                      rows={4}
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid #e5e7eb', 
                        fontSize: '1rem', 
                        transition: 'border-color 0.2s', 
                        outline: 'none', 
                        resize: 'vertical' 
                      }}
                      onFocus={e => e.target.style.borderColor = '#000000'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
            </div>
          )}

            {/* Privacy Settings Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 600, 
                  marginBottom: '1.5rem', 
                  color: '#000000', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  🔒 Account Security
                </h3>
                
                {/* Password Change Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Quick Password Reset */}
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 12, 
                    padding: '1.5rem' 
                  }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#000000', fontSize: '1.1rem' }}>
                      📧 Password Reset via Email
                    </h4>
                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#64748b', lineHeight: '1.6' }}>
                      Get a secure password reset link sent to <strong>{user?.email}</strong>
                    </p>
                    <button
                      onClick={handlePasswordReset}
                      disabled={passwordLoading}
                      style={{ 
                        padding: '12px 24px', 
                        background: passwordLoading ? '#9ca3af' : '#000000', 
                        color: '#fff', 
                        border: 'none',
                        borderRadius: 8, 
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {passwordLoading ? '📨 Sending...' : '📧 Send Reset Email'}
                    </button>
                  </div>

                  {/* Direct Password Change */}
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 12, 
                    padding: '1.5rem' 
                  }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#000000', fontSize: '1.1rem' }}>
                      🔑 Change Password Directly
                    </h4>
                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#64748b', lineHeight: '1.6' }}>
                      Change your password immediately by entering your current password
                    </p>
                    
                    {!showPasswordForm ? (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        style={{ 
                          padding: '12px 24px', 
                          background: '#ffffff', 
                          color: '#000000', 
                          border: '1px solid #e5e7eb',
                          borderRadius: 8, 
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        🔑 Change Password Now
                      </button>
                  ) : (
                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>Current Password</label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#000000'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password (min 6 characters)"
                            required
                            minLength={6}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#000000'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#000000' }}>Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            required
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#000000'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      
                        <div style={{ display: 'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', gap: '1rem', marginTop: '0.5rem' }}>
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            style={{
                              padding: '12px 24px',
                              background: passwordLoading ? '#9ca3af' : '#000000',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: '1rem',
                              fontWeight: 600,
                              cursor: passwordLoading ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              flex: 1
                            }}
                          >
                            {passwordLoading ? '🔄 Changing...' : '✅ Update Password'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                              setPasswordMessage('');
                            }}
                            style={{
                              padding: '12px 24px',
                              background: '#ffffff',
                              color: '#000000',
                              border: '1px solid #e5e7eb',
                              borderRadius: 8,
                              fontSize: '1rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                    </form>
                  )}
                </div>

                {/* Password Message */}
                {passwordMessage && (
                  <div style={{
                    padding: '1rem',
                    borderRadius: 8,
                    background: passwordMessageType === 'success' ? '#dcfce7' : '#fef2f2',
                    border: `1px solid ${passwordMessageType === 'success' ? '#16a34a' : '#dc2626'}`,
                    color: passwordMessageType === 'success' ? '#166534' : '#991b1b',
                    fontSize: '1rem',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    {passwordMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

          {/* Save Button & Message */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: window.innerWidth <= 768 ? 16 : 20, 
            padding: '1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            gap: window.innerWidth <= 768 ? '1rem' : '0'
          }}>
            <div style={{ flex: 1 }}>
              {message && (
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: 8, 
                  background: messageType === 'success' ? '#dcfce7' : '#fef2f2',
                  border: `1px solid ${messageType === 'success' ? '#16a34a' : '#dc2626'}`,
                  color: messageType === 'success' ? '#166534' : '#991b1b',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textAlign: 'center'
                }}>
                  {message}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '12px 32px', 
                borderRadius: 8, 
                background: loading ? '#9ca3af' : '#000000', 
                color: '#fff', 
                fontWeight: 600, 
                border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontSize: '1rem', 
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
          </div>
      </form>
        )}
    </div>
    </div>
  );
};

export default Profile;
