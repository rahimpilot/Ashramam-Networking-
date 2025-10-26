import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hangout: React.FC = () => {
  const navigate = useNavigate();

  const powerGroupMembers = [
    { name: 'Raimu Hassan', email: 'raimu456@gmail.com', role: 'Community Leader', avatar: '/raimu.jpg' },
    { name: 'Hyder Mohamed', email: 'hyder.mohamed@gmail.com', role: 'Tech Innovator', avatar: '/hyder.JPG' },
    { name: 'Bruno', email: 'mzmhmd@gmail.com', role: 'Visionary', avatar: '/bruno.png' },
    { name: 'Nias Ahamed', email: 'nias.ahamad@gmail.com', role: 'Strategic Advisor', avatar: '/nias.jpg' },
    { name: 'Shanir', email: 'mshanir@gmail.com', role: 'Creative Director', avatar: '/shanir.jpeg' }
  ];

  const viewUserProfile = (email: string, name: string) => {
    // Navigate to profile page or show profile modal
    navigate('/profile');
  };

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
            <div style={{
              fontSize: window.innerWidth <= 768 ? '3rem' : '4rem',
              marginBottom: '1rem'
            }}>
              🍸
            </div>
            <h1 style={{
              fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              color: '#1f2937'
            }}>
              Hangout
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#64748b',
              margin: 0,
              maxWidth: '400px'
            }}>
              Connect, share, and build community together.
            </p>
          </div>
        </div>

        {/* Power Group Section */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: window.innerWidth <= 768 ? 12 : 16,
          padding: window.innerWidth <= 768 ? '2rem 1rem' : '3rem 2rem',
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          border: '2px solid #fbbf24',
          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexDirection: 'column',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '3rem' }}>⚡</span>
            <h2 style={{
              fontSize: window.innerWidth <= 768 ? '1.5rem' : '1.8rem',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
              color: '#92400e'
            }}>
              Power Group
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#78350f',
              margin: '0 0 1rem 0',
              fontWeight: 500
            }}>
              Exclusive community of leaders and innovators
            </p>
          </div>

          {/* Members Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#92400e',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Members ({powerGroupMembers.length})
            </h3>

            {/* Power Group Members */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {powerGroupMembers.map((member, index) => (
                <div
                  key={member.email}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => viewUserProfile(member.email, member.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #fbbf24',
                    flexShrink: 0
                  }}>
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 1.5rem; font-weight: 600;">
                              ${member.name.charAt(0).toUpperCase()}
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        fontWeight: 600
                      }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      color: '#1e293b',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}>
                      {member.name}
                    </h4>
                    <p style={{
                      margin: '0 0 0.25rem 0',
                      color: '#64748b',
                      fontSize: '0.85rem'
                    }}>
                      {member.role}
                    </p>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      <span>⚡</span>
                      Power Member
                    </div>
                  </div>

                  <div style={{
                    color: '#64748b',
                    fontSize: '1.2rem'
                  }}>
                    →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Power Group Stats */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: '#ffffff',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.3rem',
              fontWeight: 700
            }}>
              Group Statistics
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{powerGroupMembers.length}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Members</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>24/7</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Active</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>∞</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Potential</div>
              </div>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              opacity: 0.9,
              lineHeight: '1.4'
            }}>
              "United in purpose, driven by excellence, shaping the future together."
            </p>
          </div>
        </div>

        {/* Additional Features Placeholder */}
        <div style={{
          background: '#f8fafc',
          borderRadius: window.innerWidth <= 768 ? 12 : 16,
          padding: window.innerWidth <= 768 ? '2rem 1rem' : '3rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            color: '#94a3b8',
            marginBottom: '1rem'
          }}>
            🚧 More Features Coming Soon 🚧
          </div>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            margin: 0
          }}>
            Additional hangout features and groups will be added here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hangout;