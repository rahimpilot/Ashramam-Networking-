import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';
import { SkeletonPost } from './Skeleton';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Ashramam Exclusive — the group's hot & exclusive news desk. Members only.
 * Topic list at /ashramam-exclusive, full story at /ashramam-exclusive/:storyId.
 */

interface ExclusiveStory {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  excerpt: string;
  body?: string;
  image?: string;
  footerImage?: string;
  footerCaption?: string;
  date: string;
}

const STORIES: ExclusiveStory[] = [
  {
    id: 'dhoomakethu',
    badge: 'EXCLUSIVE',
    badgeColor: '#e63946',
    title: 'Dhoomakethu',
    excerpt: "Shanir Musliyamveetil's first cinema drops this Friday — a comedy loop thriller.",
    body: `Shanir Musliyamveetil's first cinema drops this Friday — and the project is titled Dhoomakethu, a comedy loop thriller.

Shanir stepped into the industry almost by accident, but once he was in, there was no looking back. He threw himself into it — engaging with artists on and off set, exploring the craft, and discovering a genuine passion for the work. Along the way he made friends, gathered his Power Group members around him, and now travels everywhere with them, honouring their little inner selves.

Coming back to the topic — Dhoomakethu. Our whole crew is set to watch the movie first-day-first-show, from different parts of the world. We wish Shanir Musliyamveetil the very best of luck — and many more to come.

He even arranged a special screening for his friend Niyaz Kamaru, who insisted on watching the film with his family at any cost — a true family man, a one-woman man, and ever truthful to his wife. And though Shanir is an evergreen fraud, he decided to honour the request.

Back to the movie — we will pack the cinema hall, cheer it on, and wait to celebrate its success.

While post-production was underway, Shanir's friend Asif travelled to Kochi to meet and congratulate the entire cast. While congratulating them, Asif honoured his own little inner self so many times that he forgot the purpose of his Kochi visit last week.

Shanir will be watching the film from Kerala, alongside his naughty close friends Hyder, Riyaz, and Farhad. I don't want to get into Hyder too much and get lost in the loop — rather, go watch this loop thriller with your loved ones.

All the best and cheers.`,
    image: '/dhoomakethu-poster.jpg',
    footerImage: '/shanir-honour.jpg',
    footerCaption: 'Shanir Musliyamveetil — the man of the moment. Respect. 🙏',
    date: 'September 25, 2026',
  },
];

const AshramamExclusive: React.FC = () => {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Members only — same gate as Stories
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#e9f1f8' }}>
        <PageHeader title="Ashramam Exclusive" backTo="/hangout" backLabel="Back to hangout" />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
          <SkeletonPost />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const selected = storyId ? STORIES.find((s) => s.id === storyId) || null : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9f1f8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      <PageHeader
        title="Ashramam Exclusive"
        backTo="/hangout"
        backLabel={selected ? 'Back to exclusives' : 'Back to hangout'}
        onBack={selected ? () => navigate('/ashramam-exclusive') : undefined}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 110px 16px' }}>
        {!selected ? (
          <>
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

            {/* Topic list */}
            <div className="iv-stagger">
              {STORIES.map((story) => (
                <article
                  key={story.id}
                  className="iv-card iv-press"
                  onClick={() => navigate(`/ashramam-exclusive/${story.id}`)}
                  style={{ marginBottom: 12, overflow: 'hidden', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', gap: 14, padding: 14, alignItems: 'center' }}>
                    {story.image && (
                      <img
                        src={story.image}
                        alt={story.title}
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: 'cover',
                          borderRadius: 12,
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'inline-block',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        color: '#ffffff',
                        background: story.badgeColor,
                        padding: '3px 9px',
                        borderRadius: 20,
                        marginBottom: 6
                      }}>
                        {story.badge}
                      </div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, color: '#1c2733' }}>
                        {story.title}
                      </h3>
                      <p style={{
                        margin: 0, fontSize: 13, color: '#5b6b7c', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {story.excerpt}
                      </p>
                      {story.date && (
                        <div style={{ marginTop: 6, fontSize: 12, color: '#8a9aab' }}>{story.date}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 20, color: '#9db2c6', flexShrink: 0 }}>›</div>
                  </div>
                </article>
              ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#8a9aab', marginTop: 20 }}>
              More exclusives dropping soon…
            </p>
          </>
        ) : (
          /* Story detail */
          <article className="iv-card" style={{ overflow: 'hidden' }}>
            {selected.image && (
              <img src={selected.image} alt={selected.title} style={{ width: '100%', display: 'block' }} />
            )}
            <div style={{ padding: 20 }}>
              <div style={{
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#ffffff',
                background: selected.badgeColor,
                padding: '4px 10px',
                borderRadius: 20,
                marginBottom: 10
              }}>
                {selected.badge}
              </div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 800, color: '#1c2733' }}>
                {selected.title}
              </h2>
              {selected.date && (
                <div style={{ fontSize: 13, color: '#8a9aab', marginBottom: 14 }}>{selected.date}</div>
              )}
              <p style={{ margin: 0, fontSize: 15, color: '#3d4b5c', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {selected.body || selected.excerpt}
              </p>
              {selected.footerImage && (
                <figure style={{ margin: '22px 0 0 0' }}>
                  <img
                    src={selected.footerImage}
                    alt="Shanir Musliyamveetil"
                    style={{ width: '100%', display: 'block', borderRadius: 12 }}
                  />
                  {selected.footerCaption && (
                    <figcaption style={{
                      textAlign: 'center', fontSize: 13, color: '#5b6b7c',
                      marginTop: 10, fontStyle: 'italic', lineHeight: 1.5
                    }}>
                      {selected.footerCaption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          </article>
        )}

        {/* Copy link — bottom right, after everything */}
        {selected && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button
              onClick={copyLink}
              className="iv-press"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#1c2733',
                color: '#ffffff',
                border: 'none',
                borderRadius: 24,
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(28, 39, 51, 0.25)'
              }}
            >
              <span style={{ fontSize: 15 }}>{copied ? '✓' : '🔗'}</span>
              {copied ? 'Link copied!' : 'Copy link'}
            </button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AshramamExclusive;
