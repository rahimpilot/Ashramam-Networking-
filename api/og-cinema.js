// api/og-cinema.js
//
// Dynamic Open Graph preview for Our Cinemas films.
//
//   /api/og-cinema?cinemaId=<id>  -> HTML card with OG meta tags. Served to
//                                   WhatsApp / Facebook / Twitter crawlers
//                                   through a User-Agent rewrite in vercel.json.
//                                   Humans keep getting the SPA.
//
// Unknown or missing ids fall back to the generic Our Cinemas card.

const SITE = 'https://www.ashramamvibes.com';

// Mirror of the catalog in src/ourCinemas.ts (id -> title/by/youtubeId).
const CINEMAS = {
  'ore-swasam': {
    title: 'Ore Swasam',
    by: 'Riyaz Ummer',
    youtubeId: 'mtnuJy4z_1E',
  },
};

const FALLBACK_IMAGE = `${SITE}/og-cinema.jpg`;
const FALLBACK_TITLE = 'Our Cinemas | Ashramam';
const FALLBACK_DESC = 'Short films by our own people. Tap to open and watch.';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

module.exports = async (req, res) => {
  const id = String(req.query.cinemaId || '');
  const film = CINEMAS[id];
  const pageTitle = film ? `${film.title} | Our Cinemas` : FALLBACK_TITLE;
  const description = film
    ? `${film.title} — a short film by ${film.by}. Tap to watch.`
    : FALLBACK_DESC;
  // YouTube's own thumbnail (1280x720) as the preview image.
  const image = film
    ? `https://i.ytimg.com/vi/${film.youtubeId}/maxresdefault.jpg`
    : FALLBACK_IMAGE;
  const pageUrl = film
    ? `${SITE}/our-cinemas/${encodeURIComponent(id)}`
    : `${SITE}/our-cinemas`;

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
    body { font-family: -apple-system, 'Segoe UI', sans-serif; background: #e9e4f5; color: #2c2a4a;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 20px; padding: 36px 40px; text-align: center;
            box-shadow: 0 12px 40px rgba(80,60,140,.18); max-width: 420px; margin: 24px; }
    a { color: #5b54a8; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${esc(pageTitle)}</h1>
    <p>${esc(description)}</p>
    <p><a href="${esc(pageUrl)}">Watch the film</a></p>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
};
