import React, { useEffect, useState, useRef, useCallback } from 'react';
import { auth, rtdb } from './firebase';
import { ref, set, push, onValue, onChildAdded, remove, update, onDisconnect } from 'firebase/database';
import type { Unsubscribe } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

interface Participant {
  id: string;
  name: string;
  email: string;
  isMuted: boolean;
  isActive: boolean;
  joinedAt: number;
}

const ROOM_ID = 'happening-now-room';

// STUN for most connections + a free TURN fallback so phones on mobile
// data (symmetric NATs) can still connect, Clubhouse-style.
const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
    ],
  },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelay',
    credential: 'openrelay',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelay',
    credential: 'openrelay',
  },
  {
    urls: 'turns:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelay',
    credential: 'openrelay',
  },
];

const roomRef = (path: string) => ref(rtdb, `voiceRooms/${ROOM_ID}/${path}`);

const VoiceRoom: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  // speakingTick re-renders the UI when the speaking set changes
  const [, setSpeakingTick] = useState(0);

  const userRef = useRef<User | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const remoteAnalysersRef = useRef<Map<string, { analyser: AnalyserNode; data: Uint8Array }>>(new Map());
  const localAnalyserRef = useRef<{ analyser: AnalyserNode; data: Uint8Array } | null>(null);
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const listenersRef = useRef<Unsubscribe[]>([]);
  const speakingRef = useRef<Set<string>>(new Set());
  const joinedRef = useRef(false);

  const setSpeaking = useCallback((id: string, speaking: boolean) => {
    const s = speakingRef.current;
    if (speaking && !s.has(id)) {
      s.add(id);
      setSpeakingTick(t => t + 1);
    } else if (!speaking && s.has(id)) {
      s.delete(id);
      setSpeakingTick(t => t + 1);
    }
  }, []);

  const isSpeaking = useCallback((id: string) => speakingRef.current.has(id), []);

  // ---------- auth ----------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      userRef.current = currentUser;
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  // Live headcount on the join screen (read-only, works before joining)
  useEffect(() => {
    if (!authReady || !user) return;
    const unsub = onValue(roomRef('participants'), (snap) => {
      const data = snap.val() || {};
      const list = (Object.values(data) as Participant[]).filter(p => p && p.isActive !== false);
      setParticipants(list);
    });
    return () => unsub();
  }, [authReady, user]);

  // ---------- peer connection management ----------
  const cleanupPeer = useCallback((peerId: string) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      try { pc.close(); } catch { /* noop */ }
      peerConnectionsRef.current.delete(peerId);
    }
    const audio = remoteAudiosRef.current.get(peerId);
    if (audio) {
      try { audio.pause(); } catch { /* noop */ }
      audio.srcObject = null;
      remoteAudiosRef.current.delete(peerId);
    }
    remoteAnalysersRef.current.delete(peerId);
    pendingCandidatesRef.current.delete(peerId);
    setSpeaking(peerId, false);
    setConnectedPeers(prev => prev.filter(id => id !== peerId));
  }, [setSpeaking]);

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection | null => {
    const me = userRef.current;
    if (!me) return null;
    try {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (!remoteStream) return;
        let audio = remoteAudiosRef.current.get(peerId);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          remoteAudiosRef.current.set(peerId, audio);
        }
        audio.srcObject = remoteStream;
        audio.play().catch(() => {
          // Autoplay blocked (shouldn't happen after the join tap, but retry on next gesture)
        });

        // Speaking indicator for this remote stream
        try {
          if (!remoteAnalysersRef.current.has(peerId) && audioCtxRef.current) {
            const src = audioCtxRef.current.createMediaStreamSource(remoteStream);
            const analyser = audioCtxRef.current.createAnalyser();
            analyser.fftSize = 512;
            src.connect(analyser);
            remoteAnalysersRef.current.set(peerId, { analyser, data: new Uint8Array(analyser.fftSize) });
          }
        } catch { /* analyser is best-effort */ }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && userRef.current) {
          // push() => every candidate is kept; set() would overwrite the previous one
          push(roomRef(`iceCandidates/${userRef.current.uid}/${peerId}`), {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            timestamp: Date.now(),
          }).catch(err => console.error('ICE push failed:', err));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setConnectedPeers(prev => (prev.includes(peerId) ? prev : [...prev, peerId]));
        } else if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'closed'
        ) {
          cleanupPeer(peerId);
        }
      };

      peerConnectionsRef.current.set(peerId, pc);
      return pc;
    } catch (err) {
      console.error('createPeerConnection failed:', err);
      return null;
    }
  }, [cleanupPeer]);

  const flushPendingCandidates = useCallback(async (peerId: string) => {
    const pc = peerConnectionsRef.current.get(peerId);
    const queued = pendingCandidatesRef.current.get(peerId);
    if (!pc || !queued || queued.length === 0) return;
    pendingCandidatesRef.current.set(peerId, []);
    for (const c of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch { /* stale candidate, ignore */ }
    }
  }, []);

  const handleRemoteICECandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (!pc || pc.signalingState === 'closed') return;
    try {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        // Offer/answer hasn't landed yet — queue it
        const q = pendingCandidatesRef.current.get(peerId) || [];
        q.push(candidate);
        pendingCandidatesRef.current.set(peerId, q);
      }
    } catch { /* stale candidate, ignore */ }
  }, []);

  const makeOffer = useCallback(async (peerId: string) => {
    const me = userRef.current;
    if (!me || peerConnectionsRef.current.has(peerId)) return;
    const pc = createPeerConnection(peerId);
    if (!pc) return;
    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      await set(roomRef(`offers/${me.uid}/${peerId}`), {
        sdp: offer.sdp,
        type: offer.type,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('makeOffer failed:', err);
      cleanupPeer(peerId);
    }
  }, [createPeerConnection, cleanupPeer]);

  const handleRemoteOffer = useCallback(async (peerId: string, offer: { sdp: string; type: string }) => {
    const me = userRef.current;
    if (!me) return;
    // If we already have a connection, ignore duplicate offers
    if (peerConnectionsRef.current.has(peerId)) {
      remove(roomRef(`offers/${peerId}/${me.uid}`)).catch(() => {});
      return;
    }
    const pc = createPeerConnection(peerId);
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offer.sdp }));
      await flushPendingCandidates(peerId);
      const answer = await pc.createAnswer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(answer);
      await set(roomRef(`answers/${me.uid}/${peerId}`), {
        sdp: answer.sdp,
        type: answer.type,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('handleRemoteOffer failed:', err);
      cleanupPeer(peerId);
    } finally {
      // Consumed — remove so it can never be reprocessed
      remove(roomRef(`offers/${peerId}/${me.uid}`)).catch(() => {});
    }
  }, [createPeerConnection, flushPendingCandidates, cleanupPeer]);

  const handleRemoteAnswer = useCallback(async (peerId: string, answer: { sdp: string; type: string }) => {
    const me = userRef.current;
    if (!me) return;
    try {
      const pc = peerConnectionsRef.current.get(peerId);
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer.sdp }));
        await flushPendingCandidates(peerId);
      }
    } catch (err) {
      console.error('handleRemoteAnswer failed:', err);
    } finally {
      remove(roomRef(`answers/${me.uid}/${peerId}`)).catch(() => {});
    }
  }, [flushPendingCandidates]);

  // ---------- join / leave ----------
  const joinRoom = useCallback(async () => {
    const me = userRef.current;
    if (!me || joinedRef.current) return;
    setJoining(true);
    setError(null);

    try {
      // 1. Microphone (inside the tap gesture, so mobile browsers allow it)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      localStreamRef.current = stream;

      // 2. AudioContext for the speaking indicator (must resume in a gesture)
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      audioCtxRef.current = audioCtx;
      const localSrc = audioCtx.createMediaStreamSource(stream);
      const localAnalyser = audioCtx.createAnalyser();
      localAnalyser.fftSize = 512;
      localSrc.connect(localAnalyser);
      localAnalyserRef.current = { analyser: localAnalyser, data: new Uint8Array(localAnalyser.fftSize) };

      // 3. Presence — onDisconnect removes us even if the tab crashes
      const participantRef = roomRef(`participants/${me.uid}`);
      await set(participantRef, {
        id: me.uid,
        name: me.displayName || me.email || 'Anonymous',
        email: me.email || '',
        isMuted: false,
        isActive: true,
        joinedAt: Date.now(),
      });
      await onDisconnect(participantRef).remove();

      // 4. Clear any stale signaling from a previous session
      await Promise.all([
        remove(roomRef(`offers/${me.uid}`)),
        remove(roomRef(`answers/${me.uid}`)),
        remove(roomRef(`iceCandidates/${me.uid}`)),
      ]).catch(() => {});

      joinedRef.current = true;
      setJoined(true);

      // 5. Signaling listeners (child_added => each message processed exactly once)
      const unsubs: Unsubscribe[] = [];

      // Participants: offer to newcomers (only the greater UID offers — no glare)
      unsubs.push(onValue(roomRef('participants'), (snap) => {
        const data = snap.val() || {};
        const others = (Object.values(data) as Participant[])
          .filter(p => p && p.id !== me.uid && p.isActive !== false);
        setParticipants([ // include self at the top for the UI
          ...(Object.values(data) as Participant[]).filter(p => p && p.id === me.uid),
          ...others,
        ]);
        for (const p of others) {
          if (!peerConnectionsRef.current.has(p.id) && me.uid > p.id) {
            setTimeout(() => makeOffer(p.id), 150);
          }
        }
        // Drop peer connections for people who left
        const aliveIds = new Set(others.map(p => p.id));
        for (const peerId of Array.from(peerConnectionsRef.current.keys())) {
          if (!aliveIds.has(peerId)) cleanupPeer(peerId);
        }
      }));

      // Offers addressed to me
      unsubs.push(onChildAdded(roomRef('offers'), (fromSnap) => {
        const fromUid = fromSnap.key!;
        const targetRef = roomRef(`offers/${fromUid}`);
        const unsubTargets = onChildAdded(targetRef, (targetSnap) => {
          if (targetSnap.key === me.uid) {
            const offer = targetSnap.val();
            if (offer && offer.sdp) void handleRemoteOffer(fromUid, offer);
          }
        });
        unsubs.push(unsubTargets);
      }));

      // Answers addressed to me
      unsubs.push(onChildAdded(roomRef(`answers/${me.uid}`), (snap) => {
        const fromUid = snap.key!;
        const answer = snap.val();
        if (answer && answer.sdp) void handleRemoteAnswer(fromUid, answer);
      }));

      // ICE candidates addressed to me
      unsubs.push(onChildAdded(roomRef(`iceCandidates/${me.uid}`), (fromSnap) => {
        const fromUid = fromSnap.key!;
        const candRef = roomRef(`iceCandidates/${me.uid}/${fromUid}`);
        const unsubCands = onChildAdded(candRef, (candSnap) => {
          const c = candSnap.val();
          if (c && c.candidate) {
            void handleRemoteICECandidate(fromUid, {
              candidate: c.candidate,
              sdpMLineIndex: c.sdpMLineIndex,
              sdpMid: c.sdpMid,
            });
          }
          // Consumed — remove so it can never be reprocessed
          remove(roomRef(`iceCandidates/${me.uid}/${fromUid}/${candSnap.key}`)).catch(() => {});
        });
        unsubs.push(unsubCands);
      }));

      listenersRef.current = unsubs;

      // 6. Speaking-indicator loop
      const levelOf = (entry: { analyser: AnalyserNode; data: Uint8Array }) => {
        entry.analyser.getByteTimeDomainData(entry.data as Uint8Array);
        let sum = 0;
        for (let i = 0; i < entry.data.length; i++) {
          const v = (entry.data[i] - 128) / 128;
          sum += v * v;
        }
        return Math.sqrt(sum / entry.data.length);
      };
      const speakTimer = window.setInterval(() => {
        if (!joinedRef.current) return;
        if (localAnalyserRef.current && localStreamRef.current?.getAudioTracks()[0]?.enabled) {
          setSpeaking('me', levelOf(localAnalyserRef.current) > 0.03);
        } else {
          setSpeaking('me', false);
        }
        remoteAnalysersRef.current.forEach((entry, peerId) => {
          setSpeaking(peerId, levelOf(entry) > 0.03);
        });
      }, 350);
      (listenersRef.current as unknown as { _speakTimer?: number })._speakTimer = speakTimer;
    } catch (err) {
      console.error('joinRoom failed:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow the microphone and try again.');
      } else if (err instanceof Error && /permission_denied/i.test(err.message)) {
        setError('Could not reach the voice server (permission denied). The database rules need to be published — see database.rules.json in the project, then Firebase console → Realtime Database → Rules → Publish.');
      } else {
        setError(`Could not join the voice room: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
    } finally {
      setJoining(false);
    }
  }, [makeOffer, handleRemoteOffer, handleRemoteAnswer, handleRemoteICECandidate, cleanupPeer, setSpeaking]);

  const leaveRoom = useCallback(async () => {
    const me = userRef.current;
    joinedRef.current = false;

    // Stop listeners
    listenersRef.current.forEach(unsub => {
      try { (unsub as Unsubscribe)(); } catch { /* noop */ }
    });
    const timer = (listenersRef.current as unknown as { _speakTimer?: number })._speakTimer;
    if (timer) window.clearInterval(timer);
    listenersRef.current = [];

    // Close all peer connections
    for (const peerId of Array.from(peerConnectionsRef.current.keys())) cleanupPeer(peerId);

    // Stop mic
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    localAnalyserRef.current = null;
    speakingRef.current.clear();

    // Remove presence + stale signaling
    if (me) {
      await Promise.all([
        remove(roomRef(`participants/${me.uid}`)),
        remove(roomRef(`offers/${me.uid}`)),
        remove(roomRef(`answers/${me.uid}`)),
        remove(roomRef(`iceCandidates/${me.uid}`)),
      ]).catch(() => {});
    }

    setJoined(false);
    setConnectedPeers([]);
    navigate('/hangout');
  }, [cleanupPeer, navigate]);

  // Safety net: clean up if the component unmounts while joined
  useEffect(() => {
    const pcs = peerConnectionsRef.current;
    const audios = remoteAudiosRef.current;
    const localStream = localStreamRef.current;
    return () => {
      if (joinedRef.current) {
        joinedRef.current = false;
        listenersRef.current.forEach(unsub => {
          try { (unsub as Unsubscribe)(); } catch { /* noop */ }
        });
        const timer = (listenersRef.current as unknown as { _speakTimer?: number })._speakTimer;
        if (timer) window.clearInterval(timer);
        pcs.forEach(pc => { try { pc.close(); } catch { /* noop */ } });
        pcs.clear();
        audios.forEach(a => { try { a.pause(); } catch { /* noop */ } });
        audios.clear();
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        const me = userRef.current;
        if (me) remove(roomRef(`participants/${me.uid}`)).catch(() => {});
      }
    };
  }, []);

  const toggleMute = useCallback(async () => {
    const me = userRef.current;
    if (!localStreamRef.current || !me) return;
    const newMuted = !isMuted;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setIsMuted(newMuted);
    setSpeaking('me', false);
    await update(roomRef(`participants/${me.uid}`), { isMuted: newMuted }).catch(() => {});
  }, [isMuted, setSpeaking]);

  // ---------- UI ----------
  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>Loading…</p>
      </div>
    );
  }

  // ---- Join screen (the tap is what unlocks audio on mobile browsers) ----
  if (!joined) {
    const othersCount = participants.filter(p => p.id !== user?.uid).length;
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          background: '#ffffff', borderRadius: '20px', padding: '2.5rem 2rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxWidth: '420px', width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔥</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#991b1b', margin: '0 0 0.5rem 0' }}>
            Happening Now
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
            {othersCount > 0
              ? `🟢 ${othersCount} friend${othersCount === 1 ? '' : 's'} ${othersCount === 1 ? 'is' : 'are'} in the room right now`
              : 'The room is quiet — be the first one in! 🎉'}
          </p>
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
              padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#991b1b', textAlign: 'left',
            }}>
              {error}
            </div>
          )}
          <button
            onClick={joinRoom}
            disabled={joining}
            style={{
              background: joining ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              padding: '1.1rem 2rem', fontSize: '1.15rem', fontWeight: 700,
              cursor: joining ? 'default' : 'pointer', width: '100%',
              boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
            }}
          >
            {joining ? 'Joining…' : '🎙️ Join Voice Chat'}
          </button>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '1rem' }}>
            You'll be asked for microphone access.
          </p>
          <button
            onClick={() => navigate('/hangout')}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            ← Back to Hangout
          </button>
        </div>
        <div style={{ height: '80px' }} />
        <BottomNavigation />
      </div>
    );
  }

  // ---- In-room UI ----
  const others = participants.filter(p => p.id !== user?.uid);

  const statusFor = (p: Participant, id: string) =>
    p.isMuted ? '🔇 Muted' : isSpeaking(id) ? '🎤 Speaking' : '🎧 Listening';

  const cardStyle = (speaking: boolean, highlight: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', padding: '1rem',
    background: '#f9fafb', borderRadius: '12px', marginBottom: '0.75rem',
    border: '1px solid #e5e7eb',
    boxShadow: speaking ? `0 0 0 3px ${highlight}, 0 4px 12px rgba(0,0,0,0.1)` : 'none',
    transition: 'box-shadow 0.2s ease',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      padding: '1.25rem',
      paddingBottom: '96px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#991b1b' }}>
            🔥 Happening Now
          </h1>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 0.9rem', borderRadius: '20px',
            background: connectedPeers.length > 0 || others.length === 0 ? '#dcfce7' : '#fef3c7',
            border: '1px solid #16a34a',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>
              {others.length === 0 ? 'Live' : `${connectedPeers.length}/${others.length} connected`}
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
            padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#991b1b',
          }}>
            {error}
          </div>
        )}

        {/* Participants */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#1f2937' }}>
            👥 In the room ({participants.length})
          </h2>

          {/* You */}
          <div style={cardStyle(isSpeaking('me'), '#3b82f6')}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginRight: '1rem', flexShrink: 0,
            }}>
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#1f2937' }}>
                {user?.displayName || user?.email} (You)
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                {isMuted ? '🔇 Muted' : isSpeaking('me') ? '🎤 Speaking' : '🎧 Listening'}
              </p>
            </div>
          </div>

          {others.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6b7280' }}>
              <p style={{ margin: 0 }}>No one else here yet — share the Hangout and get them in! 🎉</p>
            </div>
          ) : others.map(p => (
            <div key={p.id} style={cardStyle(isSpeaking(p.id), '#22c55e')}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginRight: '1rem', flexShrink: 0,
              }}>
                {p.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#1f2937' }}>{p.name}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{statusFor(p, p.id)}</p>
              </div>
              {connectedPeers.includes(p.id) && (
                <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>● live</span>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={toggleMute}
            style={{
              flex: 1,
              background: isMuted ? '#10b981' : '#374151',
              color: '#fff', border: 'none', borderRadius: '14px',
              padding: '1.1rem', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {isMuted ? '🔓 Unmute' : '🔇 Mute'}
          </button>
          <button
            onClick={leaveRoom}
            style={{
              flex: 1,
              background: '#dc2626', color: '#fff', border: 'none', borderRadius: '14px',
              padding: '1.1rem', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            👋 Leave
          </button>
        </div>

        <div style={{
          background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '12px',
          padding: '1rem', marginTop: '1.25rem',
        }}>
          <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
            💡 <strong>Tip:</strong> keep the tab open while chatting. Mute yourself when you're just
            listening. If someone can't hear you, both of you leaving and rejoining fixes most issues.
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default VoiceRoom;
