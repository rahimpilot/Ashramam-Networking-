import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login';
import Feed from './Feed';
import InviteCode from './InviteCode';
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
          const userDoc = await getDoc(doc(db, 'approvedUsers', user.uid));
          if (userDoc.exists()) {
            setApprovedUser(userDoc.data() as ApprovedUser);
          } else {
            setApprovedUser(null);
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
                        Your account is waiting for administrator approval.
                      </p>
                      <p className="text-sm text-gray-500">
                        Contact the network admin if you believe this is an error.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/signup"
            element={
              currentUser ? (
                <Navigate to="/login" />
              ) : (
                <InviteCode />
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
