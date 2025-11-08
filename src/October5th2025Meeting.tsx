import React from 'react';
import { useNavigate } from 'react-router-dom';

const October5th2025Meeting: React.FC = () => {
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
            <h1 style={{
              fontSize: window.innerWidth <= 768 ? '2.2rem' : '3rem',
              fontWeight: 700,
              margin: '0',
              color: '#1f2937'
            }}>
              October 5th 2025
            </h1>
          </div>
        </div>

        {/* Meeting Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: window.innerWidth <= 768 ? 16 : 20,
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          lineHeight: 1.8,
          color: '#374151'
        }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.5rem',
            fontWeight: 600,
            marginTop: 0,
            marginBottom: '1.5rem',
            color: '#1f2937'
          }}>
            Meeting Minutes
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              1. Opening Remarks - Special Meeting with Limited Members
            </h3>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              The meeting today was very special since we had only 2 members today henceforth starting this minute by thanking that mother fucker host named Marzook. He created the link for next 10 years and ghosted us (felt really lonely)
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              2. Eye Father's Update - Return from Kerala
            </h3>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              The only member joined was Eye father who just got back from Kerala last night resumed his work right away where in he changed his working dress from abudhabi international airport arrival and proceeded to his farm. He shared his experiences during his holidays in kerala and the kind of jobs / roles handled such as Nabidina speaker, Car mechanic, Airport drops including Dua, Duck feeding and rally etc. He recently did a servicing for a hyson ambulance during their trip to pick up a body from medical college. Eye father had to stop the servicing in between after realizing his flight schedule then got away. The ambulance is still stuck at is garage and picking up the body is still due for them.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              3. Illi's Update - Miscall from China
            </h3>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              Illi gave a miscall 5 AM in their local time after the party in china. Illi is currently passing beer instead of urine as we heard.
            </p>
          </div>

          <div style={{
            borderTop: '2px solid #e5e7eb',
            paddingTop: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <p style={{
              fontSize: '0.95rem',
              fontStyle: 'italic',
              color: '#6b7280',
              margin: 0
            }}>
              That's all about today and once again thanking the kunna host for his irresponsibility.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div style={{
          textAlign: 'center',
          marginTop: window.innerWidth <= 768 ? '1.5rem' : '2rem'
        }}>
          <button
            onClick={() => navigate('/meeting-minutes')}
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
            ← Back to Minutes of Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default October5th2025Meeting;