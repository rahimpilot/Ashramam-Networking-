import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';
import { rtdb } from './firebase';
import { ref, onValue } from 'firebase/database';

const ROOM_ID = 'happening-now-room';

interface Tile {
  icon: string;
  title: string;
  subtitle: string;
  path: string;
  iconBg: string;
}

const TILES: Tile[] = [
  {
    icon: '⚡',
    title: 'Power Group',
    subtitle: 'Rich and naughty',
    path: '/power-group',
    iconBg: 'rgba(254, 243, 199, 0.85)',
  },
  {
    icon: '📝',
    title: 'Meeting Minutes',
    subtitle: 'Catch up on decisions',
    path: '/meeting-minutes',
    iconBg: 'rgba(224, 234, 244, 0.85)',
  },
  {
    icon: '🏦',
    title: 'Royal Bank',
    subtitle: 'Financial assistance',
    path: '/royal-bank',
    iconBg: 'rgba(209, 250, 229, 0.85)',
  },
  {
    icon: '✈️',
    title: 'Our Trips',
    subtitle: 'Share travel experiences',
    path: '/our-trips',
    iconBg: 'rgba(237, 233, 254, 0.85)',
  },
  {
    icon: '🔥',
    title: 'Ashramam Exclusive',
    subtitle: 'Hot news, members only',
    path: '/ashramam-exclusive',
    iconBg: 'rgba(254, 226, 226, 0.85)',
  },
  {
    icon: '📖',
    title: 'Articles',
    subtitle: 'Words worth keeping',
    path: '/articles',
    iconBg: 'rgba(255, 247, 237, 0.85)',
  },
];

const GLASS_CARD = {
  background: 'rgba(255, 255, 255, 0.52)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.65)',
  boxShadow: '0 8px 28px rgba(80, 90, 180, 0.16)',
};

