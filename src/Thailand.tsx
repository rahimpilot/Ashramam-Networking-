import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

/** Thailand 2025 (Krabi) — a curated memory page. Photo on top, story below.
 *  Not a posting page: content is published by Abdu through Muse. */
const Thailand: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyDiaryLink = async () => {
    const url = 'https://www.ashramamvibes.com/our-trips/thailand?v=1';
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
            Thailand
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
      <div className="thailand-hero">
        <img
          src="/thailand-2025.jpg"
          alt="The Ashramam team together in Thailand, 2025"
        />
      </div>
      <style>{`
        .thailand-hero img {
          display: block;
          width: 100%;
          height: auto;
        }
        @media (min-width: 1024px) {
          .thailand-hero {
            max-width: 760px;
            margin: 24px auto 0 auto;
            padding: 0 16px;
          }
          .thailand-hero img {
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
          Thailand
        </h2>
        <div style={{ fontSize: 13, color: '#6b7f92', marginBottom: '16px' }}>
          📅 2025 · Ashramam Team
        </div>
        <div className="iv-card" style={{ padding: '22px' }}>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            Next one is Thailand, and that was in 2025. As usual, the boys had
            to travel from different parts of the world to reunite and enjoy.
            The purpose was just to enjoy, and Power Group leader Shanir took
            charge of this trip and planned all the enjoyment the boys should
            have. He took the help of Riyaz Ummer (spiritual soul of Ashramam).
            His bloody thoughts were different, hence he chose a place where the
            boys could trip on happy shake — and he found a name: that's Krabi.
            Power took the rest of the role and booked a fascinating, luxurious
            itinerary. Mister Anas did not join this trip, maybe because he had
            some bad experience in Baku with his guests.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            The highlight of this Thailand trip was foot massage. The boys got
            massages like there was no tomorrow. The gentlemen from the UK and
            Europe had even more massages, saying their currency was worth more
            than everyone else's in the group. Never mind — food was delicious,
            the beach experience was amazing, and the boys had so much fun,
            especially when we all moved to the last stay at a villa.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: 0 }}>
            The British citizen kept blaming and complaining about the weather
            since he came to Thailand with 7 hoodies. Some boys left early and
            some stayed longer than usual, even visiting Bangkok, thanks to the
            caliber of the Power Group. The European folk combined this trip
            with his lover's and stayed for a month or so. That was another
            fantastic trip.
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
      <div className="iv-dock-spacer" />
      <BottomNavigation />
    </div>
  );
};

export default Thailand;
