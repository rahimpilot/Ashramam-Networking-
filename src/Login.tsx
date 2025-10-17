import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import DisclaimerModal from './DisclaimerModal';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // For sign-up, show disclaimer first if not already accepted
    if (isSignUp && !disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send verification email immediately after account creation
        try {
          await sendEmailVerification(user);
        } catch (verificationError) {
          console.error('Error sending verification email:', verificationError);
        }
        
        await setDoc(doc(db, 'pendingUsers', user.uid), {
          email: user.email,
          approved: false,
          joinedAt: new Date(),
          uid: user.uid
        });
        
        setError('Account created successfully! A verification email has been sent to your email address. Please verify your email and wait for admin approval before signing in.');
        setIsSignUp(false);
        setDisclaimerAccepted(false); // Reset for next time
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // Enforce admin approval: check user's pendingUsers doc
        const pendingRef = doc(db, 'pendingUsers', cred.user.uid);
        const pendingSnap = await getDoc(pendingRef);
        if (pendingSnap.exists()) {
          const data = pendingSnap.data() as { approved?: boolean };
          if (!data.approved) {
            // Not approved yet: sign out and notify user
            await signOut(auth);
            setError(`Your account is awaiting admin approval.\nFirestore doc: ${JSON.stringify(data, null, 2)}`);
            return;
          }
        } else {
          setError('No pendingUsers document found for your account.');
          return;
        }
        // Approved: redirect to account page
        navigate('/account');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisclaimerAgree = () => {
    setShowDisclaimer(false);
    setDisclaimerAccepted(true);
    // Trigger the form submission after accepting disclaimer
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false);
    setDisclaimerAccepted(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: window.innerWidth <= 768 ? '0.5rem' : '1rem'
    }}>
      <div style={{ 
        maxWidth: '28rem', 
        width: '100%',
        margin: window.innerWidth <= 768 ? '0' : 'auto'
      }}>
        {/* Login Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: window.innerWidth <= 768 ? '0.75rem' : '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: window.innerWidth <= 768 ? 'calc(100vh - 1rem)' : 'auto',
          justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start'
        }}>
          {/* Logo above login form */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
            width: '100%'
          }}>
            <img 
              src="/newlogo.svg" 
              alt="Ashramam Vibes Logo" 
              style={{
                height: window.innerWidth <= 768 ? '48px' : '64px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))'
              }}
            />
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem' 
          }}>
            <h2 style={{
              fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem',
              lineHeight: '1.3',
              textAlign: 'center'
            }}>
              {isSignUp ? 'അവനവൻ കുഴിക്കുന്ന കുരുക്കഴിച്ചെടുക്കുമ്പോൾ ഗുലുമാൽ' : ''}
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem',
              fontWeight: isSignUp ? 'normal' : 'bold',
              lineHeight: '1.4'
            }}>
              {isSignUp ? '' : <strong style={{fontWeight:'900', fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem'}}>സുഖല്ലേ? എന്ന കേറിക്കോ</strong>}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  outline: 'none',
                  color: '#111827',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  outline: 'none',
                  color: '#111827',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                color: '#2563eb',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'color 0.2s',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
      
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAgree={handleDisclaimerAgree}
        onCancel={handleDisclaimerCancel}
      />
    </div>
  );
};

export default Login;