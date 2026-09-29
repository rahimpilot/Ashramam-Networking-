import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

/** Kasol — a curated memory page. Photo on top, story below.
 *  Not a posting page: content is published by Abdu through Muse. */
const Kasol: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyDiaryLink = async () => {
    const url = 'https://www.ashramamvibes.com/our-trips/kasol?v=1';
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
            Kasol
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
      <div className="kasol-hero">
        <img
          src="/kasol.jpg"
          alt="The Ashramam boys in the pine forests around Kasol"
        />
      </div>
      <style>{`
        .kasol-hero img {
          display: block;
          width: 100%;
          height: auto;
        }
        @media (min-width: 1024px) {
          .kasol-hero {
            max-width: 760px;
            margin: 24px auto 0 auto;
            padding: 0 16px;
          }
          .kasol-hero img {
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
          Kasol
        </h2>
        <div style={{ fontSize: 13, color: '#6b7f92', marginBottom: '16px' }}>
          📅 The first planned Ashramam trip · Ashramam Team
        </div>
        <div className="iv-card" style={{ padding: '22px' }}>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            Kasol — the first properly planned trip of Ashramam. The boys had
            manifested this one for a long time, and it finally happened.
            Before this there had been several trips, but always in different
            batches — never the full crew together. Marzook was a new member
            of the team then, so he didn't turn up… or maybe he was just busy
            taking beats from his lover. Either way, the journey began: Dubai
            to Delhi, then on to Kasol — including one of the finest airplane
            experiences ever, aboard an ATR.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: '0 0 16px 0' }}>
            Happiness hit the boys the moment they landed in Kullu, on the taxi
            ride up to Kasol. They trekked to several places around and
            explored to their hearts' content. But the undisputed highlight of
            the trip was the legendary "Bear Story" — a tale (we believe,
            entirely made up) by Hyder and Asif, from when the two got
            separated from the group while trekking to Tosh. They claim they
            wandered into a deep pine forest and had to face down a bear.
            Hyder insists he wasn't scared at all — he says he ran right
            alongside Asif, jumping over roots and… smoking a cigarette
            mid-sprint. We know Hyder, and we know Asif is easy to
            manipulate — you do the math.
          </p>
          <p style={{ fontSize: 15, fontFamily: "'Marcellus', Georgia, serif", lineHeight: 1.7, color: '#33414f', margin: 0 }}>
            All good things come to an end, and the boys had to return to
            Dubai — jobs, daily life, the usual. But not before a bonus trip
            to Delhi, hosted by Mohasin Ali, after ditching flight tickets
            worth ₹48,000 and deciding to take the bus to Delhi instead. The
            airport threw a few more challenges at the boys on the way back
            too. Enough is enough… but it was fun though.
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

export default Kasol;
