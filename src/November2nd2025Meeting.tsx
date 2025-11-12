import React from 'react';
import { useNavigate } from 'react-router-dom';

const November2nd2025Meeting: React.FC = () => {
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
              November 2nd 2025
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
              1. The Late Meeting Host - Marzooq Mohammed
            </h3>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              The meeting host was late as usual — none other than Marzooq Mohammed — and started blabbering as usual as soon as he joined. He gave some instructions about the upcoming trip and also blabbered about stories from his past adventurous trips. During that time, I noticed that the other participants had placed their microphones on mute, which was obvious.
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
              2. Rare Guest Appearance - Asif Madheena
            </h3>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              This time, we had a guest who hardly ever joins this Sunday meeting: his name is Asif Madheena. He tries to skip the meeting most of the time, providing random and ridiculous excuses such as visiting relatives, attending a grama event, going to theevandi rehearsals, visiting Black friends in Deira, etc. (We have learned enough not to fall for these stupid trap excuses anymore.) Another excuse he gives is about his "family man" life, which is utterly bullshit. Let's keep that topic aside.
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
              3. Punctual Participant - Anas Ismail
            </h3>
            <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
              Anas Ismail was another punctual participant in this meeting. He was obviously managing his staff at the chicken shop and cutting several chicken thighs while wearing his white coat (just like a scientist in a lab) and attending the meeting. I was so proud to see his dedication toward this meeting while other motherfuckers fled without attending. He was also speaking to his staff, customers, and chicken distributors in English, Malayalam, Hindi, Arabic, Tulu, Konkani, and Kannada — all in Kallur accent.
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
              That's all for the minutes. If anything is missing, feel free to approach the admin, who can update the content accordingly.
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

export default November2nd2025Meeting;