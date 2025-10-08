import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc, doc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

interface Post {
  id: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  articleUrl?: string;
  userId: string;
  userEmail: string;
  timestamp: any;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        // Check if current user is approved
        try {
          const userDoc = await getDoc(doc(db, 'approvedUsers', user.uid));
          setIsApproved(userDoc.exists() && userDoc.data().approved);
        } catch (error) {
          console.error('Error checking approval status:', error);
          setIsApproved(false);
        }
      } else {
        setIsApproved(false);
      }
    });

    // Listen for posts from approved users only
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(q, async (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      // Filter posts to only show from approved users
      const approvedUserIds = new Set();
      try {
        const approvedUsersSnapshot = await getDocs(collection(db, 'approvedUsers'));
        approvedUsersSnapshot.docs.forEach(doc => {
          if (doc.data().approved) {
            approvedUserIds.add(doc.id);
          }
        });
      } catch (error) {
        console.error('Error fetching approved users:', error);
      }

      const filteredPosts = postsData.filter(post => approvedUserIds.has(post.userId));
      setPosts(filteredPosts);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (!newPost.trim() && !selectedFile)) return;

    setLoading(true);
    try {
      let fileUrl = '';

      // Upload file if selected
      if (selectedFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        fileUrl = await getDownloadURL(snapshot.ref);
      }

      // Add post to Firestore
      await addDoc(collection(db, 'posts'), {
        text: newPost,
        imageUrl: selectedFile?.type.startsWith('image/') ? fileUrl : '',
        videoUrl: selectedFile?.type.startsWith('video/') ? fileUrl : '',
        articleUrl: '', // You can add article URL logic here
        userId: currentUser.uid,
        userEmail: currentUser.email,
        timestamp: serverTimestamp()
      });

      setNewPost('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error adding post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view the feed</h2>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your account is waiting for administrator approval to access the feed.
          </p>
          <p className="text-sm text-gray-500">
            You can view posts once approved. Contact the network admin if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">Ashramam Vibes</h1>
          <p className="text-center text-gray-600">Welcome back, {currentUser.email}!</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Post Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share a story, memory, or update with your school friends..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />

            <div className="mt-4 flex items-center justify-between">
              <div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700"
                >
                  📎 {selectedFile ? selectedFile.name : 'Add Photo/Video'}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || (!newPost.trim() && !selectedFile)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Share'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {post.userEmail?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{post.userEmail}</p>
                    <p className="text-sm text-gray-500">
                      {post.timestamp?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </p>
                  </div>
                </div>

                {post.text && (
                  <p className="mb-4 text-gray-800">{post.text}</p>
                )}

                {post.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                {post.videoUrl && (
                  <div className="mb-4">
                    <video
                      src={post.videoUrl}
                      controls
                      className="max-w-full h-auto rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button className="hover:text-blue-600">👍 Like</button>
                  <button className="hover:text-blue-600">💬 Comment</button>
                  <button className="hover:text-blue-600">📤 Share</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
