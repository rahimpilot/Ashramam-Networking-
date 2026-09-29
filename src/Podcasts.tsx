import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface Episode {
  title: string;
  note: string;
  spotifyUrl: string;
  isDemo: boolean;
}

/** Turn any open.spotify.com link into its embeddable player URL. */
function toEmbedUrl(spotifyUrl: string): string | null {
  const m = spotifyUrl.match(/open\.spotify\.com\/(episode|show|track|playlist|album)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
}

const EPISODES: Episode[] = [
  {
    title: 'Well Played',
    note: 'Demo episode — send your Spotify links and your recordings will appear here.',
    spotifyUrl: 'https://open.spotify.com/episode/1iWSFY7pQVPbnjvNYFsobs',
    isDemo: true,
  },
];

/** Podcasts — play Spotify recordings right inside the app. */
const Podcasts: React.FC = () => {
  const navigate = useNavigate();

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
          Podcasts
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#555555',
          textAlign: 'center',
          margin: '0 0 20px 0'
        }}>
          Press play and listen right here — no need to open Spotify.
        </p>

        {EPISODES.map((ep) => {
          const embedUrl = toEmbedUrl(ep.spotifyUrl);
          if (!embedUrl) return null;
          return (
            <div
              key={ep.spotifyUrl}
              style={{
                background: '#ffffff',
                border: '1px solid #d9d9d9',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                gap: '12px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 400,
                  color: '#111111',
                  margin: 0
                }}>
                  {ep.title}
                </h3>
                {ep.isDemo && (
                  <span style={{
                    fontSize: '11px',
                    color: '#555555',
                    background: '#f0f0f0',
                    border: '1px solid #d9d9d9',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    whiteSpace: 'nowrap'
                  }}>
                    Demo
                  </span>
                )}
              </div>
              <iframe
                title={ep.title}
                src={embedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '8px', display: 'block' }}
              />
              <p style={{
                fontSize: '13px',
                color: '#555555',
                margin: '12px 0 0 0',
                lineHeight: 1.5
              }}>
                {ep.note}
              </p>
            </div>
          );
        })}
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '80px' }} />
      <BottomNavigation />
    </div>
  );
};

export default Podcasts;
