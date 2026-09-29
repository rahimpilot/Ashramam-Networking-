// api/og-style.js
//
// Dynamic Open Graph preview for individual Style By Mafi topics.
//
//   /api/og-style?slug=<topic-slug>  -> HTML card with OG meta tags. Served to
//                                      WhatsApp / Facebook / Twitter crawlers
//                                      through a User-Agent rewrite in vercel.json.
//                                      Humans keep getting the SPA.
//
// Unknown or missing slugs fall back to the generic Style By Mafi card.

const SITE = 'https://www.ashramamvibes.com';

// Mirror of the topic catalog in src/styleTopics.ts (slug -> title/image).
const TOPICS = {
  'bazaar-diamond-issue': {
    title: "Harper's Bazaar Kazakhstan — Diamond Issue",
    kicker: 'Cover story · May 2023',
    image: `${SITE}/og-style-by-mafi.jpg`,
  },
  'bazaar-diamond-issue-digital': {
    title: "Harper's Bazaar Kazakhstan — Diamond Issue (Digital Cover)",
    kicker: 'Digital cover · May 2023',
    image: `${SITE}/og-style-by-mafi-digital.jpg`,
  },
};

const FALLBACK_IMAGE = `${SITE}/og-style-by-mafi.jpg`;
const FALLBACK_TITLE = 'Style By Mafi | Ashramam';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

module.exports = async (req, res) => {
  const slug = String(req.query.slug || '');
  const topic = TOPICS[slug];
  const pageTitle = topic ? `${topic.title} | Style By Mafi` : FALLBACK_TITLE;
  const description = topic
    ? `${topic.kicker} — ${topic.title}. Tap to open.`
    : "Mafi's styling work and fashion editorials. Tap to open.";
  const image = topic ? topic.image : FALLBACK_IMAGE;
  const pageUrl = topic
    ? `${SITE}/style-by-mafi/${encodeURIComponent(slug)}`
    : `${SITE}/style-by-mafi`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
  <!-- Open Graph / WhatsApp / Facebook / LinkedIn / Telegram / Discord -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Ashramam - Community Network" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:title" content="${esc(pageTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:secure_url" content="${esc(image)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content="${esc(pageTitle)}" />
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(pageTitle)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, 'Segoe UI', sans-serif; background: #e9f1f8; color: #1c2733;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 20px; padding: 36px 40px; text-align: center;
            box-shadow: 0 12px 40px rgba(47,127,196,.18); max-width: 420px; margin: 24px; }
    a { color: #2f7fc4; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${esc(pageTitle)}</h1>
    <p>Taking you to the style story…</p>
    <p><a href="${esc(pageUrl)}">Continue to the style story →</a></p>
  </div>
  <script>window.location.replace(${JSON.stringify(pageUrl)});</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(html);
};
