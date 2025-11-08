import React from 'react';
import { useNavigate } from 'react-router-dom';

const September7th2025Meeting: React.FC = () => {
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
              September 7th 2025
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
              Participants
            </h3>
            <ul style={{
              margin: '0.5rem 0',
              fontSize: '0.95rem',
              paddingLeft: '1.5rem'
            }}>
              <li>Bruno</li>
              <li>Niyaz kamaru</li>
              <li>2k rapper vedan friends riyaz ummer</li>
              <li>Myself</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#1f2937',
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              Points to Remember
            </h3>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#374151',
              marginTop: 0,
              marginBottom: '0.5rem'
            }}>
              1. Marzook's Alps Adventure
            </h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              Marzook Mohammed is going for a adventure trip at alps Mouton mountain where he is performing 5 days trek alone during the freezing winter. This trip would allow him to find inner peace of himself as he claims. 95 percent trippers died in that mountain but our friend Marzook will succeed
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#374151',
              marginTop: 0,
              marginBottom: '0.5rem'
            }}>
              2. Niyaz Kamaru - Audio Issues
            </h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              Niyaz kamaru joined with a random copy Bluetooth apple airpod and his device was giving noise like a pressure cooker. He was unable to speak
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#374151',
              marginTop: 0,
              marginBottom: '0.5rem'
            }}>
              3. Riyaz Ummer's Relocation
            </h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              Riyaz ummer moved to kengeri which is 100 kms from Bangalore and close to udumalpet there he don have 3G network. His speeches where being delivered after the meeting. Technically he couldn't speak
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#374151',
              marginTop: 0,
              marginBottom: '0.5rem'
            }}>
              4. Marzook Chandy & Priven - Scotland Road Trip
            </h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              Marzook chaandy and priven going on a road trip to Scotland next month. Basically a van trip and that's the highlight of this meeting
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#374151',
              marginTop: 0,
              marginBottom: '0.5rem'
            }}>
              5. Bruno's Big Move to America
            </h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              The final point but least our friend Bruno is moving to America to work and live with his gal friend (no consent provided by his trippy dad. He is very a angry on him and meanwhile Spidey is trying to sneak to his family so that his dad will give away few land to him
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
              That's all
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

export default September7th2025Meeting;