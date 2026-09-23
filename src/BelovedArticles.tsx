import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';
import StoryEngagement from './StoryEngagement';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Beloved Articles — timeless pieces from Abdu's old WordPress site,
 * proofread and republished. PUBLIC — no login required.
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
const ARTICLES: BelovedArticle[] = [
  {
    id: 'sahir-momey',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Sahir Momey: The Artist Behind the Lens',
    excerpt: 'A born artist from Fort Kochi — 32 years of craft, from hand-drawn design to photography.',
    image: '/sahir-momey.jpg',
    body: `Sahir Momey is a born artist who went on to become a photographer, with 32 years of experience in the field. He is widely regarded as a legend in hand-drawn design, and later moved into computer design — spanning product design, wall advertisements, theatre slides, portraits, logo design, screen printing, and spray painting. Gradually, he stepped back and moved partially into photography, to support his livelihood.

Sahir was born and brought up in Fort Kochi, a historic port city in Kerala, India, where the community enjoys a vibrant cultural exposure unlike anywhere else in the state. He was raised in a middle-class Muslim family grounded in faith and spirituality. His father was a portrait artist and hand-drawn designer — a college dropout from Feroke, Kozhikode. Sahir's childhood was deeply creative; he accompanied his father to art workshops and grew up immersed in art.

Changing direction was a bold move — never an easy one — yet he succeeded in turning his passion toward photography, focusing on weddings, videography, and local events. He has covered countless weddings with distinction, serving two generations of families. Deeply career-driven, he embraced the rise of new technology, constantly expanding his knowledge and refining his craft.

Through his long journey, he set aside time each day to keep his painter's soul alive, and today he holds a rich collection of his own paintings. His passion is boundless — a driving force that keeps him painting, rather than settling for photography as merely his bread and butter.`,
    date: 'From the archives',
  },
  {
    id: 'retro-life',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Retro Life',
    excerpt: 'On music, patience, and chasing the dream of mastering an instrument.',
    image: '/retro-life.jpg',
    body: `Music is an inspiration — it reveals the instrument you were meant to play. Every instrument finds its mentor in the player who chooses it with purpose and respect for what they aim to achieve.

I have always been passionate, though quietly so. I carried ambitions I wanted to pursue, even as doubt and confusion haunted me like an unwelcome spoiler. But I decided not to hold back, and not to give up for just any reason.

Learning an instrument demands patience — the kind that never stops you from dreaming. So chase your dreams, and discover what you are truly good at.`,
    date: 'From the archives',
  },
  {
    id: 'educating-the-poor',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Educating the Poor',
    excerpt: 'Why millions of children still miss school — and the people fighting to change that.',
    image: '/educating-poor.jpg',
    body: `Education is the process of learning — acquiring knowledge, skills, values, and habits through teaching, training, discussion, and research. It is the key that unlocks human potential, giving shape to ideas and depth to thought. As the ancients said, knowledge is power, and education plays a vital role in any society. Yet today, our society faces a real shortage of education in many places: our country faces a major challenge in bringing schooling to every corner. Governments have launched schemes for the needy — free education systems, government institutes, and more.

But the real challenge runs deeper. Across the world — and in large numbers in India — countless children grow up outside well-managed families, living and working on the streets simply to survive. Addressing this is not easy. NGOs have shown remarkable commitment to the welfare of poor communities, understanding the problem from every angle. They run successful campaigns to educate the poor, backed by sponsors and support programmes.

Even where school fees are free, hidden costs remain: uniforms, food, books — and transport, since schools are often far from rural homes. Parents who cannot bear these costs are forced to pull their children out of school midway.

Children also face steep barriers on their educational path: lack of funding, untrained teachers, missing classrooms, scarce learning materials, hunger, and poor nutrition. Only dedicated, sustained campaigns can clear these barriers. More than grand infrastructure, what works is well-organised social service — and it can transform the lives of poor communities.

Consider a recent story. Sreedhanya Suresh, a 25-year-old woman from a poor background, beat all odds to become a topper. From the Kurichiya tribe of Wayanad, Kerala, she became the first tribal woman from Kerala to clear the UPSC civil services examination — securing the 410th rank on her third attempt. This is not just news; it is history. Her will and courage prove a simple truth: talent lives in every crowd — all it needs is a little support to stretch its wings and fly. She is one example; there are a thousand more like her waiting to show their calibre.

Research points to practical ways of reaching unprivileged children: weekend mobile schools run from a rented van or minibus, turning a living room into a classroom, free libraries built from donated books, small skill-training sessions for children, weekend outdoor sports events — simple ideas, refined through years of experience by dedicated mentors. Social service interns across the country are already running such campaigns, gathering the materials they need to keep teaching alive.

To put it simply: India has more than a billion people, and barely a third can read. With a rapidly growing population, we face a shortage of trained teachers, basic facilities, and funds. Studies show more than 30% of education funding goes to higher education, while primary education — the foundation — is neglected. We rank fourth among the top ten nations with the highest number of primary-level children, and India's growth depends on a well-educated, skilled workforce.

Another crisis weighs on the nation: health and nutrition. Five hundred million Indians live below the poverty line. Underprivileged children face serious short- and long-term risks from macronutrient and micronutrient deficiencies — often beginning before birth, when undernourished mothers face complications in pregnancy. Girls, burdened by their lower social status, are even more vulnerable. These are the realities that stop ordinary families from raising their children toward education.

International organisations have stepped in to rescue children trapped by poverty and lack of schooling, working to give every deserving child what they need to build on their skills. These organisations stand beside the poor every single day — and through such campaigns, countless children have been educated, built careers, supported their families, and served their nation.

Our agenda must be clear: support the education of the poor, and help fulfil their dreams.`,
    date: 'From the archives',
  },
  {
    id: 'the-task',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'The Task',
    excerpt: 'On sharing the planet: the stray animals we walk past every day.',
    image: '/the-task.jpg',
    body: `Ever since the Earth was formed, humans are the only species that pays to live on it — and so our way of living is entirely different from every other species. Though the planet is shared by all, humans dominate: naming ourselves the superior species, controlling, ruling, and consuming. The proper use of science is not to conquer nature but to live with it; instead, we exploit it for infrastructure and lifestyle.

There are many reasons humans became the dominant form of life — not least our ability to cooperate. Yet that same dominance has led us to neglect a simple fact: we are not alone on this planet. Our selfishness can wipe other species aside without a thought for humanity. We underestimate the other creatures of this Earth, fail to treat them right, and rarely grasp the scale of the damage we cause — consequences that can be deadly.

Stray animals are part of our everyday life. They survive on garbage, restaurant leftovers, and scraps — yet no proper system exists to feed them. Project Animalia took up this task: an initiative for the welfare of stray animals, feeding them, sheltering them through extreme conditions, and caring for everything they deserve.`,
    date: 'From the archives',
  },
];

const BelovedArticles: React.FC = () => {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const [user, setUser] = useState<User | null>(null);

  // Public section — track login only so members can comment
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
            <StoryEngagement
              storyId={selected.id}
              user={user}
              collectionName="belovedArticles"
              emptyText="No comments yet — be the first to share your thoughts."
            />
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BelovedArticles;