/** Hangout — Frosted Glass edition. */
const Hangout: React.FC = () => {
  const navigate = useNavigate();
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [openTables, setOpenTables] = useState<number | null>(null);

  useEffect(() => {
    const participantsRef = ref(rtdb, `voiceRooms/${ROOM_ID}/participants`);
    const unsub = onValue(
      participantsRef,
      (snap) => {
        let count = 0;
        snap.forEach(() => {
          count += 1;
          return false;
        });
        setLiveCount(count);
      },
      () => setLiveCount(null)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const gamesRef = ref(rtdb, 'games');
    const unsub = onValue(
      gamesRef,
      (snap) => {
        let count = 0;
        snap.forEach((child) => {
          const room = child.val();
          if (room && !room.gameStarted && room.players && room.players.length > 0) {
            count += 1;
          }
          return false;
        });
        setOpenTables(count);
      },
      () => setOpenTables(null)
    );
    return () => unsub();
  }, []);

  const greeting = "What's up cocks?";

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
    }}>
      {/* Fixed pastel gradient backdrop */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'linear-gradient(165deg, #9dbdf0 0%, #b7a9f6 36%, #f0bcd9 68%, #b9dcf6 100%)',
        pointerEvents: 'none',
      }} />
      {/* Soft blurred color blobs for depth */}
      <div style={{
        position: 'fixed', zIndex: 0, pointerEvents: 'none',
        top: '-90px', left: '-70px', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(10px)',
      }} />
      <div style={{
        position: 'fixed', zIndex: 0, pointerEvents: 'none',
        bottom: '10%', right: '-100px', width: '340px', height: '340px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,0.45) 0%, rgba(129,140,248,0) 70%)',
        filter: 'blur(12px)',
      }} />

      <style>{`
        @keyframes hangout-pulse {
          0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55); }
          70% { box-shadow: 0 0 0 9px rgba(52, 211, 153, 0); }
          100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
        .hangout-tile { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .hangout-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(80, 90, 180, 0.22); }
        .hangout-tile:active { transform: translateY(0); }
        .hangout-voice { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .hangout-voice:hover { transform: translateY(-3px); box-shadow: 0 20px 44px rgba(99, 102, 241, 0.42); }
        .hangout-voice:active { transform: translateY(0); }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <PageHeader title="Hangout" backTo="/dashboard" backLabel="Back to dashboard" />

        <div style={{
          maxWidth: 520,
          margin: '0 auto',
          padding: '28px 16px 110px 16px'
        }}>

          {/* Hero */}
          <div style={{ marginBottom: '22px', padding: '0 4px' }}>
            <div style={{
              display: 'inline-block',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '2.5px',
              color: '#4338ca',
              background: 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              borderRadius: '999px',
              padding: '6px 14px',
              marginBottom: '14px'
            }}>
              YOUR CIRCLE
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '38px',
              fontWeight: 600,
              color: '#232946',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px',
              lineHeight: 1.05,
              textShadow: '0 1px 12px rgba(255,255,255,0.35)'
            }}>
              {greeting}
            </h2>
            <p style={{
              fontSize: '14.5px',
              color: '#4a5578',
              margin: 0,
              lineHeight: 1.6
            }}>
              Everything your crew is up to — live chats, plans and memories, all in one place.
            </p>
          </div>

          {/* Happening Now — frosted voice card */}
          <div
            className="hangout-voice"
            onClick={() => navigate('/voice-room')}
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.78) 0%, rgba(168,85,247,0.78) 100%)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '26px',
              padding: '24px 22px',
              cursor: 'pointer',
              marginBottom: '24px',
              boxShadow: '0 14px 38px rgba(99, 102, 241, 0.35)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* glass shine */}
            <div style={{
              position: 'absolute',
              top: '-70px',
              right: '-50px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '16px' }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#34D399',
                boxShadow: '0 0 10px #34D399',
                animation: 'hangout-pulse 1.8s infinite'
              }} />
              <span style={{
                fontSize: '10.5px',
                fontWeight: 800,
                letterSpacing: '2.5px',
                color: 'rgba(255,255,255,0.92)'
              }}>
                HAPPENING NOW
              </span>
            </div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '30px',
              fontWeight: 600,
              color: '#ffffff',
              margin: '0 0 8px 0',
              letterSpacing: '-0.3px'
            }}>
              Voice Room
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0 0 18px 0',
              lineHeight: 1.6
            }}>
              {liveCount !== null && liveCount > 0
                ? `${liveCount} ${liveCount === 1 ? 'person is' : 'people are'} talking right now — jump in.`
                : 'Talk with your circle in real time, just like a phone call.'}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#4c1d95',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '999px',
              padding: '12px 22px',
              boxShadow: '0 8px 20px rgba(76, 29, 149, 0.28)'
            }}>
              🎙️ Join voice chat
              <span style={{ fontSize: '16px' }}>→</span>
            </div>
          </div>

          {/* Explore grid */}
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '2.5px',
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 1px 8px rgba(80, 90, 180, 0.35)',
            margin: '0 0 14px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            EXPLORE
            <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.55)' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div
              className="hangout-tile"
              onClick={() => navigate('/hangout/games/uno')}
              style={{
                ...GLASS_CARD,
                borderRadius: '20px',
                padding: '18px 16px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '15px',
                background: 'rgba(254, 243, 199, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '13px'
              }}>
                🃏
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#232946',
                marginBottom: '4px',
                lineHeight: 1.3
              }}>
                UNO
              </div>
              <div style={{
                fontSize: '12.5px',
                color: '#5a6488',
                lineHeight: 1.45
              }}>
                {openTables !== null && openTables > 0
                  ? `${openTables} open table${openTables === 1 ? '' : 's'} — jump in`
                  : 'Game night with the crew'}
              </div>
            </div>
            {TILES.map((tile) => (
              <div
                key={tile.path}
                className="hangout-tile"
                onClick={() => navigate(tile.path)}
                style={{
                  ...GLASS_CARD,
                  borderRadius: '20px',
                  padding: '18px 16px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '15px',
                  background: tile.iconBg,
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '13px'
                }}>
                  {tile.icon}
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#232946',
                  marginBottom: '4px',
                  lineHeight: 1.3
                }}>
                  {tile.title}
                </div>
                <div style={{
                  fontSize: '12.5px',
                  color: '#5a6488',
                  lineHeight: 1.45
                }}>
                  {tile.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default Hangout;
