import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { getStyleTopic } from './styleTopics';

const PAGE_BG = 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)';
const FONT = "'Marcellus', Georgia, serif";

/** Style By Mafi — detail page for one topic. */
const StyleTopicDetail: React.FC = () => {
  const navigate = useNavigate();
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const topic = getStyleTopic(topicSlug || '');
  const [copied, setCopied] = useState(false);

  const copyTopicLink = async () => {
    if (!topic) return;
    const url = `https://www.ashramamvibes.com/style-by-mafi/${topic.slug}?v=1`;
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

  if (!topic) {
    return (
      <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: FONT }}>
        <div className="iv-page" style={{ paddingTop: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#111111' }}>This style story isn't here anymore.</p>
          <button
            onClick={() => navigate('/style-by-mafi')}
            style={{
              background: 'none', border: 'none', color: '#3a332a',
              fontSize: '16px', cursor: 'pointer', fontFamily: FONT, marginTop: '12px'
            }}
          >
            ← Back to Style By Mafi
          </button>
        </div>
        <div style={{ height: '80px' }} />
        <BottomNavigation />
      </div>
    );
  }

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
          onClick={() => navigate('/style-by-mafi')}
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
        <div className="iv-card" style={{
          background: '#ffffff',
          border: '1px solid #d9d9d9',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#777777',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {topic.kicker}
              </p>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 400,
                color: '#111111',
                margin: '0 0 8px 0'
              }}>
                {topic.title}
              </h2>
            </div>
            <button
              onClick={copyTopicLink}
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
          <img
            src={topic.image}
            alt={topic.title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              display: 'block',
              margin: '12px 0 16px 0'
            }}
          />
          <p style={{
            fontSize: '15px',
            fontWeight: 400,
            color: '#333333',
            margin: '0 0 16px 0',
            lineHeight: 1.6
          }}>
            {topic.description}
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
            {topic.credits.map((c) => (
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
      </div>

      {/* Spacer so content isn't hidden behind the bottom nav */}
      <div style={{ height: '80px' }} />
      <BottomNavigation />
    </div>
  );
};

export default StyleTopicDetail;
