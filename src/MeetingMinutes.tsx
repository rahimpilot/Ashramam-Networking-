import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';

interface Meeting {
  path: string;
  month: string;
  day: string;
  title: string;
  weekday: string;
  points: number;
  accent: string;
  accentBg: string;
}

const MEETINGS: Meeting[] = [
  {
    path: '/meeting-minutes/november-2nd-2025',
    month: 'NOV',
    day: '2',
    title: 'November 2nd, 2025',
    weekday: 'Sunday',
    points: 3,
    accent: '#4a86c8',
    accentBg: '#dbe9f7',
  },
  {
    path: '/meeting-minutes/october-5th-2025',
    month: 'OCT',
    day: '5',
    title: 'October 5th, 2025',
    weekday: 'Sunday',
    points: 3,
    accent: '#5b9bd5',
    accentBg: '#e0eaf4',
  },
  {
    path: '/meeting-minutes/september-7th-2025',
    month: 'SEP',
    day: '7',
    title: 'September 7th, 2025',
    weekday: 'Sunday',
    points: 5,
    accent: '#059669',
    accentBg: '#D1FAE5',
  },
];

const MeetingMinutes: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d7e6f7 0%, #f2f7fd 55%, #e2edf9 100%)',
      fontFamily: "'Marcellus', Georgia, serif"
    }}>
      <style>{`
        .minutes-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .minutes-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); }
        .minutes-card:active { transform: translateY(0); }
      `}</style>

      <PageHeader title="Meeting Minutes" backTo="/hangout" backLabel="Back to Hangout" />

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
            color: '#4a86c8',
            background: '#dbe9f7',
            borderRadius: '999px',
            padding: '5px 12px',
            marginBottom: '10px'
          }}>
            MEETING NOTES
          </div>
          <h2 style={{
            fontSize: '30px',
            fontFamily: "'Marcellus', Georgia, serif",
            fontWeight: 600,
            color: '#1e1a14',
            margin: '0 0 6px 0',
            letterSpacing: '-0.5px'
          }}>
            Minutes of Meeting
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#6b7f92',
            margin: 0,
            lineHeight: 1.5
          }}>
            What was discussed, decided and laughed about — newest first.
          </p>
        </div>

        {/* Meeting list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MEETINGS.map((m) => (
            <div
              key={m.path}
              className="minutes-card"
              onClick={() => navigate(m.path)}
              style={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '18px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 6px 20px rgba(91, 155, 213, 0.18)'
              }}
            >
              {/* Calendar badge */}
              <div style={{
                width: '58px',
                flexShrink: 0,
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #d3dfee',
                textAlign: 'center'
              }}>
                <div style={{
                  background: m.accent,
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  padding: '4px 0'
                }}>
                  {m.month}
                </div>
                <div style={{
                  background: '#ffffff',
                  color: '#1e1a14',
                  fontSize: '22px',
                  fontWeight: 700,
                  padding: '6px 0 8px 0',
                  lineHeight: 1
                }}>
                  {m.day}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1e1a14',
                  marginBottom: '3px'
                }}>
                  {m.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7f92'
                }}>
                  {m.weekday} · {m.points} discussion points
                </div>
              </div>

              <div style={{
                fontSize: '20px',
                color: '#C4C9D4',
                flexShrink: 0
              }}>
                ›
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MeetingMinutes;
