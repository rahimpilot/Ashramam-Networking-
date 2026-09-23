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
    iconBg: '#FEF3C7',
  },
  {
    icon: '📝',
    title: 'Meeting Minutes',
    subtitle: 'Catch up on decisions',
    path: '/meeting-minutes',
    iconBg: '#f1e6cf',
  },
  {
    icon: '🏦',
    title: 'Royal Bank',
    subtitle: 'Financial assistance',
    path: '/royal-bank',
    iconBg: '#D1FAE5',
  },
  {
    icon: '✈️',
    title: 'Our Trips',
    subtitle: 'Share travel experiences',
    path: '/our-trips',
    iconBg: '#EDE9FE',
  },
];

/** Hangout — Ivory Atelier edition. */
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f6f1e8',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <style>{`
        @keyframes hangout-pulse {
          0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55); }
          70% { box-shadow: 0 0 0 9px rgba(52, 211, 153, 0); }
          100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
        .hangout-tile { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .hangout-tile:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(90, 70, 45, 0.10); }
        .hangout-tile:active { transform: translateY(0); }
        .hangout-voice { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .hangout-voice:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(28, 25, 21, 0.35); }
        .hangout-voice:active { transform: translateY(0); }
      `}</style>

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
            color: '#5b9bd5',
            background: 'rgba(91, 155, 213, 0.08)',
            border: '1px solid rgba(91, 155, 213, 0.25)',
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
            color: '#1c1915',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
            lineHeight: 1.05
          }}>
            {greeting}
          </h2>
          <p style={{
            fontSize: '14.5px',
            color: '#7a7264',
            margin: 0,
            lineHeight: 1.6
          }}>
            Everything your crew is up to — live chats, plans and memories, all in one place.
          </p>
        </div>

        {/* Happening Now — featured voice card */}
        <div
          className="hangout-voice"
          onClick={() => navigate('/voice-room')}
          style={{
            background: 'linear-gradient(150deg, #211c16 0%, #171310 60%, #0f0d0a 100%)',
            border: '1px solid rgba(91, 155, 213, 0.35)',
            borderRadius: '24px',
            padding: '24px 22px',
            cursor: 'pointer',
            marginBottom: '24px',
            boxShadow: '0 12px 32px rgba(28, 25, 21, 0.28)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* bronze glow decoration */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(154,107,63,0.30) 0%, rgba(154,107,63,0) 70%)',
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
              color: '#c9a96a'
            }}>
              HAPPENING NOW
            </span>
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '30px',
            fontWeight: 600,
            color: '#f5f1e6',
            margin: '0 0 8px 0',
            letterSpacing: '-0.3px'
          }}>
            Voice Room
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(245, 241, 230, 0.68)',
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
            background: 'linear-gradient(135deg, #c9a96a, #5b9bd5)',
            color: '#171310',
            fontSize: '14px',
            fontWeight: 800,
            borderRadius: '999px',
            padding: '12px 22px',
            boxShadow: '0 8px 20px rgba(91, 155, 213, 0.35)'
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
          color: '#a89a80',
          margin: '0 0 14px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          EXPLORE
          <span style={{ flex: 1, height: '1px', background: 'rgba(91, 155, 213, 0.18)' }} />
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
              background: '#fffdf8',
              border: '1px solid rgba(91, 155, 213, 0.16)',
              borderRadius: '20px',
              padding: '18px 16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(90, 70, 45, 0.05)'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '15px',
              background: '#FEF3C7',
              border: '1px solid rgba(91, 155, 213, 0.18)',
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
              color: '#1c1915',
              marginBottom: '4px',
              lineHeight: 1.3
            }}>
              UNO
            </div>
            <div style={{
              fontSize: '12.5px',
              color: '#7a7264',
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
                background: '#fffdf8',
                border: '1px solid rgba(91, 155, 213, 0.16)',
                borderRadius: '20px',
                padding: '18px 16px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(90, 70, 45, 0.05)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '15px',
                background: tile.iconBg,
                border: '1px solid rgba(91, 155, 213, 0.18)',
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
                color: '#1c1915',
                marginBottom: '4px',
                lineHeight: 1.3
              }}>
                {tile.title}
              </div>
              <div style={{
                fontSize: '12.5px',
                color: '#7a7264',
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
  );
};

export default Hangout;
