// api/og-review.js
//
// Dynamic Open Graph preview for individual cinema reviews.
//
// Two modes:
//   /api/og-review?reviewId=<id>        -> HTML card with OG meta tags. Served to
//                                          WhatsApp / Facebook / Twitter crawlers
//                                          through a User-Agent rewrite in vercel.json.
//                                          Humans keep getting the SPA.
//   /api/og-review?reviewId=<id>&img=0  -> the review's own photo bytes, so the shared
//                                          preview shows the actual picture. (Review photos
//                                          are stored in Firestore as data URLs, which
//                                          crawlers cannot use as og:image directly.)
//
// Anything missing or failing falls back to the generic Cinema & Reviews card.

const PROJECT_ID = 'ashramam-network';
// Public Firebase web API key: identifies the project only, already shipped in
// the client bundle by design. cinemaReviews has a public read rule.
const API_KEY = 'AIzaSyAto1Q5Bq2nHNNecCdsXLkLmpdNR2X_RdI';
const SITE = 'https://www.ashramamvibes.com';
const FALLBACK_IMAGE = `${SITE}/og/cinema-reviews-preview.jpg`;
const FALLBACK_TITLE = 'Cinema & Reviews | Ashramam';
const FALLBACK_DESC =
  'Watched something? Rate it. Drop your name, rate the film, and tell the world what you thought. Tap to open.';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const trunc = (s, n) => {
  s = String(s ?? '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
};

function parseReview(data) {
  const f = (data && data.fields) || {};
  const str = (k) => (f[k] && typeof f[k].stringValue === 'string' ? f[k].stringValue : '');
  let rating = 0;
  if (f.rating && f.rating.integerValue != null) rating = parseInt(f.rating.integerValue, 10) || 0;
  const images =
    f.images && f.images.arrayValue && Array.isArray(f.images.arrayValue.values)
      ? f.images.arrayValue.values.map((v) => v.stringValue).filter(Boolean)
      : [];
  return {
    name: str('name'),
    cinema: str('cinema'),
    language: str('language'),
    title: str('title'),
    review: str('review'),
    rating,
    images,
  };
}

async function fetchReview(id) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents/cinemaReviews/${encodeURIComponent(id)}?key=${API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  return parseReview(await r.json());
}

function cardHtml({ title, description, pageUrl, image, imageIsPhoto, redirectTo }) {
  const dims = imageIsPhoto
    ? ''
    : '\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
  <!-- Open Graph / WhatsApp / Facebook / LinkedIn / Telegram / Discord -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Ashramam - Community Network" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />${dims}
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:secure_url" content="${esc(image)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content="${esc(title)}" />
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
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
    <h1>${esc(title)}</h1>
    <p>Taking you to the review…</p>
    <p><a href="${esc(redirectTo)}">Continue to the review →</a></p>
  </div>
  <script>window.location.replace(${JSON.stringify(redirectTo)});</script>
</body>
</html>`;
}

module.exports = async (req, res) => {
  const reviewId = String(req.query.reviewId || '');
  const imgIdx = req.query.img !== undefined ? parseInt(String(req.query.img), 10) || 0 : -1;

  // --- The review's own photo, as real image bytes for the preview card. ---
  if (imgIdx >= 0 && reviewId) {
    try {
      const review = await fetchReview(reviewId);
      const dataUrl = review && review.images[imgIdx];
      const m =
        dataUrl && /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(dataUrl.replace(/\s+/g, ''));
      if (m) {
        const buf = Buffer.from(m[2], 'base64');
        res.setHeader('Content-Type', m[1].toLowerCase());
        res.setHeader('Content-Length', String(buf.length));
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        return res.status(200).send(buf);
      }
    } catch {
      /* fall through to the fallback image */
    }
    return res.redirect(302, FALLBACK_IMAGE);
  }

  // --- Preview card HTML. ---
  let title = FALLBACK_TITLE;
  let description = FALLBACK_DESC;
  let image = FALLBACK_IMAGE;
  let imageIsPhoto = false;
  let pageUrl = `${SITE}/cinema-reviews`;
  let redirectTo = '/cinema-reviews';
  if (reviewId) {
    // Preserve our own ?v= cache-buster in og:url/canonical so each shared
    // link is its own preview object in WhatsApp/Facebook caches.
    const vParam = String(req.query.v || '').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 12);
    const vSuffix = vParam ? `?v=${vParam}` : '';
    pageUrl = `${SITE}/cinema-reviews/${encodeURIComponent(reviewId)}${vSuffix}`;
    redirectTo = `/cinema-reviews/${encodeURIComponent(reviewId)}`;
    try {
      const review = await fetchReview(reviewId);
      if (review && review.cinema) {
        const r = Math.min(5, Math.max(0, review.rating));
        const stars = '★'.repeat(r) + '☆'.repeat(5 - r);
        title = review.title || `${review.cinema} — movie review`;
        const bits = [`${stars} ${review.rating}/5 by ${review.name || 'a member'}`];
        if (review.review) bits.push(trunc(review.review, 140));
        description = bits.join(' — ') + (review.language ? ` · ${review.language}` : '');
        if (review.images.length) {
          image = `${SITE}/api/og-review?reviewId=${encodeURIComponent(reviewId)}&img=0`;
          imageIsPhoto = true;
        }
      }
    } catch {
      /* keep the generic card */
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(cardHtml({ title, description, pageUrl, image, imageIsPhoto, redirectTo }));
};
