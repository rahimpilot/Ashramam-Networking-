import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
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
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStory, setNewStory] = useState({ title: '', content: '', topic: '' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'topics' | 'stories'>('topics');

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
    if (!user) {
      navigate('/');
      return;
    }
    fetchStories();
  }, [user, navigate]);

  const fetchStories = async () => {
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const storiesData: Story[] = [];
      querySnapshot.forEach((doc) => {
        storiesData.push({ id: doc.id, ...doc.data() } as Story);
      });
      
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
        author: user.displayName || 'Anonymous User',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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
            
            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? '1.8rem' : '2.2rem', 
              fontWeight: 700, 
              margin: 0, 
              color: '#000000',
              textAlign: 'center',
              flex: 1
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
                  transition: 'all 0.2s ease'
                }}
              >
                {showAddForm ? 'Cancel' : 'Add Story'}
              </button>
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {getFilteredStories().map((story) => (
                <div key={story.id} style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: 8, 
                  padding: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#000000' }}>
                        {story.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        By {story.author} • {story.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLikeStory(story.id)}
                      style={{
                        background: story.likedBy.includes(user?.uid || '') ? '#000000' : 'transparent',
                        border: '1px solid #000000',
                        borderRadius: 4,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: story.likedBy.includes(user?.uid || '') ? '#ffffff' : '#000000',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ♥ {story.likes}
                    </button>
                  </div>
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