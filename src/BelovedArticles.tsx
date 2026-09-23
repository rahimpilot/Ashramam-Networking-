import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';
import { SkeletonPost } from './Skeleton';
import StoryEngagement from './StoryEngagement';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Beloved Articles — timeless pieces from Abdu's old WordPress site,
 * proofread and republished. Members only.
 * Topic list at /beloved-articles, full article at /beloved-articles/:articleId.
 */

interface BelovedArticle {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  excerpt: string;
  body?: string;
  image?: string;
  date: string;
}

// Abdu will feed articles one by one — they land here.
const ARTICLES: BelovedArticle[] = [];

const BelovedArticles: React.FC = () => {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Members only — same gate as Stories / Exclusive
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

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#e9f1f8' }}>
        <PageHeader title="Beloved Articles" backTo="/hangout" backLabel="Back to hangout" />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
          <SkeletonPost />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const selected = articleId ? ARTICLES.find((a) => a.id === articleId) || null : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9f1f8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
    }}>
      <PageHeader
        title="Beloved Articles"
        backTo="/hangout"
        backLabel={selected ? 'Back to articles' : 'Back to hangout'}
        onBack={selected ? () => navigate('/beloved-articles') : undefined}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 110px 16px' }}>
        {!selected ? (
          <>
            {/* Hero */}
            <div className="iv-card" style={{
              padding: '22px 20px',
              marginBottom: 16,
              background: 'linear-gradient(135deg, #2b2118 0%, #4a3423 100%)',
              border: 'none',
              color: '#ffffff'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#d97706',
                color: '#fff',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.12em',
                padding: '5px 10px',
                borderRadius: 6,
                marginBottom: 12
              }}>
                <span style={{ fontSize: 12 }}>📖</span>
                BELOVED
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: 22, fontWeight: 700 }}>
                Words worth keeping.
              </h2>
            </div>

            {/* Article list */}
            {ARTICLES.length === 0 ? (
              <div className="iv-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: '#1c2733' }}>
                  The first article is on its way…
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#5b6b7c', lineHeight: 1.6 }}>
                  Beloved pieces from the old site, polished and republished here.
                </p>
              </div>
            ) : (
              <div className="iv-stagger">
                {ARTICLES.map((article) => (
                  <article
                    key={article.id}
                    className="iv-card iv-press"
                    onClick={() => navigate(`/beloved-articles/${article.id}`)}
                    style={{ marginBottom: 12, overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', gap: 14, padding: 14, alignItems: 'center' }}>
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 96, height: 96, borderRadius: 12, flexShrink: 0,
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
                        }}>
                          📖
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'inline-block',
                          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                          color: '#ffffff', background: article.badgeColor,
                          padding: '3px 9px', borderRadius: 20, marginBottom: 6
                        }}>
                          {article.badge}
                        </div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, color: '#1c2733' }}>
                          {article.title}
                        </h3>
                        <p style={{
                          margin: 0, fontSize: 13, color: '#5b6b7c', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {article.excerpt}
                        </p>
                        {article.date && (
                          <div style={{ marginTop: 6, fontSize: 12, color: '#8a9aab' }}>{article.date}</div>
                        )}
                      </div>
                      <div style={{ fontSize: 20, color: '#9db2c6', flexShrink: 0 }}>›</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Article detail */
          <>
            <article className="iv-card" style={{ overflow: 'hidden' }}>
              {selected.image && (
                <img src={selected.image} alt={selected.title} style={{ width: '100%', display: 'block' }} />
              )}
              <div style={{ padding: 20 }}>
                <div style={{
                  display: 'inline-block',
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                  color: '#ffffff', background: selected.badgeColor,
                  padding: '4px 10px', borderRadius: 20, marginBottom: 10
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
              </div>
            </article>
            <StoryEngagement storyId={`beloved-${selected.id}`} user={user} />
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BelovedArticles;
