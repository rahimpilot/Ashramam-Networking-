import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

/** Kodaikanal 2015 — a curated memory page. Photo on top, story below.
 *  Not a posting page: content is published by Ray through Muse. */
const Kodaikanal: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyDiaryLink = async () => {
    const url = 'https://www.ashramamvibes.com/our-trips/kodaikanal?v=1';
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
            Kodaikanal
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
      <div className="kodaikanal-hero">
        <img
          src="/kodaikanal-2015.jpg"
          alt="The Ashramam boys together in the misty hills of Kodaikanal"
        />
      </div>
      <style>{`
        .kodaikanal-hero img {
          display: block;
          width: 100%;
          height: auto;
        }
        .kodaikanal-inline img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 12px;
        }
        @media (min-width: 1024px) {
          .kodaikanal-hero {
            max-width: 760px;
            margin: 24px auto 0 auto;
            padding: 0 16px;
          }
          .kodaikanal-hero img {
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
          Kodaikanal
        </h2>
        <div style={{ fontSize: 13, color: '#6b7f92', marginBottom: '16px' }}>
          📅 2015 · Ashramam Team
        </div>
        <div className="iv-card" style={{ padding: '22px' }}>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            Kodaikanal 2015 — this trip came before the bachelor life, and it
            might be one of the best trips ever. We were all in Kerala when Pat
            hired a traveller and took all the boys to Kodai. Someone booked a
            stay in the middle of a small town. The boys started chilling —
            the boys found happiness, deserved happiness, and the night was long.
          </p>
          <div className="kodaikanal-inline" style={{ margin: '0 0 16px 0' }}>
            <img
              src="/kodaikanal-2015-bus.jpg"
              alt="The boys packed into the traveller on the way to Kodaikanal"
            />
          </div>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            It was a very old, ancient, scary cottage in the middle of nowhere.
            The boys had a delicious breakfast. At night the boys saw a bison —
            though some boys claim it was a hallucination. It was a remarkable
            moment, and a remarkable travel diary for Ashramam.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            The highlight of the trip was Shylock, who joined the trip even
            though his wedding was the very next day. Maybe he had a little
            enjoyment before the wedding — but that is not our topic right now.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: 0 }}>
            We think this was Hyder's first trip with Ashramam. The mist was
            gorgeous, and so was the weather. All we can think of is the
            happiness — and the delicious food we had everywhere in Kodai, in
            the month of monsoon.
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

export default Kodaikanal;
