import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

interface PendingUser {
  uid: string;
  email: string;
  approved: boolean;
  joinedAt: any;
}

const AdminPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple admin authentication - you can change this password
  const ADMIN_PASSWORD = 'ashramam2024'; // Change this to your desired admin password

  const authenticateAdmin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect admin password');
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pendingUsers'));
      const users: PendingUser[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() } as PendingUser);
      });
      setPendingUsers(users.filter(user => !user.approved));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setLoading(false);
    }
  };

  const approveUser = async (user: PendingUser) => {
    try {
      // Update the user's approval status in pendingUsers
      await updateDoc(doc(db, 'pendingUsers', user.uid), {
        approved: true,
        approvedAt: new Date()
      });

      // Add user to approvedUsers collection
      await setDoc(doc(db, 'approvedUsers', user.uid), {
        email: user.email,
        approved: true,
        joinedAt: user.joinedAt,
        approvedAt: new Date(),
        uid: user.uid
      });

      // Refresh the pending users list
      fetchPendingUsers();
      alert(`User ${user.email} has been approved!`);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user. Please try again.');
    }
  };

  const rejectUser = async (user: PendingUser) => {
    if (window.confirm(`Are you sure you want to reject ${user.email}? This will delete their account.`)) {
      try {
        // Remove user from pendingUsers collection
        await deleteDoc(doc(db, 'pendingUsers', user.uid));
        
        // Refresh the pending users list
        fetchPendingUsers();
        alert(`User ${user.email} has been rejected and removed.`);
      } catch (error) {
        console.error('Error rejecting user:', error);
        alert('Error rejecting user. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingUsers();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && authenticateAdmin()}
              />
            </div>
            <button
              onClick={authenticateAdmin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Ashramam Admin Panel</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              Logout
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Pending User Approvals ({pendingUsers.length})</h2>
            <button
              onClick={fetchPendingUsers}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh List
            </button>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No pending users to approve</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Joined At</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.joinedAt?.toDate ? user.joinedAt.toDate().toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="space-x-2">
                          <button
                            onClick={() => approveUser(user)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectUser(user)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;