import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { ADMIN_EMAIL } from './adminConfig';

interface PendingUser {
  uid: string;
  email: string;
  approved: boolean;
}

const AdminPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  // Only the admin may use this panel (rules enforce it server-side too)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setAuthorized(true);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    const fetchPending = async () => {
      setLoading(true);
      setError('');
      try {
        const snapshot = await getDocs(collection(db, 'pendingUsers'));
        const users: PendingUser[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (!data.approved) {
            users.push({
              uid: docSnap.id,
              email: data.email || '',
              approved: false
            });
          }
        });
        setPendingUsers(users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [authorized]);

  const approveUser = async (uid: string) => {
    setError('');
    try {
      await updateDoc(doc(db, 'pendingUsers', uid), { approved: true });
      setPendingUsers(pendingUsers.filter(u => u.uid !== uid));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rejectUser = async (uid: string, email: string) => {
    if (!window.confirm(`Reject and remove the signup request from ${email}? They will not be able to log in.`)) {
      return;
    }
    setError('');
    try {
      await deleteDoc(doc(db, 'pendingUsers', uid));
      setPendingUsers(pendingUsers.filter(u => u.uid !== uid));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', background: '#ffffff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Admin Panel</h2>
      {loading ? <p>Loading...</p> : (
        <>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          {pendingUsers.length === 0 ? <p>No pending users.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {pendingUsers.map(user => (
                <li key={user.uid} style={{ marginBottom: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                  <span style={{ fontWeight: 500 }}>{user.email}</span>
                  <button onClick={() => approveUser(user.uid)} style={{ marginLeft: 16, padding: '6px 16px', borderRadius: 6, background: '#5b9bd5', color: '#ffffff', border: 'none', cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => rejectUser(user.uid, user.email)} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, background: '#ffffff', color: '#c0392b', border: '1px solid #c0392b', cursor: 'pointer' }}>Reject</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
