import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TripStory {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface TripPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
}

const Krabi: React.FC = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<TripStory[]>([
    {
      id: '1',
      author: 'Member 1',
      content: 'Amazing sunset at Railay Beach! The view was absolutely breathtaking. 🌅',
      timestamp: '2 days ago'
    }
  ]);

  const [photos, setPhotos] = useState<TripPhoto[]>([
    {
      id: '1',
      url: '/krabi-sample.jpg',
      caption: 'Railay Beach Sunset',
      uploadedBy: 'Member 1'
    }
  ]);

  const [newStory, setNewStory] = useState('');
  const [showStoryInput, setShowStoryInput] = useState(false);

  const handleAddStory = () => {
    if (newStory.trim()) {
      const story: TripStory = {
        id: Date.now().toString(),
        author: 'You',
        content: newStory,
        timestamp: 'Just now'
      };
      setStories([story, ...stories]);
      setNewStory('');
      setShowStoryInput(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photo: TripPhoto = {
          id: Date.now().toString(),
          url: e.target?.result as string,
          caption: 'New Photo',
          uploadedBy: 'You'
        };
        setPhotos([photo, ...photos]);
      };
      reader.readAsDataURL(file);
    }
  };

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
            onClick={() => navigate('/our-trips')}
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
            margin: 0
          }}>
            Krabi Trip
          </h1>
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

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '16px'
      }}>
        
        {/* Trip Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #FEF3E2 0%, #FED7AA 100%)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center',
          border: '2px solid #FB923C'
        }}>
          <div style={{
            fontSize: '64px',
            lineHeight: 1,
            marginBottom: '12px'
          }}>
            🏖️
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#92400E',
            margin: '0 0 8px 0'
          }}>
            Krabi Adventure
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#B45309',
            margin: 0
          }}>
            Share your memories from our trip
          </p>
        </div>

        {/* Add Story Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #E4E6EA'
        }}>
          {!showStoryInput ? (
            <button
              onClick={() => setShowStoryInput(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📝 Add a Story
            </button>
          ) : (
            <div>
              <textarea
                value={newStory}
                onChange={(e) => setNewStory(e.target.value)}
                placeholder="Share your Krabi memories..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  resize: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '12px'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={handleAddStory}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Post Story
                </button>
                <button
                  onClick={() => {
                    setShowStoryInput(false);
                    setNewStory('');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Photo Upload Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #E4E6EA'
        }}>
          <label style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📸 Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Stories Section */}
        <div style={{
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#050505',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>
            Stories ({stories.length})
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {stories.map((story) => (
              <div
                key={story.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #E4E6EA',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#050505',
                      margin: '0 0 4px 0'
                    }}>
                      {story.author}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      margin: 0
                    }}>
                      {story.timestamp}
                    </p>
                  </div>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {story.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Photos Section */}
        <div style={{
          marginBottom: '40px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#050505',
            margin: '0 0 12px 0'
          }}>
            Photos ({photos.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  background: '#FFFFFF',
                  border: '1px solid #E4E6EA'
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <div style={{
                  padding: '12px'
                }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#050505',
                    margin: '0 0 4px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {photo.caption}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                    margin: 0
                  }}>
                    by {photo.uploadedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Krabi;
