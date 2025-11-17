import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface MemberData {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  bio: string;
  detailedBio: string;
  achievements?: string[];
  interests?: string[];
}

// Member data - You can add detailed content here
const memberDataMap: { [key: string]: MemberData } = {
  'niaz-kamaru': {
    id: 'niaz-kamaru',
    name: 'Niaz Kamaru',
    email: 'niaznasu@gmail.com',
    profilePicture: '/niaz.jpeg',
    bio: 'Power Group Member',
    detailedBio: `Detailed biography and information about Niaz Kamaru will be added here. 
    
    This section will contain comprehensive information about his background, achievements, contributions to the community, and personal journey.`,
    achievements: [
      'Achievement 1 - To be added',
      'Achievement 2 - To be added',
      'Achievement 3 - To be added'
    ],
    interests: [
      'Interest 1',
      'Interest 2',
      'Interest 3'
    ]
  },
  'shanir-musliyamveetil': {
    id: 'shanir-musliyamveetil',
    name: 'Shanir Musliyamveetil',
    email: 'mshanir@gmail.com',
    profilePicture: '/shanir.jpeg',
    bio: 'Power Group Member',
    detailedBio: 'Detailed biography will be added later.',
    achievements: [],
    interests: []
  },
  'hyder-mohamed': {
    id: 'hyder-mohamed',
    name: 'Hyder Mohamed',
    email: 'hyder.mohamed@gmail.com',
    profilePicture: '/hyder.JPG',
    bio: 'Power Group Member',
    detailedBio: 'Detailed biography will be added later.',
    achievements: [],
    interests: []
  }
};

const PowerGroupMemberProfile: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  
  const member = memberId ? memberDataMap[memberId] : null;

  if (!member) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: 500,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 20,
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Member Not Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            The member you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/power-group')}
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
          >
            ← Back to Power Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: window.innerWidth <= 768 ? '1rem 0.5rem' : '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '0 0.5rem' : '0'
      }}>
        {/* Header with Logo */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: window.innerWidth <= 768 ? 16 : 20,
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem'
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
            fontSize: window.innerWidth <= 768 ? '1.75rem' : '2.25rem',
            fontWeight: 700,
            margin: 0,
            color: '#1f2937'
          }}>
            Power Group Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: window.innerWidth <= 768 ? 16 : 20,
          padding: window.innerWidth <= 768 ? '2rem 1.5rem' : '3rem',
          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
          border: '2px solid #fbbf24',
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem'
        }}>
          {/* Profile Picture Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              <img
                src={member.profilePicture}
                alt={member.name}
                style={{
                  width: window.innerWidth <= 768 ? '150px' : '200px',
                  height: window.innerWidth <= 768 ? '150px' : '200px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #fbbf24',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div style="
                      width: ${window.innerWidth <= 768 ? '150px' : '200px'};
                      height: ${window.innerWidth <= 768 ? '150px' : '200px'};
                      border-radius: 50%;
                      background: linear-gradient(135deg, #f59e0b, #d97706);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 5rem;
                      border: 4px solid #fbbf24;
                      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                    ">👤</div>
                  `;
                }}
              />
              
              {/* Gold Crown Badge */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '10px',
                fontSize: '2.5rem',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
              }}>
                👑
              </div>
            </div>

            <h2 style={{
              fontSize: window.innerWidth <= 768 ? '1.75rem' : '2.25rem',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
              color: '#92400e'
            }}>
              {member.name}
            </h2>

            <p style={{
              fontSize: window.innerWidth <= 768 ? '0.95rem' : '1.1rem',
              color: '#b45309',
              margin: 0
            }}>
              {member.email}
            </p>
          </div>

          {/* Detailed Biography Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 12,
            padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
              fontWeight: 600,
              color: '#92400e',
              marginBottom: '1rem'
            }}>
              About
            </h3>
            <p style={{
              fontSize: window.innerWidth <= 768 ? '0.95rem' : '1.05rem',
              color: '#78350f',
              lineHeight: '1.7',
              margin: 0,
              whiteSpace: 'pre-line'
            }}>
              {member.detailedBio}
            </p>
          </div>

          {/* Achievements Section */}
          {member.achievements && member.achievements.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 12,
              padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
                fontWeight: 600,
                color: '#92400e',
                marginBottom: '1rem'
              }}>
                🏆 Achievements
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {member.achievements.map((achievement, index) => (
                  <li key={index} style={{
                    fontSize: window.innerWidth <= 768 ? '0.95rem' : '1.05rem',
                    color: '#78350f',
                    marginBottom: '0.75rem',
                    paddingLeft: '1.5rem',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0
                    }}>✓</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interests Section */}
          {member.interests && member.interests.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 12,
              padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem'
            }}>
              <h3 style={{
                fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
                fontWeight: 600,
                color: '#92400e',
                marginBottom: '1rem'
              }}>
                💡 Interests
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                {member.interests.map((interest, index) => (
                  <span key={index} style={{
                    background: 'rgba(251, 191, 36, 0.3)',
                    color: '#92400e',
                    padding: '0.5rem 1rem',
                    borderRadius: 20,
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div style={{
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/power-group')}
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
            ← Back to Power Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerGroupMemberProfile;
