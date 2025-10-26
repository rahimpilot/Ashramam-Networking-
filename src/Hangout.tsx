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
          </div>
        </div>

        {/* Feature Icons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
          gap: window.innerWidth <= 768 ? '1rem' : '1.5rem',
          marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem'
        }}>
          {/* Power Group */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: window.innerWidth <= 768 ? 12 : 16,
            padding: window.innerWidth <= 768 ? '2rem 1rem' : '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #fbbf24',
            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)'
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.4rem',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
              color: '#92400e'
            }}>
              Power Group
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#78350f',
              margin: 0
            }}>
              Coming Soon
            </p>
          </div>

          {/* Minutes of Meeting */}
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: window.innerWidth <= 768 ? 12 : 16,
            padding: window.innerWidth <= 768 ? '2rem 1rem' : '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #3b82f6',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
          }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.4rem',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
              color: '#1e40af'
            }}>
              Minutes of Meeting
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#1d4ed8',
              margin: 0
            }}>
              Coming Soon
            </p>
          </div>

          {/* Royal Bank of Chandiyar */}
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            borderRadius: window.innerWidth <= 768 ? 12 : 16,
            padding: window.innerWidth <= 768 ? '2rem 1rem' : '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #16a34a',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(22, 163, 74, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.2)';
          }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
              fontWeight: 700,
              margin: '0 0 0.5rem 0',
              color: '#166534'
            }}>
              Royal Bank of Chandiyar
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#15803d',
              margin: 0
            }}>
              Coming Soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hangout;