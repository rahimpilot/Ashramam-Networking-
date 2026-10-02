import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { RADIO_REGIONS, RADIO_STATIONS, RadioRegion, RadioStation } from './radioStations';

/** Ashramam Radio — live stations from around the world, playing right in the app. */
const Radio: React.FC = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<RadioRegion | 'All'>('All');
  const [current, setCurrent] = useState<RadioStation | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failedSlug, setFailedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RADIO_STATIONS.filter((s) => {
      if (region !== 'All' && s.region !== region) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.place.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q)
      );
    });
  }, [query, region]);

  const playStation = (station: RadioStation) => {
    const audio = audioRef.current;
    if (!audio) return;
    // Tapping the current station toggles play/pause.
    if (current && current.slug === station.slug) {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        audio.play().catch(() => setFailedSlug(station.slug));
        setPlaying(true);
      }
      return;
    }
    setFailedSlug(null);
    setCurrent(station);
    audio.src = station.streamUrl;
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => {
        setPlaying(false);
        setFailedSlug(station.slug);
      });
  };

  const stopAll = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setCurrent(null);
    setPlaying(false);
    setFailedSlug(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
      fontFamily: "'Marcellus', Georgia, serif"
    }}>
      {/* Back Button */}
      <div style={{
        padding: '1rem 0.5rem',
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(91, 155, 213, 0.15)'
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
            color: '#3a332a'
          }}
        >
          ← Back
        </button>
      </div>

      <div className="iv-page" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 400,
          color: '#111111',
          margin: '0 0 6px 0',
          textAlign: 'center'
        }}>
          📻 Ashramam Radio
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#555555',
          textAlign: 'center',
          margin: '0 0 20px 0'
        }}>
          Live stations from around the world. Pick one and press play.
        </p>

        {/* Search */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stations, places, genres…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontSize: '15px',
            fontFamily: "'Marcellus', Georgia, serif",
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #d9d9d9',
            background: '#ffffff',
            marginBottom: '12px',
            outline: 'none'
          }}
        />

        {/* Region filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          {(['All', ...RADIO_REGIONS] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              style={{
                fontFamily: "'Marcellus', Georgia, serif",
                fontSize: '13px',
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid #d9d9d9',
                background: region === r ? '#1c2733' : '#ffffff',
                color: region === r ? '#ffffff' : '#1c2733',
                cursor: 'pointer'
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #d9d9d9',
            borderRadius: '12px',
            padding: '40px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📻</div>
            <p style={{ fontSize: '16px', color: '#555555', margin: 0 }}>
              No stations match that search.
            </p>
          </div>
        )}

        {filtered.map((station) => {
          const isCurrent = current?.slug === station.slug;
          return (
            <div
              key={station.slug}
              style={{
                background: '#ffffff',
                border: isCurrent ? '2px solid #7c3aed' : '1px solid #d9d9d9',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <button
                onClick={() => playStation(station)}
                aria-label={isCurrent && playing ? `Pause ${station.name}` : `Play ${station.name}`}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isCurrent && playing ? '#7c3aed' : '#1c2733',
                  color: '#ffffff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isCurrent && playing ? '⏸' : '▶'}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#111111',
                  margin: '0 0 2px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {station.name}
                  </span>
                  {isCurrent && playing && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '1.5px',
                      color: '#ffffff',
                      background: '#e11d48',
                      borderRadius: '999px',
                      padding: '3px 8px',
                      flexShrink: 0
                    }}>
                      LIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12.5px', color: '#777777' }}>
                  {station.place} · {station.tags}
                </div>
                {failedSlug === station.slug && (
                  <div style={{ fontSize: '12.5px', color: '#b42318', marginTop: '4px' }}>
                    This stream isn't responding right now — try another station.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared audio element */}
      <audio
        ref={audioRef}
        preload="none"
        onError={() => {
          if (current) setFailedSlug(current.slug);
          setPlaying(false);
        }}
      />

      {/* Now-playing bar */}
      {current && (
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          background: 'rgba(28, 39, 51, 0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#ffffff',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.25)'
        }}>
          <button
            onClick={() => playStation(current)}
            aria-label={playing ? 'Pause' : 'Play'}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: '#7c3aed',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {playing ? 'Now playing' : 'Paused'} — {current.name}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
              {current.place}
            </div>
          </div>
          <button
            onClick={stopAll}
            aria-label="Stop radio"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Spacer so content isn't hidden behind the bottom nav / now-playing bar */}
      <div className="iv-dock-spacer" style={current ? { height: '150px' } : undefined} />
      {!current && <BottomNavigation />}
    </div>
  );
};

export default Radio;
