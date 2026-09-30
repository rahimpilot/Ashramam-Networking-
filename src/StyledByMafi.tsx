import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const FONT = "'Marcellus', Georgia, serif";
const PAGE_BG = 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)';

const GALLERY = [
  '/styledbymafi/gallery-01.jpg',
  '/styledbymafi/gallery-02.jpg',
  '/styledbymafi/gallery-03.jpg',
  '/styledbymafi/gallery-04.jpg',
  '/styledbymafi/gallery-05.jpg',
  '/styledbymafi/gallery-06.jpg',
  '/styledbymafi/gallery-07.jpg',
  '/styledbymafi/gallery-08.jpg',
  '/styledbymafi/gallery-09.jpg',
  '/styledbymafi/gallery-10.jpg',
  '/styledbymafi/gallery-11.jpg',
  '/styledbymafi/gallery-12.jpg',
  '/styledbymafi/gallery-13.jpg',
];

/** Styled by Mafi — Mafi's fashion portfolio (public). */
const StyledByMafi: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const copyPageLink = async () => {
    const url = 'https://www.ashramamvibes.com/styledbymafi?v=1';
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

  return (
    <div className="sbm-page" style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: FONT }}>
      <style>{`
        @media (min-width: 1024px) {
          .sbm-page { max-width: 1280px; margin: 0 auto; }
          .sbm-hero { height: 82vh !important; min-height: 600px !important; }
          .sbm-hero-text { padding: 2.5rem 3rem 3rem !important; }
          .sbm-kicker { font-size: 1rem !important; }
          .sbm-title { font-size: 5rem !important; }
          .sbm-tag { font-size: 1.3rem !important; max-width: 600px !important; }
          .sbm-about { max-width: 860px !important; padding-top: 3rem !important; }
          .sbm-about h2, .sbm-gallery-wrap h2 { font-size: 2rem !important; }
          .sbm-about-text { font-size: 1.2rem !important; }
          .sbm-gallery-wrap { max-width: 1280px !important; }
          .sbm-gallery { columns: 3 300px !important; column-gap: 1.25rem !important; }
          .sbm-contact { margin: 0 2rem 3rem !important; }
        }
      `}</style>
      {/* Hero */}
      <div className="sbm-hero" style={{ position: 'relative', height: '62vh', minHeight: 380, overflow: 'hidden' }}>
        <img
          src="/styledbymafi/hero.jpg"
          alt="Mehroof — fashion stylist"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,8,20,0.85) 0%, rgba(10,8,20,0.25) 55%, rgba(10,8,20,0.35) 100%)'
        }} />
        <button
          onClick={() => navigate('/hangout')}
          aria-label="Back"
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 2,
            background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, fontSize: '1.3rem', cursor: 'pointer', color: '#3a332a'
          }}
        >←</button>
        <button
          onClick={copyPageLink}
          aria-label="Copy link"
          title="Copy link"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2,
            background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, fontSize: '1.1rem', cursor: 'pointer',
            color: copied ? '#2e7d32' : '#3a332a'
          }}
        >{copied ? '✓' : '🔗'}</button>
        <div className="sbm-hero-text" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1,
          padding: '1.5rem 1.25rem 1.75rem', color: '#fff'
        }}>
          <div className="sbm-kicker" style={{ fontSize: '0.8rem', letterSpacing: '0.35em', opacity: 0.85, marginBottom: '0.4rem' }}>
            FASHION STYLIST
          </div>
          <h1 className="sbm-title" style={{ margin: 0, fontSize: '3rem', fontWeight: 400, lineHeight: 1.05 }}>
            Mehroof
          </h1>
          <p className="sbm-tag" style={{ margin: '0.6rem 0 0', fontSize: '1rem', opacity: 0.9, maxWidth: 420 }}>
            Creating visual stories through wardrobe, texture, and mood.
          </p>
        </div>
      </div>

      {/* About */}
      <div className="sbm-about" style={{ padding: '2rem 1.25rem 0.5rem', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#2c2a4a', margin: '0 0 0.75rem' }}>
          About Me
        </h2>
        <p className="sbm-about-text" style={{ fontSize: '1.02rem', lineHeight: 1.7, color: '#4a4763', margin: 0 }}>
          Creating visual stories through wardrobe, texture, and mood. I specialize in
          editorial shoots, modern styling, and personalized fashion transformations.
        </p>
      </div>

      {/* Gallery */}
      <div className="sbm-gallery-wrap" style={{ padding: '1.5rem 1.25rem 0.5rem', maxWidth: 1080, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#2c2a4a', margin: '0 0 1rem' }}>
          The Gallery
        </h2>
        <div className="sbm-gallery" style={{ columns: '2 200px', columnGap: '0.75rem' }}>
          {GALLERY.map((src) => (
            <img
              key={src}
              src={src}
              alt="Styled by Mafi — portfolio work"
              loading="lazy"
              onClick={() => setLightbox(src)}
              style={{
                width: '100%', display: 'block', marginBottom: '0.75rem',
                borderRadius: 10, cursor: 'zoom-in', breakInside: 'avoid',
                boxShadow: '0 2px 10px rgba(60,50,100,0.12)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Contact — dark textured band */}
      <div className="sbm-contact" style={{
        position: 'relative', overflow: 'hidden', margin: '0 0 2.5rem',
        borderRadius: 18,
      }}>
        <img
          src="/styledbymafi/touch-bg.jpg" alt="" aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,36,0.72)' }} />
        <div style={{ position: 'relative', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#fff', margin: '0 0 0.75rem' }}>
            Get In Touch
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            For bookings, collaborations and styling inquiries.
          </p>
          <a
            href="mailto:mehroofmt@gmail.com"
            style={{
              display: 'inline-block', padding: '0.8rem 2rem', borderRadius: 999,
              background: '#fff', color: '#2c2a4a', textDecoration: 'none', fontSize: '1.05rem', fontWeight: 600
            }}
          >
            ✉️ mehroofmt@gmail.com
          </a>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div className="iv-dock-spacer" />

      <BottomNavigation />

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(8,6,16,0.92)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '1rem'
          }}
        >
          <img
            src={lightbox}
            alt="Styled by Mafi — portfolio work"
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
};

export default StyledByMafi;
