import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

/** Baku 2024 — a curated memory page. Photo on top, story below.
 *  Not a posting page: content is published by Abdu through Muse. */
const Baku: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyDiaryLink = async () => {
    const url = 'https://www.ashramamvibes.com/our-trips/baku?v=2';
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
      fontFamily: "'Marcellus', Georgia, serif"
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #c9d9e8'
      }}>
        <div
          className="iv-page"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}>
          <button
            onClick={() => navigate('/our-trips')}
            style={{
              background: 'none',
              border: 'none',
              color: '#5b9bd5',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
            }}
            aria-label="Back to Travel Diaries"
          >
            ←
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 400,
            color: '#1c1915',
            lineHeight: '1.3',
            margin: 0
          }}>
            Baku
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

      {/* Hero photo — full-bleed on mobile, capped and rounded on web */}
      <div className="baku-hero">
        <img
          src="/baku-2024.jpg"
          alt="The Ashramam team together in Baku, 2024"
        />
      </div>
      <style>{`
        .baku-hero img {
          display: block;
          width: 100%;
          height: auto;
        }
        @media (min-width: 1024px) {
          .baku-hero {
            max-width: 760px;
            margin: 24px auto 0 auto;
            padding: 0 16px;
          }
          .baku-hero img {
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          }
        }
      `}</style>

      {/* Story */}
      <div
        className="iv-page"
        style={{
          paddingTop: '20px',
          paddingBottom: '16px',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        <h2 style={{
          fontSize: '22px',
          fontWeight: 400,
          fontFamily: "'Marcellus', Georgia, serif",
          letterSpacing: '0.5px',
          color: '#1c2733',
          margin: '0 0 4px 0',
          lineHeight: 1.25,
        }}>
          Baku
        </h2>
        <div style={{ fontSize: 13, color: '#6b7f92', marginBottom: '16px' }}>
          📅 2024 · Ashramam Team
        </div>
        <div className="iv-card" style={{ padding: '22px' }}>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            This was the first trip where the boys had to travel from different
            parts of the world to reunite. Though the weather was not so nice,
            we had an amazing, blasting time as usual.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            The highlight of the trip was lamb — we had lamb for breakfast, lunch,
            and dinner, all day, every day. It was a crucial decision made by
            Chaandy Cock, who wanted to please his friends with lamb. Our blessing
            was the Power Group's luxury — they had a minimum standard for
            everything they chose, especially the stay. The Power Group booked
            every single tiny facility in Baku and let the boys enjoy.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: 0 }}>
            The last night of the trip was crazy — the Power Group took us to a
            disco in the city with the help of their business partners in Baku
            and made the boys feel like they were in a dream world. There was no
            counting the luxury that night. Priven was the star of the night.
          </p>
        </div>
      </div>

      {/* Copy link — at the bottom of the diary */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
        <button
          onClick={copyDiaryLink}
          aria-label="Copy link to this diary"
          title="Copy link"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '10px',
            fontSize: '22px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          {copied ? <span style={{ color: '#1c9c4c' }}>✓</span> : '🔗'}
        </button>
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '80px' }} />
      <BottomNavigation />
    </div>
  );
};

export default Baku;
