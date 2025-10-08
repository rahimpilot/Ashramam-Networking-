import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const InviteCode: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'invite' | 'signup'>('invite');

  // List of valid invite codes for your 14 school friends
  const VALID_INVITE_CODES = [
    'ASHFRIENDS2024',
    'SCHOOLNETWORK',
    'FRIENDS14',
    'CLASSMATES',
    'REUNION2024'
  ];

  const validateInviteCode = async (code: string) => {
    if (!VALID_INVITE_CODES.includes(code.toUpperCase())) {
      throw new Error('Invalid invite code. Please contact the admin for a valid invite code.');
    }

    // Check if code has been used
    const codeDoc = await getDoc(doc(db, 'inviteCodes', code.toUpperCase()));
    if (codeDoc.exists() && codeDoc.data().used) {
      throw new Error('This invite code has already been used.');
    }

    return true;
  };

  const markInviteCodeAsUsed = async (code: string) => {
    await setDoc(doc(db, 'inviteCodes', code.toUpperCase()), {
      used: true,
      usedBy: email,
      usedAt: new Date()
    });
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await validateInviteCode(inviteCode);
      setStep('signup');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate invite code again
      await validateInviteCode(inviteCode);

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mark invite code as used
      await markInviteCodeAsUsed(inviteCode);

      // Add user to approved users collection
      await setDoc(doc(db, 'approvedUsers', user.uid), {
        email: user.email,
        inviteCode: inviteCode.toUpperCase(),
        joinedAt: new Date(),
        approved: true
      });

      // Success! User will be redirected to feed

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'invite') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Ashramam Vibes</h2>
          <p className="text-center text-gray-600 mb-6">
            This is a private network for our 14 school friends. Please enter your invite code to continue.
          </p>

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
                Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 uppercase"
                placeholder="ENTER INVITE CODE"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Don't have an invite code?</p>
            <p>Contact the network admin to get one!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
        <p className="text-center text-gray-600 mb-6">
          Welcome! Create your account to join the private network.
        </p>

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              minLength={6}
              required
            />
          </div>

          <div className="text-xs text-gray-500">
            <p><strong>Invite Code:</strong> {inviteCode}</p>
            <p>This code will be used for your account registration.</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setStep('invite')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Invite Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteCode;
