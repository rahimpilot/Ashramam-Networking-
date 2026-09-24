import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from './PageHeader';
import { db, storage } from './firebase';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface CinemaReview {
  id: string;
  name: string;
  cinema: string;
  language: string;
  rating: number;
  review: string;
  images: string[];
  createdAt: Timestamp | null;
}

const LANGUAGES = [
  'Malayalam', 'Tamil', 'Hindi', 'English', 'Telugu', 'Kannada',
  'Bengali', 'Marathi', 'Punjabi', 'Urdu', 'Other',
];

const MAX_IMAGES = 4;

/** Shrink an image client-side so uploads stay small and fast. */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not compress image'))),
        'image/jpeg',
        0.82
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

function Stars({ value, onPick, size = 30 }: { value: number; onPick?: (n: number) => void; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onPick && onPick(n)}
          disabled={!onPick}
          style={{
            background: 'none',
            border: 'none',
            padding: 2,
            cursor: onPick ? 'pointer' : 'default',
            fontSize: size,
            lineHeight: 1,
            color: n <= value ? '#f5a623' : '#cfd9e3',
            textShadow: n <= value ? '0 1px 4px rgba(245,166,35,.45)' : 'none',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #d7e3ef',
  background: '#f7fbfe',
  fontSize: 15,
  fontFamily: 'inherit',
  color: '#1c2733',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: '#4a5f75',
  marginBottom: 6,
};

/** Cinema & Reviews — public page. Anyone with the link can post a review,
 *  no login needed. Lives in Hangout as the "Cinema and Reviews" tile. */
export default function CinemaReviews() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [reviews, setReviews] = useState<CinemaReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [cinema, setCinema] = useState('');
  const [language, setLanguage] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'cinemaReviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CinemaReview, 'id'>) })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Revoke preview object URLs on unmount / change
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    const room = MAX_IMAGES - files.length;
    const next = [...files, ...picked.slice(0, room)];
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removeFile = (i: number) => {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please tell us your name.'); return; }
    if (!cinema.trim()) { setError('Please enter the cinema name.'); return; }
    if (rating < 1) { setError('Please tap the stars to give a rating.'); return; }
    setSubmitting(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const blob = await compressImage(f);
        const path = `cinema-reviews/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;
        const snap = await uploadBytes(ref(storage, path), blob, { contentType: 'image/jpeg' });
        urls.push(await getDownloadURL(snap.ref));
      }
      await addDoc(collection(db, 'cinemaReviews'), {
        name: name.trim(),
        cinema: cinema.trim(),
        language: language.trim(),
        rating,
        review: review.trim(),
        images: urls,
        createdAt: serverTimestamp(),
      });
      setName(''); setCinema(''); setLanguage(''); setRating(0);
      setReview(''); setFiles([]); setPreviews([]);
      setPosted(true);
      setTimeout(() => setPosted(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Could not post your review just now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e9f1f8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    }}>
      <PageHeader title="Cinema & Reviews" backTo="/hangout" backLabel="Back to hangout" />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 110px 16px' }}>
        {/* Hero */}
        <div className="iv-card" style={{
          padding: '22px 20px',
          marginBottom: 16,
          background: 'linear-gradient(135deg, #0f2a4a 0%, #1f5d9e 60%, #2f7fc4 100%)',
          border: 'none',
          color: '#ffffff',
        }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: 22, fontWeight: 800 }}>
            Watched something? Rate it.
          </h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.9, lineHeight: 1.55 }}>
            No account needed — drop your name, rate the film, and tell the world what you thought.
          </p>
          {avg && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 26 }}>★</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{avg}</span>
              <span style={{ fontSize: 13, opacity: 0.85 }}>
                average from {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </span>
            </div>
          )}
        </div>

        {/* Review form */}
        <form onSubmit={submit} className="iv-card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: 17, fontWeight: 800, color: '#1c2733' }}>
            Write a review
          </h3>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Your name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abdu" maxLength={60} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Cinema name *</label>
              <input style={inputStyle} value={cinema} onChange={(e) => setCinema(e.target.value)}
                placeholder="e.g. Dhoomakethu" maxLength={80} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Language</label>
              <input style={inputStyle} list="cinema-languages" value={language}
                onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. Malayalam" maxLength={30} />
              <datalist id="cinema-languages">
                {LANGUAGES.map((l) => <option key={l} value={l} />)}
              </datalist>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Your rating *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Stars value={rating} onPick={setRating} />
              {rating > 0 && (
                <span style={{ fontSize: 14, fontWeight: 700, color: '#8a6d1c' }}>{rating}/5</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Review</label>
            <textarea style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
              value={review} onChange={(e) => setReview(e.target.value)}
              placeholder="What did you love? What fell flat? No spoilers, please."
              maxLength={2000} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Pictures <span style={{ fontWeight: 400, color: '#8a9aab' }}>(up to {MAX_IMAGES})</span></label>
            <input ref={fileRef} type="file" accept="image/*" multiple
              onChange={onFilesPicked} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {previews.map((u, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                  <img src={u} alt="" style={{
                    width: 72, height: 72, objectFit: 'cover', borderRadius: 10,
                    border: '1px solid #d7e3ef',
                  }} />
                  <button type="button" onClick={() => removeFile(i)}
                    aria-label="Remove picture"
                    style={{
                      position: 'absolute', top: -8, right: -8, width: 22, height: 22,
                      borderRadius: '50%', border: 'none', background: '#d33', color: '#fff',
                      fontSize: 13, cursor: 'pointer', lineHeight: 1,
                    }}>×</button>
                </div>
              ))}
              {files.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{
                    width: 72, height: 72, borderRadius: 10, border: '1.5px dashed #9db8d2',
                    background: '#f7fbfe', color: '#2f7fc4', fontSize: 26, cursor: 'pointer',
                  }}>+</button>
              )}
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: 12, padding: '10px 14px', borderRadius: 10,
              background: '#fdecec', color: '#b3261e', fontSize: 14, fontWeight: 600,
            }}>{error}</div>
          )}
          {posted && (
            <div style={{
              marginBottom: 12, padding: '10px 14px', borderRadius: 10,
              background: '#e6f6ec', color: '#1c7a3d', fontSize: 14, fontWeight: 600,
            }}>Review posted. Thanks!</div>
          )}

          <button type="submit" disabled={submitting} className="iv-press" style={{
            width: '100%', padding: '13px', borderRadius: 999, border: 'none',
            background: submitting ? '#9db8d2' : 'linear-gradient(135deg, #2f7fc4, #1f5d9e)',
            color: '#fff', fontSize: 16, fontWeight: 800, cursor: submitting ? 'default' : 'pointer',
            boxShadow: '0 4px 14px rgba(47,127,196,.35)',
          }}>
            {submitting ? 'Posting…' : 'Post review'}
          </button>
        </form>

        {/* Reviews feed */}
        <h3 style={{ margin: '0 0 12px 2px', fontSize: 16, fontWeight: 800, color: '#1c2733' }}>
          Latest reviews
        </h3>
        {loading ? (
          <div style={{ color: '#8a9aab', fontSize: 14, padding: '12px 2px' }}>Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="iv-card" style={{ padding: '28px 20px', textAlign: 'center', color: '#8a9aab' }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🎬</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4a5f75' }}>No reviews yet.</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Be the first to rate a film above.</div>
          </div>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="iv-card" style={{ padding: 18, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1c2733' }}>{r.cinema}</div>
                  {r.language && (
                    <span style={{
                      display: 'inline-block', marginTop: 6, fontSize: 12, fontWeight: 700,
                      color: '#2f7fc4', background: '#e3eefb', borderRadius: 999, padding: '3px 10px',
                    }}>{r.language}</span>
                  )}
                </div>
                <Stars value={r.rating} size={18} />
              </div>
              {r.review && (
                <p style={{ margin: '10px 0 0 0', fontSize: 14.5, color: '#3d4b5c', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {r.review}
                </p>
              )}
              {r.images && r.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
                  {r.images.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noreferrer">
                      <img src={src} alt="" loading="lazy" style={{
                        width: 96, height: 96, objectFit: 'cover', borderRadius: 10,
                        border: '1px solid #d7e3ef', flexShrink: 0,
                      }} />
                    </a>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 12.5, color: '#8a9aab' }}>
                <span style={{ fontWeight: 700, color: '#4a5f75' }}>{r.name}</span>
                {r.createdAt && (
                  <> · {r.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                )}
              </div>
            </article>
          ))
        )}

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button onClick={() => navigate('/hangout')} className="iv-press" style={{
            padding: '11px 22px', borderRadius: 999, border: '1px solid rgba(91,155,213,.45)',
            background: '#ffffff', color: '#2f7fc4', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            ← Back to hangout
          </button>
        </div>
      </div>
    </div>
  );
}
