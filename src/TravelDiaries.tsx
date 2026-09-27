import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PageHeader from './PageHeader';
import { auth, db } from './firebase';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, Timestamp, doc, getDoc, deleteDoc,
} from 'firebase/firestore';

interface TravelDiary {
  id: string;
  title: string;
  story: string;
  images: string[];
  authorEmail: string;
  authorName: string;
  createdAt: Timestamp | null;
}

const MAX_IMAGES = 8;

/** Shrink an image and return it as a data URL, so diary photos can be
 *  stored directly in Firestore (no paid Storage plan needed). */
function compressToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

function fmtDate(ts: Timestamp | null): string {
  if (!ts) return '';
  return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #d9d4e9',
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
};

/** Copy-link button — the classic bare 🔗, green ✓ for 1.8s on copy. */
function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy link"
      onClick={(e) => {
        e.stopPropagation();
        const done = () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        };
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(done);
        } else { done(); }
      }}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '16px', padding: '4px', lineHeight: 1,
        color: copied ? '#16a34a' : 'inherit',
      }}
    >
      {copied ? '✓' : '🔗'}
    </button>
  );
}

/* ------------------------------ List view ------------------------------ */

export default function TravelDiaries() {
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState<TravelDiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'travelDiaries'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setDiaries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TravelDiary, 'id'>) })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  return (
    <div className="iv-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
      fontFamily: "'Marcellus', Georgia, serif",
      paddingBottom: '96px',
    }}>
      <PageHeader title="Travel Diaries" backTo="/dashboard" backLabel="Back" />
      <div style={{ padding: '16px', maxWidth: '720px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/travel-diaries/new')}
          className="iv-press"
          style={{
            width: '100%', padding: '13px', borderRadius: 999, border: 'none',
            background: 'linear-gradient(135deg, #2f7fc4, #1f5d9e)',
            color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          ✈️ New diary
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7f92', padding: '32px' }}>Loading memories…</div>
        ) : diaries.length === 0 ? (
          <div className="iv-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7f92' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧳</div>
            No travel diaries yet. Tap “New diary” to cherish your first memory.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {diaries.map((d) => (
              <article key={d.id} style={cardStyle} onClick={() => navigate(`/travel-diaries/${d.id}`)}>
                {d.images.length > 0 && (
                  <img
                    src={d.images[0]}
                    alt=""
                    style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                  />
                )}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: '#1c2733', lineHeight: 1.3 }}>
                      {d.title}
                    </h2>
                    <CopyLink url={`${window.location.origin}/travel-diaries/${d.id}`} />
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7f92', marginTop: '6px' }}>
                    📅 {fmtDate(d.createdAt)}{d.images.length > 1 && ` · 📷 ${d.images.length} photos`}
                  </div>
                  {d.story && (
                    <p style={{
                      margin: '8px 0 0 0', fontSize: 14, color: '#33414f', lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {d.story}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Detail view ----------------------------- */

export function TravelDiaryDetail() {
  const { diaryId } = useParams<{ diaryId: string }>();
  const navigate = useNavigate();
  const [diary, setDiary] = useState<TravelDiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!diaryId) return;
    getDoc(doc(db, 'travelDiaries', diaryId)).then((snap) => {
      if (snap.exists()) setDiary({ id: snap.id, ...(snap.data() as Omit<TravelDiary, 'id'>) });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [diaryId]);

  const handleDelete = async () => {
    if (!diary || !window.confirm('Delete this diary?')) return;
    await deleteDoc(doc(db, 'travelDiaries', diary.id));
    navigate('/travel-diaries');
  };

  if (loading) {
    return (
      <div className="iv-page" style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
        fontFamily: "'Marcellus', Georgia, serif", padding: '32px', textAlign: 'center', color: '#6b7f92',
      }}>
        Loading…
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="iv-page" style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
        fontFamily: "'Marcellus', Georgia, serif", padding: '32px', textAlign: 'center',
      }}>
        <p style={{ color: '#6b7f92' }}>This diary could not be found.</p>
        <Link to="/travel-diaries" style={{ color: '#2f7fc4' }}>← All diaries</Link>
      </div>
    );
  }

  const isAuthor = user?.email === diary.authorEmail;

  return (
    <div className="iv-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
      fontFamily: "'Marcellus', Georgia, serif",
      paddingBottom: '96px',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Link to="/travel-diaries" style={{ color: '#2f7fc4', textDecoration: 'none', fontSize: 15 }}>
            ← All diaries
          </Link>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <CopyLink url={`${window.location.origin}/travel-diaries/${diary.id}`} />
            {isAuthor && (
              <button
                onClick={handleDelete}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 }}
                aria-label="Delete diary"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        <h1 style={{ margin: '0 0 6px 0', fontSize: 26, fontWeight: 400, color: '#1c2733', lineHeight: 1.25 }}>
          {diary.title}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7f92', marginBottom: '16px' }}>
          📅 {fmtDate(diary.createdAt)}{diary.authorName && ` · ✍️ ${diary.authorName}`}
        </div>

        {diary.images.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: diary.images.length === 1 ? '1fr' : '1fr 1fr',
            gap: '8px', marginBottom: '20px',
          }}>
            {diary.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                onClick={() => setLightbox(src)}
                style={{
                  width: '100%',
                  height: diary.images.length === 1 ? 'auto' : '180px',
                  maxHeight: '420px',
                  objectFit: 'cover', borderRadius: '12px', cursor: 'zoom-in', display: 'block',
                }}
              />
            ))}
          </div>
        )}

        <div className="iv-card" style={{ padding: '20px' }}>
          <div style={{
            fontSize: 16, lineHeight: 1.8, color: '#33414f',
            whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
          }}>
            {diary.story}
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '16px', cursor: 'zoom-out',
          }}
        >
          <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------- New form ------------------------------ */

