import React from 'react';
import PageHeader from './PageHeader';
import BottomNavigation from './BottomNavigation';

interface MemberTheme {
  badge: string;
  coin: string;
  text: string;
  glow: string;
}

const THEMES: MemberTheme[] = [
  {
    badge: '👑',
    coin: 'radial-gradient(circle at 30% 30%, #8f7bf0, #4a3a9e 55%, #241a5e)',
    text: '#ffe9a3',
    glow: 'rgba(143, 123, 240, 0.45)',
  },
  {
    badge: '💰',
    coin: 'radial-gradient(circle at 30% 30%, #ffe9a3, #f5c542 48%, #a8740a)',
    text: '#5c3d00',
    glow: 'rgba(245, 197, 66, 0.5)',
  },
  {
    badge: '💎',
    coin: 'radial-gradient(circle at 30% 30%, #e6f9ff, #9bdcf5 52%, #3d8fc2)',
    text: '#0b3b5c',
    glow: 'rgba(155, 220, 245, 0.45)',
  },
  {
    badge: '💵',
    coin: 'radial-gradient(circle at 30% 30%, #c4f5d2, #52c47e 55%, #1c6e38)',
    text: '#08331b',
    glow: 'rgba(82, 196, 126, 0.45)',
  },
];

const MEMBERS = [
  'Niaz Kamaru',
  'Shanir Musliyamveetil',
  'Hyder Mohamed',
  'Mohasin Ali',
];

const SPARKLES = [
  { left: '6%', delay: '0s', duration: '11s', size: '1.1rem', char: '💸' },
  { left: '18%', delay: '2.5s', duration: '13s', size: '0.9rem', char: '✨' },
  { left: '32%', delay: '1s', duration: '10s', size: '1.2rem', char: '🪙' },
  { left: '47%', delay: '4s', duration: '14s', size: '0.85rem', char: '✨' },
  { left: '61%', delay: '0.8s', duration: '12s', size: '1.1rem', char: '💸' },
  { left: '74%', delay: '3.2s', duration: '11s', size: '0.9rem', char: '🪙' },
  { left: '88%', delay: '1.8s', duration: '15s', size: '1rem', char: '✨' },
];

const PowerGroup: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0d2417 0%, #08130d 60%, #050b08 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes pgSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pgShine {
          0% { transform: translateX(-160%) skewX(-18deg); }
          55%, 100% { transform: translateX(260%) skewX(-18deg); }
        }
        @keyframes pgRise {
          0% { transform: translateY(20vh) rotate(0deg); opacity: 0; }
          12% { opacity: 0.55; }
          88% { opacity: 0.4; }
          100% { transform: translateY(-110vh) rotate(40deg); opacity: 0; }
        }
        @keyframes pgGlowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 197, 66, 0.0); }
          50% { box-shadow: 0 0 26px 4px rgba(245, 197, 66, 0.25); }
        }
      `}</style>

      {/* Floating money sparkles (decor only) */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              bottom: '-8vh',
              left: s.left,
              fontSize: s.size,
              opacity: 0,
              animation: `pgRise ${s.duration} linear ${s.delay} infinite`,
            }}
          >
            {s.char}
          </span>
        ))}
      </div>

      <PageHeader title="💰 Power Group" backTo="/hangout" backLabel="Back to Hangout" />

      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '28px 16px 0 16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255, 233, 163, 0.85)',
            fontSize: '0.95rem',
            margin: '0 0 28px 0',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}
        >
          where money meet needs
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
        >
          {MEMBERS.map((name, index) => {
            const theme = THEMES[index % THEMES.length];
            const initial = name.trim().charAt(0).toUpperCase();
            return (
              <div
                key={name}
                style={{
                  background: 'rgba(255, 255, 255, 0.045)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '20px',
                  padding: '26px 12px 20px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  animation: `pgSlideUp 0.45s ease ${index * 0.09}s both, pgGlowPulse 4s ease ${index * 0.7}s infinite`,
                  backdropFilter: 'blur(2px)',
                }}
              >
                {/* Coin avatar */}
                <div style={{ position: 'relative', width: '88px', height: '88px' }}>
                  <div
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      background: theme.coin,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.4rem',
                      fontWeight: 800,
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      color: theme.text,
                      boxShadow: `0 6px 18px ${theme.glow}, inset 0 2px 6px rgba(255,255,255,0.45), inset 0 -3px 8px rgba(0,0,0,0.25)`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Coin reeding ring */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: '9px',
                        borderRadius: '50%',
                        border: '2px dashed rgba(255,255,255,0.4)',
                        pointerEvents: 'none',
                      }}
                    />
                    <span style={{ position: 'relative', zIndex: 1 }}>{initial}</span>
                    {/* Shine sweep */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-20%',
                        bottom: '-20%',
                        width: '38%',
                        background:
                          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
                        animation: `pgShine 3.6s ease-in-out ${index * 0.5}s infinite`,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  {/* Persona badge */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      bottom: '-6px',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#0d2417',
                      border: '2px solid rgba(212, 175, 55, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                    }}
                  >
                    {theme.badge}
                  </div>
                </div>

                {/* Name only — no actions */}
                <div
                  style={{
                    color: '#f5f0dd',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    lineHeight: 1.35,
                    overflowWrap: 'anywhere',
                    minWidth: 0,
                  }}
                >
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '110px' }} />
      <BottomNavigation />
    </div>
  );
};

export default PowerGroup;
