import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface Credit {
  role: string;
  name: string;
}

const FEATURE_CREDITS: Credit[] = [
  { role: 'Editor-in-Chief', name: 'Larissa Azanova' },
  { role: 'Photography', name: 'Mann' },
  { role: 'Concept & Art Direction', name: 'Galbi' },
  { role: 'Styling', name: 'Daniela Correia' },
  { role: 'Styling Assistant', name: 'Mehroof (Mafi)' },
  { role: 'Hair', name: 'Umang' },
  { role: 'Makeup', name: 'Arianna Scapola' },
  { role: 'Digitech', name: 'Alister' },
  { role: 'Model', name: 'Reimi' },
  { role: 'Casting Curation', name: 'Ellie Vojvodinska' },
  { role: 'Light Assistant', name: 'James' },
  { role: 'Retouch', name: 'Gorgeous Agency' },
  { role: 'Studio', name: 'Bicki Boss' },
  { role: 'Production', name: 'Things By People' },
];

/** Style By Mafi — a member's fashion and styling showcase. */
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
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          Style By Mafi
        </h1>

        {/* Feature tile — Harper's Bazaar Kazakhstan, Diamond Issue */}
        <div className="iv-card" style={{
          background: '#ffffff',
          border: '1px solid #d9d9d9',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <img
            src="/style-by-mafi/bazaar-diamond-cover.jpg"
            alt="Harper's Bazaar Kazakhstan, May 2023 — Diamond Issue cover"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              display: 'block'
            }}
          />
          <p style={{
            fontSize: '12px',
            fontWeight: 400,
            color: '#777777',
            margin: '16px 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Cover story · May 2023
          </p>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 400,
            color: '#111111',
            margin: '0 0 8px 0'
          }}>
            Harper's Bazaar Kazakhstan — Diamond Issue
          </h2>
          <p style={{
            fontSize: '15px',
            fontWeight: 400,
            color: '#333333',
            margin: '0 0 16px 0',
            lineHeight: 1.6
          }}>
            Mafi worked as styling assistant on the cover story of Harper's
            Bazaar Kazakhstan's Diamond Issue — a high-fashion editorial shoot.
          </p>

          <div style={{
            borderTop: '1px solid #e6e6e6',
            paddingTop: '12px'
          }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 400,
              color: '#777777',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Credits
            </p>
            {FEATURE_CREDITS.map((c) => (
              <div
                key={c.role}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '5px 0',
                  fontSize: '13px',
                  lineHeight: 1.4
                }}
              >
                <span style={{ color: '#777777' }}>{c.role}</span>
                <span style={{ color: '#111111', textAlign: 'right' }}>{c.name}</span>
              </div>
            ))}
          </div>
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
