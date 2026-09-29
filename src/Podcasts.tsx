import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface Episode {
  title: string;
  note: string;
  /** Direct audio file URL (Firebase Storage or bundled) — plays for everyone, no login. */
  audioUrl?: string;
  /** Spotify link — falls back to Spotify's embed player (needs Spotify login for full playback). */
  spotifyUrl?: string;
}

/** Turn any open.spotify.com link into its embeddable player URL. */
function toEmbedUrl(spotifyUrl: string): string | null {
  const m = spotifyUrl.match(/open\.spotify\.com\/(episode|show|track|playlist|album)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
}

const EPISODES: Episode[] = [];

/** Podcasts — play recordings right inside the app, no login needed. */
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
          Press play and listen right here.
        </p>

        {EPISODES.length === 0 && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #d9d9d9',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎙️</div>
            <p style={{
              fontSize: '18px',
              fontWeight: 400,
              color: '#111111',
              margin: '0 0 8px 0'
            }}>
              The first recording is on its way
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#555555',
              margin: 0,
              lineHeight: 1.5
            }}>
              It will play right here in the app — no Spotify login needed.
            </p>
          </div>
        )}

        {EPISODES.map((ep) => (
          <div
            key={ep.title}
            style={{
              background: '#ffffff',
              border: '1px solid #d9d9d9',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
            }}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: 400,
              color: '#111111',
              margin: '0 0 12px 0'
            }}>
              {ep.title}
            </h3>
            {ep.audioUrl ? (
              <audio
                controls
                preload="metadata"
                src={ep.audioUrl}
                style={{ width: '100%', display: 'block' }}
              />
            ) : ep.spotifyUrl && toEmbedUrl(ep.spotifyUrl) ? (
              <iframe
                title={ep.title}
                src={toEmbedUrl(ep.spotifyUrl)!}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '8px', display: 'block' }}
              />
            ) : null}
            <p style={{
              fontSize: '13px',
              color: '#555555',
              margin: '12px 0 0 0',
              lineHeight: 1.5
            }}>
              {ep.note}
            </p>
          </div>
        ))}
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '80px' }} />
      <BottomNavigation />
    </div>
  );
};

export default Podcasts;
