import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hangout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      {/* Modern Mobile Header - 60px height */}
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
            onClick={() => navigate('/dashboard')}
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
            Hangout
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

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '8px'
        }}>
          {/* Power Group */}
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #FBBF24',
            boxShadow: '0 1px 3px rgba(251, 191, 36, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
          onClick={() => navigate('/power-group')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(251, 191, 36, 0.2)';
          }}
          >
            <div style={{ 
              fontSize: '48px', 
              lineHeight: 1,
              flexShrink: 0 
            }}>⚡</div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '1.3',
                margin: '0 0 4px 0',
                color: '#92400E'
              }}>
                Power Group
              </h3>
              <p style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.4',
                color: '#78350F',
                margin: 0
              }}>
                Rich and Naughty
              </p>
            </div>
          </div>

          {/* Minutes of Meeting */}
          <div style={{
            background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #3B82F6',
            boxShadow: '0 1px 3px rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
          onClick={() => navigate('/meeting-minutes')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.2)';
          }}
          >
            <div style={{ 
              fontSize: '48px', 
              lineHeight: 1,
              flexShrink: 0 
            }}>📝</div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '1.3',
                margin: '0',
                color: '#1E40AF'
              }}>
                Minutes of Meeting
              </h3>
            </div>
          </div>

          {/* Royal Bank of Chandiyar */}
          <div style={{
            background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #16A34A',
            boxShadow: '0 1px 3px rgba(22, 163, 74, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
          onClick={() => navigate('/royal-bank')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(22, 163, 74, 0.2)';
          }}
          >
            <div style={{ 
              fontSize: '48px', 
              lineHeight: 1,
              flexShrink: 0 
            }}>🏦</div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '1.3',
                margin: '0 0 4px 0',
                color: '#166534'
              }}>
                Royal Bank of Chandiyar
              </h3>
              <p style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.4',
                color: '#15803D',
                margin: 0
              }}>
                Apply for financial assistance to enjoy life
              </p>
            </div>
          </div>

          {/* Happening Now */}
          <div style={{
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #DC2626',
            boxShadow: '0 1px 3px rgba(220, 38, 38, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
          onClick={() => navigate('/voice-room')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(220, 38, 38, 0.2)';
          }}
          >
            <div style={{ 
              fontSize: '48px', 
              lineHeight: 1,
              flexShrink: 0 
            }}>🔥</div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '1.3',
                margin: '0 0 4px 0',
                color: '#991B1B'
              }}>
                Happening Now
              </h3>
              <p style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.4',
                color: '#B91C1C',
                margin: 0
              }}>
                Join Voice Chat
              </p>
            </div>
          </div>

          {/* Our Trips */}
          <div style={{
            background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #A855F7',
            boxShadow: '0 1px 3px rgba(168, 85, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
          onClick={() => navigate('/our-trips')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(168, 85, 247, 0.2)';
          }}
          >
            <div style={{ 
              fontSize: '48px', 
              lineHeight: 1,
              flexShrink: 0 
            }}>✈️</div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '1.3',
                margin: '0 0 4px 0',
                color: '#6B21A8'
              }}>
                Our Trips
              </h3>
              <p style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.4',
                color: '#7E22CE',
                margin: 0
              }}>
                Share travel experiences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hangout;