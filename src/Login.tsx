import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first, then tap "Forgot password?".');
      return;
    }
    setError('');
    setResetSent(false);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'pendingUsers', user.uid), {
          email: user.email,
          approved: false,
          joinedAt: new Date(),
          uid: user.uid
        });

        setError('Account created successfully! Please wait for admin approval before signing in.');
        setIsSignUp(false);
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
        // Approved: redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f1e6cf, #fffdf8, #faf6ec)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {/* Login Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
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
                height: '64px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))'
              }}
            />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2a241c',
              marginBottom: '0.5rem'
            }}>
              {isSignUp ? 'Join Ashramam Vibes' : ''}
            </h2>
            <p style={{
              color: '#7a7264',
              fontSize: '0.875rem',
              fontWeight: isSignUp ? 'normal' : 'bold'
            }}>
              {isSignUp ? 'Create your account to connect with friends' : <strong style={{ fontWeight: 'bold' }}>സുഖല്ലേ? എന്ന കേറിക്കോ</strong>}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#332e26',
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
                  border: '1px solid #d8c9ae',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  outline: 'none',
                  color: '#1c1915',
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
                color: '#332e26',
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
                  border: '1px solid #d8c9ae',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  outline: 'none',
                  color: '#1c1915',
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
                background: 'linear-gradient(to right, #9a6b3f, #9333ea)',
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
                color: '#9a6b3f',
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
            {!isSignUp && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={handleForgotPassword}
                  style={{
                    color: '#9a6b3f',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot password?
                </button>
                {resetSent && (
                  <p style={{ color: '#15803d', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Password reset email sent — check your inbox.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;