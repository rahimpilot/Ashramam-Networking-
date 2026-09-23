import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { User } from 'firebase/auth';
import {
  collection, doc, setDoc, deleteDoc, addDoc,
  query, orderBy, onSnapshot, Timestamp, getDocs
} from 'firebase/firestore';

interface StoryComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: Timestamp | null;
}

/**
 * Like button + comments for an exclusive story.
 * Data: exclusiveStories/{storyId}/comments and .../likes/{uid}
 */
const StoryEngagement: React.FC<{ storyId: string; user: User }> = ({ storyId, user }) => {
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Resolve display name from profiles (same pattern as Stories)
  useEffect(() => {
    const fetchName = async () => {
      const fallback = user.displayName || user.email?.split('@')[0] || 'Member';
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        let name = '';
        snap.forEach((d) => {
          const data = d.data();
          if (data.email === user.email && data.name) name = data.name;
        });
        setAuthorName(name || fallback);
      } catch {
        setAuthorName(fallback);
      }
    };
    fetchName();
  }, [user]);

  // Live comments
  useEffect(() => {
    const q = query(
      collection(db, 'exclusiveStories', storyId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: StoryComment[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<StoryComment, 'id'>) }));
      setComments(list);
    });
    return () => unsub();
  }, [storyId]);

  // Live likes
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'exclusiveStories', storyId, 'likes'),
      (snap) => {
        setLikeCount(snap.size);
        setLiked(snap.docs.some((d) => d.id === user.uid));
      }
    );
    return () => unsub();
  }, [storyId, user.uid]);

  const toggleLike = async () => {
    const likeDoc = doc(db, 'exclusiveStories', storyId, 'likes', user.uid);
    try {
      if (liked) await deleteDoc(likeDoc);
      else await setDoc(likeDoc, { createdAt: Timestamp.now() });
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  const postComment = async () => {
    const text = newComment.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'exclusiveStories', storyId, 'comments'), {
        uid: user.uid,
        email: user.email,
        authorName,
        text,
        createdAt: Timestamp.now(),
      });
      setNewComment('');
    } catch (e) {
      console.error('Comment failed', e);
    } finally {
      setPosting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
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

  const fmtTime = (ts: Timestamp | null) => {
    if (!ts) return '';
    return ts.toDate().toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Like + copy link row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <button
          onClick={toggleLike}
          className="iv-press"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: liked ? '#e63946' : '#ffffff',
            color: liked ? '#ffffff' : '#1c2733',
            border: liked ? 'none' : '1px solid #d5e0ec',
            borderRadius: 24, padding: '10px 18px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(28, 39, 51, 0.12)'
          }}
        >
          <span style={{ fontSize: 16 }}>{liked ? '❤️' : '🤍'}</span>
          {likeCount > 0 ? likeCount : 'Like'}
        </button>
        <button
          onClick={copyLink}
          className="iv-press"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1c2733', color: '#ffffff', border: 'none',
            borderRadius: 24, padding: '10px 18px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(28, 39, 51, 0.25)'
          }}
        >
          <span style={{ fontSize: 15 }}>{copied ? '✓' : '🔗'}</span>
          {copied ? 'Link copied!' : 'Copy link'}
        </button>
      </div>

      {/* Comments */}
      <div className="iv-card" style={{ marginTop: 14, padding: 16 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: '#1c2733' }}>
          Comments {comments.length > 0 && <span style={{ color: '#8a9aab', fontWeight: 600 }}>({comments.length})</span>}
        </h3>

        {comments.length === 0 ? (
          <p style={{ fontSize: 13, color: '#8a9aab', margin: '0 0 12px 0' }}>
            No comments yet — be the first to roast… err, congratulate. 😄
          </p>
        ) : (
          <div style={{ marginBottom: 12 }}>
            {comments.map((c) => (
              <div key={c.id} style={{
                padding: '10px 12px', background: '#f2f6fa',
                borderRadius: 12, marginBottom: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1c2733' }}>{c.authorName}</span>
                  <span style={{ fontSize: 11, color: '#8a9aab' }}>{fmtTime(c.createdAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#3d4b5c', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') postComment(); }}
            placeholder={`Comment as ${authorName || '…'}`}
            maxLength={500}
            style={{
              flex: 1, minWidth: 0, border: '1px solid #d5e0ec', borderRadius: 24,
              padding: '10px 16px', fontSize: 14, outline: 'none', background: '#ffffff'
            }}
          />
          <button
            onClick={postComment}
            disabled={posting || !newComment.trim()}
            className="iv-press"
            style={{
              background: '#1c2733', color: '#ffffff', border: 'none',
              borderRadius: 24, padding: '10px 20px', fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
              opacity: posting || !newComment.trim() ? 0.5 : 1
            }}
          >
            {posting ? '…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryEngagement;
