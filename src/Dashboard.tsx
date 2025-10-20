import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  name?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  profileCompletion?: number;
  profilePicture?: string;
}

interface ScrapPost {
  id: string;
  message: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp;
  likes: string[];
  likeCount: number;
  tags: string[];
  replies: ScrapReply[];
  replyCount: number;
}

interface ScrapReply {
  id: string;
  message: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp;
}

interface Notification {
  id: string;
  type: 'mention' | 'reply';
  fromUser: string;
  fromEmail: string;
  toEmail: string;
  postId: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('scrapbook');
  const [scrapPosts, setScrapPosts] = useState<ScrapPost[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hangoutActiveTab, setHangoutActiveTab] = useState<string>('upcoming-trip');

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (!currentUser) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Navigation functions
  const goToStories = () => navigate('/stories');
  const goToResidents = () => navigate('/residents'); 
  const goToProfile = () => navigate('/profile');
  const goToAccount = () => navigate('/account');

  // Simple post submission
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setSubmitting(true);
    try {
      const postData = {
        message: newMessage.trim(),
        author: userProfile.name || user.displayName || 'Anonymous User',
        authorEmail: user.email || '',
        createdAt: Timestamp.now(),
        likes: [],
        likeCount: 0,
        tags: [],
        replies: [],
        replyCount: 0
      };

      const docRef = doc(collection(db, 'scrapbook'));
      await setDoc(docRef, postData);
      
      setNewMessage('');
      fetchScrapPosts();
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch functions
  const fetchUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        setUserProfile(profileSnap.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchScrapPosts = async () => {
    try {
      const scrapRef = collection(db, 'scrapbook');
      const q = query(scrapRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const posts: ScrapPost[] = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as ScrapPost);
      });
      
      setScrapPosts(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchUserProfile();
    fetchScrapPosts();
    setLoading(false);
  }, [user, navigate, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          textAlign: 'center',
          color: '#ffffff',
          background: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: 20,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
            {authLoading ? 'Checking authentication...' : 'Loading your feed...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Modern Mobile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 480,
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🏠</span>
            </div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: 700,
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Ashramam
            </h1>
          </div>
          
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.3)',
            transition: 'all 0.2s ease'
          }}
          onClick={goToProfile}>
            <span style={{ fontSize: '1.2rem', color: '#ffffff' }}>👤</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        background: '#ffffff',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* Story/Post Composer */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <form onSubmit={handleSubmitPost}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="What's on your mind?"
              style={{
                width: '100%',
                minHeight: '80px',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                resize: 'none',
                fontFamily: 'inherit',
                color: '#1e293b',
                background: 'transparent'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>📷</span>
                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>😊</span>
                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>📍</span>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || submitting}
                style={{
                  background: newMessage.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0',
                  color: newMessage.trim() ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: 20,
                  padding: '0.5rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? '⏳' : 'Share'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div style={{ padding: '0' }}>
          {scrapPosts.map((post) => (
            <div
              key={post.id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #f1f5f9',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      fontWeight: 600,
                      color: '#1e293b'
                    }}>
                      {post.author}
                    </h4>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#64748b'
                    }}>
                      {post.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                    margin: '0 0 1rem 0',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    color: '#334155',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {post.message}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      ❤️ {post.likeCount || 0}
                    </button>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      💬 {post.replyCount || 0}
                    </button>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}>
                      📤
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '0.75rem 0',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: 480,
          margin: '0 auto'
        }}>
          <button
            onClick={() => setActiveTab('scrapbook')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: activeTab === 'scrapbook' ? '#667eea' : '#64748b'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🏠</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Home</span>
          </button>
          
          <button
            onClick={goToStories}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#64748b'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Stories</span>
          </button>
          
          <button
            onClick={goToResidents}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#64748b'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>👥</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>People</span>
          </button>
          
          <button
            onClick={goToAccount}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#64748b'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>⚙️</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;