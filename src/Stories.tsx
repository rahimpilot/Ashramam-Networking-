import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp;
  likes: number;
  likedBy: string[];
  topic: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const Stories: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStory, setNewStory] = useState({ title: '', content: '', topic: '' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'topics' | 'stories'>('topics');
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editStoryData, setEditStoryData] = useState({ title: '', content: '' });
  const [userProfile, setUserProfile] = useState<any>({});
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});

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

  const topics: Topic[] = [
    { id: 'life', name: 'ഞങ്ങളുടെ താർ', description: 'Personal experiences and life lessons', icon: '', color: '#000000' },
    { id: 'travel', name: 'കുറച്ചു യാത്രകൾ', description: 'Journey tales and travel experiences', icon: '', color: '#000000' },
    { id: 'food', name: 'കഥാപാത്രങ്ങൾ', description: 'Culinary experiences and cultural stories', icon: '', color: '#000000' },
    { id: 'career', name: 'തള്ള്', description: 'Professional growth and career stories', icon: '', color: '#000000' },
    { id: 'family', name: 'ഉംറക്ക് പോയവർ', description: 'Stories about relationships and bonds', icon: '', color: '#000000' },
    { id: 'kannappan', name: 'കണ്ണപ്പന്റെ സ്റ്റുഡിയോ ഗാരേജ്', description: 'Stories from Kannappan\'s Studio Garage', icon: '', color: '#000000' },
    { id: 'powergroup', name: 'പവർ ഗ്രൂപ്പ് ഓഫ് ആശ്രമം', description: 'Power Group of Ashramam stories', icon: '', color: '#000000' },
    { id: 'asifbar', name: 'ആസിഫ് ബാർ', description: 'Stories from Asif Bar', icon: '', color: '#000000' },
    { id: 'munthiriclub', name: 'മുന്തിരി ക്ലബ്', description: 'Munthiri Club stories and experiences', icon: '', color: '#000000' },
    { id: 'shajipappan', name: 'ഷാജി പാപ്പൻ', description: 'Stories about Shaji Pappan', icon: '', color: '#000000' },
    { id: 'teamsensorium', name: 'ടീം സെൻസോറിയം', description: 'Team Sensorium stories and projects', icon: '', color: '#000000' },
    { id: 'editingsimham', name: 'എഡിറ്റിംഗ് സിംഹം', description: 'Editing Simham stories and experiences', icon: '', color: '#000000' },
    { id: 'krabi', name: 'ക്രാബി', description: 'Stories from Krabi', icon: '', color: '#000000' }
  ];

  useEffect(() => {
    if (authLoading) {
      // Wait for auth state to be determined
      return;
    }

    if (!user) {
      navigate('/');
      return;
    }
    fetchUserProfile();
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, authLoading]);

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

  const fetchStories = async () => {
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const storiesData: Story[] = [];
      const emailSet = new Set<string>();

      querySnapshot.forEach((doc) => {
        const story = { id: doc.id, ...doc.data() } as Story;
        storiesData.push(story);
        if (story.authorEmail) {
          emailSet.add(story.authorEmail);
        }
      });

      // Fetch author names from profiles
      const profilesRef = collection(db, 'profiles');
      const profilesSnapshot = await getDocs(profilesRef);
      const names: Record<string, string> = {};

      profilesSnapshot.forEach((doc) => {
        const profileData = doc.data();
        if (profileData.email && profileData.name) {
          names[profileData.email] = profileData.name;
        }
      });

      setAuthorNames(names);
      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic) return;

    setSubmitting(true);
    try {
      const storyData = {
        title: newStory.title.trim(),
        content: newStory.content.trim(),
        topic: newStory.topic,
        author: userProfile.name || user.displayName || 'Anonymous User',
        authorEmail: user.email || '',
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: []
      };

      await setDoc(doc(collection(db, 'stories')), storyData);
      setNewStory({ title: '', content: '', topic: '' });
      setShowAddForm(false);
      fetchStories();
    } catch (error) {
      console.error('Error adding story:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    if (!user) return;

    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      const isLiked = story.likedBy.includes(user.uid);
      const updatedLikedBy = isLiked
        ? story.likedBy.filter(uid => uid !== user.uid)
        : [...story.likedBy, user.uid];

      await setDoc(doc(db, 'stories', storyId), {
        ...story,
        likes: updatedLikedBy.length,
        likedBy: updatedLikedBy
      }, { merge: true });

      fetchStories();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const goBack = () => {
    if (currentView === 'stories') {
      setCurrentView('topics');
      setSelectedTopic('all');
    } else {
      navigate('/dashboard');
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentView('stories');
    fetchStories();
  };

  const getFilteredStories = () => {
    if (selectedTopic === 'all') return stories;
    return stories.filter(story => story.topic === selectedTopic);
  };

  const getCurrentTopic = () => {
    return topics.find(topic => topic.id === selectedTopic);
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story.id);
    setEditStoryData({ title: story.title, content: story.content });
    setExpandedStory(null); // Close expansion if open
  };

  const handleSaveEdit = async (storyId: string) => {
    if (!editStoryData.title.trim() || !editStoryData.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setSubmitting(true);
      await setDoc(doc(db, 'stories', storyId), {
        title: editStoryData.title.trim(),
        content: editStoryData.content.trim(),
        updatedAt: Timestamp.now()
      }, { merge: true });

      setEditingStory(null);
      setEditStoryData({ title: '', content: '' });
      fetchStories();
    } catch (error) {
      console.error('Error updating story:', error);
      alert('Error updating story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStory(null);
    setEditStoryData({ title: '', content: '' });
  };



  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#FFFFFF',
          background: 'rgba(255,255,255,0.15)',
          padding: '32px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 500, lineHeight: '1.3' }}>
            Loading stories...
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#FFFFFF',
          background: 'rgba(255,255,255,0.15)',
          padding: '32px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 500, lineHeight: '1.3' }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      {/* Modern Mobile Header - 60px height */}
      <div style={{
        background: '#FFFFFF',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #E4E6EA'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 480,
          margin: '0 auto',
          height: '100%',
          padding: '0 16px'
        }}>
          <button
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#1877F2',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ←
          </button>

          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#050505',
            lineHeight: '1.3',
            margin: 0,
            flex: 1,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '0 8px'
          }}>
            {currentView === 'topics' ? 'Our Stories (v1.1)' : getCurrentTopic()?.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentView === 'stories' && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  background: showAddForm ? '#E4E6EA' : 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: showAddForm ? '#050505' : '#FFFFFF',
                  transition: 'all 0.2s ease',
                  minHeight: '36px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!showAddForm) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 119, 242, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {showAddForm ? 'Cancel' : '+ Add'}
              </button>
            )}
            <img
              src="/newlogo.svg"
              alt="Logo"
              style={{
                height: 32,
                width: 'auto',
                maxWidth: '100px',
                opacity: 0.8
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '16px'
      }}>

        {/* Add Story Form */}
        {showAddForm && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, lineHeight: '1.3', marginBottom: '16px', color: '#050505' }}>
              Share Your Story
            </h3>

            <form onSubmit={handleSubmitStory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#050505' }}>
                  Topic Category
                </label>
                <select
                  value={newStory.topic}
                  onChange={(e) => setNewStory({ ...newStory, topic: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #E4E6EA',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '1.4',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#FFF'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1877F2'}
                  onBlur={e => e.target.style.borderColor = '#E4E6EA'}
                  required
                >
                  <option value="">Select a topic...</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#050505' }}>
                  Story Title
                </label>
                <input
                  type="text"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  placeholder="Give your story a catchy title..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #E4E6EA',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '1.4',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1877F2'}
                  onBlur={e => e.target.style.borderColor = '#E4E6EA'}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#050505' }}>
                  Your Story
                </label>
                <textarea
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  placeholder="Tell us your story..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #E4E6EA',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '1.4',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1877F2'}
                  onBlur={e => e.target.style.borderColor = '#E4E6EA'}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic}
                style={{
                  background: submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic
                    ? '#E4E6EA'
                    : 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  cursor: (submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '44px',
                  color: submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic ? '#9A9DA1' : '#FFFFFF',
                  transition: 'all 0.2s ease',
                  boxShadow: (submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic) ? 'none' : '0 2px 4px rgba(24, 119, 242, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!submitting && newStory.title.trim() && newStory.content.trim() && newStory.topic) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 119, 242, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = (submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic) ? 'none' : '0 2px 4px rgba(24, 119, 242, 0.2)';
                }}
              >
                {submitting ? 'Publishing...' : 'Publish Story'}
              </button>
            </form>
          </div>
        )}

        {/* Topics Grid or Stories List */}
        {currentView === 'topics' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E6EA',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#1877F2';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#E4E6EA';
                }}
              >
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '1.3',
                  margin: '0 0 8px 0',
                  color: '#050505'
                }}>
                  {topic.name}
                </h3>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#65676B'
                }}>
                  {stories.filter(s => s.topic === topic.id).length} stories
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Stories List for selected topic
          getFilteredStories().length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E4E6EA',
              borderRadius: '12px',
              padding: '32px 16px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, lineHeight: '1.3', color: '#050505', marginBottom: '8px' }}>
                No stories yet
              </h3>
              <p style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.4', color: '#65676B', marginBottom: '16px' }}>
                Be the first to share a story!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '44px',
                  color: '#FFFFFF',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(24, 119, 242, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 119, 242, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(24, 119, 242, 0.2)';
                }}
              >
                📝 Write First Story
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getFilteredStories().map((story) => (
                <div key={story.id} style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E6EA',
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                  onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}>
                  {editingStory === story.id ? (
                    // Edit Mode
                    <div style={{ width: '100%' }}>
                      <input
                        type="text"
                        value={editStoryData.title}
                        onChange={(e) => setEditStoryData({ ...editStoryData, title: e.target.value })}
                        placeholder="Story title"
                        style={{
                          width: '100%',
                          padding: '12px',
                          marginBottom: '12px',
                          border: '1px solid #E4E6EA',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: '1.3',
                          outline: 'none'
                        }}
                        onFocus={e => e.target.style.borderColor = '#1877F2'}
                        onBlur={e => e.target.style.borderColor = '#E4E6EA'}
                      />
                      <textarea
                        value={editStoryData.content}
                        onChange={(e) => setEditStoryData({ ...editStoryData, content: e.target.value })}
                        placeholder="Write your story here..."
                        rows={10}
                        style={{
                          width: '100%',
                          padding: '12px',
                          marginBottom: '12px',
                          border: '1px solid #E4E6EA',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '1.4',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          outline: 'none'
                        }}
                        onFocus={e => e.target.style.borderColor = '#1877F2'}
                        onBlur={e => e.target.style.borderColor = '#E4E6EA'}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={handleCancelEdit}
                          disabled={submitting}
                          style={{
                            background: 'transparent',
                            border: '1px solid #E4E6EA',
                            color: '#65676B',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            minHeight: '44px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(story.id)}
                          disabled={submitting}
                          style={{
                            background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)',
                            border: 'none',
                            color: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            minHeight: '44px',
                            opacity: submitting ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(24, 119, 242, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            if (!submitting) {
                              e.currentTarget.style.transform = 'scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 119, 242, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(24, 119, 242, 0.2)';
                          }}
                        >
                          {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, lineHeight: '1.3', margin: '0 0 8px 0', color: '#050505' }}>
                          {story.title}
                        </h3>
                        <div style={{ fontSize: '12px', fontWeight: 400, color: '#65676B', marginBottom: '12px' }}>
                          By <span style={{ fontWeight: 600, color: '#050505' }}>
                            {authorNames[story.authorEmail] || story.author || 'Anonymous'}
                          </span> • {story.createdAt.toDate().toLocaleDateString()}
                        </div>

                        {/* Story Content Preview */}
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '1.4',
                          color: '#050505',
                          marginBottom: '12px'
                        }}>
                          {expandedStory === story.id ? (
                            // Full content
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                              {story.content}
                            </div>
                          ) : (
                            // Preview with truncation
                            <div>
                              {story.content.length > 150
                                ? story.content.substring(0, 150) + '...'
                                : story.content
                              }
                            </div>
                          )}
                        </div>

                        {/* Read More/Less indicator */}
                        <div style={{
                          fontSize: '12px',
                          color: '#1877F2',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {expandedStory === story.id ? (
                            <>📖 Click to collapse</>
                          ) : (
                            <>👆 Click to read full story</>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        {/* Edit button - only show to story author */}
                        {story.authorEmail === user?.email && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStory(story);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid #E4E6EA',
                              color: '#65676B',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 500,
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F8F9FA';
                              e.currentTarget.style.borderColor = '#1877F2';
                              e.currentTarget.style.color = '#1877F2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderColor = '#E4E6EA';
                              e.currentTarget.style.color = '#65676B';
                            }}
                          >
                            ✏️ Edit
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeStory(story.id);
                          }}
                          style={{
                            background: story.likedBy.includes(user?.uid || '') ? 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)' : 'transparent',
                            border: '1px solid #1877F2',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: story.likedBy.includes(user?.uid || '') ? '#FFFFFF' : '#1877F2',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => {
                            if (!story.likedBy.includes(user?.uid || '')) {
                              e.currentTarget.style.backgroundColor = '#F8F9FA';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!story.likedBy.includes(user?.uid || '')) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          ♥ {story.likes}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Stories;