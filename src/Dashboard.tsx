import React, { useEffect, useState } from 'react';
import { auth, db, storage } from './firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, deleteObject } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

// Admin-controlled profile picture mapping
const getProfilePicture = (email: string, name: string) => {
  const profilePictureMap: { [key: string]: string } = {
    // Add user email mappings here - controlled by admin
    'raimu456@gmail.com': '/raimu.jpg',
    'hyder.mohamed@gmail.com': '/hyder.JPG',
    'mzmhmd@gmail.com': '/bruno.png',
    'nias.ahamad@gmail.com': '/nias.jpg',
    'mshanir@gmail.com': '/shanir.jpeg',
    'niaznasu@gmail.com': '/niaz.jpeg',
    'riaz986@gmail.com': '/riaz',
    'anaskallur@gmail.com': '/anas.jpg',
    'mailmohasinali@gmail.com': '/appan.JPG',
    'asifmadheena@gmail.com': '/asif.png',
    // Add more mappings as needed
  };

  // Check if user has a custom profile picture
  if (profilePictureMap[email.toLowerCase()]) {
    return profilePictureMap[email.toLowerCase()];
  }

  // Return null for default avatar
  return null;
};

interface UserProfile {
  name?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  profileCompletion?: number;
  profilePicture?: string;
  email?: string;
}

interface MentionableUser {
  id: string;
  name: string;
  email: string;
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
  image?: string;
}

