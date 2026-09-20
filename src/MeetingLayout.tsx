import React from 'react';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';

export interface DiscussionPoint {
  title: string;
  body: string;
}

interface MeetingLayoutProps {
  dateTitle: string;
  weekday: string;
  accent: string;
  accentBg: string;
  participants?: string[];
  points: DiscussionPoint[];
  footer: string;
}

/** Shared clean layout for individual meeting-minutes pages. */
const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  dateTitle,
  weekday,
  accent,
  accentBg,
  participants,
  points,
  footer,
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F6F7F9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      <PageHeader title="Meeting Minutes" backTo="/meeting-minutes" backLabel="Back to all meetings" />

      <div style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '24px 16px 110px 16px'
      }}>
        {/* Hero */}
        <div style={{ marginBottom: '20px', padding: '0 4px' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: accent,
            background: accentBg,
            borderRadius: '999px',
            padding: '5px 12px',
            marginBottom: '10px'
          }}>
            MEETING NOTES
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#111318',
            margin: '0 0 6px 0',
            letterSpacing: '-0.5px'
          }}>
            {dateTitle}
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            margin: 0
          }}>
            {weekday} · {points.length} discussion {points.length === 1 ? 'point' : 'points'}
          </p>
        </div>

        {/* Participants */}
        {participants && participants.length > 0 && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #ECEEF1',
            borderRadius: '16px',
            padding: '18px',
            marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#9CA3AF',
              marginBottom: '12px'
            }}>
              PARTICIPANTS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {participants.map((p) => (
                <span
                  key={p}
                  style={{
                    background: accentBg,
                    color: accent,
                    fontSize: '13.5px',
                    fontWeight: 600,
                    borderRadius: '999px',
                    padding: '7px 14px'
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Discussion points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {points.map((point, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECEEF1',
                borderRadius: '16px',
                padding: '18px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: accentBg,
                  color: accent,
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '15.5px',
                    fontWeight: 700,
                    color: '#111318',
                    marginBottom: '6px',
                    lineHeight: 1.4
                  }}>
                    {point.title}
                  </div>
                  <p style={{
                    fontSize: '14.5px',
                    color: '#4B5563',
                    margin: 0,
                    lineHeight: 1.65
                  }}>
                    {point.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#9CA3AF',
          margin: '20px 4px 0 4px',
          lineHeight: 1.6
        }}>
          {footer}
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MeetingLayout;
