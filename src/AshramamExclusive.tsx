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
  body?: string;
  image?: string;
  date: string;
}

const STORIES: ExclusiveStory[] = [
  {
    id: 'dhoomakethu',
    badge: 'EXCLUSIVE',
    badgeColor: '#e63946',
    title: 'Dhoomakethu',
    excerpt: "Shanir Musliyamveetil's first cinema drops this Friday — a comedy loop thriller.",
    image: '/dhoomakethu-poster.jpg',
    body: `Shanir Musliyamveetil's first cinema drops this Friday — and the project is titled Dhoomakethu, a comedy loop thriller.

Shanir stepped into the industry almost by accident, but once he was in, there was no looking back. He threw himself into it — engaging with artists on and off set, exploring the craft, and discovering a genuine passion for the work. Along the way he made friends, gathered his Power Group members around him, and now travels everywhere with them, honouring their little inner selves.

Coming back to the topic — Dhoomakethu. Our whole crew is set to watch the movie first-day-first-show, from different parts of the world. We wish Shanir Musliyamveetil the very best of luck — and many more to come.

He even arranged a special screening for his friend Niyaz Kamaru, who insisted on watching the film with his family at any cost — a true family man, a one-woman man, and ever truthful to his wife. And though Shanir is an evergreen fraud, he decided to honour the request.

Back to the movie — we will pack the cinema hall, cheer it on, and wait to celebrate its success.

While post-production was underway, Shanir's friend Asif travelled to Kochi to meet and congratulate the entire cast. While congratulating them, Asif honoured his own little inner self so many times that he forgot the purpose of his Kochi visit last week.

Shanir will be watching the film from Kerala, alongside his naughty close friends Hyder, Riyaz, and Farhad. I don't want to get into Hyder too much and get lost in the loop — rather, go watch this loop thriller with your loved ones.

All the best — and chests.`,
    date: 'September 25, 2026',
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
        </div>

        {/* Stories */}
        <div className="iv-stagger">
          {STORIES.map((story) => (
            <article key={story.id} className="iv-card iv-press" style={{ padding: 0, marginBottom: 12, overflow: 'hidden' }}>
              {story.image && (
                <img
                  src={story.image}
                  alt={story.title}
                  style={{ width: '100%', display: 'block' }}
                />
              )}
              <div style={{ padding: 18 }}>
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
              <p style={{ margin: 0, fontSize: 14, color: '#5b6b7c', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {story.body || story.excerpt}
              </p>
              {story.date && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#8a9aaB' }}>{story.date}</div>
              )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AshramamExclusive;