interface ScrapReply {
  id: string;
  message: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp;
}

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen || !imageSrc) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
        cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <div style={{
        position: 'relative',
        maxWidth: '95vw',
        maxHeight: '95vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-2rem',
            right: '0',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '2.5rem',
            height: '2.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            zIndex: 1
          }}
        >
          ✕
        </button>
        <img
          src={imageSrc}
          alt="Full size post"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            borderRadius: '0.5rem',
            objectFit: 'contain',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [scrapPosts, setScrapPosts] = useState<ScrapPost[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userProfiles, setUserProfiles] = useState<{[email: string]: UserProfile}>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<{[postId: string]: boolean}>({});
  const [newComment, setNewComment] = useState<{[postId: string]: string}>({});
  const [showLikes, setShowLikes] = useState<{[postId: string]: boolean}>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);
  
  // Mention/Tagging states
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionUsers, setMentionUsers] = useState<MentionableUser[]>([]);
  const [allUsers, setAllUsers] = useState<MentionableUser[]>([]);

  // Comment mention states
  const [showCommentMentionDropdown, setShowCommentMentionDropdown] = useState<{[postId: string]: boolean}>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [commentMentionQuery, setCommentMentionQuery] = useState<{[postId: string]: string}>({});
  const [commentCursorPosition, setCommentCursorPosition] = useState<{[postId: string]: number}>({});
  const [commentMentionUsers, setCommentMentionUsers] = useState<{[postId: string]: MentionableUser[]}>({});

  // Edit post states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string>('');
  const [editingImageRemoved, setEditingImageRemoved] = useState<boolean>(false);

  // Enhanced avatar fetching with fallback options
  const getUserAvatar = (post: any): string | null => {
    const authorEmail = post.authorEmail || post.author;
    console.log('🎯 Getting avatar for post author:', authorEmail);
    console.log('📋 Post data:', post);
    
    // Use the same profile picture mapping as Profile.tsx
    const profilePicture = getProfilePicture(authorEmail, post.author || '');
    if (profilePicture) {
      console.log('✅ Found profile picture for', authorEmail, ':', profilePicture);
      return profilePicture;
    }
    
    // Check if profile data is directly on the post
    if (post.authorProfile?.profilePicture) {
      console.log('✅ Using post embedded avatar for', authorEmail, ':', post.authorProfile.profilePicture);
      return post.authorProfile.profilePicture;
    }
    
    // Check if the post author is current user and we have user profile
    if (user?.email === authorEmail && userProfile?.profilePicture) {
      console.log('✅ Using current user avatar for', authorEmail, ':', userProfile.profilePicture);
      return userProfile.profilePicture;
    }
    
    console.log('❌ No avatar found for', authorEmail, '- using fallback.');
    return null; // Return null so we can show fallback UI
  };

  // Helper function to get user name from email
  const getUserName = (email: string): string => {
    const user = allUsers.find(u => u.email === email);
    return user ? user.name : email; // Fallback to email if name not found
  };

  // Enhanced profile fetching with multiple strategies
  const fetchAuthorProfile = async (email: string) => {
    try {
      console.log('🔍 Fetching profile for email:', email);
      
      // Strategy 1: Direct email match
      const usersCollection = collection(db, 'profiles');
      const usersSnapshot = await getDocs(usersCollection);
      
      let foundProfile = null;
      
      console.log('📄 Total profiles in database:', usersSnapshot.size);
      
      usersSnapshot.forEach((doc) => {
        const profileData = doc.data();
        console.log('🔍 Checking profile doc ID:', doc.id, 'data:', profileData);
        
        // Multiple matching strategies
        if (
          profileData.email === email ||                    // Direct email match
          doc.id === email ||                               // Document ID is email
          doc.id === email.replace(/[@.]/g, '_') ||        // Email converted to doc ID
          (profileData.name && profileData.email === email) // Name and email match
        ) {
          foundProfile = profileData;
          console.log('✅ Found matching profile for', email, ':', profileData);
        }
      });
      
      // Strategy 2: If no profile found, try to find by Firebase UID
      if (!foundProfile && user?.email === email) {
        try {
          console.log('🔄 Trying UID lookup for current user:', user.uid);
          const profileRef = doc(db, 'profiles', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            foundProfile = profileSnap.data();
            console.log('✅ Found profile by UID for', email, ':', foundProfile);
          }
        } catch (uidError) {
          console.log('❌ UID lookup failed:', uidError);
        }
      }
      
      if (!foundProfile) {
        console.log('❌ No profile found for email:', email);
      }
      
      return foundProfile;
    } catch (error) {
      console.error('❌ Error fetching profile for', email, ':', error);
      return null;
    }
  };

  // Fetch all users for mentioning
  const fetchAllUsers = async () => {
    try {
      const usersCollection = collection(db, 'profiles');
      const usersSnapshot = await getDocs(usersCollection);
      
      const users: MentionableUser[] = [];
      usersSnapshot.forEach((doc) => {
        const profileData = doc.data() as UserProfile;
        
        if (profileData.name && profileData.email) {
          users.push({
            id: doc.id,
            name: profileData.name,
            email: profileData.email,
            profilePicture: profileData.profilePicture
          });
        }
      });
      
      console.log('✅ All users fetched for mentioning:', users);
      setAllUsers(users);
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
    }
  };

  // Handle text input change with mention detection
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setNewMessage(value);
    setCursorPosition(cursorPos);
    
    // Check for @ mentions
    const beforeCursor = value.substring(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const afterAt = beforeCursor.substring(atIndex + 1);
      
      // Check if there's a space after @ (which would end the mention)
      if (afterAt.includes(' ') || afterAt.includes('\n')) {
        setShowMentionDropdown(false);
        return;
      }
      
      setMentionQuery(afterAt);
      
      // Filter users based on query
      const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(afterAt.toLowerCase())
      );
      
      setMentionUsers(filteredUsers.slice(0, 5)); // Show max 5 suggestions
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  // Insert mention into text
  const insertMention = (user: MentionableUser) => {
    const beforeCursor = newMessage.substring(0, cursorPosition);
    const afterCursor = newMessage.substring(cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    const beforeAt = beforeCursor.substring(0, atIndex);
    const newText = `${beforeAt}@${user.name} ${afterCursor}`;
    
    setNewMessage(newText);
    setShowMentionDropdown(false);
    setMentionQuery('');
  };

  // Comment mention handlers
  const handleCommentInput = (postId: string, value: string, cursorPos: number) => {
    setNewComment(prev => ({ ...prev, [postId]: value }));
    setCommentCursorPosition(prev => ({ ...prev, [postId]: cursorPos }));

    // Check for @ mentions
    const beforeCursor = value.substring(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const afterAt = beforeCursor.substring(atIndex + 1);

      // Check if there's a space after @ (which would end the mention)
      if (afterAt.includes(' ') || afterAt.includes('\n')) {
        setShowCommentMentionDropdown(prev => ({ ...prev, [postId]: false }));
        return;
      }

      setCommentMentionQuery(prev => ({ ...prev, [postId]: afterAt }));

      // Filter users based on query
      const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(afterAt.toLowerCase())
      );

      setCommentMentionUsers(prev => ({ ...prev, [postId]: filteredUsers.slice(0, 5) }));
      setShowCommentMentionDropdown(prev => ({ ...prev, [postId]: true }));
    } else {
      setShowCommentMentionDropdown(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Insert mention into comment
  const insertCommentMention = (postId: string, user: MentionableUser) => {
    const currentComment = newComment[postId] || '';
    const cursorPos = commentCursorPosition[postId] || 0;

    const beforeCursor = currentComment.substring(0, cursorPos);
    const afterCursor = currentComment.substring(cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');

    const beforeAt = beforeCursor.substring(0, atIndex);
    const newText = `${beforeAt}@${user.name} ${afterCursor}`;

    setNewComment(prev => ({ ...prev, [postId]: newText }));
    setShowCommentMentionDropdown(prev => ({ ...prev, [postId]: false }));
    setCommentMentionQuery(prev => ({ ...prev, [postId]: '' }));
  };

  // Render message with highlighted mentions
  const renderMessageWithMentions = (message: string) => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(message.substring(lastIndex, match.index));
      }
      
      // Add highlighted mention
      parts.push(
        <span
          key={match.index}
          style={{
            color: '#1f2937',
            fontWeight: 600,
            background: 'rgba(31, 41, 55, 0.1)',
            borderRadius: '4px',
            padding: '2px 4px'
          }}
        >
          @{match[1]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < message.length) {
      parts.push(message.substring(lastIndex));
    }
    
    return parts.length > 1 ? parts : message;
  };

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

  // View user profile function
  const viewUserProfile = (userEmail: string, userName: string) => {
    // For now, we'll navigate to a user profile route with query params
    // In a more advanced setup, you might want to create a dedicated user profile component
    navigate(`/profile?user=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}`);
  };

  // Image upload handler
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Like post handler
  const handleLike = async (postId: string) => {
    if (!user?.email) return;
    
    try {
      const postRef = doc(db, 'scrapbook', postId);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        const postData = postSnap.data();
        const likes = postData.likes || [];
        const userEmail = user.email;
        
        let updatedLikes;
        if (likes.includes(userEmail)) {
          updatedLikes = likes.filter((email: string) => email !== userEmail);
        } else {
          updatedLikes = [...likes, userEmail];
        }
        
        await updateDoc(postRef, {
          likes: updatedLikes,
          likeCount: updatedLikes.length
        });
        
        fetchScrapPosts();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Comment handlers
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId: string) => {
    const comment = newComment[postId]?.trim();
    if (!comment || !user?.email) return;

    try {
      // Extract mentions from the comment
      const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
      const commentMentions = [];
      let match;

      while ((match = mentionRegex.exec(comment)) !== null) {
        commentMentions.push(match[1]);
      }

      console.log('Found comment mentions:', commentMentions);

      const postRef = doc(db, 'scrapbook', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const replies = postData.replies || [];

        const newReply: ScrapReply = {
          id: Date.now().toString(),
          message: comment,
          author: userProfile.name || user.displayName || 'Anonymous User',
          authorEmail: user.email,
          createdAt: Timestamp.now()
        };

        const updatedReplies = [...replies, newReply];

        await updateDoc(postRef, {
          replies: updatedReplies,
          replyCount: updatedReplies.length
        });

        setNewComment(prev => ({ ...prev, [postId]: '' }));
        setShowCommentMentionDropdown(prev => ({ ...prev, [postId]: false }));
        fetchScrapPosts();

      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Edit post functions
  const startEditingPost = (postId: string, currentMessage: string) => {
    setEditingPostId(postId);
    setEditingMessage(currentMessage);
  };

  const cancelEditingPost = () => {
    setEditingPostId(null);
    setEditingMessage('');
    setEditingImageRemoved(false);
  };

  const saveEditedPost = async (postId: string) => {
    if (!editingMessage.trim() || !user?.email) return;

    try {
      const postRef = doc(db, 'scrapbook', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();

        // Check if user is the author
        if (postData.authorEmail !== user.email) {
          alert('You can only edit your own posts');
          return;
        }

        const updateData: any = {
          message: editingMessage.trim()
        };

        // Handle image removal
        if (editingImageRemoved && postData.image) {
          try {
            const imageRef = ref(storage, postData.image);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image from storage:', error);
          }
          updateData.image = null;
        }

        await updateDoc(postRef, updateData);

        setEditingPostId(null);
        setEditingMessage('');
        setEditingImageRemoved(false);
        fetchScrapPosts();
      }
    } catch (error) {
      console.error('Error editing post:', error);
      alert('Failed to edit post. Please try again.');
    }
  };

  // Image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800px width/height, maintain aspect ratio)
        let { width, height } = img;

        const maxDimension = 800;
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with quality compression (0.7 = 70% quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageClick = (imageSrc: string) => {
    setModalImageSrc(imageSrc);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setModalImageSrc(null);
  };

  // Simple post submission
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newMessage.trim() && !selectedImage)) return;

    console.log('Starting post submission...');
    setSubmitting(true);
    try {
      // Extract mentions from the message
      const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(newMessage)) !== null) {
        mentions.push(match[1]);
      }
      
      console.log('Found mentions:', mentions);
      
      let imageUrl = null;
      
      // Convert image to base64 as temporary workaround (since Firebase Storage has permission issues)
      if (selectedImage) {
        console.log('Compressing and converting image to base64...', selectedImage.name, selectedImage.size, 'bytes');

        try {
          // Compress image before converting to base64
          const compressedBase64 = await compressImage(selectedImage);
          imageUrl = compressedBase64;
          console.log('Image compressed and converted to base64 successfully, length:', imageUrl.length);

        } catch (uploadError) {
          console.error('Error compressing/converting image:', uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
          alert(`Failed to process image: ${errorMessage}`);

          // Don't continue with post creation if image processing fails for image-only posts
          if (!newMessage.trim()) {
            throw new Error('Image processing failed and no text provided');
          }
          imageUrl = null;
        }
      }
      
      console.log('Creating post data...');
      const postData = {
        message: newMessage.trim(),
        author: userProfile.name || user.displayName || 'Anonymous User',
        authorEmail: user.email || '',
        createdAt: Timestamp.now(),
        likes: [],
        likeCount: 0,
        tags: mentions, // Store mentioned users in tags
        replies: [],
        replyCount: 0,
        image: imageUrl
      };

      console.log('Saving to Firestore...');
      const docRef = doc(collection(db, 'scrapbook'));
      await setDoc(docRef, postData);
      console.log('Post saved successfully');
      
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowMentionDropdown(false); // Hide mention dropdown
      console.log('Refreshing posts...');
      fetchScrapPosts();
      console.log('Post submission completed successfully');

    } catch (error) {
      console.error('Error posting message:', error);
      alert('Failed to post. Please try again.');
    } finally {
      console.log('Setting submitting to false');
      setSubmitting(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('Fetching user profile for UID:', user.uid);
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        console.log('✅ User profile loaded:', profileData);
        setUserProfile(profileData);
      } else {
        console.log('❌ No profile found for UID:', user.uid);
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
      const authorEmails = new Set<string>();
      
      querySnapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() } as ScrapPost;
        posts.push(postData);
        if (postData.authorEmail) {
          authorEmails.add(postData.authorEmail);
        }
      });
      
      // Fetch profiles for all unique author emails
      const profilesMap: {[email: string]: UserProfile} = {};
      
      for (const email of Array.from(authorEmails)) {
        const profile = await fetchAuthorProfile(email);
        if (profile) {
          profilesMap[email] = profile;
        }
      }
      
      console.log('Fetched profiles:', profilesMap);
      setUserProfiles(profilesMap);
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
    fetchAllUsers(); // Fetch users for mentioning
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
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
        background: '#ffffff',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 480,
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/newlogo.svg" 
              alt="Logo" 
              style={{ 
                height: 40,
                width: 'auto',
                maxWidth: '140px'
              }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Profile Picture */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              overflow: 'hidden'
            }}
            onClick={() => navigate('/profile')}>
              {user?.email && getProfilePicture(user.email, userProfile.name || user.displayName || '') ? (
                <img
                  src={getProfilePicture(user.email, userProfile.name || user.displayName || '')!}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    console.log('Header profile image failed to load:', getProfilePicture(user.email!, userProfile.name || user.displayName || ''));
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <span style="font-size: 1.2rem; color: #374151;">👤</span>
                    `;
                  }}
                />
              ) : (
                <span style={{ fontSize: '1.2rem', color: '#374151' }}>👤</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: '70px', // Below the header
        zIndex: 50
      }}>
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            style={{
              flex: 1,
              padding: '1rem 0.5rem',
              border: 'none',
              background: '#f8fafc',
              color: '#1f2937',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: '2px solid #3b82f6'
            }}
          >
            📝 Scrapbook
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        background: '#ffffff',
        minHeight: '100vh'
      }}>
        {/* Story/Post Composer */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          position: 'relative'
        }}>
          <form onSubmit={handleSubmitPost}>
            <textarea
              value={newMessage}
              onChange={handleMessageChange}
              placeholder="What's on your mind? Type @ to mention someone"
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
            
            {/* Mention Dropdown */}
            {showMentionDropdown && mentionUsers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100px',
                left: '1rem',
                right: '1rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {mentionUsers.map((user, index) => (
                  <div
                    key={user.id}
                    onClick={() => insertMention(user)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      borderBottom: index < mentionUsers.length - 1 ? '1px solid #f1f5f9' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: user.profilePicture ? 'transparent' : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#1e293b' }}>{user.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Image Preview */}
            {imagePreview && (
              <div style={{ marginTop: '1rem', position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Camera Button */}
                <label style={{ fontSize: '1.2rem', cursor: 'pointer' }}>
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedImage) || submitting}
                style={{
                  background: (newMessage.trim() || selectedImage) ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' : '#e2e8f0',
                  color: (newMessage.trim() || selectedImage) ? '#ffffff' : '#94a3b8',
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
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                onClick={() => viewUserProfile(post.authorEmail || post.author, post.author)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  {(() => {
                    const avatarUrl = getUserAvatar(post);
                    console.log('Rendering avatar for post:', post.id, 'URL:', avatarUrl);
                    
                    if (avatarUrl) {
                      return (
                        <img
                          src={avatarUrl}
                          alt={post.authorEmail || post.author}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.log('❌ Avatar image failed to load:', avatarUrl);
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement!;
                            parent.innerHTML = `
                              <div style="
                                width: 36px;
                                height: 36px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: #ffffff;
                                font-size: 1.2rem;
                                font-weight: 600;
                              ">
                                ${(post.authorEmail || post.author || '?').charAt(0).toUpperCase()}
                              </div>
                            `;
                          }}
                        />
                      );
                    } else {
                      return (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}>
                          {(post.authorEmail || post.author || '?').charAt(0).toUpperCase()}
                        </div>
                      );
                    }
                  })()}
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
                  {editingPostId === post.id ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <textarea
                        value={editingMessage}
                        onChange={(e) => setEditingMessage(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          outline: 'none'
                        }}
                        placeholder="Edit your post..."
                      />
                      {post.image && !editingImageRemoved && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <img
                              src={post.image}
                              alt="Post content"
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '6px'
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#92400e', fontWeight: 500 }}>
                                Image attached
                              </p>
                              <button
                                onClick={() => {
                                  setEditingImageRemoved(true);
                                }}
                                style={{
                                  background: '#dc2626',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {editingImageRemoved && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b', fontWeight: 500 }}>
                            ✓ Image will be removed when you save
                          </p>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => saveEditedPost(post.id)}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditingPost}
                          style={{
                            background: '#6b7280',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{
                      margin: '0 0 1rem 0',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      color: '#334155',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {renderMessageWithMentions(post.message)}
                    </p>
                  )}
                  
                  {/* Post Image */}
                  {post.image && (
                    <div style={{ marginBottom: '1rem' }}>
                      <img
                        src={post.image}
                        alt="Post content"
                        onClick={() => handleImageClick(post.image!)}
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleLike(post.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: post.likes?.includes(user?.email || '') ? '#ef4444' : '#64748b',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        ❤️
                      </button>
                      <span 
                        onClick={() => setShowLikes(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        style={{
                          color: '#64748b',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {post.likeCount || 0} {post.likeCount === 1 ? 'like' : 'likes'}
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      💬 {post.replyCount || 0}
                    </button>
                    {user?.email === post.authorEmail && (
                      <button 
                        onClick={() => startEditingPost(post.id, post.message)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                  
                  {/* Likes Section */}
                  {showLikes[post.id] && post.likes && post.likes.length > 0 && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500', marginBottom: '0.5rem' }}>
                        Liked by:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {post.likes.map((email: string) => (
                          <span
                            key={email}
                            onClick={() => viewUserProfile(email, getUserName(email))}
                            style={{
                              backgroundColor: '#e2e8f0',
                              color: '#334155',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cbd5e1'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                          >
                            {getUserName(email)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      {/* Existing Comments */}
                      {post.replies && post.replies.map((reply) => (
                        <div key={reply.id} style={{ marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          {/* Reply Avatar */}
                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transition: 'border 0.2s ease'
                          }}
                          onClick={() => viewUserProfile(reply.authorEmail || reply.author, reply.author)}
                          onMouseEnter={(e) => e.currentTarget.style.border = '2px solid #3b82f6'}
                          onMouseLeave={(e) => e.currentTarget.style.border = 'none'}
                          >
                            {(() => {
                              const replyAvatar = getProfilePicture(reply.authorEmail || reply.author, reply.author);
                              if (replyAvatar) {
                                return (
                                  <img
                                    src={replyAvatar}
                                    alt={reply.author}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const parent = e.currentTarget.parentElement!;
                                      parent.innerHTML = `
                                        <div style="
                                          width: 20px;
                                          height: 20px;
                                          border-radius: 50%;
                                          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                                          display: flex;
                                          align-items: center;
                                          justify-content: center;
                                          color: #ffffff;
                                          font-size: 0.7rem;
                                          font-weight: 600;
                                        ">
                                          ${(reply.authorEmail || reply.author || '?').charAt(0).toUpperCase()}
                                        </div>
                                      `;
                                    }}
                                  />
                                );
                              } else {
                                return (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontSize: '0.7rem',
                                    fontWeight: 600
                                  }}>
                                    {(reply.authorEmail || reply.author || '?').charAt(0).toUpperCase()}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                          
                          {/* Reply Content */}
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: '#1e293b' }}>{reply.author}:</strong>{' '}
                            <span style={{ color: '#374151' }}>{renderMessageWithMentions(reply.message)}</span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {reply.createdAt.toDate().toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Comment */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', position: 'relative' }}>
                        <input
                          type="text"
                          value={newComment[post.id] || ''}
                          onChange={(e) => handleCommentInput(post.id, e.target.value, e.target.selectionStart || 0)}
                          placeholder="Add a comment..."
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                        />

                        {/* Comment Mention Dropdown */}
                        {showCommentMentionDropdown[post.id] && commentMentionUsers[post.id]?.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '0',
                            right: '80px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {commentMentionUsers[post.id].map((user, index) => (
                              <div
                                key={index}
                                onClick={() => insertCommentMention(post.id, user)}
                                style={{
                                  padding: '0.5rem',
                                  cursor: 'pointer',
                                  borderBottom: index < commentMentionUsers[post.id].length - 1 ? '1px solid #f1f5f9' : 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: '#e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem'
                                }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.9rem', color: '#374151' }}>{user.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleAddComment(post.id)}
                          style={{
                            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        imageSrc={modalImageSrc}
        onClose={closeImageModal}
      />
    </div>
  );
};

export default Dashboard;