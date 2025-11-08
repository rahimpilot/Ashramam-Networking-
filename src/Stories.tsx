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
    { id: 'editingsimham', name: 'എഡിറ്റിംഗ് സിംഹം', description: 'Editing Simham stories and experiences', icon: '', color: '#000000' }
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
        background: '#ffffff'
      }}>
        <div style={{ color: '#374151', fontSize: '1.2rem' }}>Loading stories...</div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Checking authentication...</p>
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
      background: '#ffffff',
      padding: window.innerWidth <= 768 ? '1rem 0.5rem' : '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: 800, 
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '0 0.5rem' : '0'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: window.innerWidth <= 768 ? 16 : 20, 
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem', 
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem',
            flexWrap: window.innerWidth <= 480 ? 'wrap' : 'nowrap',
            gap: window.innerWidth <= 480 ? '0.5rem' : '0'
          }}>
            <button onClick={goBack} style={{ 
              background: 'rgba(255,255,255,0.8)', 
              border: '2px solid #e5e7eb',
              borderRadius: 12, 
              width: 40, 
              height: 40, 
              color: '#374151', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease'
            }}>
              ←
            </button>
            
            <img src="/newlogo.svg" alt="Logo" style={{ 
              height: window.innerWidth <= 768 ? 36 : 48,
              order: window.innerWidth <= 480 ? -1 : 0,
              width: window.innerWidth <= 480 ? '100%' : 'auto',
              maxWidth: window.innerWidth <= 480 ? '120px' : 'none',
              margin: window.innerWidth <= 480 ? '0 auto 0.5rem auto' : '0',
              flex: window.innerWidth <= 480 ? 'none' : '0 0 auto'
            }} />
            
            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? '1.8rem' : '2.2rem', 
              fontWeight: 700, 
              margin: 0, 
              color: '#000000',
              textAlign: 'center',
              flex: 1,
              order: window.innerWidth <= 480 ? 1 : 0
            }}>
              {currentView === 'topics' ? 'Our Stories' : getCurrentTopic()?.name}
            </h1>

            {currentView === 'stories' && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  background: '#000000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  order: window.innerWidth <= 480 ? 2 : 0
                }}
              >
                {showAddForm ? 'Cancel' : 'Add Story'}
              </button>
            )}
            
            {currentView === 'topics' && (
              <div style={{ width: 40 }}></div>
            )}
          </div>

          <p style={{ 
            fontSize: '1rem', 
            color: '#64748b', 
            margin: 0,
            textAlign: 'center'
          }}>
            {currentView === 'topics' 
              ? 'Choose a topic to explore stories or share your own'
              : getCurrentTopic()?.description || 'Share your stories in this topic'
            }
          </p>
        </div>

        {/* Add Story Form */}
        {showAddForm && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: window.innerWidth <= 768 ? 16 : 20, 
            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem', 
            marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', color: '#000000' }}>
              Share Your Story
            </h3>
            
            <form onSubmit={handleSubmitStory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Topic Category
                </label>
                <select
                  value={newStory.topic}
                  onChange={(e) => setNewStory({ ...newStory, topic: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#fff'
                  }}
                  onFocus={e => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
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
                    borderRadius: 8,
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Your Story
                </label>
                <textarea
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  placeholder="Tell us your story... Share your experiences, memories, or thoughts with the community."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical'
                  }}
                  onFocus={e => e.target.style.borderColor = '#ff6b6b'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic}
                style={{
                  background: submitting ? '#9ca3af' : '#000000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  cursor: (submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  opacity: (submitting || !newStory.title.trim() || !newStory.content.trim() || !newStory.topic) ? 0.6 : 1
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
            gridTemplateColumns: window.innerWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(5, 1fr)',
            gap: '1rem'
          }}>
            {topics.slice(0, 10).map((topic) => (
              <div 
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: 8, 
                  padding: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  minHeight: window.innerWidth <= 768 ? '100px' : '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <h3 style={{ 
                  fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem', 
                  fontWeight: 600, 
                  margin: '0 0 0.5rem 0', 
                  color: '#000000',
                  lineHeight: '1.3'
                }}>
                  {topic.name}
                </h3>
                <span style={{ 
                  fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.85rem', 
                  color: '#6b7280',
                  fontWeight: 500
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
              background: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: 8, 
              padding: '2rem', 
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#000000', marginBottom: '0.5rem' }}>
                {getCurrentTopic()?.name}
              </h3>
              <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Story will be published shortly.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  background: '#000000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#ffffff'
                }}
              >
                Add Story
              </button>
            </div>
          ) : getFilteredStories().length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                No stories yet in {getCurrentTopic()?.name}
              </h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Be the first to share a story in this topic!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#374151'}
                onMouseOut={(e) => e.currentTarget.style.background = '#000000'}
              >
                📝 Write First Story
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getFilteredStories().map((story) => (
                <div key={story.id} style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: 8, 
                  padding: '1rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
                          padding: '0.75rem',
                          marginBottom: '1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: '1.1rem',
                          fontWeight: 600
                        }}
                      />
                      <textarea
                        value={editStoryData.content}
                        onChange={(e) => setEditStoryData({ ...editStoryData, content: e.target.value })}
                        placeholder="Write your story here..."
                        rows={10}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          marginBottom: '1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={handleCancelEdit}
                          disabled={submitting}
                          style={{
                            background: 'transparent',
                            border: '1px solid #6b7280',
                            color: '#6b7280',
                            borderRadius: 6,
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(story.id)}
                          disabled={submitting}
                          style={{
                            background: '#000000',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: 6,
                            padding: '8px 16px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            opacity: submitting ? 0.7 : 1
                          }}
                        >
                          {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, marginRight: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#000000' }}>
                          {story.title}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                          By <span style={{ fontWeight: 600, color: '#374151' }}>
                            {authorNames[story.authorEmail] || story.author || 'Anonymous'}
                          </span> • {story.createdAt.toDate().toLocaleDateString()}
                        </div>
                        
                        {/* Story Content Preview */}
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#374151', 
                          lineHeight: '1.5',
                          marginBottom: '0.75rem'
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
                          fontSize: '0.8rem', 
                          color: '#1d4ed8', 
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {expandedStory === story.id ? (
                            <>📖 Click to collapse</>
                          ) : (
                            <>👆 Click to read full story</>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        {/* Edit button - only show to story author */}
                        {story.authorEmail === user?.email && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStory(story);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid #6b7280',
                              color: '#6b7280',
                              borderRadius: 4,
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = '#374151';
                              e.currentTarget.style.color = '#374151';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = '#6b7280';
                              e.currentTarget.style.color = '#6b7280';
                            }}
                          >
                            ✏️ Edit
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the expand/collapse
                            handleLikeStory(story.id);
                          }}
                          style={{
                            background: story.likedBy.includes(user?.uid || '') ? '#000000' : 'transparent',
                            border: '1px solid #000000',
                            borderRadius: 4,
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: story.likedBy.includes(user?.uid || '') ? '#ffffff' : '#000000',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
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