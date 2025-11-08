import React from 'react';
import { useNavigate } from 'react-router-dom';

const MeetingMinutes: React.FC = () => {
  const navigate = useNavigate();

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
              Minutes of Meeting
            </h1>
          </div>
        </div>

        {/* Meeting Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: window.innerWidth <= 768 ? 16 : 20,
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* September 7th 2025 Meeting Tile */}
          <div style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            borderRadius: window.innerWidth <= 768 ? 12 : 16,
            padding: window.innerWidth <= 768 ? '2rem 1rem' : '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #6366f1',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            marginBottom: '1rem'
          }}
          onClick={() => navigate('/meeting-minutes/september-7th-2025')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
          }}
          >
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.4rem' : '1.6rem',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
              color: '#4f46e5'
            }}>
              September 7th 2025
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#4f46e5',
              margin: 0,
              fontWeight: 500
            }}>
              Meeting minutes and discussions
            </p>
          </div>

          {/* October 5th 2025 Meeting Tile */}
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: window.innerWidth <= 768 ? 12 : 16,
            padding: window.innerWidth <= 768 ? '2rem 1rem' : '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #3b82f6',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
            marginBottom: '1rem'
          }}
          onClick={() => navigate('/meeting-minutes/october-5th-2025')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
          }}
          >
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.4rem' : '1.6rem',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
              color: '#1e40af'
            }}>
              October 5th 2025
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#1d4ed8',
              margin: 0,
              fontWeight: 500
            }}>
              Meeting minutes and discussions
            </p>
          </div>
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

export default MeetingMinutes;