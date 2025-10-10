import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Add user to pending approval collection
        await setDoc(doc(db, 'pendingUsers', user.uid), {
          email: user.email,
          approved: false,
          joinedAt: new Date(),
          uid: user.uid
        });
        
        // Sign out the user immediately after signup so they can't access the app
        await signOut(auth);
        setError('Account created successfully! Please wait for admin approval before signing in.');
        setIsSignUp(false); // Switch back to login form
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Google Fonts: Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`body { font-family: 'Inter', sans-serif; }`}</style>
      
      {/* ASHRAMAM Brand Logo at the top */}
      <div className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center">
          <div className="text-6xl font-extrabold text-gray-800 tracking-wider">
            <span className="inline-block transform -rotate-12 mr-2">A</span>
            <span className="text-5xl">SHRAMAM</span>
          </div>
        </div>
      </div>
      
      {/* Centered login form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-md w-full bg-white/95 rounded-2xl shadow-2xl p-8 border border-gray-200 mx-4">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 tracking-tight drop-shadow-sm">
          {isSignUp ? 'Join Ashramam Vibes' : 'സുഖല്ലേ? എന്ന കേറിക്കോ'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-gray-900 bg-gray-50"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-900 bg-gray-50"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-bold shadow-md hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 hover:text-pink-600 text-sm font-semibold underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
