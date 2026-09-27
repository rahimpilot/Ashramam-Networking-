import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

/** Albania 2022 — a curated memory page. Photo on top, story below.
 *  Not a posting page: content is published by Abdu through Muse. */
const Albania: React.FC = () => {
  const navigate = useNavigate();

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
            Albania
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
      <div className="albania-hero">
        <img
          src="/albania-2022.jpg"
          alt="The Ashramam team together in Albania, 2022"
        />
      </div>
      <style>{`
        .albania-hero img {
          display: block;
          width: 100%;
          height: auto;
        }
        @media (min-width: 1024px) {
          .albania-hero {
            max-width: 600px;
            margin: 24px auto 0 auto;
            padding: 0 16px;
          }
          .albania-hero img {
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
          fontSize: '26px',
          fontWeight: 400,
          color: '#1c2733',
          margin: '0 0 4px 0',
          lineHeight: 1.25,
        }}>
          Albania
        </h2>
        <div style={{ fontSize: 13, color: '#6b7f92', marginBottom: '16px' }}>
          📅 2022 · Ashramam Team
        </div>
        <div className="iv-card" style={{ padding: '22px' }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#33414f', margin: '0 0 16px 0' }}>
            This was one of the best trips the Ashramam team ever did — back in 2022,
            just a few months after the core COVID days. The trip gave us the chance
            to experience leisure and fun: hiking, a little adventure — it was a
            complete package.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#33414f', margin: '0 0 16px 0' }}>
            The location was brand new to us, and the nature was incredibly rich.
            The highlight of the trip was Lake Komani, where we were taken to a
            resort named Eagle's Land after a 45-minute to one-hour boat ride through
            the middle of a deep lake surrounded by huge mountains.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#33414f', margin: 0 }}>
            That ride alone changed our mood — and the destination was even more
            surprising. The boys threw an amazing party every single night of the trip.
          </p>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '80px' }} />
      <BottomNavigation />
    </div>
  );
};

export default Albania;
