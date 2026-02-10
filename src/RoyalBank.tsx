import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoanApplicationForm from './LoanApplicationForm';

const RoyalBank: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Back Button */}
      <div style={{
        padding: window.innerWidth <= 768 ? '1rem 0.5rem' : '1.5rem 1rem',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <button
          onClick={() => navigate('/hangout')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#4a4a4a'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Banner Section */}
      <div style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #3d3d3d 50%, #4a4a4a 100%)',
        padding: window.innerWidth <= 768 ? '3rem 1rem' : '4rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1
        }}>
          {/* Bank Icon */}
          <div style={{
            fontSize: window.innerWidth <= 768 ? '4rem' : '5rem',
            marginBottom: '1.5rem'
          }}>
            🏦
          </div>

          {/* Bank Name */}
          <h1 style={{
            fontSize: window.innerWidth <= 768 ? '2rem' : '3rem',
            fontWeight: 800,
            margin: '0 0 1rem 0',
            color: '#ffffff',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}>
            Royal Bank of Chaandiyar
          </h1>

          {/* Tagline */}
          <p style={{
            fontSize: window.innerWidth <= 768 ? '1rem' : '1.3rem',
            fontStyle: 'italic',
            color: '#e8e8e8',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontWeight: 500
          }}>
            Where money meets leisure and pleasure
          </p>

          {/* Subtitle */}
          <p style={{
            fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
            color: '#d0d0d0',
            margin: '1rem 0 0 0',
            letterSpacing: '0.5px'
          }}>
            Your Gateway to Financial Freedom
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: window.innerWidth <= 768 ? '1.5rem 0.5rem' : '2rem 1rem'
      }}>
        {/* About Bank */}
        <div style={{
          background: '#eeeeee',
          borderLeft: '5px solid #4a4a4a',
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.6rem',
            fontWeight: 700,
            color: '#2a2a2a',
            margin: '0 0 1rem 0'
          }}>
            About Us
          </h2>
          <p style={{
            fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
            color: '#374151',
            lineHeight: 1.6,
            margin: 0
          }}>
            Welcome to the Royal Bank of Chaandiyar, where we believe banking should enhance your lifestyle rather than complicate it. We're committed to providing financial solutions that balance growth with leisure, allowing you to enjoy life while building wealth for your future.
          </p>
        </div>

        {/* Services Grid */}
        <h2 style={{
          fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.6rem',
          fontWeight: 700,
          color: '#2a2a2a',
          margin: '0 0 1.5rem 0'
        }}>
          Our Services
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
          gap: window.innerWidth <= 768 ? '1rem' : '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Service Card 1 */}
          <div style={{
            background: 'linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)',
            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
            borderRadius: '12px',
            border: '2px solid #4a4a4a'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✈️</div>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
              fontWeight: 700,
              color: '#2a2a2a',
              margin: '0 0 0.5rem 0'
            }}>
              യാത്ര വായ്പ
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#4a4a4a',
              margin: 0
            }}>
              ഭാര്യയിൽ നിന്നും ഒരു ഒളിച്ചോട്ടം
            </p>
          </div>

          {/* Service Card 2 */}
          <div style={{
            background: 'linear-gradient(135deg, #e0e0e0 0%, #c8c8c8 100%)',
            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
            borderRadius: '12px',
            border: '2px solid #4a4a4a'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🕌</div>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
              fontWeight: 700,
              color: '#2a2a2a',
              margin: '0 0 0.5rem 0'
            }}>
              ഉംറ വായ്പ
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#4a4a4a',
              margin: 0
            }}>
              നല്ലവനായ ഉണ്ണിയാവാൻ ആഗ്രഹിക്കുന്നവർക്ക്
            </p>
          </div>

          {/* Service Card 3 */}
          <div style={{
            background: 'linear-gradient(135deg, #d8d8d8 0%, #c0c0c0 100%)',
            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
            borderRadius: '12px',
            border: '2px solid #4a4a4a'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
              fontWeight: 700,
              color: '#2a2a2a',
              margin: '0 0 0.5rem 0'
            }}>
              ഉല്ലാസ വായ്പ
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#4a4a4a',
              margin: 0
            }}>
              നാരങ്ങാ വെള്ളവും പിന്നെ അങ്ങോട്ട് സുഖമാവലും
            </p>
          </div>

          {/* Service Card 4 */}
          <div style={{
            background: 'linear-gradient(135deg, #d0d0d0 0%, #b8b8b8 100%)',
            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
            borderRadius: '12px',
            border: '2px solid #4a4a4a'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{
              fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
              fontWeight: 700,
              color: '#2a2a2a',
              margin: '0 0 0.5rem 0'
            }}>
              വായ്പ തിരികെ അടക്കാത്തവർ
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#4a4a4a',
              margin: 0
            }}>
              തിരിച്ചു താടാ
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div style={{
          background: '#f9fce7',
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '2px solid #eab308'
        }}>
          <h3 style={{
            fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.4rem',
            fontWeight: 700,
            color: '#713f12',
            margin: '0 0 1rem 0'
          }}>
            Why Choose Royal Bank of Chaandiyar?
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{
              fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
              color: '#374151',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              Immediate approval with fastest verification
            </li>
            <li style={{
              fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
              color: '#374151',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              No questions asked for Leisure loans with pleasure
            </li>
            <li style={{
              fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
              color: '#374151',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              Anonymous application process and personal chat with the Owner
            </li>
            <li style={{
              fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              Complimentary leisure services with the bank owner for the lenders
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1a5f2f 0%, #2d8659 100%)',
          padding: window.innerWidth <= 768 ? '2rem 1.5rem' : '2.5rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.6rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 1rem 0'
          }}>
            Ready to Join Us?
          </h3>
          <p style={{
            fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
            color: '#bbf7d0',
            margin: '0 0 1.5rem 0'
          }}>
            വായ്പ എടുക്കുവിൻ .... ഉല്ലസിക്കുവിൻ...
          </p>
          <button 
            onClick={() => setIsFormOpen(true)}
            style={{
            background: '#fbbf24',
            color: '#78350f',
            border: 'none',
            padding: window.innerWidth <= 768 ? '0.9rem 2rem' : '1rem 2.5rem',
            borderRadius: '8px',
            fontSize: window.innerWidth <= 768 ? '0.95rem' : '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(251, 191, 36, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
          }}
          >
            Apply Now
          </button>
        </div>

        {/* Contact Section */}
        <div style={{
          background: '#f3f4f6',
          padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.4rem',
            fontWeight: 700,
            color: '#1f2937',
            margin: '0 0 1rem 0'
          }}>
            Get In Touch
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            <div>
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: '0 0 0.5rem 0'
              }}>
                📞 Phone
              </p>
              <p style={{
                fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
                color: '#1f2937',
                fontWeight: 600,
                margin: 0
              }}>
                +1 (555) BANK-123
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: '0 0 0.5rem 0'
              }}>
                📧 Email
              </p>
              <p style={{
                fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
                color: '#1f2937',
                fontWeight: 600,
                margin: 0
              }}>
                support@royalbank.com
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: '0 0 0.5rem 0'
              }}>
                🌐 Website
              </p>
              <p style={{
                fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
                color: '#1f2937',
                fontWeight: 600,
                margin: 0
              }}>
                www.royalbank.chaandiyar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Application Form Modal */}
      <LoanApplicationForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

export default RoyalBank;
