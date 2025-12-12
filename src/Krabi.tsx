import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PhotoComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface TripPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  uploadDate: string;
  comments: PhotoComment[];
}

const Krabi: React.FC = () => {
  const navigate = useNavigate();
  
  const [photos, setPhotos] = useState<TripPhoto[]>([
    {
      id: '1',
      url: '/krabi-sample.jpg',
      caption: 'Railay Beach Sunset',
      uploadedBy: 'Member 1',
      uploadDate: '2 days ago',
      comments: [
        {
          id: '1',
          author: 'Member 2',
          text: 'Amazing view! 🌅',
          timestamp: '1 day ago'
        }
      ]
    }
  ]);

  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentingPhotoId, setCommentingPhotoId] = useState<string | null>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photo: TripPhoto = {
          id: Date.now().toString(),
          url: e.target?.result as string,
          caption: 'New Photo',
          uploadedBy: 'You',
          uploadDate: 'Just now',
          comments: []
        };
        setPhotos([photo, ...photos]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim() && commentingPhotoId) {
      setPhotos(photos.map(photo => {
        if (photo.id === commentingPhotoId) {
          const newComment: PhotoComment = {
            id: Date.now().toString(),
            author: 'You',
            text: commentText,
            timestamp: 'Just now'
          };
          return {
            ...photo,
            comments: [newComment, ...photo.comments]
          };
        }
        return photo;
      }));
      setCommentText('');
      setCommentingPhotoId(null);
    }
  };

  const selectedPhoto = photos.find(p => p.id === selectedPhotoId);
  const currentPhotoIndex = photos.findIndex(p => p.id === selectedPhotoId);

  const goToPreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setSelectedPhotoId(photos[currentPhotoIndex - 1].id);
    }
  };

  const goToNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setSelectedPhotoId(photos[currentPhotoIndex + 1].id);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      {/* Modern Mobile Header */}
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
            Krabi Gallery
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
        
        {/* Gallery Header */}
        <div style={{
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#050505',
            margin: '0 0 8px 0'
          }}>
            Photo Gallery 📸
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: 0
          }}>
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in the gallery
          </p>
        </div>

        {/* Upload Section */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #E4E6EA',
          textAlign: 'center'
        }}>
          <label style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
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
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            � Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Photos Gallery Grid */}
        <div style={{
          marginBottom: '40px'
        }}>
          {photos.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '40px 16px',
              textAlign: 'center',
              border: '1px solid #E4E6EA',
              color: '#9CA3AF'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>📷</div>
              <p style={{
                fontSize: '14px',
                margin: 0
              }}>
                No photos yet. Start by uploading one!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhotoId(photo.id)}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    background: '#FFFFFF',
                    border: '1px solid #E4E6EA',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: '200px',
                    background: '#F3F4F6'
                  }}>
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    {/* Comments badge */}
                    {photo.comments.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#EC4899',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        💬 {photo.comments.length}
                      </div>
                    )}
                  </div>
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
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Modal Header */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.95)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {currentPhotoIndex + 1} / {photos.length}
            </div>
            <button
              onClick={() => setSelectedPhotoId(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* Image Section */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              position: 'relative'
            }}>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
              
              {/* Navigation Buttons */}
              {currentPhotoIndex > 0 && (
                <button
                  onClick={goToPreviousPhoto}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  ❮
                </button>
              )}
              
              {currentPhotoIndex < photos.length - 1 && (
                <button
                  onClick={goToNextPhoto}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  ❯
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div style={{
              width: '320px',
              background: '#1F2937',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              maxHeight: '100%',
              overflowY: 'auto'
            }}>
              {/* Photo Info */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <p style={{
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  margin: '0 0 4px 0'
                }}>
                  {selectedPhoto.caption}
                </p>
                <p style={{
                  color: '#9CA3AF',
                  fontSize: '12px',
                  margin: 0
                }}>
                  by {selectedPhoto.uploadedBy}
                </p>
                <p style={{
                  color: '#6B7280',
                  fontSize: '11px',
                  margin: '4px 0 0 0'
                }}>
                  {selectedPhoto.uploadDate}
                </p>
              </div>

              {/* Comments List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px'
              }}>
                {selectedPhoto.comments.length === 0 ? (
                  <p style={{
                    color: '#9CA3AF',
                    fontSize: '12px',
                    textAlign: 'center',
                    padding: '20px 0',
                    margin: 0
                  }}>
                    No comments yet. Be the first!
                  </p>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {selectedPhoto.comments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '10px',
                          borderLeft: '3px solid #EC4899'
                        }}
                      >
                        <p style={{
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          margin: '0 0 4px 0'
                        }}>
                          {comment.author}
                        </p>
                        <p style={{
                          color: '#D1D5DB',
                          fontSize: '12px',
                          margin: '0 0 4px 0',
                          lineHeight: '1.4'
                        }}>
                          {comment.text}
                        </p>
                        <p style={{
                          color: '#9CA3AF',
                          fontSize: '10px',
                          margin: 0
                        }}>
                          {comment.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div style={{
                padding: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.3)'
              }}>
                {commentingPhotoId === selectedPhoto.id ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment();
                        }
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={handleAddComment}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: '#EC4899',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#DB2777'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#EC4899'}
                      >
                        Post
                      </button>
                      <button
                        onClick={() => {
                          setCommentingPhotoId(null);
                          setCommentText('');
                        }}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCommentingPhotoId(selectedPhoto.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(236, 72, 153, 0.2)',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      borderRadius: '6px',
                      color: '#EC4899',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(236, 72, 153, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                    }}
                  >
                    💬 Add Comment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Krabi;