export function NewTravelDiary() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    const room = MAX_IMAGES - files.length;
    const next = [...files, ...picked.slice(0, Math.max(0, room))];
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removeFile = (i: number) => {
    setFiles(files.filter((_, j) => j !== i));
    setPreviews(previews.filter((_, j) => j !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please give your diary a title.'); return; }
    if (!story.trim()) { setError('Please write a few lines about the trip.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const dataUrls: string[] = [];
      for (const f of files) {
        dataUrls.push(await compressToDataUrl(f));
      }
      const encodedBytes = dataUrls.reduce((s, u) => s + u.length, 0);
      if (encodedBytes > 700_000) {
        setError('Those pictures are too large together — please remove one and try again.');
        setSubmitting(false);
        return;
      }
      const user = auth.currentUser;
      const ref = await addDoc(collection(db, 'travelDiaries'), {
        title: title.trim(),
        story: story.trim(),
        images: dataUrls,
        authorEmail: user?.email || '',
        authorName: user?.displayName || '',
        createdAt: serverTimestamp(),
      });
      navigate(`/travel-diaries/${ref.id}`);
    } catch (err: any) {
      setError(err?.message || 'Could not save the diary. Please try again.');
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px', borderRadius: '12px',
    border: '1px solid #c9d9e8', fontSize: '16px', outline: 'none',
    fontFamily: 'inherit', background: '#ffffff', color: '#1c1915',
  };

  return (
    <div className="iv-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
      fontFamily: "'Marcellus', Georgia, serif",
      paddingBottom: '96px',
    }}>
      <PageHeader title="New diary" backTo="/travel-diaries" backLabel="Back" />
      <div style={{ padding: '16px', maxWidth: '720px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="iv-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: 14, color: '#4a5f75', marginBottom: '6px' }}>
              Trip title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Goa with the crew 🌊"
              style={inputStyle}
              maxLength={80}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: 14, color: '#4a5f75', marginBottom: '6px' }}>
              Your story
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="A few lines about the trip…"
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: 14, color: '#4a5f75', marginBottom: '6px' }}>
              Pictures {files.length > 0 && `(${files.length}/${MAX_IMAGES})`}
            </label>
            <label
              style={{
                display: 'inline-block', padding: '10px 18px', borderRadius: 999,
                background: '#eef3f9', color: '#2f7fc4', fontSize: 14,
                cursor: 'pointer', border: '1px solid #c9d9e8',
              }}
            >
              📷 Choose pictures
              <input
                type="file" accept="image/*" multiple
                onChange={onPickFiles} style={{ display: 'none' }}
              />
            </label>
            {previews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: '90px', height: '90px' }}>
                    <img
                      src={src} alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label="Remove picture"
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: '#1c2733', color: '#fff', border: 'none',
                        cursor: 'pointer', fontSize: '12px', lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#b91c1c', fontSize: 14, marginBottom: '12px' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="iv-press"
            style={{
              width: '100%', padding: '13px', borderRadius: 999, border: 'none',
              background: submitting ? '#d3dfee' : 'linear-gradient(135deg, #2f7fc4, #1f5d9e)',
              color: '#fff', fontSize: 16, fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Saving…' : 'Save diary'}
          </button>
        </form>
      </div>
    </div>
  );
}
