// api/og-podcast.js
//
// Dynamic Open Graph preview for individual podcast episodes.
//
//   /api/og-podcast?ep=<slug>  -> HTML card with OG meta tags. Served to
//                               WhatsApp / Facebook / Twitter crawlers
//                               through a User-Agent rewrite in vercel.json.
//                               Humans keep getting the SPA.
//
// Unknown or missing slugs fall back to the generic Podcasts card.

const SITE = 'https://www.ashramamvibes.com';
const IMAGE = `${SITE}/og-podcasts.jpg`;
const FALLBACK_TITLE = 'Podcasts | Ashramam';
const FALLBACK_DESC = 'Recordings from the Ashramam circle — press play and listen right in the app. Tap to open.';

// Mirror of the episode catalog in src/Podcasts.tsx (slug -> title).
const EPISODES = {
  'snake-stories-assorted': 'Snake stories assorted',
  'illi-is-a-wonderman': 'illi is a wonderman with reality',
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

module.exports = async (req, res) => {
  const slug = String(req.query.ep || '');
  const title = EPISODES[slug];
  const pageTitle = title ? `${title} | Ashramam Podcasts` : FALLBACK_TITLE;
  const pageUrl = title ? `${SITE}/podcasts?ep=${encodeURIComponent(slug)}` : `${SITE}/podcasts`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(FALLBACK_DESC)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
  <!-- Open Graph / WhatsApp / Facebook / LinkedIn / Telegram / Discord -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Ashramam - Community Network" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:title" content="${esc(pageTitle)}" />
  <meta property="og:description" content="${esc(FALLBACK_DESC)}" />
  <meta property="og:image" content="${esc(IMAGE)}" />
  <meta property="og:image:secure_url" content="${esc(IMAGE)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="1200" />
  <meta property="og:image:alt" content="${esc(pageTitle)}" />
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(pageTitle)}" />
  <meta name="twitter:description" content="${esc(FALLBACK_DESC)}" />
  <meta name="twitter:image" content="${esc(IMAGE)}" />
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
    <p>Taking you to the episode…</p>
    <p><a href="${esc(pageUrl)}">Continue to the episode →</a></p>
  </div>
  <script>window.location.replace(${JSON.stringify(pageUrl)});</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(html);
};
