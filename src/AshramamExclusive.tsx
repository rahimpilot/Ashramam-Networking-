import React from 'react';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';

/**
 * Ashramam Exclusive — the group's hot & exclusive news desk.
 * Abdu will provide the first story content.
 */

interface ExclusiveStory {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  excerpt: string;
  date: string;
}

// Placeholder — first real story lands here when Abdu shares it.
const STORIES: ExclusiveStory[] = [
  {
    id: 'coming-soon',
    badge: 'COMING SOON',
    badgeColor: '#6b7f92',
    title: 'First exclusive dropping soon…',
    excerpt: 'The hottest news from inside the group lands here first. Stay tuned — Abdu is cooking up the first exclusive as we speak.',
    date: '',
  },
];

const AshramamExclusive: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9f1f8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      <PageHeader title="Ashramam Exclusive" backTo="/hangout" backLabel="Back to hangout" />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 110px 16px' }}>
        {/* News-desk hero */}
        <div className="iv-card" style={{
          padding: '22px 20px',
          marginBottom: 16,
          background: 'linear-gradient(135deg, #1c2733 0%, #2c3e50 100%)',
          border: 'none',
          color: '#ffffff'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#e63946',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            padding: '5px 10px',
            borderRadius: 6,
            marginBottom: 12
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            EXCLUSIVE
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: 22, fontWeight: 700 }}>
            Inside stories, before anyone else.
          </h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.75, lineHeight: 1.5 }}>
            The hot news desk of the group — members only.
          </p>
        </div>

        {/* Stories */}
        <div className="iv-stagger">
          {STORIES.map((story) => (
            <article key={story.id} className="iv-card iv-press" style={{ padding: 18, marginBottom: 12 }}>
              <div style={{
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#ffffff',
                background: story.badgeColor,
                padding: '4px 10px',
                borderRadius: 20,
                marginBottom: 10
              }}>
                {story.badge}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: '#1c2733', lineHeight: 1.35 }}>
                {story.title}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#5b6b7c', lineHeight: 1.6 }}>
                {story.excerpt}
              </p>
              {story.date && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#8a9aaB' }}>{story.date}</div>
              )}
            </article>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AshramamExclusive;
