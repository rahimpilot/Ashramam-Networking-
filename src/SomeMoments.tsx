import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface Moment {
  slug: string;
  title: string;
  /** Shown next to the title, e.g. "2017". */
  year?: string;
  /** Bundled video file — plays right inside the app for logged-in members. */
  videoUrl: string;
}

/**
 * Ray's short-video corner. He sends each video + title, we publish it here:
 * drop the file in public/videos/ and add one entry below. Newest first.
 */
const MOMENTS: Moment[] = [
  {
    slug: 'selfie-fight-2017',
    title: 'Selfie Fight',
    year: '2017',
    videoUrl: '/videos/selfie-fight-2017.mp4',
  },
];

/** One video card: title + copy-link + player with a Facebook-style full-screen button. */
const MomentCard: React.FC<{
  m: Moment;
  copied: boolean;
  onCopy: () => void;
}> = ({ m, copied, onCopy }) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const toggleFullscreen = () => {
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (v.requestFullscreen) {
      v.requestFullscreen().catch(() => {});
    } else if (v.webkitEnterFullscreen) {
      // iOS Safari: fullscreen only works through the video element itself.
      v.webkitEnterFullscreen();
    }
  };

  return (
    <div
      id={`moment-${m.slug}`}
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
          {m.title}
          {m.year && (
            <span style={{ fontSize: '14px', color: '#777777' }}> · {m.year}</span>
          )}
        </h3>
        <button
          onClick={onCopy}
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
          {copied ? <span style={{ color: '#1c9c4c' }}>✓</span> : '🔗'}
        </button>
      </div>
      <div style={{
        position: 'relative',
        background: '#000000',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <video
          ref={videoRef}
          controls
          preload="metadata"
          playsInline
          src={m.videoUrl}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '560px',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            background: '#000000'
          }}
        />
        <button
          onClick={toggleFullscreen}
          title="Full screen"
          aria-label="Watch in full screen"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#ffffff',
            fontSize: '20px',
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          ⛶
        </button>
      </div>
    </div>
  );
};

/** Some Moment — short videos from the crew, members only. */
const SomeMoments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // A shared link like /some-moment?m=<slug> scrolls straight to that video.
  useEffect(() => {
    const slug = searchParams.get('m');
    if (slug) {
      const el = document.getElementById(`moment-${slug}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchParams]);

  const copyMomentLink = async (m: Moment) => {
    const url = `https://www.ashramamvibes.com/some-moment?m=${m.slug}`;
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
    setCopiedSlug(m.slug);
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
          Some Moment
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#555555',
          textAlign: 'center',
          margin: '0 0 20px 0'
        }}>
          Short videos from the crew — press play and watch right here.
        </p>

        {MOMENTS.length === 0 && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #d9d9d9',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
            <p style={{
              fontSize: '18px',
              fontWeight: 400,
              color: '#111111',
              margin: '0 0 8px 0'
            }}>
              The first moment is on its way
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#555555',
              margin: 0,
              lineHeight: 1.5
            }}>
              It will play right here in the app, members only.
            </p>
          </div>
        )}

        {MOMENTS.map((m) => (
          <MomentCard
            key={m.slug}
            m={m}
            copied={copiedSlug === m.slug}
            onCopy={() => copyMomentLink(m)}
          />
        ))}
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div className="iv-dock-spacer" />
      <BottomNavigation />
    </div>
  );
};

export default SomeMoments;
