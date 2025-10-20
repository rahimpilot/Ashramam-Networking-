import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ImageUtils from './ImageUtils';

interface PhotoPost {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  tags: string[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp;
}

const PhotoScrapbook: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [photoPosts, setPhotoPosts] = useState<PhotoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string>('');
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

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

  // Load photo posts
  useEffect(() => {
    if (user) {
      loadPhotoPosts();
    }
  }, [user]);

  const loadPhotoPosts = async () => {
    try {
      const postsRef = collection(db, 'photoPosts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PhotoPost[];
      
      setPhotoPosts(posts);
    } catch (error) {
      console.error('Error loading photo posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = ImageUtils.validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedImage || !user) return;

    setUploading(true);
    try {
      // Compress image
      const compressedImage = await ImageUtils.compressImage(selectedImage);
      const thumbnail = await ImageUtils.generateThumbnail(selectedImage);
      
      // Convert to base64
      const imageUrl = await ImageUtils.blobToBase64(compressedImage);
      const thumbnailUrl = await ImageUtils.blobToBase64(thumbnail);

      // Parse tags
      const tagsList = tags.split('#').filter(tag => tag.trim().length > 0).map(tag => tag.trim());

      // Create post
      const newPost = {
        imageUrl,
        thumbnailUrl,
        caption,
        author: user.displayName || user.email || 'Anonymous',
        authorEmail: user.email || '',
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        comments: [],
        tags: tagsList
      };

      await addDoc(collection(db, 'photoPosts'), newPost);
      
      // Reset form
      setSelectedImage(null);
      setImagePreview('');
      setCaption('');
      setTags('');
      setShowUploadForm(false);
      
      // Reload posts
      loadPhotoPosts();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'photoPosts', postId);
      const post = photoPosts.find(p => p.id === postId);
      
      if (!post) return;

      const isLiked = post.likedBy.includes(user.email || '');
      
      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: arrayRemove(user.email)
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: arrayUnion(user.email)
        });
      }

      // Update local state
      setPhotoPosts(posts => posts.map(p => {
        if (p.id === postId) {
          const newLikedBy = isLiked 
            ? p.likedBy.filter(email => email !== user.email)
            : [...p.likedBy, user.email || ''];
          
          return {
            ...p,
            likes: isLiked ? p.likes - 1 : p.likes + 1,
            likedBy: newLikedBy
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    try {
      const comment = {
        id: Date.now().toString(),
        text: newComment[postId].trim(),
        author: user.displayName || user.email || 'Anonymous',
        authorEmail: user.email || '',
        createdAt: Timestamp.now()
      };

      const postRef = doc(db, 'photoPosts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      // Update local state
      setPhotoPosts(posts => posts.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [...p.comments, comment] };
        }
        return p;
      }));

      // Clear comment input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (authLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in to view photos.</div>;
  }

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      paddingBottom: isMobile ? '80px' : '20px'
    }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            📸 Photo Scrapbook
          </h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📤 Upload Photo
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        {/* Upload Form */}
        {showUploadForm && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>
              Share a New Photo
            </h3>

            {/* Image Selection */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '16px',
                background: imagePreview ? 'transparent' : '#f8fafc',
                position: 'relative'
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</div>
                  <p style={{ color: '#64748b', fontSize: '1rem' }}>
                    Click to select an image
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    JPEG, PNG, WebP (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Caption */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your photo..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                minHeight: '80px',
                marginBottom: '16px'
              }}
            />

            {/* Tags */}
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (use # before each tag, e.g., #family #vacation #memories)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '20px'
              }}
            />

            {/* Upload Button */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUploadForm(false)}
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedImage || uploading}
                style={{
                  background: selectedImage && !uploading 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: selectedImage && !uploading ? 'pointer' : 'not-allowed',
                  fontWeight: 600
                }}
              >
                {uploading ? 'Uploading...' : 'Share Photo'}
              </button>
            </div>
          </div>
        )}

        {/* Photo Posts */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#64748b' }}>Loading photos...</p>
          </div>
        ) : photoPosts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📷</div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No photos yet</h3>
            <p style={{ color: '#64748b' }}>Be the first to share a memory!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {photoPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #f1f5f9'
                }}
              >
                {/* Post Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 600
                    }}>
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{post.author}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {post.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Post Content */}
                <div style={{ padding: '16px' }}>
                  {/* Caption */}
                  {post.caption && (
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      color: '#1e293b',
                      lineHeight: 1.5
                    }}>
                      {post.caption}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'inline-block',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            marginRight: '8px',
                            marginBottom: '4px'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: post.likedBy.includes(user?.email || '') ? '#ef4444' : '#64748b',
                        fontSize: '0.9rem'
                      }}
                    >
                      {post.likedBy.includes(user?.email || '') ? '❤️' : '🤍'} {post.likes}
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: '#64748b',
                        fontSize: '0.9rem'
                      }}
                    >
                      💬 {post.comments.length}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div style={{ marginTop: '16px' }}>
                      {/* Existing Comments */}
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #f8fafc'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              flexShrink: 0
                            }}>
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                                {comment.author}
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#374151', marginTop: '2px' }}>
                                {comment.text}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginTop: '12px',
                        alignItems: 'flex-end'
                      }}>
                        <input
                          type="text"
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ 
                            ...prev, 
                            [post.id]: e.target.value 
                          }))}
                          placeholder="Add a comment..."
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '20px',
                            fontSize: '0.9rem'
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ➤
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PhotoScrapbook;