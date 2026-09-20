import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
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
    iconBg: '#DBEAFE',
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

const Hangout: React.FC = () => {
  const navigate = useNavigate();
  const [liveCount, setLiveCount] = useState<number | null>(null);

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F6F7F9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      <style>{`
        @keyframes hangout-pulse {
          0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55); }
          70% { box-shadow: 0 0 0 9px rgba(52, 211, 153, 0); }
          100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
        .hangout-tile { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .hangout-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); }
        .hangout-tile:active { transform: translateY(0); }
        .hangout-voice { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .hangout-voice:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(35, 20, 50, 0.35); }
        .hangout-voice:active { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #ECEEF1'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 520,
          margin: '0 auto',
          height: '100%',
          padding: '0 16px'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1877F2',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F6F7F9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Back to dashboard"
          >
            ←
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#050505',
            lineHeight: '1.3',
            margin: 0
          }}>
            Hangout
          </h1>
          <img
            src="/newlogo.svg"
            alt="Logo"
            style={{
              height: 32,
              width: 'auto',
              maxWidth: '100px',
              opacity: 0.8
            }}
          />
        </div>
      </div>

      <div style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '24px 16px 110px 16px'
      }}>

        {/* Hero */}
        <div style={{ marginBottom: '20px', padding: '0 4px' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: '#7C5CBF',
            background: '#EFE9FA',
            borderRadius: '999px',
            padding: '5px 12px',
            marginBottom: '10px'
          }}>
            YOUR CIRCLE
          </div>
          <h2 style={{
            fontSize: '30px',
            fontWeight: 700,
            color: '#111318',
            margin: '0 0 6px 0',
            letterSpacing: '-0.5px'
          }}>
            {greeting}
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.5
          }}>
            Everything your crew is up to — live chats, plans and memories, all in one place.
          </p>
        </div>

        {/* Happening Now — featured voice card */}
        <div
          className="hangout-voice"
          onClick={() => navigate('/voice-room')}
          style={{
            background: 'linear-gradient(135deg, #221C33 0%, #3A2B52 55%, #54386A 100%)',
            borderRadius: '20px',
            padding: '22px',
            cursor: 'pointer',
            marginBottom: '22px',
            boxShadow: '0 6px 18px rgba(35, 20, 50, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* soft glow decoration */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(167,139,250,0) 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#34D399',
              animation: 'hangout-pulse 1.8s infinite'
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: '#A7F3D0'
            }}>
              HAPPENING NOW
            </span>
          </div>
          <h3 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px'
          }}>
            Voice Room
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.72)',
            margin: '0 0 16px 0',
            lineHeight: 1.5
          }}>
            {liveCount !== null && liveCount > 0
              ? `${liveCount} ${liveCount === 1 ? 'person is' : 'people are'} talking right now — jump in.`
              : 'Talk with your circle in real time, just like a phone call.'}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            color: '#2A2140',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '999px',
            padding: '10px 18px'
          }}>
            🎙️ Join voice chat
            <span style={{ fontSize: '16px' }}>→</span>
          </div>
        </div>

        {/* Explore grid */}
        <div style={{
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: '#9CA3AF',
          margin: '0 0 12px 4px'
        }}>
          EXPLORE
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          {TILES.map((tile) => (
            <div
              key={tile.path}
              className="hangout-tile"
              onClick={() => navigate(tile.path)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEEF1',
                borderRadius: '16px',
                padding: '18px 16px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: tile.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '12px'
              }}>
                {tile.icon}
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#111318',
                marginBottom: '3px',
                lineHeight: 1.3
              }}>
                {tile.title}
              </div>
              <div style={{
                fontSize: '12.5px',
                color: '#6B7280',
                lineHeight: 1.4
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
