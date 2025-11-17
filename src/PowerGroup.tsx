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

const PowerGroup: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile pictures mapping
  const profilePictureMap: { [key: string]: string } = {
    'niaznasu@gmail.com': '👤',
    'mshanir@gmail.com': '👨',
    'hyder.mohamed@gmail.com': '🧔'
  };

  // Name mapping for Power Group members
  const nameMap: { [key: string]: string } = {
    'niaznasu@gmail.com': 'Niaz Kamaru',
    'mshanir@gmail.com': 'Shanir Musliyamveetil',
    'hyder.mohamed@gmail.com': 'Hyder Mohamed'
  };

  const emailsToFetch = ['niaznasu@gmail.com', 'mshanir@gmail.com', 'hyder.mohamed@gmail.com'];

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
              bio: doc.data().bio || '',
              profilePicture: profilePictureMap[email] || '👤',
              location: doc.data().location || '',
              joinedDate: doc.data().joinedDate || ''
            });
          } else {
            // Create a default profile if user doesn't exist
            membersList.push({
              id: email,
              email: email,
              displayName: nameMap[email] || email.split('@')[0],
              bio: '',
              profilePicture: profilePictureMap[email] || '👤',
              location: '',
              joinedDate: ''
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: window.innerWidth <= 768 ? '1rem 0.5rem' : '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '0 0.5rem' : '0'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: window.innerWidth <= 768 ? 16 : 20,
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center'
          }}>
            {/* Logo */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem',
              width: '100%'
            }}>
              <img
                src="/newlogo.svg"
                alt="Ashramam Vibes Logo"
                style={{
                  height: window.innerWidth <= 768 ? '48px' : '64px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))'
                }}
              />
            </div>
            <h1 style={{
              fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              color: '#1f2937'
            }}>
              Power Group
            </h1>
            <p style={{
              fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
              color: '#6b7280',
              margin: 0
            }}>
              Elite members of the community
            </p>
          </div>
        </div>

        {/* Members Grid */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: window.innerWidth <= 768 ? 16 : 20,
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
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
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: window.innerWidth <= 768 ? '1rem' : '1.5rem'
            }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: window.innerWidth <= 768 ? 12 : 16,
                    padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                    textAlign: 'center',
                    border: '2px solid #fbbf24',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.2)';
                  }}
                >
                  {/* Profile Picture with Wealth Indicators */}
                  <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>
                    {/* Main Avatar */}
                    <div style={{
                      fontSize: '3.5rem'
                    }}>
                      {member.profilePicture}
                    </div>
                    
                    {/* Gold Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      fontSize: '1.8rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      animation: 'pulse 2s infinite'
                    }}>
                      💰
                    </div>

                    {/* Money Bag Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-5px',
                      left: '-5px',
                      fontSize: '1.8rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      animation: 'pulse 2s infinite 0.3s'
                    }}>
                      💵
                    </div>
                  </div>

                  {/* Name */}
                  <h3 style={{
                    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
                    fontWeight: 700,
                    margin: '0 0 0.5rem 0',
                    color: '#92400e'
                  }}>
                    {member.displayName}
                  </h3>

                  {/* Email */}
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#b45309',
                    margin: '0 0 0.75rem 0',
                    wordBreak: 'break-all'
                  }}>
                    {member.email}
                  </p>

                  {/* Bio */}
                  {member.bio && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#78350f',
                      margin: 0
                    }}>
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div style={{
          textAlign: 'center',
          marginTop: window.innerWidth <= 768 ? '1.5rem' : '2rem'
        }}>
          <button
            onClick={() => navigate('/hangout')}
            style={{
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 25,
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
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