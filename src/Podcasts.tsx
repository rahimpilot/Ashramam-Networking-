import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface Episode {
  slug: string;
  title: string;
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

const EPISODES: Episode[] = [
  {
    slug: 'snake-stories-assorted',
    title: 'Snake stories assorted',
    audioUrl: '/audio/snake-stories-assorted.m4a',
  },
  {
    slug: 'illi-is-a-wonderman',
    title: 'illi is a wonderman with reality',
    audioUrl: '/audio/illi-is-a-wonderman.m4a',
  },
  {
    slug: 'fear-of-snake-and-tiger',
    title: 'Fear of snake and tiger',
    audioUrl: '/audio/fear-of-snake-and-tiger.m4a',
  },
];

/** Podcasts — play recordings right inside the app, no login needed. */
const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // A shared link like /podcasts?ep=<slug> scrolls straight to that episode.
  useEffect(() => {
    const slug = searchParams.get('ep');
    if (slug) {
      const el = document.getElementById(`ep-${slug}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchParams]);

  const copyEpisodeLink = async (ep: Episode) => {
    const url = `https://www.ashramamvibes.com/podcasts?ep=${ep.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* clipboard unavailable */ }
      document.body.removeChild(ta);
    }
    setCopiedSlug(ep.slug);
    setTimeout(() => setCopiedSlug(null), 1800);
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
            key={ep.slug}
            id={`ep-${ep.slug}`}
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
              <button
                onClick={() => copyEpisodeLink(ep)}
                title="Copy link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  lineHeight: 1,
                  flexShrink: 0
                }}
              >
                {copiedSlug === ep.slug ? <span style={{ color: '#1c9c4c' }}>✓</span> : '🔗'}
              </button>
            </div>
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
