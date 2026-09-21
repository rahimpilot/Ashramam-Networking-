import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';

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
  const [copiedStoryId, setCopiedStoryId] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      // Logged-out visitors can still view stories via shared permalinks
    });

    return () => unsubscribe();
  }, []);

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
    { id: 'krabi', name: 'ക്രാബി', description: 'Stories from Krabi', icon: '', color: '#000000' },
    { id: 'hydergoa', name: 'Hyder in Goa', description: 'Tales of Hyder\'s Goan escapades', icon: '', color: '#000000' }
  ];

  useEffect(() => {
    if (authLoading) {
      // Wait for auth state to be determined
      return;
    }

    if (user) {
      fetchUserProfile();
    }
    // Stories are publicly readable so shared permalinks work without login
    fetchStories();
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

  const getStoryCount = (topicId: string) => stories.filter(s => s.topic === topicId).length;

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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll the deep-linked (or expanded) story into view once loaded
  useEffect(() => {
    if (expandedStory && stories.some(s => s.id === expandedStory)) {
      const el = document.getElementById('story-' + expandedStory);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [expandedStory, stories]);

  const renderLoading = (label: string) => (
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
          {label}
        </p>
      </div>
    </div>
  );

  if (loading) return renderLoading('Loading stories...');
  if (authLoading) return renderLoading('Checking authentication...');

  // Logged-out visitors can view stories (via shared permalinks); only
  // logged-in users see add/edit/like controls.

  const currentTopic = getCurrentTopic();
  const filteredStories = getFilteredStories();
  const formValid = newStory.title.trim() && newStory.content.trim() && newStory.topic;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F6F7F9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      <style>{`
        .story-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .story-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); }
        .story-card:active { transform: translateY(0); }
        .topics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 600px) { .topics-grid { grid-template-columns: repeat(3, 1fr); } }
        .topic-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
        .topic-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); border-color: #1877F2; }
        .topic-card:active { transform: translateY(0); }
        .story-input:focus { border-color: #1877F2 !important; }
      `}</style>

      {currentView === 'topics' ? (
        <PageHeader title="Our Stories" backTo={user ? '/dashboard' : '/'} backLabel="Back" />
      ) : (
        <PageHeader
          title={currentTopic?.name || 'Stories'}
          backTo="/stories"
          backLabel="Back to topics"
          onBack={goBackToTopics}
        />
      )}

      <div style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '24px 16px 110px 16px'
      }}>

        {currentView === 'topics' ? (
          <>
            {/* Hero */}
            <div style={{ marginBottom: '20px', padding: '0 4px' }}>
              <div style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: '#1877F2',
                background: '#E7F0FE',
                borderRadius: '999px',
                padding: '5px 12px',
                marginBottom: '10px'
              }}>
                COMMUNITY
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#111318',
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px'
              }}>
                Our Stories
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.5
              }}>
                Pick a corner of Ashramam life and read what members shared — newest first.
              </p>
            </div>

            {/* Topics grid */}
            <div className="topics-grid">
              {topics.map((topic) => {
                const count = getStoryCount(topic.id);
                return (
                  <div
                    key={topic.id}
                    className="topic-card"
                    onClick={() => handleTopicSelect(topic.id)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #ECEEF1',
                      borderRadius: '16px',
                      padding: '20px 12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      minHeight: '112px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                    }}
                  >
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: '#111318',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}>
                      {topic.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6B7280',
                      background: '#F1F3F5',
                      borderRadius: '999px',
                      padding: '3px 10px',
                      whiteSpace: 'nowrap'
                    }}>
                      {count} {count === 1 ? 'story' : 'stories'}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Stories view hero */}
            <div style={{ marginBottom: '16px', padding: '0 4px' }}>
              <div style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: '#1877F2',
                background: '#E7F0FE',
                borderRadius: '999px',
                padding: '5px 12px',
                marginBottom: '10px'
              }}>
                STORIES
              </div>
              <h2 style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#111318',
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px',
                overflowWrap: 'break-word'
              }}>
                {currentTopic?.name}
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                margin: '0 0 14px 0',
                lineHeight: 1.5
              }}>
                {currentTopic?.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  background: '#FFFFFF',
                  border: '1px solid #ECEEF1',
                  borderRadius: '999px',
                  padding: '6px 12px',
                  whiteSpace: 'nowrap'
                }}>
                  {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                </span>
                {user && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                      background: showAddForm ? '#ECEEF1' : '#1877F2',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: showAddForm ? '#111318' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                      minHeight: '36px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {showAddForm ? 'Cancel' : '+ Add story'}
                  </button>
                )}
              </div>
            </div>

            {/* Add story form */}
            {showAddForm && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #ECEEF1',
                borderRadius: '16px',
                padding: '20px 16px',
                marginBottom: '12px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#111318' }}>
                  Share your story
                </h3>
                <form onSubmit={handleSubmitStory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#111318' }}>
                      Topic
                    </label>
                    <select
                      value={newStory.topic}
                      onChange={(e) => setNewStory({ ...newStory, topic: e.target.value })}
                      className="story-input"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #E4E6EA',
                        fontSize: '16px',
                        outline: 'none',
                        background: '#FFF'
                      }}
                      required
                    >
                      <option value="">Select a topic...</option>
                      {topics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#111318' }}>
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
                        border: '1px solid #E4E6EA',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#111318' }}>
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
                        border: '1px solid #E4E6EA',
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
                      background: (submitting || !formValid) ? '#ECEEF1' : '#1877F2',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      cursor: (submitting || !formValid) ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      minHeight: '44px',
                      color: (submitting || !formValid) ? '#9A9DA1' : '#FFFFFF',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {submitting ? 'Publishing...' : 'Publish story'}
                  </button>
                </form>
              </div>
            )}

            {/* Stories list */}
            {filteredStories.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #ECEEF1',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111318', margin: '0 0 8px 0' }}>
                  No stories yet
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Be the first to share a story in {currentTopic?.name}!
                </p>
                {user && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      background: '#1877F2',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      minHeight: '44px',
                      color: '#FFFFFF'
                    }}
                  >
                    Write the first story
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredStories.map((story) => {
                  const isExpanded = expandedStory === story.id;
                  const isEditing = editingStory === story.id;
                  const isAuthor = !!user && story.authorEmail === user.email;
                  const isLiked = !!user && story.likedBy.includes(user.uid);
                  const preview = story.content.length > 180
                    ? story.content.substring(0, 180).trimEnd() + '…'
                    : story.content;

                  return (
                    <div
                      key={story.id}
                      id={'story-' + story.id}
                      className="story-card"
                      onClick={() => !isEditing && setExpandedStory(isExpanded ? null : story.id)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #ECEEF1',
                        borderRadius: '16px',
                        padding: '18px 16px',
                        cursor: isEditing ? 'default' : 'pointer',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                        scrollMarginTop: '76px',
                        minWidth: 0
                      }}
                    >
                      {isEditing ? (
                        <div onClick={(e) => e.stopPropagation()} style={{ minWidth: 0 }}>
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
                              border: '1px solid #E4E6EA',
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
                              border: '1px solid #E4E6EA',
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
                                border: '1px solid #E4E6EA',
                                color: '#6B7280',
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
                                background: '#1877F2',
                                border: 'none',
                                color: '#FFFFFF',
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
                      ) : (
                        <>
                          {/* Title row */}
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <h3 style={{
                              flex: 1,
                              minWidth: 0,
                              fontSize: '17px',
                              fontWeight: 700,
                              lineHeight: 1.35,
                              margin: 0,
                              color: '#111318',
                              overflowWrap: 'break-word'
                            }}>
                              {story.title}
                            </h3>
                            {user ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikeStory(story.id);
                                }}
                                aria-label={isLiked ? 'Unlike this story' : 'Like this story'}
                                style={{
                                  background: isLiked ? '#1877F2' : 'transparent',
                                  border: '1px solid #1877F2',
                                  borderRadius: '999px',
                                  padding: '6px 12px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: isLiked ? '#FFFFFF' : '#1877F2',
                                  transition: 'all 0.2s ease',
                                  flexShrink: 0,
                                  minHeight: '32px',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                ♥ {story.likes}
                              </button>
                            ) : (
                              <span style={{
                                border: '1px solid #ECEEF1',
                                borderRadius: '999px',
                                padding: '6px 12px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#6B7280',
                                flexShrink: 0,
                                whiteSpace: 'nowrap'
                              }}>
                                ♥ {story.likes}
                              </span>
                            )}
                          </div>

                          {/* Byline */}
                          <div style={{
                            fontSize: '13px',
                            color: '#6B7280',
                            marginBottom: '10px',
                            overflowWrap: 'break-word'
                          }}>
                            By <span style={{ fontWeight: 700, color: '#111318' }}>
                              {authorNames[story.authorEmail] || story.author || 'Anonymous'}
                            </span>
                            {' '}· {story.createdAt.toDate().toLocaleDateString()}
                          </div>

                          {/* Content */}
                          <div style={{
                            fontSize: '15px',
                            lineHeight: 1.6,
                            color: '#1F2329',
                            marginBottom: '10px',
                            minWidth: 0,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: isExpanded ? 'pre-wrap' : 'normal'
                          }}>
                            {isExpanded ? story.content : preview}
                          </div>

                          {/* Footer actions */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              fontSize: '13px',
                              color: '#1877F2',
                              fontWeight: 700
                            }}>
                              {isExpanded ? 'Show less' : 'Read full story ›'}
                            </span>
                            <span style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyPermalink(story);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#1877F2',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  padding: '8px 6px',
                                  minHeight: '36px',
                                  textDecoration: 'underline'
                                }}
                              >
                                {copiedStoryId === story.id ? '✓ Copied!' : 'Copy link'}
                              </button>
                              {isAuthor && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStory(story);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid #ECEEF1',
                                    color: '#6B7280',
                                    borderRadius: '999px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    minHeight: '36px'
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
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
