import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const MEMBERS = [
  { name: 'Mohamed Niyas', photo: '/niaz.jpeg' },
  { name: 'Mohammed Shanir Musluyamveettil Kunchimohammed', photo: '/shanir.jpeg' },
  { name: 'Mohamed Hyder', photo: '/hyder.JPG' },
  { name: 'Mohasin Ali', photo: '/appan.JPG' },
];

const PowerGroup: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 55% at 50% 0%, #2b2113 0%, #0b0b0d 58%) #0b0b0d',
        fontFamily: "'Marcellus', Georgia, serif",
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
          className="iv-page"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '60px',
            paddingTop: 0,
            paddingBottom: 0,
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

      <div className="iv-page-wide" style={{ paddingTop: '22px' }}>
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
          style={{
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '14px',
            background:
              'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 100%)',
            padding: '18px 20px',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>🏦</div>
          <p
            style={{
              color: '#f0e6c8',
              fontSize: '0.92rem',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Meet the Power Group — the backbone of this crew. Officially they
            focus on leisure; unofficially, naughty activities only. On boys'
            trips and gatherings, their mission is simple: maximum mischief,
            zero regrets. They don't care about money — enjoyment only.
          </p>
        </div>

        <div
          className="pg-card-grid iv-cards-2"
          style={{
            gap: '16px',
          }}
        >
          {MEMBERS.map((member, index) => (
            <div
              key={member.name}
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
                <img
                  src={member.photo}
                  alt={member.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(212, 175, 55, 0.9)',
                    boxShadow: '0 0 10px rgba(245, 197, 66, 0.45)',
                    flexShrink: 0,
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
                {member.name}
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
