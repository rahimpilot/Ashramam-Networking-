import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { STYLE_TOPICS } from './styleTopics';

const PAGE_BG = 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)';
const FONT = "'Marcellus', Georgia, serif";

/** Style By Mafi — topic listing. Each card opens its own detail page. */
const StyleByMafi: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyPageLink = async () => {
    const url = 'https://www.ashramamvibes.com/style-by-mafi?v=2';
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
    <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: FONT }}>
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
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          Styled by Mafi
        </h1>

        <div className="iv-cards">
          {STYLE_TOPICS.map((topic) => (
            <button
              key={topic.slug}
              onClick={() => navigate(`/style-by-mafi/${topic.slug}`)}
              style={{
                background: '#ffffff',
                border: '1px solid #d9d9d9',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: FONT,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <img
                src={topic.image}
                alt={topic.title}
                style={{
                  width: '84px',
                  height: '112px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  flexShrink: 0,
                  display: 'block'
                }}
              />
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: '11px',
                  color: '#777777',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {topic.kicker}
                </p>
                <p style={{
                  fontSize: '17px',
                  fontWeight: 400,
                  color: '#111111',
                  margin: 0,
                  lineHeight: 1.35
                }}>
                  {topic.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Copy public link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={copyPageLink}
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
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '80px' }} />
      <BottomNavigation />
    </div>
  );
};

export default StyleByMafi;
