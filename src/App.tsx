import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login';
import Feed from './Feed';
import AdminPanel from './AdminPanel';

import './App.css';

interface ApprovedUser {
  email: string;
  approved: boolean;
  inviteCode: string;
  joinedAt: Date;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [approvedUser, setApprovedUser] = useState<ApprovedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Check if user is approved
        try {
          // First check in approvedUsers collection
          let userDoc = await getDoc(doc(db, 'approvedUsers', user.uid));
          if (userDoc.exists() && userDoc.data().approved) {
            setApprovedUser(userDoc.data() as ApprovedUser);
          } else {
            // If not in approvedUsers, check pendingUsers
            userDoc = await getDoc(doc(db, 'pendingUsers', user.uid));
            if (userDoc.exists()) {
              if (userDoc.data().approved) {
                // User has been approved, move them to approvedUsers collection
                const userData = userDoc.data();
                await setDoc(doc(db, 'approvedUsers', user.uid), {
                  ...userData,
                  approved: true
                });
                setApprovedUser(userData as ApprovedUser);
              } else {
                setApprovedUser(null); // Still pending approval
              }
            } else {
              setApprovedUser(null);
            }
          }
        } catch (error) {
          console.error('Error checking user approval:', error);
          setApprovedUser(null);
        }
      } else {
        setApprovedUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              currentUser ? (
                approvedUser ? (
                  <Navigate to="/feed" />
                ) : (
                  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                      <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
                      <p className="text-gray-600 mb-4">
                        Your account has been created successfully and is waiting for administrator approval.
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        You will be able to access the network once an admin approves your account.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Check Status
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/feed"
            element={
              currentUser && approvedUser ? (
                <Feed />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin"
            element={<AdminPanel />}
          />
          <Route
            path="/"
            element={
              <Navigate to={
                currentUser ?
                  (approvedUser ? "/feed" : "/login")
                  : "/login"
              } />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
