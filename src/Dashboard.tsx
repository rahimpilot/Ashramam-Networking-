import React, { useEffect, useState } from 'react';
import { auth, db, storage } from './firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, deleteObject } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { SkeletonPost } from './Skeleton';
import { tapMedium } from './haptics';

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
  const [likePop, setLikePop] = useState<string | null>(null);
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
    
    // Use the same profile picture mapping as Profile.tsx
    const profilePicture = getProfilePicture(authorEmail, post.author || '');
    if (profilePicture) {
      return profilePicture;
    }
    
    // Check if profile data is directly on the post
    if (post.authorProfile?.profilePicture) {
      return post.authorProfile.profilePicture;
    }
    
    // Check if the post author is current user and we have user profile
    if (user?.email === authorEmail && userProfile?.profilePicture) {
      return userProfile.profilePicture;
    }
    
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
      
      // Strategy 1: Direct email match
      const usersCollection = collection(db, 'profiles');
      const usersSnapshot = await getDocs(usersCollection);
      
      let foundProfile = null;
      
      
      usersSnapshot.forEach((doc) => {
        const profileData = doc.data();
        
        // Multiple matching strategies
        if (
          profileData.email === email ||                    // Direct email match
          doc.id === email ||                               // Document ID is email
          doc.id === email.replace(/[@.]/g, '_') ||        // Email converted to doc ID
          (profileData.name && profileData.email === email) // Name and email match
        ) {
          foundProfile = profileData;
        }
      });
      
      // Strategy 2: If no profile found, try to find by Firebase UID
      if (!foundProfile && user?.email === email) {
        try {
          const profileRef = doc(db, 'profiles', user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            foundProfile = profileSnap.data();
          }
        } catch (uidError) {
        }
      }
      
      if (!foundProfile) {
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
            color: '#5b9bd5',
            fontWeight: 600,
            background: 'rgba(24, 119, 242, 0.1)',
            borderRadius: '6px',
            padding: '2px 6px'
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
    tapMedium();
    setLikePop(postId);
    setTimeout(() => setLikePop(null), 400);
    
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

    setSubmitting(true);
    try {
      // Extract mentions from the message
      const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(newMessage)) !== null) {
        mentions.push(match[1]);
      }
      
      
      let imageUrl = null;
      
      // Convert image to base64 as temporary workaround (since Firebase Storage has permission issues)
      if (selectedImage) {

        try {
          // Compress image before converting to base64
          const compressedBase64 = await compressImage(selectedImage);
          imageUrl = compressedBase64;

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

      const docRef = doc(collection(db, 'scrapbook'));
      await setDoc(docRef, postData);
      
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowMentionDropdown(false); // Hide mention dropdown
      fetchScrapPosts();

    } catch (error) {
      console.error('Error posting message:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        setUserProfile(profileData);
      } else {
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
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
        fontFamily: "'Marcellus', Georgia, serif",
        padding: '16px',
        paddingTop: '76px',
        margin: '0 auto'
      }}
        className="iv-page">
        <div className="iv-skeleton" style={{ height: 60, borderRadius: 16, marginBottom: 16 }} />
        <SkeletonPost />
        <SkeletonPost />
        <SkeletonPost />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
      fontFamily: "'Marcellus', Georgia, serif"
    }}>
      <style>{`
        /* Mobile only: halve the Scrapbook composer height */
        @media (max-width: 767px) {
          .sb-composer-card { padding: 8px 12px !important; }
          .sb-composer-input { min-height: 40px !important; }
          .sb-composer-actions { margin-top: 8px !important; }
          .sb-mention-dropdown { top: 54px !important; left: 12px !important; right: 12px !important; }
          /* Mobile only: Facebook-style photo rendering — natural ratio when the
             photo fits, clean center-crop when taller (never squished) */
          .sb-post-img-wrap { margin-bottom: 12px !important; }
          .sb-post-img { display: block !important; max-height: 480px !important; }
        }
      `}</style>
      {/* Modern Mobile Header - 60px height */}
      <div
        className="iv-dash-header"
        style={{
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #c9d9e8'
      }}>
        <div
          className="iv-page"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%'
          }}
        >
          {/* Left: Profile Picture + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2px solid #c9d9e8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
            onClick={() => navigate('/profile')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#5b9bd5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = '#c9d9e8';
            }}>
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
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <span style="font-size: 1.2rem; color: #6b7f92;">👤</span>
                    `;
                  }}
                />
              ) : (
                <span style={{ fontSize: '1.2rem', color: '#6b7f92' }}>👤</span>
              )}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1c1915',
                lineHeight: '1.3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {userProfile.name || user?.displayName || 'User'}
              </div>
              {userProfile.bio && (
                <div style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#6b7f92',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userProfile.bio}
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* Tab Navigation - Cleaner Design */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(91, 155, 213, 0.18)',
        position: 'sticky',
        top: '60px',
        zIndex: 50
      }}>
        <div
          className="iv-page"
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <button
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: '#1c1915',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              borderBottom: '3px solid #5b9bd5',
              transition: 'all 0.2s ease'
            }}
          >
            📝 Scrapbook
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="iv-page-wide"
        style={{
          background: 'transparent',
          minHeight: '100vh'
        }}
      >
        {/* Story/Post Composer - Card Style */}
        <div className="sb-composer-card" style={{
          margin: '16px 16px 8px 16px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '18px',
          boxShadow: '0 6px 20px rgba(91, 155, 213, 0.18)',
          position: 'relative'
        }}>
          <form onSubmit={handleSubmitPost}>
            <textarea
              value={newMessage}
              onChange={handleMessageChange}
              placeholder="What's on your mind? Type @ to mention someone"
              className="sb-composer-input"
              style={{
                width: '100%',
                minHeight: '80px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '1.4',
                resize: 'none',
                fontFamily: 'inherit',
                color: '#1c1915',
                background: 'transparent'
              }}
            />
            
            {/* Mention Dropdown */}
            {showMentionDropdown && mentionUsers.length > 0 && (
              <div className="sb-mention-dropdown" style={{
                position: 'absolute',
                top: '100px',
                left: '16px',
                right: '16px',
                background: '#ffffff',
                border: '1px solid #c9d9e8',
                borderRadius: '12px',
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
                      padding: '12px',
                      cursor: 'pointer',
                      borderBottom: index < mentionUsers.length - 1 ? '1px solid #e9f1f8' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s, transform 0.1s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9f1f8';
                      e.currentTarget.style.transform = 'scale(1.01)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #c9d9e8',
                      background: user.profilePicture ? 'transparent' : 'linear-gradient(135deg, #5b9bd5 0%, #4a86c8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: 600
                    }}>
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: '#1c1915' }}>{user.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Image Preview */}
            {imagePreview && (
              <div style={{ marginTop: '16px', position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '12px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✕
                </button>
              </div>
            )}
            
            <div className="sb-composer-actions" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Camera Button */}
                <label style={{ 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9f1f8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
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
                  background: (newMessage.trim() || selectedImage) 
                    ? 'linear-gradient(135deg, #5b9bd5 0%, #4a86c8 100%)' 
                    : '#c9d9e8',
                  color: (newMessage.trim() || selectedImage) ? '#ffffff' : '#9dafbe',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  minHeight: '44px',
                  cursor: (newMessage.trim() || selectedImage) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: (newMessage.trim() || selectedImage) ? '0 2px 4px rgba(24, 119, 242, 0.2)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (newMessage.trim() || selectedImage) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 119, 242, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = (newMessage.trim() || selectedImage) ? '0 2px 4px rgba(24, 119, 242, 0.2)' : 'none';
                }}
              >
                {submitting ? '⏳' : 'Share'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="iv-cards-2 iv-tab-clearance" style={{ paddingBottom: '96px' }}>
          {scrapPosts.map((post, index) => (
            <div
              key={post.id}
              className="iv-stagger"
              style={{
                marginBottom: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                boxShadow: '0 6px 20px rgba(91, 155, 213, 0.18)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                animationDelay: `${Math.min(index, 8) * 60}ms`
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 28px rgba(91, 155, 213, 0.28)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 155, 213, 0.18)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  className="iv-ring"
                  style={{
                    width: 53,
                    height: 53,
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                onClick={() => viewUserProfile(post.authorEmail || post.author, post.author)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden'
                  }}>
                  {(() => {
                    const avatarUrl = getUserAvatar(post);
                    
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
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement!;
                            parent.innerHTML = `
                              <div style="
                                width: 36px;
                                height: 36px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #2a241c 0%, #332e26 100%);
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
                          background: 'linear-gradient(135deg, #5b9bd5 0%, #4a86c8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 600
                        }}>
                          {(post.authorEmail || post.author || '?').charAt(0).toUpperCase()}
                        </div>
                      );
                    }
                  })()}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '18px', 
                      fontWeight: 600,
                      lineHeight: '1.3',
                      color: '#1c1915'
                    }}>
                      {post.author}
                    </h4>
                    <span style={{ 
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: '1.4',
                      color: '#6b7f92'
                    }}>
                      {post.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                      margin: '0 0 16px 0',
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '1.4',
                      color: '#1c1915',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {renderMessageWithMentions(post.message)}
                    </p>
                  
                  {/* Post Image */}
                  {post.image && (
                    <div className="sb-post-img-wrap" style={{ marginBottom: '16px' }}>
                      <img
                        src={post.image}
                        alt="Post content"
                        className="sb-post-img"
                        onClick={() => handleImageClick(post.image!)}
                        style={{
                          width: '100%',
                          maxWidth: '100%',
                          height: 'auto',
                          maxHeight: '300px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.01)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      className={likePop === post.id ? 'iv-pop' : ''}
                      aria-label="Like this post"
                      style={{
                        background: post.likes?.includes(user?.email || '') ? '#5b9bd5' : '#e3eefb',
                        border: 'none',
                        color: post.likes?.includes(user?.email || '') ? '#ffffff' : '#2f7fc4',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        boxShadow: post.likes?.includes(user?.email || '') ? '0 4px 12px rgba(91,155,213,0.4)' : 'none'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      ♥&nbsp;
                      <span
                        onClick={(e) => { e.stopPropagation(); setShowLikes(prev => ({ ...prev, [post.id]: !prev[post.id] })); }}
                        title="See who liked"
                        style={{ textDecoration: 'underline dotted', textUnderlineOffset: '3px', cursor: 'pointer' }}
                      >
                        {post.likeCount || 0}
                      </span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      aria-label="Comments"
                      style={{
                        background: '#eef3f9',
                        border: 'none',
                        color: '#5b6b7c',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e3eefb'; e.currentTarget.style.color = '#2f7fc4'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#eef3f9'; e.currentTarget.style.color = '#5b6b7c'; }}
                    >
                      💬 {post.replyCount || 0}
                    </button>
                    {user?.email === post.authorEmail && (
                      <button 
                        onClick={() => startEditingPost(post.id, post.message)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7f92',
                          fontSize: '14px',
                          fontWeight: 400,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9f1f8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                  
                  {/* Likes Section */}
                  {showLikes[post.id] && post.likes && post.likes.length > 0 && (
                    <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#e9f1f8', borderRadius: '12px', border: '1px solid #c9d9e8' }}>
                      <div style={{ fontSize: '12px', color: '#6b7f92', fontWeight: 500, marginBottom: '8px' }}>
                        Liked by:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {post.likes.map((email: string) => (
                          <span
                            key={email}
                            onClick={() => viewUserProfile(email, getUserName(email))}
                            style={{
                              backgroundColor: '#c9d9e8',
                              color: '#1c1915',
                              padding: '6px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 400,
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease, transform 0.1s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#5b9bd5';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#c9d9e8';
                              e.currentTarget.style.color = '#1c1915';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {getUserName(email)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #c9d9e8' }}>
                      {/* Existing Comments */}
                      {post.replies && post.replies.map((reply) => (
                        <div key={reply.id} style={{ marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          {/* Reply Avatar */}
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #c9d9e8',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease'
                          }}
                          onClick={() => viewUserProfile(reply.authorEmail || reply.author, reply.author)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.borderColor = '#5b9bd5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = '#c9d9e8';
                          }}
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
                                          background: linear-gradient(135deg, #2a241c 0%, #332e26 100%);
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
                                    background: 'linear-gradient(135deg, #5b9bd5 0%, #4a86c8 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontSize: '12px',
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
                            <strong style={{ color: '#1c1915', fontSize: '14px', fontWeight: 600 }}>{reply.author}:</strong>{' '}
                            <span style={{ color: '#6b7f92', fontSize: '14px', fontWeight: 400, lineHeight: '1.4' }}>
                              {renderMessageWithMentions(reply.message)}
                            </span>
                            <div style={{ fontSize: '11px', color: '#9dafbe', marginTop: '4px' }}>
                              {reply.createdAt.toDate().toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Comment */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', position: 'relative' }}>
                        <input
                          type="text"
                          value={newComment[post.id] || ''}
                          onChange={(e) => handleCommentInput(post.id, e.target.value, e.target.selectionStart || 0)}
                          placeholder="Add a comment..."
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            border: '1px solid #c9d9e8',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '1.4',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            minHeight: '44px'
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#5b9bd5'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#c9d9e8'}
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
                            border: '1px solid #c9d9e8',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginBottom: '8px'
                          }}>
                            {commentMentionUsers[post.id].map((user, index) => (
                              <div
                                key={index}
                                onClick={() => insertCommentMention(post.id, user)}
                                style={{
                                  padding: '8px',
                                  cursor: 'pointer',
                                  borderBottom: index < commentMentionUsers[post.id].length - 1 ? '1px solid #e9f1f8' : 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9f1f8'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                              >
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: '2px solid #c9d9e8',
                                  background: '#c9d9e8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px'
                                }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '14px', color: '#1c1915' }}>{user.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleAddComment(post.id)}
                          style={{
                            background: 'linear-gradient(135deg, #5b9bd5 0%, #4a86c8 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            minHeight: '44px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 119, 242, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
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


      {/* Edit Post Modal */}
      {editingPostId && (() => {
        const editingPost = scrapPosts.find(p => p.id === editingPostId);
        if (!editingPost) return null;
        const avatarUrl = getUserAvatar(editingPost);
        const authorInitial = (editingPost.author || '?').charAt(0).toUpperCase();
        return (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(18, 28, 42, 0.55)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16, animation: 'ivModalIn 0.22s ease'
            }}
            onClick={cancelEditingPost}
          >
            <div
              style={{
                background: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 480,
                maxHeight: '88vh', overflowY: 'auto',
                boxShadow: '0 24px 64px rgba(10, 25, 45, 0.35)',
                animation: 'ivModalCardIn 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px 20px' }}>
                <h3 className="iv-display" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600, color: '#1c2733' }}>Edit Post</h3>
                <button
                  onClick={cancelEditingPost}
                  aria-label="Close"
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#eef3f8', color: '#5b6b7d', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}
                >✕</button>
              </div>
              <div style={{ height: 1, background: '#e6edf4' }} />
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#d8e6f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: '#4a86c8' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={editingPost.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : authorInitial}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1c2733', fontSize: 15 }}>{editingPost.author}</div>
                    <div style={{ fontSize: 12, color: '#8a99ab' }}>{editingPost.createdAt.toDate().toLocaleDateString()}</div>
                  </div>
                </div>
                <textarea
                  value={editingMessage}
                  onChange={(e) => setEditingMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  autoFocus
                  style={{
                    width: '100%', minHeight: 110, border: 'none', background: '#f4f7fb',
                    borderRadius: 14, padding: '14px', fontSize: 16, lineHeight: 1.5,
                    fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                    color: '#1c2733', boxSizing: 'border-box'
                  }}
                />
                {editingPost.image && !editingImageRemoved ? (
                  <div style={{ position: 'relative', marginTop: 12 }}>
                    <img
                      src={editingPost.image}
                      alt="Post attachment"
                      style={{ width: '100%', borderRadius: 14, display: 'block', maxHeight: 320, objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => setEditingImageRemoved(true)}
                      aria-label="Remove image"
                      style={{
                        position: 'absolute', top: 10, right: 10, width: 34, height: 34,
                        borderRadius: '50%', border: 'none', background: 'rgba(15, 23, 36, 0.65)',
                        color: '#ffffff', fontSize: 15, cursor: 'pointer', lineHeight: 1,
                        backdropFilter: 'blur(2px)'
                      }}
                    >✕</button>
                  </div>
                ) : null}
                {editingPost.image && editingImageRemoved ? (
                  <button
                    onClick={() => setEditingImageRemoved(false)}
                    style={{
                      marginTop: 12, width: '100%', background: '#f1f5f9',
                      border: '1px dashed #bccfdd', borderRadius: 12, padding: '10px 14px',
                      fontSize: 13, color: '#4a86c8', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Image removed — tap to undo
                  </button>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '4px 20px 20px 20px' }}>
                <button
                  onClick={cancelEditingPost}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #d5e0ec',
                    background: '#ffffff', color: '#5b6b7d', fontWeight: 600, fontSize: 15, cursor: 'pointer'
                  }}
                >Cancel</button>
                <button
                  onClick={() => saveEditedPost(editingPost.id)}
                  style={{
                    flex: 2, padding: '12px 0', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #5b9bd5, #4a86c8)', color: '#ffffff',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(74, 134, 200, 0.35)'
                  }}
                >Save</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        imageSrc={modalImageSrc}
        onClose={closeImageModal}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;