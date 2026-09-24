import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';
import { SkeletonStory } from './Skeleton';
import { tapMedium } from './haptics';

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
  const [newStory, setNewStory] = useState({ title: '', content: '', topic: 'hydergoa' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'topics' | 'stories' | 'story'>('topics');
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editStoryData, setEditStoryData] = useState({ title: '', content: '' });
  const [userProfile, setUserProfile] = useState<any>({});
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [copiedStoryId, setCopiedStoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicSearch, setTopicSearch] = useState('');

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        // Stories are members-only — send visitors to login
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const topics: Topic[] = [
    { id: 'hydergoa', name: 'Hyder in Goa', description: 'Tales of Hyder\'s Goan escapades', icon: '', color: '#1c1915' }
  ];

  useEffect(() => {
    if (authLoading) {
      // Wait for auth state to be determined
      return;
    }

    if (user) {
      fetchUserProfile();
      fetchStories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

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
      setNewStory({ title: '', content: '', topic: 'hydergoa' });
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
    tapMedium();

    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      const isLiked = story.likedBy.includes(user.uid);
      const updatedLikedBy = isLiked
        ? story.likedBy.filter(uid => uid !== user.uid)
        : [...story.likedBy, user.uid];

      await setDoc(doc(db, 'stories', storyId), {
        likes: updatedLikedBy.length,
        likedBy: updatedLikedBy
      }, { merge: true });

      fetchStories();
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const goBackToTopics = () => {
    setCurrentView('topics');
    setSelectedTopic('all');
    setExpandedStory(null);
  };

  const openStory = (storyId: string) => {
    setExpandedStory(storyId);
    setCurrentView('story');
    window.scrollTo(0, 0);
  };

  const goBackToStoryList = () => {
    setCurrentView('stories');
    window.scrollTo(0, 0);
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentView('stories');
    setExpandedStory(null);
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

  // Copy a permalink for a story (deep link: /stories?topic=<id>&story=<id>)
  const handleCopyPermalink = async (story: Story) => {
    const url = `${window.location.origin}/stories?topic=${story.topic}&story=${story.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers without clipboard API access
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedStoryId(story.id);
    setTimeout(() => setCopiedStoryId(null), 2000);
  };

  // Inline edit form, shared by the story cards and the full-page story view
  const renderEditForm = (story: Story) => (
    <div style={{ minWidth: 0 }}>
      <input
        type="text"
        value={editStoryData.title}
        onChange={(e) => setEditStoryData({ ...editStoryData, title: e.target.value })}
        placeholder="Story title"
        className="story-input"
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid #c9d9e8',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          outline: 'none'
        }}
      />
      <textarea
        value={editStoryData.content}
        onChange={(e) => setEditStoryData({ ...editStoryData, content: e.target.value })}
        placeholder="Write your story here..."
        rows={10}
        className="story-input"
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid #c9d9e8',
          borderRadius: '12px',
          fontSize: '15px',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          outline: 'none'
        }}
      />
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={handleCancelEdit}
          disabled={submitting}
          style={{
            background: 'transparent',
            border: '1px solid #c9d9e8',
            color: '#6b7f92',
            borderRadius: '12px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            minHeight: '44px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => handleSaveEdit(story.id)}
          disabled={submitting}
          style={{
            background: '#5b9bd5',
            border: 'none',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '10px 16px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            minHeight: '44px',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );

  // Like / copy-link / edit controls, shared by the story cards and the full-page story view
  const renderStoryControls = (story: Story) => {
    const liked = !!user && story.likedBy.includes(user.uid);
    const author = !!user && story.authorEmail === user.email;
    return (
      <span style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        {user ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLikeStory(story.id);
            }}
            aria-label={liked ? 'Unlike this story' : 'Like this story'}
            style={{
              background: liked ? '#5b9bd5' : '#F1F6FC',
              border: 'none',
              borderRadius: '999px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              color: liked ? '#ffffff' : '#2f7fc4',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            ♥ {story.likes}
          </button>
        ) : (
          <span style={{
            background: '#F1F6FC',
            borderRadius: '999px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#2f7fc4',
            whiteSpace: 'nowrap'
          }}>
            ♥ {story.likes}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyPermalink(story);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#8fa3b8',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 4px',
            textDecoration: 'underline'
          }}
        >
          {copiedStoryId === story.id ? '✓ Copied!' : 'Copy link'}
        </button>
        {author && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditStory(story);
            }}
            style={{
              background: 'transparent',
              border: '1px solid #d3dfee',
              color: '#6b7f92',
              borderRadius: '999px',
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Edit
          </button>
        )}
      </span>
    );
  };

  // Honor permalink query params: /stories?topic=<id>&story=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get('topic');
    const storyParam = params.get('story');
    if (topicParam && topics.some(t => t.id === topicParam)) {
      setSelectedTopic(topicParam);
      setCurrentView('stories');
      if (storyParam) {
        setExpandedStory(storyParam);
        setCurrentView('story');
        window.scrollTo(0, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderLoading = () => (
    <div style={{
      minHeight: '100vh',
      background: '#e9f1f8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      padding: '16px',
      paddingTop: '76px',
      maxWidth: '640px',
      margin: '0 auto'
    }}>
      <SkeletonStory />
      <SkeletonStory />
      <SkeletonStory />
    </div>
  );

  if (loading || authLoading) return renderLoading();

  // Logged-out visitors can view stories (via shared permalinks); only
  // logged-in users see add/edit/like controls.

  const currentTopic = getCurrentTopic();
  const activeStory = expandedStory ? stories.find(s => s.id === expandedStory) ?? null : null;
  const latestByTopic: Record<string, Date | null> = {};
  stories.forEach((s) => {
    const d = s.createdAt.toDate();
    if (!latestByTopic[s.topic] || d > (latestByTopic[s.topic] as Date)) latestByTopic[s.topic] = d;
  });
  const visibleTopics = topics.filter((t) => {
    const q = topicSearch.trim().toLowerCase();
    if (!q) return true;
    return (t.name + ' ' + t.description).toLowerCase().includes(q);
  });
  const filteredStories = getFilteredStories().filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const hay = (s.title + ' ' + s.content + ' ' + (authorNames[s.authorEmail] || s.author || '')).toLowerCase();
    return hay.includes(q);
  });
  const formValid = newStory.title.trim() && newStory.content.trim() && newStory.topic;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9f1f8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      <style>{`
        .story-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .story-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); }
        .story-card:active { transform: translateY(0); }
        .topics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 600px) { .topics-grid { grid-template-columns: repeat(3, 1fr); } }
        .topic-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
        .topic-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); border-color: #5b9bd5; }
        .topic-card:active { transform: translateY(0); }
        .story-input:focus { border-color: #5b9bd5 !important; }
      `}</style>

      {currentView === 'topics' ? (
        <PageHeader title="Our Stories" backTo={user ? '/dashboard' : '/'} backLabel="Back" />
      ) : currentView === 'stories' ? (
        <PageHeader
          title={currentTopic?.name || 'Stories'}
          backTo="/stories"
          backLabel="Back to topics"
          onBack={goBackToTopics}
        />
      ) : (
        <PageHeader
          title={activeStory?.title || 'Story'}
          backTo="/stories"
          backLabel="Back to stories"
          onBack={goBackToStoryList}
        />
      )}

      <div style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '24px 16px 110px 16px'
      }}>

        {currentView === 'topics' ? (
          <>
            {/* Add story — top of landing */}
            {user && (
              <div style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{
                    width: '100%',
                    background: showAddForm ? '#d3dfee' : '#5b9bd5',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '13px 24px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: showAddForm ? '#1e1a14' : '#ffffff',
                    transition: 'all 0.2s ease',
                    minHeight: '48px',
                    boxShadow: '0 4px 14px rgba(91,155,213,0.25)'
                  }}
                >
                  {showAddForm ? 'Cancel' : '+ Add story'}
                </button>
              </div>
            )}

            {/* Add story form */}
            {showAddForm && (
              <div style={{
                background: '#ffffff',
                border: '1px solid #d3dfee',
                borderRadius: '20px',
                padding: '20px 16px',
                marginBottom: '12px',
                boxShadow: '0 6px 24px rgba(91,155,213,0.10)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#1e1a14' }}>
                  Share your story
                </h3>
                <form onSubmit={handleSubmitStory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#1e1a14' }}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      placeholder="Give your story a catchy title..."
                      className="story-input"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #c9d9e8',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#1e1a14' }}>
                      Your story
                    </label>
                    <textarea
                      value={newStory.content}
                      onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                      placeholder="Tell us your story..."
                      rows={6}
                      className="story-input"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #c9d9e8',
                        fontSize: '16px',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        lineHeight: 1.5
                      }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !formValid}
                    style={{
                      background: (submitting || !formValid) ? '#d3dfee' : '#5b9bd5',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      cursor: (submitting || !formValid) ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      minHeight: '44px',
                      color: (submitting || !formValid) ? '#9dafbe' : '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {submitting ? 'Publishing...' : 'Publish story'}
                  </button>
                </form>
              </div>
            )}

            {/* Search topics */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #d3dfee',
              borderRadius: '999px',
              padding: '11px 16px',
              marginBottom: '12px',
              boxShadow: '0 2px 10px rgba(91,155,213,0.08)'
            }}>
              <span style={{ fontSize: '16px', color: '#8fa3b8' }}>🔍</span>
              <input
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search topics…"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  flex: 1,
                  minWidth: 0,
                  color: '#1c2733'
                }}
              />
              {topicSearch && (
                <button
                  onClick={() => setTopicSearch('')}
                  style={{ background: 'none', border: 'none', color: '#8fa3b8', fontSize: '16px', cursor: 'pointer', padding: '0 2px' }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Topics feed */}
            {visibleTopics.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #dce8f5',
                borderRadius: '20px',
                padding: '36px 20px',
                textAlign: 'center',
                color: '#6b7f92',
                fontSize: '14px'
              }}>
                No topics match your search.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visibleTopics.map((topic, index) => {
                  const latest = latestByTopic[topic.id];
                  return (
                    <div
                      key={topic.id}
                      className="topic-card iv-stagger"
                      onClick={() => handleTopicSelect(topic.id)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dce8f5',
                        borderRadius: '20px',
                        padding: '12px 16px',
                        animationDelay: `${Math.min(index, 8) * 60}ms`,
                        cursor: 'pointer',
                        boxShadow: '0 6px 24px rgba(91,155,213,0.10)',
                        minWidth: 0
                      }}
                    >
                      {/* Date row */}
                      {latest && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#6b7f92',
                            whiteSpace: 'nowrap'
                          }}>
                            📅 {latest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 style={{
                        fontSize: '19px',
                        fontWeight: 700,
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        lineHeight: 1.25,
                        margin: '0 0 8px 0',
                        color: '#1c2733',
                        overflowWrap: 'break-word'
                      }}>
                        {topic.name}
                      </h3>

                      {/* Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '13px', color: '#2f7fc4', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          Open ›
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : currentView === 'stories' ? (
          <>
            {/* Stories view — search + controls */}
            <div style={{ marginBottom: '14px', padding: '0 4px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #d3dfee',
                borderRadius: '999px',
                padding: '11px 16px',
                marginBottom: '12px',
                boxShadow: '0 2px 10px rgba(91,155,213,0.08)'
              }}>
                <span style={{ fontSize: '16px', color: '#8fa3b8' }}>🔍</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories…"
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '15px',
                    flex: 1,
                    minWidth: 0,
                    color: '#1c2733'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: '#8fa3b8', fontSize: '16px', cursor: 'pointer', padding: '0 2px' }}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7f92',
                  background: '#ffffff',
                  border: '1px solid #d3dfee',
                  borderRadius: '999px',
                  padding: '6px 12px',
                  whiteSpace: 'nowrap'
                }}>
                  {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
            </div>

            {/* Stories list */}
            {filteredStories.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #d3dfee',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e1a14', margin: '0 0 8px 0' }}>
                  No stories yet
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7f92', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Be the first to share a story in {currentTopic?.name}!
                </p>
                {user && (
                  <button
                    onClick={() => { goBackToTopics(); setShowAddForm(true); }}
                    style={{
                      background: '#5b9bd5',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      minHeight: '44px',
                      color: '#ffffff'
                    }}
                  >
                    Write the first story
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredStories.map((story, index) => {
                  const isEditing = editingStory === story.id;

                  return (
                    <div
                      key={story.id}
                      id={'story-' + story.id}
                      className="story-card iv-stagger"
                      onClick={() => !isEditing && openStory(story.id)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dce8f5',
                        borderRadius: '20px',
                        padding: '16px',
                        animationDelay: `${Math.min(index, 8) * 60}ms`,
                        cursor: isEditing ? 'default' : 'pointer',
                        boxShadow: '0 6px 24px rgba(91,155,213,0.10)',
                        scrollMarginTop: '76px',
                        minWidth: 0
                      }}
                    >
                      {isEditing ? (
                        <div onClick={(e) => e.stopPropagation()} style={{ minWidth: 0 }}>
                          {renderEditForm(story)}
                        </div>
                      ) : (
                        <>
                          {/* Date row */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#6b7f92',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}>
                              📅 {story.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 style={{
                            fontSize: '19px',
                            fontWeight: 700,
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            lineHeight: 1.25,
                            margin: '0 0 6px 0',
                            color: '#1c2733',
                            overflowWrap: 'break-word'
                          }}>
                            {story.title}
                          </h3>

                          {/* Excerpt */}
                          <div style={{
                            fontSize: '14px',
                            lineHeight: 1.55,
                            color: '#5b6b7c',
                            marginBottom: '10px',
                            minWidth: 0,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {story.content}
                          </div>

                          {/* Footer */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              fontSize: '13px',
                              color: '#6b7f92',
                              overflowWrap: 'break-word',
                              minWidth: 0
                            }}>
                              ✍️ <span style={{ fontWeight: 700, color: '#1c2733' }}>
                                {authorNames[story.authorEmail] || story.author || 'Anonymous'}
                              </span>
                              {' '}· <span style={{ color: '#2f7fc4', fontWeight: 700 }}>
                                Read ›
                              </span>
                            </span>
                            {renderStoryControls(story)}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Story detail — full page reading view */}
            {activeStory ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #dce8f5',
                borderRadius: '20px',
                padding: '20px 18px',
                boxShadow: '0 6px 24px rgba(91,155,213,0.10)'
              }}>
                {editingStory === activeStory.id ? (
                  renderEditForm(activeStory)
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7f92', whiteSpace: 'nowrap' }}>
                        📅 {activeStory.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 style={{
                      fontSize: '26px',
                      fontWeight: 700,
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      lineHeight: 1.25,
                      margin: '0 0 12px 0',
                      color: '#1c2733',
                      overflowWrap: 'break-word'
                    }}>
                      {activeStory.title}
                    </h2>
                    <div style={{
                      fontSize: '16px',
                      lineHeight: 1.7,
                      color: '#33414f',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      marginBottom: '18px'
                    }}>
                      {activeStory.content}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap',
                      borderTop: '1px solid #edf2f7',
                      paddingTop: '14px'
                    }}>
                      <span style={{ fontSize: '13px', color: '#6b7f92' }}>
                        ✍️ <span style={{ fontWeight: 700, color: '#1c2733' }}>
                          {authorNames[activeStory.authorEmail] || activeStory.author || 'Anonymous'}
                        </span>
                      </span>
                      {renderStoryControls(activeStory)}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{
                background: '#ffffff',
                border: '1px solid #dce8f5',
                borderRadius: '20px',
                padding: '36px 20px',
                textAlign: 'center',
                color: '#6b7f92',
                fontSize: '14px'
              }}>
                Story not found.
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Stories;
