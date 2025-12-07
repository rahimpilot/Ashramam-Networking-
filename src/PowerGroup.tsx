import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Add keyframe animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
  joinedDate?: string;
}

interface Group {
  id: number;
  title: string;
  members: number;
  icon: string;
  color: string;
  mutual: number;
}

const PowerGroup: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile pictures mapping
  const profilePictureMap: { [key: string]: string } = {
    'niaznasu@gmail.com': '👤',
    'mshanir@gmail.com': '👨',
    'hyder.mohamed@gmail.com': '🧔',
    'mohasinali@gmail.com': '👨‍💼'
  };

  // Name mapping for Power Group members
  const nameMap: { [key: string]: string } = {
    'niaznasu@gmail.com': 'Niaz Kamaru',
    'mshanir@gmail.com': 'Shanir Musliyamveetil',
    'hyder.mohamed@gmail.com': 'Hyder Mohamed',
    'mohasinali@gmail.com': 'Mohasin Ali'
  };

  // Member ID mapping for routing
  const memberIdMap: { [key: string]: string } = {
    'niaznasu@gmail.com': 'niaz-kamaru',
    'mshanir@gmail.com': 'shanir-musliyamveetil',
    'hyder.mohamed@gmail.com': 'hyder-mohamed',
    'mohasinali@gmail.com': 'mohasin-ali'
  };

  // Mock groups data based on design spec
  const suggestedGroups: Group[] = [
    { id: 1, title: 'Lightning Fast Team', members: 256, icon: '⚡', color: '#FF9800', mutual: 72 },
    { id: 2, title: 'Would You Rather', members: 256, icon: '❓', color: '#FF9800', mutual: 63 },
    { id: 3, title: 'Drop a pic of your pet', members: 256, icon: '🐶', color: '#4CAF50', mutual: 72 },
    { id: 4, title: 'Climate Change', members: 256, icon: '🌍', color: '#4CAF50', mutual: 0 },
    { id: 5, title: 'Gym & Fitness', members: 256, icon: '🏋️', color: '#FFEB3B', mutual: 0 },
  ];

  const emailsToFetch = ['niaznasu@gmail.com', 'mshanir@gmail.com', 'hyder.mohamed@gmail.com', 'mohasinali@gmail.com'];

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        
        const membersList: UserProfile[] = [];

        for (const email of emailsToFetch) {
          const q = query(usersRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            membersList.push({
              id: doc.id,
              email: doc.data().email,
              displayName: nameMap[email] || doc.data().displayName || email.split('@')[0],
              bio: doc.data().bio || 'Bookworm with a passion for community',
              profilePicture: profilePictureMap[email] || '👤',
              location: doc.data().location || 'Seattle, WA',
              joinedDate: doc.data().joinedDate || 'May 5'
            });
          } else {
            // Create a default profile if user doesn't exist
            membersList.push({
              id: email,
              email: email,
              displayName: nameMap[email] || email.split('@')[0],
              bio: 'Bookworm with a passion for community',
              profilePicture: profilePictureMap[email] || '👤',
              location: 'Seattle, WA',
              joinedDate: 'May 5'
            });
          }
        }

        setMembers(membersList);
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFriend = (member: UserProfile) => {
    // Placeholder for add friend action
    console.log('Add friend:', member.displayName);
  };

  const handleMessage = (member: UserProfile) => {
    // Placeholder for message action
    console.log('Message:', member.displayName);
  };

  const handleJoinGroup = (group: Group) => {
    // Placeholder for join group action
    console.log('Join group:', group.title);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F8FF',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Status Bar Mock */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1rem',
        color: '#666',
        fontSize: '0.875rem'
      }}>
        <span>9:41</span>
        <span>⚡📶</span>
      </div>

      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        animation: 'fadeIn 0.3s ease'
      }}>
        {/* Groups Section */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 0 0.25rem 0',
              color: '#1f2937'
            }}>
              Groups
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#999',
              margin: '0 0 0.5rem 0'
            }}>
              Public groups {suggestedGroups.length}
            </p>
            <button
              onClick={() => console.log('See all groups')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2196F3',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              See all
            </button>
          </div>

          {/* Groups Cards */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            paddingBottom: '1rem'
          }}>
            {suggestedGroups.map((group, index) => (
              <div
                key={group.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  animation: `slideUp 0.3s ease ${index * 0.05}s forwards`,
                  opacity: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: group.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0
                  }}
                >
                  {group.icon}
                </div>

                {/* Group Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: '0 0 0.25rem 0',
                    color: '#1f2937'
                  }}>
                    {group.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {group.members} members
                  </p>
                  {group.mutual > 0 && (
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#4CAF50',
                      margin: 0
                    }}>
                      {group.mutual} friends are members
                    </p>
                  )}
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinGroup(group)}
                  style={{
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1976D2';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2196F3';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Friends Section */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0',
              color: '#1f2937'
            }}>
              Suggested Friends
            </h2>
          </div>

          {/* Friends Cards */}
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p>Loading members...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#ef4444'
            }}>
              <p>{error}</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              paddingBottom: '1rem'
            }}>
              {members.map((member, index) => (
                <div
                  key={member.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: `slideUp 0.3s ease ${(suggestedGroups.length + index) * 0.05}s forwards`,
                    opacity: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Profile Photo */}
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#E0E7FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedProfile(member);
                      setShowProfileModal(true);
                    }}
                  >
                    {member.profilePicture}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.25rem 0',
                      color: '#1f2937'
                    }}>
                      {member.displayName}
                    </h3>
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#666',
                      margin: '0 0 0.25rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {member.bio}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      margin: 0
                    }}>
                      📍 {member.location}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => handleAddFriend(member)}
                      style={{
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1976D2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2196F3';
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => handleMessage(member)}
                      style={{
                        background: '#E8E8E8',
                        color: '#333',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#D0D0D0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#E8E8E8';
                      }}
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Modal */}
        {showProfileModal && selectedProfile && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'flex-end',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease'
            }}
            onClick={() => setShowProfileModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px 16px 0 0',
                width: '100%',
                maxHeight: '80vh',
                padding: '1.5rem',
                overflow: 'auto',
                animation: 'slideUp 0.3s ease'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ←
              </button>

              {/* Profile Photo */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#E0E7FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem'
                  }}
                >
                  {selectedProfile.profilePicture}
                </div>
              </div>

              {/* Name */}
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
                margin: '0 0 0.5rem 0',
                color: '#1f2937'
              }}>
                {selectedProfile.displayName}
              </h2>

              {/* Bio */}
              <p style={{
                fontSize: '0.95rem',
                textAlign: 'center',
                color: '#666',
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                {selectedProfile.bio}
              </p>

              {/* Location */}
              <p style={{
                fontSize: '0.875rem',
                textAlign: 'center',
                color: '#999',
                margin: '0 0 1.5rem 0'
              }}>
                📍 {selectedProfile.location}
              </p>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  onClick={() => {
                    handleAddFriend(selectedProfile);
                    setShowProfileModal(false);
                  }}
                  style={{
                    flex: 1,
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1976D2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2196F3';
                  }}
                >
                  Add friend
                </button>
                <button
                  onClick={() => {
                    handleMessage(selectedProfile);
                    setShowProfileModal(false);
                  }}
                  style={{
                    flex: 1,
                    background: 'none',
                    color: '#2196F3',
                    border: '2px solid #2196F3',
                    borderRadius: '20px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E3F2FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem 1rem 1rem'
        }}>
          <button
            onClick={() => navigate('/hangout')}
            style={{
              background: '#1f2937',
              color: '#ffffff',
              border: 'none',
              borderRadius: '25px',
              padding: '0.75rem 2rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
          >
            ← Back to Hangout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerGroup;