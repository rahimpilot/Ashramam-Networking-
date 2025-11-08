import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface ResidentUser {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  city?: string;
  country?: string;
  profileCompletion?: number;
  intellectual?: string;
  umrah?: string;
  funLover?: string;
}

interface UserProfileModalProps {
  user: ResidentUser | null;
  onClose: () => void;
  onImageClick: (imageSrc: string, userName: string, e: React.MouseEvent) => void;
}

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  userName: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, userName, onClose }) => {
  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '2rem',
        cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <div style={{
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 'bold',
            zIndex: 1
          }}
        >
          ✕
        </button>
        <img 
          src={imageSrc}
          alt={userName}
          style={{
            maxWidth: '400px',
            maxHeight: '400px',
            width: 'auto',
            height: 'auto',
            borderRadius: '0.5rem',
            objectFit: 'cover'
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <p style={{
          textAlign: 'center',
          marginTop: '0.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#000000'
        }}>
          {userName}
        </p>
      </div>
    </div>
  );
};

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

  // Debug logging
  console.log('Residents - Profile picture check:', { email: email.toLowerCase(), name, hasMapping: !!profilePictureMap[email.toLowerCase()] });

  // Check if user has a custom profile picture
  if (profilePictureMap[email.toLowerCase()]) {
    return profilePictureMap[email.toLowerCase()];
  }

  // Return null for default avatar
  return null;
};

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onImageClick }) => {
  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>Profile Information</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div 
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              marginRight: '1rem',
              overflow: 'hidden',
              position: 'relative',
              cursor: getProfilePicture(user.email, user.name) ? 'pointer' : 'default'
            }}
            onMouseOver={(e) => {
              if (getProfilePicture(user.email, user.name)) {
                const overlay = e.currentTarget.querySelector('.zoom-overlay') as HTMLElement;
                if (overlay) overlay.style.opacity = '1';
              }
            }}
            onMouseOut={(e) => {
              const overlay = e.currentTarget.querySelector('.zoom-overlay') as HTMLElement;
              if (overlay) overlay.style.opacity = '0';
            }}
          >
            {getProfilePicture(user.email, user.name) ? (
              <img 
                src={getProfilePicture(user.email, user.name)!} 
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, opacity 0.2s ease'
                }}
                onClick={(e) => onImageClick(getProfilePicture(user.email, user.name)!, user.name, e)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 2rem;
                        font-weight: 600;
                      ">
                        ${user.name.charAt(0).toUpperCase()}
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 600
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Zoom overlay for clickable profile pictures */}
            {getProfilePicture(user.email, user.name) && (
              <div 
                className="zoom-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'none'
                }}
              >
                <div style={{
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  🔍
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#000000',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              {user.name}
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#64748b',
              margin: 0
            }}>
              {user.city && user.country ? `${user.city}, ${user.country}` : user.email}
            </p>
          </div>
        </div>

        <div style={{ color: '#374151', lineHeight: '1.6' }}>
          {user.bio && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem' }}>
                Bio:
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{user.bio}</p>
            </div>
          )}

          {user.intellectual && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem' }}>
                ബുദ്ധിജീവി ആണോ?
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{user.intellectual}</p>
            </div>
          )}

          {user.umrah && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem' }}>
                ഉംറ ചെയ്തിട്ടുണ്ടോ:
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{user.umrah}</p>
            </div>
          )}

          {user.funLover && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1rem' }}>
                ഉല്ലാസം ഇഷ്ടമാണോ?
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{user.funLover}</p>
            </div>
          )}

          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginTop: '1rem',
            border: '1px solid #d1d5db'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
              <strong>Profile Completion:</strong> {user.profileCompletion || 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Residents: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [residents, setResidents] = useState<ResidentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ResidentUser | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

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
  const [enlargedImageUser, setEnlargedImageUser] = useState<string>('');

  useEffect(() => {
    if (authLoading) {
      // Wait for auth state to be determined
      return;
    }
    
    if (!user) {
      navigate('/');
      return;
    }

    const fetchResidents = async () => {
      setLoading(true);
      try {
        // Get approved users from pendingUsers collection
        const pendingUsersRef = collection(db, 'pendingUsers');
        const pendingSnapshot = await getDocs(pendingUsersRef);
        
        const approvedUsers: ResidentUser[] = [];
        
        for (const docSnapshot of pendingSnapshot.docs) {
          const userData = docSnapshot.data();
          if (userData.approved) {
            // Get profile data for each approved user
            const profileRef = doc(db, 'profiles', userData.uid);
            const profileSnap = await getDoc(profileRef);
            
            let profileData: any = {};
            if (profileSnap.exists()) {
              profileData = profileSnap.data();
            }
            
            approvedUsers.push({
              uid: userData.uid,
              email: userData.email,
              name: profileData.name || userData.email.split('@')[0],
              bio: profileData.bio || '',
              city: profileData.city || '',
              country: profileData.country || '',
              profileCompletion: profileData.profileCompletion || 0,
              intellectual: profileData.intellectual || '',
              umrah: profileData.umrah || '',
              funLover: profileData.funLover || ''
            });
          }
        }
        
        // Sort by name
        approvedUsers.sort((a, b) => a.name.localeCompare(b.name));
        setResidents(approvedUsers);
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, [user, navigate, authLoading]);

  const goToAccount = () => {
    navigate('/account');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const goToStories = () => {
    navigate('/stories');
  };

  const handleImageClick = (imageSrc: string, userName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the profile modal
    setEnlargedImage(imageSrc);
    setEnlargedImageUser(userName);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setEnlargedImage(null);
    setEnlargedImageUser('');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading residents...</p>
        </div>
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
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '1rem 0' }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: window.innerWidth <= 768 ? '1rem' : '2rem', 
        background: '#fff', 
        borderRadius: window.innerWidth <= 768 ? 12 : 16, 
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)', 
        minHeight: window.innerWidth <= 768 ? 'calc(100vh - 2rem)' : 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: window.innerWidth <= 768 ? 16 : 24,
          flexWrap: window.innerWidth <= 480 ? 'wrap' : 'nowrap',
          gap: window.innerWidth <= 480 ? '0.5rem' : '0'
        }}>
          <img src="/newlogo.svg" alt="Logo" style={{ 
            height: window.innerWidth <= 768 ? 36 : 48,
            order: window.innerWidth <= 480 ? -1 : 0,
            width: window.innerWidth <= 480 ? '100%' : 'auto',
            maxWidth: window.innerWidth <= 480 ? '120px' : 'none',
            margin: window.innerWidth <= 480 ? '0 auto 0.5rem auto' : '0'
          }} />
          
          <div style={{ 
            display: 'flex', 
            gap: window.innerWidth <= 768 ? '0.5rem' : '1rem',
            flexWrap: window.innerWidth <= 480 ? 'wrap' : 'nowrap',
            justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-end',
            width: window.innerWidth <= 480 ? '100%' : 'auto'
          }}>
            <button 
              onClick={goToDashboard}
              style={{ 
                background: '#ffffff', 
                color: '#000000', 
                border: '1px solid #e5e7eb', 
                borderRadius: 10, 
                padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px', 
                cursor: 'pointer', 
                fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem', 
                fontWeight: 600,
                transition: 'all 0.2s ease',
                minWidth: 'fit-content'
              }}
            >
              🏠 Dashboard
            </button>
            <button 
              onClick={goToStories}
              style={{ 
                background: '#ffffff', 
                color: '#000000', 
                border: '1px solid #e5e7eb', 
                borderRadius: 10, 
                padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px', 
                cursor: 'pointer', 
                fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem', 
                fontWeight: 600,
                transition: 'all 0.2s ease',
                minWidth: 'fit-content'
              }}
            >
              📚 Stories
            </button>
            <button 
              onClick={goToProfile}
              style={{ 
                background: '#ffffff', 
                color: '#000000', 
                border: '1px solid #e5e7eb', 
                borderRadius: 10, 
                padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px', 
                cursor: 'pointer', 
                fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem', 
                fontWeight: 600,
                transition: 'all 0.2s ease',
                minWidth: 'fit-content'
              }}
            >
              👤 Profile
            </button>
            <button 
              onClick={goToAccount}
              style={{ 
                background: '#ffffff', 
                color: '#000000', 
                border: '1px solid #e5e7eb', 
                borderRadius: 10, 
                padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px', 
                cursor: 'pointer', 
                fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem', 
                fontWeight: 600,
                transition: 'all 0.2s ease',
                minWidth: 'fit-content'
              }}
            >
              ⚙️ Account
            </button>
          </div>
        </div>

        <h1 style={{ 
          fontSize: window.innerWidth <= 768 ? '1.6rem' : '2rem', 
          fontWeight: 700, 
          marginBottom: '1rem', 
          color: '#000000',
          textAlign: 'center'
        }}>
          🏠 ആശ്രമ നിവാസികൾ
        </h1>

        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <img 
            src={`${process.env.PUBLIC_URL}/muthalali.jpeg`}
            alt="Muthalali"
            style={{
              width: window.innerWidth <= 768 ? '100%' : '100%',
              maxWidth: window.innerWidth <= 768 ? '350px' : '500px',
              height: 'auto',
              borderRadius: '12px',
              objectFit: 'contain',
              border: '3px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {residents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>👥</div>
            <h3 style={{ color: '#64748b', fontSize: '1.1rem' }}>No residents found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Approved users will appear here
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            justifyItems: 'center'
          }}>
            {residents.map((resident) => (
              <div
                key={resident.uid}
                onClick={() => setSelectedUser(resident)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '200px'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  margin: '0 auto 1rem auto',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {getProfilePicture(resident.email, resident.name) ? (
                    <img 
                      src={getProfilePicture(resident.email, resident.name)!} 
                      alt={resident.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="
                              width: 100%;
                              height: 100%;
                              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              color: white;
                              font-size: 1.5rem;
                              font-weight: 600;
                            ">
                              ${resident.name.charAt(0).toUpperCase()}
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '1.5rem',
                      fontWeight: 600
                    }}>
                      {resident.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#000000',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  {resident.name}
                </h3>
                
                <p style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  margin: 0,
                  marginBottom: '0.75rem'
                }}>
                  {resident.city && resident.country ? 
                    `${resident.city}, ${resident.country}` : 
                    resident.email.split('@')[0]
                  }
                </p>
                
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  display: 'inline-block'
                }}>
                  {resident.profileCompletion}% complete
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UserProfileModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onImageClick={handleImageClick}
      />

      <ImageModal
        isOpen={imageModalOpen}
        imageSrc={enlargedImage}
        userName={enlargedImageUser}
        onClose={closeImageModal}
      />
    </div>
  );
};

export default Residents;