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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 16,
        cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <div style={{
        position: 'relative',
        maxWidth: 'min(90vw, 480px)',
        maxHeight: '90vh',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 600,
            zIndex: 1,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
        >
          ✕
        </button>
        <img 
          src={imageSrc}
          alt={userName}
          style={{
            maxWidth: 'min(400px, calc(90vw - 32px))',
            maxHeight: 'min(400px, calc(90vh - 64px))',
            width: 'auto',
            height: 'auto',
            borderRadius: 8,
            objectFit: 'cover'
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <p style={{
          textAlign: 'center',
          marginTop: 12,
          fontSize: 16,
          fontWeight: 600,
          color: '#050505',
          margin: '12px 0 0 0'
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
      padding: 16
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        maxWidth: 480,
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E4E6EA'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#050505',
            margin: 0
          }}>Profile Information</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#65676B',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <div 
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              marginRight: 16,
              overflow: 'hidden',
              position: 'relative',
              cursor: getProfilePicture(user.email, user.name) ? 'pointer' : 'default',
              border: '2px solid #E4E6EA'
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
                        background: linear-gradient(135deg, #1877F2 0%, #166FE5 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 32px;
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
                background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: 32,
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
                  fontSize: 24,
                  fontWeight: 600
                }}>
                  🔍
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#050505',
              margin: 0,
              marginBottom: 4
            }}>
              {user.name}
            </h3>
            <p style={{
              fontSize: 14,
              color: '#65676B',
              margin: 0
            }}>
              {user.city && user.country ? `${user.city}, ${user.country}` : user.email}
            </p>
          </div>
        </div>

        <div style={{ color: '#050505', lineHeight: 1.4 }}>
          {user.bio && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ 
                color: '#050505', 
                marginBottom: 8, 
                fontSize: 14,
                fontWeight: 600
              }}>
                Bio:
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: 14,
                color: '#65676B'
              }}>{user.bio}</p>
            </div>
          )}

          {user.intellectual && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ 
                color: '#050505', 
                marginBottom: 8, 
                fontSize: 14,
                fontWeight: 600
              }}>
                ബുദ്ധിജീവി ആണോ?
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: 14,
                color: '#65676B'
              }}>{user.intellectual}</p>
            </div>
          )}

          {user.umrah && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ 
                color: '#050505', 
                marginBottom: 8, 
                fontSize: 14,
                fontWeight: 600
              }}>
                ഉംറ ചെയ്തിട്ടുണ്ടോ:
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: 14,
                color: '#65676B'
              }}>{user.umrah}</p>
            </div>
          )}

          {user.funLover && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ 
                color: '#050505', 
                marginBottom: 8, 
                fontSize: 14,
                fontWeight: 600
              }}>
                ഉല്ലാസം ഇഷ്ടമാണോ?
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: 14,
                color: '#65676B'
              }}>{user.funLover}</p>
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48,
            height: 48,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #FFFFFF',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ 
            color: '#FFFFFF', 
            fontSize: 16,
            fontWeight: 500,
            margin: 0
          }}>Loading residents...</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48,
            height: 48,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #FFFFFF',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ 
            color: '#FFFFFF', 
            fontSize: 16,
            fontWeight: 500,
            margin: 0
          }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Modern Header */}
      <div style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderBottom: '1px solid #E4E6EA',
        height: 60
      }}>
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px'
        }}>
          <button
            onClick={goToDashboard}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              width: 36,
              height: 36
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 20 }}>←</span>
          </button>
          
          <h1 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#050505'
          }}>
            People
          </h1>

          <button
            onClick={goToProfile}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              width: 36,
              height: 36
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 20 }}>👤</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: 480, 
        margin: '0 auto', 
        paddingTop: 16
      }}>

        {/* Muthalali Section */}
        <div style={{ 
          background: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: 18, 
            fontWeight: 600, 
            marginBottom: 12, 
            color: '#050505',
            textAlign: 'center'
          }}>
            🏠 ആശ്രമ നിവാസികൾ
          </h2>

          <div style={{ 
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img 
              src={`${process.env.PUBLIC_URL}/muthalali.jpeg`}
              alt="Muthalali"
              style={{
                width: '100%',
                maxWidth: 350,
                height: 'auto',
                borderRadius: 12,
                objectFit: 'contain',
                border: '2px solid #E4E6EA',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        </div>

        {residents.length === 0 ? (
          <div style={{ 
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>👥</div>
            <h3 style={{ 
              color: '#65676B', 
              fontSize: 16,
              fontWeight: 600,
              margin: '0 0 8px 0'
            }}>No residents found</h3>
            <p style={{ 
              color: '#65676B', 
              fontSize: 14,
              margin: 0
            }}>
              Approved users will appear here
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            paddingBottom: 80
          }}>
            {residents.map((resident) => (
              <div
                key={resident.uid}
                onClick={() => setSelectedUser(resident)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E6EA',
                  borderRadius: 12,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  margin: '0 auto 12px auto',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '2px solid #E4E6EA'
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
                              background: linear-gradient(135deg, #1877F2 0%, #166FE5 100%);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              color: white;
                              font-size: 24px;
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
                      background: 'linear-gradient(135deg, #1877F2 0%, #166FE5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: 24,
                      fontWeight: 600
                    }}>
                      {resident.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#050505',
                  margin: 0,
                  marginBottom: 4
                }}>
                  {resident.name}
                </h3>
                
                <p style={{
                  fontSize: 12,
                  color: '#65676B',
                  margin: 0,
                  marginBottom: 8
                }}>
                  {resident.city && resident.country ? 
                    `${resident.city}, ${resident.country}` : 
                    resident.email.split('@')[0]
                  }
                </p>
                
                <div style={{
                  fontSize: 11,
                  color: '#65676B',
                  padding: '4px 8px',
                  backgroundColor: '#F8F9FA',
                  borderRadius: 12,
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