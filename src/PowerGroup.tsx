import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const MEMBERS = [
  'Niaz Kamaru',
  'Shanir Musliyamveetil',
  'Hyder Mohamed',
  'Mohasin Ali',
];

const PowerGroup: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 55% at 50% 0%, #2b2113 0%, #0b0b0d 58%) #0b0b0d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#f5eeda',
      }}
    >
      <style>{`
        @keyframes pgCardIn {
          from { opacity: 0; transform: translateY(26px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pgSheen {
          0% { transform: translateX(-170%) skewX(-18deg); }
          60%, 100% { transform: translateX(280%) skewX(-18deg); }
        }
      `}</style>

      {/* Dark header matching the black-card theme */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(11, 11, 13, 0.92)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.22)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: 640,
            margin: '0 auto',
            height: '60px',
            padding: '0 8px 0 4px',
          }}
        >
          <button
            onClick={() => navigate('/hangout')}
            aria-label="Back to Hangout"
            style={{
              background: 'none',
              border: 'none',
              color: '#f5c542',
              fontSize: '26px',
              cursor: 'pointer',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ‹
          </button>
          <h1
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '1px',
              margin: 0,
              paddingRight: '44px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Power Group
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '22px 18px 0 18px' }}>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(245, 197, 66, 0.75)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: '0 0 24px 0',
          }}
        >
          where money meet needs
        </p>

        <div
          className="pg-card-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px',
          }}
        >
          {MEMBERS.map((name, index) => (
            <div
              key={name}
              style={{
                borderRadius: '14px',
                padding: '18px 20px',
                background:
                  'linear-gradient(135deg, #232328 0%, #101013 60%, #1b1b20 100%)',
                border: '1px solid rgba(212, 175, 55, 0.65)',
                boxShadow:
                  '0 10px 26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
                aspectRatio: '1.586',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                animation: `pgCardIn 0.5s ease ${index * 0.1}s both`,
              }}
            >
              {/* Sheen sweep */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-20%',
                  bottom: '-20%',
                  width: '34%',
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,235,180,0.14) 50%, rgba(255,255,255,0) 100%)',
                  animation: `pgSheen 5s ease-in-out ${index * 0.6}s infinite`,
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '4px',
                    fontWeight: 800,
                    color: '#d4af37',
                  }}
                >
                  POWER GROUP
                </span>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at 35% 35%, #ffe9a3, #b8860b)',
                    boxShadow: '0 0 8px rgba(245, 197, 66, 0.6)',
                  }}
                />
              </div>

              <div
                style={{
                  width: '40px',
                  height: '30px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #ffe9a3, #c9971f)',
                  border: '1px solid rgba(120, 80, 0, 0.55)',
                  boxShadow: 'inset 0 0 0 4px rgba(120, 80, 0, 0.18)',
                }}
              />

              <div
                style={{
                  color: 'rgba(240, 230, 200, 0.55)',
                  letterSpacing: '3px',
                  fontSize: '0.85rem',
                }}
              >
                •••• •••• •••• {String(index + 1).padStart(4, '0')}
              </div>

              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(180deg, #fff3c4, #d4af37)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  overflowWrap: 'anywhere',
                }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>

        {/* Two-column grid on wider screens */}
        <style>{`
          @media (min-width: 560px) {
            .pg-card-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '110px' }} />
      <BottomNavigation />
    </div>
  );
};

export default PowerGroup;
