import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification, reload, onAuthStateChanged, User } from 'firebase/auth';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

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

  const formatDate = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/';
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const goToHome = () => {
    navigate('/dashboard');
  };

  const handleSendVerification = async () => {
    if (!user) return;
    
    setVerificationLoading(true);
    setVerificationMessage('');
    
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      setVerificationMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      setVerificationMessage(`Error: ${error.message}`);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    
    setIsCheckingVerification(true);
    
    try {
      await reload(user);
      // Force a page refresh to get updated user data
      window.location.reload();
    } catch (error: any) {
      console.error('Error checking verification:', error);
      setVerificationMessage('Error checking verification status. Please try again.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Auto-check verification status every 30 seconds if not verified
  useEffect(() => {
    if (!user || user.emailVerified) return;
    
    const interval = setInterval(async () => {
      try {
        await reload(user);
        if (user.emailVerified) {
          setVerificationMessage('🎉 Email verified successfully!');
          clearInterval(interval);
          // Refresh the page to update the UI
          setTimeout(() => window.location.reload(), 2000);
        }
      } catch (error) {
        console.error('Error auto-checking verification:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

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
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '1rem 0' }}>
      <div style={{ 
        maxWidth: 400, 
        margin: '0 auto', 
        padding: window.innerWidth <= 768 ? '1rem' : '2rem', 
        background: '#fff', 
        borderRadius: window.innerWidth <= 768 ? 12 : 16, 
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        minHeight: window.innerWidth <= 768 ? 'calc(100vh - 4rem)' : 'auto'
      }}>
      {/* Header with Home Button */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: window.innerWidth <= 768 ? 16 : 24,
        flexWrap: window.innerWidth <= 480 ? 'wrap' : 'nowrap',
        gap: window.innerWidth <= 480 ? '0.5rem' : '0'
      }}>
        <button 
          onClick={goToHome}
          style={{ 
            background: '#000000', 
            color: '#ffffff', 
            border: '2px solid #000000', 
            borderRadius: 10, 
            padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px', 
            cursor: 'pointer', 
            fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
            minWidth: 'fit-content'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          🏠 Home
        </button>
        <img src="/newlogo.svg" alt="Logo" style={{ 
          height: window.innerWidth <= 768 ? 36 : 48,
          order: window.innerWidth <= 480 ? -1 : 0,
          width: window.innerWidth <= 480 ? '100%' : 'auto',
          maxWidth: window.innerWidth <= 480 ? '120px' : 'none',
          margin: window.innerWidth <= 480 ? '0 auto 0.5rem auto' : '0'
        }} />
        <div style={{ 
          width: window.innerWidth <= 480 ? '0' : window.innerWidth <= 768 ? '60px' : '72px'
        }}></div> {/* Spacer for centering logo */}
      </div>
      <h2 style={{ 
        fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.5rem', 
        fontWeight: 700, 
        marginBottom: '0.5rem', 
        color: '#000000',
        textAlign: 'center'
      }}>Welcome!</h2>
      {user ? (
        <>
          <div style={{ marginBottom: window.innerWidth <= 768 ? 16 : 24, width: '100%' }}>
            <div style={{ 
              background: '#ffffff', 
              borderRadius: window.innerWidth <= 768 ? 8 : 12, 
              padding: window.innerWidth <= 768 ? 16 : 20, 
              border: '1px solid #000000' 
            }}>
              <h3 style={{ 
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem', 
                fontWeight: 600, 
                marginBottom: window.innerWidth <= 768 ? 12 : 16, 
                color: '#000000', 
                textAlign: 'center' 
              }}>Account Information</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: window.innerWidth <= 768 ? 8 : 12 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center', 
                  padding: window.innerWidth <= 768 ? '6px 0' : '8px 0', 
                  borderBottom: '1px solid #000000',
                  flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                  gap: window.innerWidth <= 480 ? '4px' : '0'
                }}>
                  <span style={{ 
                    fontWeight: 600, 
                    color: '#000000',
                    fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
                  }}>Display Name:</span>
                  <span style={{ 
                    color: '#000000',
                    fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                    textAlign: window.innerWidth <= 480 ? 'left' : 'right'
                  }}>{user.displayName || 'Not set'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #000000' }}>
                  <span style={{ fontWeight: 600, color: '#000000' }}>Email:</span>
                  <span style={{ color: '#000000', fontSize: '0.9rem' }}>{user.email}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #000000' }}>
                  <span style={{ fontWeight: 600, color: '#000000' }}>Email Verified:</span>
                  <span style={{ 
                    color: '#000000', 
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    {user.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #000000' }}>
                  <span style={{ fontWeight: 600, color: '#000000' }}>Phone Number:</span>
                  <span style={{ color: '#000000' }}>{user.phoneNumber || 'Not provided'}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #000000' }}>
                  <span style={{ fontWeight: 600, color: '#000000' }}>Account Created:</span>
                  <span style={{ color: '#000000', fontSize: '0.85rem' }}>{formatDate(user.metadata.creationTime)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #000000' }}>
                  <span style={{ fontWeight: 600, color: '#000000' }}>Last Sign In:</span>
                  <span style={{ color: '#000000', fontSize: '0.85rem' }}>{formatDate(user.metadata.lastSignInTime)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #000000' }}>
                  <span style={{ fontWeight: 600, color: '#000000' }}>Provider:</span>
                  <span style={{ color: '#000000' }}>
                    {user.providerData.length > 0 ? user.providerData[0].providerId : 'Unknown'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <span style={{ fontWeight: 600, color: '#000000' }}>User ID:</span>
                  <span style={{ color: '#000000', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {user.uid.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {!user.emailVerified && (
            <div style={{ marginBottom: 16, width: '100%' }}>
              <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#000000' }}>
                  <strong>⚠️ Email not verified</strong><br />
                  Please verify your email address for full account access.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  {!verificationSent ? (
                    <button
                      onClick={handleSendVerification}
                      disabled={verificationLoading}
                      style={{
                        background: '#000000',
                        color: '#ffffff',
                        border: '2px solid #000000',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: verificationLoading ? 'not-allowed' : 'pointer',
                        opacity: verificationLoading ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {verificationLoading ? '⏳ Sending...' : '📧 Send Verification Email'}
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckVerification}
                      disabled={isCheckingVerification}
                      style={{
                        background: '#000000',
                        color: '#ffffff',
                        border: '2px solid #000000',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: isCheckingVerification ? 'not-allowed' : 'pointer',
                        opacity: isCheckingVerification ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isCheckingVerification ? '⏳ Checking...' : '🔄 I\'ve Verified - Check Status'}
                    </button>
                  )}
                  
                  {verificationMessage && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#000000',
                      fontWeight: 500,
                      marginTop: '4px',
                      lineHeight: '1.3'
                    }}>
                      {verificationMessage}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '0.75rem', color: '#000000', marginTop: '4px' }}>
                    💡 Check your spam folder if you don't see the email
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.emailVerified && (
            <div style={{ marginBottom: 16, width: '100%' }}>
              <div style={{ background: '#ffffff', border: '2px solid #000000', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#000000', fontWeight: 600 }}>
                  ✅ Email verified successfully!
                </p>
              </div>
            </div>
          )}
          <button onClick={goToProfile} style={{ 
            marginBottom: 12, 
            padding: window.innerWidth <= 768 ? '8px 24px' : '10px 32px', 
            borderRadius: 8, 
            background: '#000000', 
            color: '#ffffff', 
            fontWeight: 600, 
            border: '2px solid #000000', 
            cursor: 'pointer', 
            fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem', 
            width: window.innerWidth <= 480 ? '100%' : 'auto',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
          >Profile</button>
          <button onClick={handleLogout} style={{ 
            padding: window.innerWidth <= 768 ? '8px 24px' : '10px 32px', 
            borderRadius: 8, 
            background: '#000000', 
            color: '#ffffff', 
            fontWeight: 600, 
            border: '2px solid #000000', 
            cursor: 'pointer', 
            fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem', 
            width: window.innerWidth <= 480 ? '100%' : 'auto',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
          >Logout</button>
        </>
      ) : (
        <p>Not logged in.</p>
      )}
    </div>
    </div>
  );
};

export default Account;
