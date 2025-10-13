import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

interface PendingUser {
  uid: string;
  email: string;
  approved: boolean;
}

const AdminPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  const approveUser = async (uid: string) => {
    setError('');
    try {
      await updateDoc(doc(db, 'pendingUsers', uid), { approved: true });
      setPendingUsers(pendingUsers.filter(u => u.uid !== uid));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Admin Panel</h2>
      {loading ? <p>Loading...</p> : (
        <>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          {pendingUsers.length === 0 ? <p>No pending users.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {pendingUsers.map(user => (
                <li key={user.uid} style={{ marginBottom: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                  <span style={{ fontWeight: 500 }}>{user.email}</span>
                  <button onClick={() => approveUser(user.uid)} style={{ marginLeft: 16, padding: '6px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>Approve</button>
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
