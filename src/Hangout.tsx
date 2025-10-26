import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hangout: React.FC = () => {
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
              Coming Soon - Redesigned Hangout Experience
            </p>
          </div>
        </div>

        {/* Placeholder Content */}
        <div style={{
          background: '#f8fafc',
          borderRadius: window.innerWidth <= 768 ? 12 : 16,
          padding: window.innerWidth <= 768 ? '3rem 1rem' : '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            color: '#94a3b8',
            marginBottom: '1rem'
          }}>
            🚧 Under Construction 🚧
          </div>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            margin: 0
          }}>
            The Hangout page is being redesigned. Check back soon for an amazing new experience!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hangout;