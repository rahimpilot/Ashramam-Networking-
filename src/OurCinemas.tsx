import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { CINEMAS, getCinema, cinemaPoster, cinemaWatchUrl, Cinema } from './ourCinemas';

const FONT = "'Marcellus', Georgia, serif";
const PAGE_BG = 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)';
const SITE = 'https://www.ashramamvibes.com';

function useCopyLink(url: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
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
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return [copied, copy];
}

function TopBar({ onBack, shareUrl }: { onBack: () => void; shareUrl: string }) {
  const [copied, copy] = useCopyLink(shareUrl);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem' }}>
      <button
        onClick={onBack}
        aria-label="Back"
        style={{
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: 40, height: 40, fontSize: '1.3rem', cursor: 'pointer', color: '#3a332a',
          boxShadow: '0 2px 8px rgba(60,50,100,0.15)',
        }}
      >←</button>
      <button
        onClick={copy}
        aria-label="Copy link"
        title="Copy link"
        style={{
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: 40, height: 40, fontSize: '1.1rem', cursor: 'pointer',
          color: copied ? '#2e7d32' : '#3a332a',
          boxShadow: '0 2px 8px rgba(60,50,100,0.15)',
        }}
      >{copied ? '✓' : '🔗'}</button>
    </div>
  );
}

function CinemaCard({ cinema }: { cinema: Cinema }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/our-cinemas/${cinema.id}`)}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        border: '1px solid rgba(120,110,160,0.25)',
        boxShadow: '0 2px 10px rgba(60,50,100,0.10)',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#1c1830' }}>
        <img
          src={cinemaPoster(cinema)}
          alt={cinema.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', color: '#2c2a4a', paddingLeft: 4,
          }}>▶</div>
        </div>
      </div>
      <div style={{ padding: '0.9rem 1rem 1.1rem' }}>
        <div style={{ fontSize: '1.15rem', color: '#2c2a4a' }}>{cinema.title}</div>
        <div style={{ fontSize: '0.9rem', color: '#6b6785', marginTop: '0.25rem' }}>by {cinema.by}</div>
      </div>
    </div>
  );
}

/** Our Cinemas — public short-film category. List at /our-cinemas, player at /our-cinemas/:cinemaId. */
const OurCinemas: React.FC = () => {
  const navigate = useNavigate();
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const cinema = getCinema(cinemaId);

  return (
    <div className="oc-page" style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: FONT }}>
      <style>{`
        @media (min-width: 1024px) {
          .oc-wrap { max-width: 1280px !important; }
          .oc-title { font-size: 2.6rem !important; }
          .oc-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 1.5rem !important; }
          .oc-player-wrap { max-width: 980px !important; }
          .oc-detail-title { font-size: 2.2rem !important; }
        }
      `}</style>

      {cinema ? (
        <>
          <TopBar onBack={() => navigate('/our-cinemas')} shareUrl={`${SITE}/our-cinemas/${cinema.id}?v=1`} />
          <div className="oc-wrap oc-player-wrap" style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.25rem 3rem' }}>
            <a
              href={cinemaWatchUrl(cinema)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${cinema.title} on YouTube`}
              style={{
                display: 'block', borderRadius: 16, overflow: 'hidden', background: '#000',
                boxShadow: '0 8px 30px rgba(40,30,80,0.25)', cursor: 'pointer', position: 'relative',
              }}
            >
              <div style={{ aspectRatio: '16 / 9' }}>
                <img
                  src={cinemaPoster(cinema)}
                  alt={cinema.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(10,8,25,0.18)',
              }}>
                <div style={{
                  width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.94)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', color: '#2c2a4a', paddingLeft: 6,
                  boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
                }}>▶</div>
              </div>
            </a>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#8a86a3', marginTop: '0.6rem' }}>
              Tap to watch on YouTube
            </div>
            <h1 className="oc-detail-title" style={{ fontSize: '1.7rem', fontWeight: 400, color: '#2c2a4a', margin: '1.25rem 0 0.35rem' }}>
              {cinema.title}
            </h1>
            <div style={{ fontSize: '1rem', color: '#6b6785', marginBottom: '0.75rem' }}>by {cinema.by}</div>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: '#4a4763', margin: 0 }}>
              {cinema.description}
            </p>
            {cinema.directorStory && (
              <div style={{ marginTop: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#2c2a4a', margin: '0 0 0.6rem' }}>
                  About the director
                </h2>
                {cinema.directorStory.split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontSize: '1rem', lineHeight: 1.7, color: '#4a4763', margin: i === 0 ? 0 : '0.75rem 0 0' }}>
                    {para}
                  </p>
                ))}
              </div>
            )}
            {cinema.cast.length > 0 && (
              <div style={{ marginTop: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#2c2a4a', margin: '0 0 0.6rem' }}>
                  Cast
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#4a4763', margin: 0 }}>
                  {cinema.cast.join(', ')}
                </p>
              </div>
            )}
            {cinema.crew.length > 0 && (
              <div style={{ marginTop: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#2c2a4a', margin: '0 0 0.6rem' }}>
                  Crew
                </h2>
                <div>
                  {cinema.crew.map((credit) => (
                    <div key={credit.role} style={{ display: 'flex', gap: '0.75rem', padding: '0.3rem 0', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      <div style={{ flex: '0 0 190px', color: '#8a86a3' }}>{credit.role}</div>
                      <div style={{ color: '#2c2a4a' }}>{credit.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cinema.copyright && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#8a86a3' }}>
                {cinema.copyright}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <TopBar onBack={() => navigate('/hangout')} shareUrl={`${SITE}/our-cinemas?v=1`} />
          <div className="oc-wrap" style={{ maxWidth: 1080, margin: '0 auto', padding: '0.5rem 1.25rem 3rem' }}>
            <h1 className="oc-title" style={{ fontSize: '1.9rem', fontWeight: 400, color: '#2c2a4a', margin: '0 0 0.4rem' }}>
              Our Cinemas
            </h1>
            <p style={{ fontSize: '1rem', color: '#6b6785', margin: '0 0 1.5rem' }}>
              Short films by our own people. Tap a film to watch.
            </p>
            <div className="oc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              {CINEMAS.map((c) => <CinemaCard key={c.id} cinema={c} />)}
            </div>
          </div>
        </>
      )}

      <BottomNavigation />
    </div>
  );
};

export default OurCinemas;
