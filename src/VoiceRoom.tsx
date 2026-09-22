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
  isCameraOn?: boolean;
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

// Video is temporarily disabled while voice-call reliability is fixed.
// Flip back to true to re-enable the camera button + camera permission at join.
const VIDEO_ENABLED = false;

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
  // Voice-server connection state (null = not known yet)
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const isMutedRef = useRef(false);
  // Base participant payload so presence can be re-asserted after a reconnect
  const participantPayloadRef = useRef<{ id: string; name: string; email: string; joinedAt: number } | null>(null);
  // Tracks which nested offer listeners are attached (SDK re-fires onChildAdded on reconnect)
  const offerListenersRef = useRef<Set<string>>(new Set());
  const retryCountRef = useRef<Map<string, number>>(new Map());
  const makeOfferRef = useRef<(peerId: string) => Promise<void>>(async () => {});
  // Camera toggle state
  const [cameraOn, setCameraOn] = useState(false);
  const cameraOnRef = useRef(false);
  const localVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const localVideoElRef = useRef<HTMLVideoElement | null>(null);
  // Remote media streams by peer (drives the video tiles)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

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

  // Connection monitor + presence re-assertion.
  // Mobile networks drop and reconnect often; when the socket drops, the server
  // fires our onDisconnect and removes our participant entry. Without
  // re-asserting, we'd be invisibly stuck in the room (we see the room UI, but
  // nobody sees us). So on every (re)connect while joined, re-write our entry
  // and re-arm onDisconnect.
  useEffect(() => {
    if (!authReady) return;
    const unsub = onValue(ref(rtdb, '.info/connected'), (snap) => {
      const connected = snap.val() === true;
      setDbConnected(connected);
      if (connected && joinedRef.current && participantPayloadRef.current) {
        const p = participantPayloadRef.current;
        const pref = roomRef(`participants/${p.id}`);
        set(pref, {
          id: p.id,
          name: p.name,
          email: p.email,
          isMuted: isMutedRef.current,
          isActive: true,
          isCameraOn: cameraOnRef.current,
          joinedAt: p.joinedAt,
        }).catch(() => {});
        onDisconnect(pref).remove().catch(() => {});
      }
    });
    return () => unsub();
  }, [authReady]);

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
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
    setSpeaking(peerId, false);
    setConnectedPeers(prev => prev.filter(id => id !== peerId));
  }, [setSpeaking]);

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection | null => {
    const me = userRef.current;
    if (!me) return null;
    try {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      if (localStreamRef.current) {
        // All tracks (audio always; video too when the camera is on)
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (!remoteStream) return;
        // Declarative state drives the video tiles; refresh when tracks are removed too
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.set(peerId, remoteStream);
          return next;
        });
        remoteStream.onremovetrack = () => setRemoteStreams(prev => new Map(prev));
        // Video is rendered by the tiles below; only audio needs the imperative element
        if (event.track.kind !== 'audio') return;
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
          // NOTE: sdpMLineIndex is null in modern browsers (deprecated in favour
          // of sdpMid). The RTDB validate rule requires the field to be present,
          // so default it — addIceCandidate() prefers sdpMid anyway. Without
          // this, every candidate push is rejected and calls never connect.
          push(roomRef(`iceCandidates/${userRef.current.uid}/${peerId}`), {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex ?? 0,
            sdpMid: event.candidate.sdpMid ?? '0',
            timestamp: Date.now(),
          }).catch(err => console.error('ICE push failed:', err));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          retryCountRef.current.delete(peerId);
          setConnectedPeers(prev => (prev.includes(peerId) ? prev : [...prev, peerId]));
        } else if (pc.connectionState === 'failed') {
          // ICE/connectivity failed (flaky mobile networks) — clean up and let
          // the offerer retry a few times instead of leaving the call stuck.
          console.warn(`Voice connection to ${peerId} failed — retrying`);
          cleanupPeer(peerId);
          const meNow = userRef.current;
          if (meNow && meNow.uid > peerId && joinedRef.current) {
            const attempts = (retryCountRef.current.get(peerId) || 0) + 1;
            retryCountRef.current.set(peerId, attempts);
            if (attempts <= 3) {
              setTimeout(() => {
                if (joinedRef.current && !peerConnectionsRef.current.has(peerId)) {
                  void makeOfferRef.current(peerId);
                }
              }, 2500);
            } else {
              console.warn(`Giving up retrying ${peerId} after 3 attempts`);
            }
          }
        } else if (
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
  makeOfferRef.current = makeOffer;

  // Re-negotiate an EXISTING peer connection (e.g. camera toggled).
  // Retries a few times if a negotiation is still in flight.
  const renegotiateOffer = useCallback(async (peerId: string, attempt = 0) => {
    const me = userRef.current;
    const pc = peerConnectionsRef.current.get(peerId);
    if (!me || !pc || pc.signalingState === 'closed') return;
    if (pc.signalingState !== 'stable') {
      if (attempt < 4) setTimeout(() => renegotiateOffer(peerId, attempt + 1), 800);
      return;
    }
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await set(roomRef(`offers/${me.uid}/${peerId}`), {
        sdp: offer.sdp,
        type: offer.type,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('renegotiateOffer failed:', err);
    }
  }, []);

  const handleRemoteOffer = useCallback(async (peerId: string, offer: { sdp: string; type: string }) => {
    const me = userRef.current;
    if (!me) return;
    const existing = peerConnectionsRef.current.get(peerId);
    if (existing) {
      // Renegotiation (e.g. peer toggled camera) or simultaneous offers (glare).
      // Polite peer (lower UID) accepts even mid-negotiation via implicit rollback;
      // impolite peer only accepts when stable.
      const polite = me.uid < peerId;
      const canAccept =
        existing.signalingState === 'stable' ||
        (polite && existing.signalingState === 'have-local-offer');
      try {
        if (canAccept) {
          await existing.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offer.sdp }));
          await flushPendingCandidates(peerId);
          const answer = await existing.createAnswer();
          await existing.setLocalDescription(answer);
          await set(roomRef(`answers/${me.uid}/${peerId}`), {
            sdp: answer.sdp,
            type: answer.type,
            timestamp: Date.now(),
          });
          // If glare made us offer too, drop our own stale offer
          await remove(roomRef(`offers/${me.uid}/${peerId}`)).catch(() => {});
        }
      } catch (err) {
        console.error('handleRemoteOffer (renegotiation) failed:', err);
      } finally {
        // Consumed — remove so it can never be reprocessed
        remove(roomRef(`offers/${peerId}/${me.uid}`)).catch(() => {});
      }
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
      // If our camera is on but the peer's offer was audio-only (they joined
      // without a camera), renegotiate to bring our video up. Delayed so the
      // answer is processed first — avoids offer/answer races.
      if (cameraOnRef.current && !offer.sdp.includes('m=video')) {
        setTimeout(() => renegotiateOffer(peerId), 1500);
      }
    } catch (err) {
      console.error('handleRemoteOffer failed:', err);
      cleanupPeer(peerId);
    } finally {
      // Consumed — remove so it can never be reprocessed
      remove(roomRef(`offers/${peerId}/${me.uid}`)).catch(() => {});
    }
  }, [createPeerConnection, flushPendingCandidates, cleanupPeer, renegotiateOffer]);

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
      // 1. Microphone + camera (inside the tap gesture, so mobile browsers allow it).
      // The camera is requested up front so toggling video later is instant.
      // The video track starts muted — the camera stays OFF until the user taps
      // the camera button. Falls back to audio-only if the camera is denied.
      const audioConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
      const videoConstraints = VIDEO_ENABLED
        ? {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 24 },
            facingMode: 'user',
          }
        : false;
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: videoConstraints,
        });
      } catch (err) {
        if (VIDEO_ENABLED) {
          // Camera may be denied/unavailable — fall back to audio-only
          console.warn('Camera unavailable at join — falling back to audio-only:', err);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
            video: false,
          });
        } else {
          throw err;
        }
      }
      localStreamRef.current = stream;
      const joinVtrack = stream.getVideoTracks()[0] || null;
      if (joinVtrack) {
        joinVtrack.enabled = false; // camera off until toggled
        localVideoTrackRef.current = joinVtrack;
      }

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
      participantPayloadRef.current = {
        id: me.uid,
        name: me.displayName || me.email || 'Anonymous',
        email: me.email || '',
        joinedAt: Date.now(),
      };
      const presencePayload = {
        ...participantPayloadRef.current,
        isMuted: false,
        isActive: true,
        isCameraOn: false,
      };
      // Never hang forever on a dead/flaky connection — fail loudly instead.
      const joinTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('JOIN_TIMEOUT')), 15000)
      );
      await Promise.race([
        (async () => {
          await set(participantRef, presencePayload);
          await onDisconnect(participantRef).remove();
        })(),
        joinTimeout,
      ]);

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
        // onChildAdded re-fires for existing children on reconnect — attach once
        if (offerListenersRef.current.has(fromUid)) return;
        offerListenersRef.current.add(fromUid);
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
      } else if (err instanceof Error && err.message === 'JOIN_TIMEOUT') {
        participantPayloadRef.current = null;
        // Best-effort: clear any entry the timed-out attempt may have written late
        if (me) remove(roomRef(`participants/${me.uid}`)).catch(() => {});
        setError('Could not reach the voice server (timed out after 15 seconds). Check your internet connection / VPN and try again.');
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
    participantPayloadRef.current = null;
    offerListenersRef.current.clear();
    cameraOnRef.current = false;
    localVideoTrackRef.current = null;
    setCameraOn(false);
    setRemoteStreams(new Map());

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
    isMutedRef.current = newMuted;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setIsMuted(newMuted);
    setSpeaking('me', false);
    await update(roomRef(`participants/${me.uid}`), { isMuted: newMuted }).catch(() => {});
  }, [isMuted, setSpeaking]);

  const toggleCamera = useCallback(async () => {
    const me = userRef.current;
    if (!me || !joinedRef.current || !localStreamRef.current) return;
    const participantRef = roomRef(`participants/${me.uid}`);

    if (!cameraOnRef.current) {
      // ---- Enable camera ----
      let vtrack = localVideoTrackRef.current;
      if (vtrack && vtrack.readyState === 'ended') {
        localVideoTrackRef.current = null;
        vtrack = null;
      }
      if (!vtrack) {
        // No camera track (denied/unavailable at join) — try acquiring now.
        // This needs a renegotiation since the track was never negotiated.
        try {
          const vstream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 24 },
              facingMode: 'user',
            },
          });
          vtrack = vstream.getVideoTracks()[0];
          if (!vtrack) throw new Error('no video track');
          localVideoTrackRef.current = vtrack;
          localStreamRef.current.addTrack(vtrack);
          await update(participantRef, { isCameraOn: true }).catch(() => {});
          for (const peerId of Array.from(peerConnectionsRef.current.keys())) {
            const pc = peerConnectionsRef.current.get(peerId);
            if (pc && pc.signalingState !== 'closed') {
              try { pc.addTrack(vtrack, localStreamRef.current); } catch { /* already added */ }
              await renegotiateOffer(peerId);
            }
          }
        } catch (err) {
          console.error('enableCamera failed:', err);
          setError('Could not access the camera. Please allow camera access and try again.');
          return;
        }
      } else {
        // Track already negotiated at join — just unmute it. Instant, no renegotiation.
        vtrack.enabled = true;
        await update(participantRef, { isCameraOn: true }).catch(() => {});
      }
      cameraOnRef.current = true;
      setCameraOn(true);
      if (localVideoElRef.current) localVideoElRef.current.srcObject = localStreamRef.current;
    } else {
      // ---- Disable camera: mute the track, keep it negotiated for instant re-enable ----
      const vtrack = localVideoTrackRef.current;
      if (vtrack) vtrack.enabled = false;
      cameraOnRef.current = false;
      setCameraOn(false);
      if (localVideoElRef.current) localVideoElRef.current.srcObject = null;
      await update(participantRef, { isCameraOn: false }).catch(() => {});
    }
  }, [renegotiateOffer]);

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
          <p style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
            {othersCount > 0
              ? `🟢 ${othersCount} friend${othersCount === 1 ? '' : 's'} ${othersCount === 1 ? 'is' : 'are'} in the room right now`
              : 'The room is quiet — be the first one in! 🎉'}
          </p>
          <div style={{
            margin: '0 0 1.25rem 0', fontSize: '0.85rem', fontWeight: 600,
            color: dbConnected === false ? '#991b1b' : dbConnected ? '#15803d' : '#92400e',
          }}>
            {dbConnected === false
              ? '🔴 Voice server unreachable — check your internet / VPN'
              : dbConnected
                ? '🟢 Voice server connected'
                : '🟡 Connecting to voice server…'}
          </div>
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
            disabled={joining || dbConnected === false}
            style={{
              background: joining || dbConnected === false ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              padding: '1.1rem 2rem', fontSize: '1.15rem', fontWeight: 700,
              cursor: joining || dbConnected === false ? 'default' : 'pointer', width: '100%',
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

        {dbConnected === false && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
            padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#991b1b',
          }}>
            🔴 Lost connection to the voice server — you'll reappear automatically when it
            reconnects. Check your internet / VPN.
          </div>
        )}

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
            {cameraOn ? (
              <video
                ref={(el) => {
                  localVideoElRef.current = el;
                  if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
                }}
                autoPlay playsInline muted
                style={{
                  width: '96px', aspectRatio: '16 / 9', borderRadius: '10px', objectFit: 'cover',
                  transform: 'scaleX(-1)', background: '#111827',
                  marginRight: '1rem', flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginRight: '1rem', flexShrink: 0,
              }}>
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
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
          ) : others.map(p => {
            const rstream = remoteStreams.get(p.id);
            const hasVideo = !!rstream && rstream.getVideoTracks().length > 0;
            const showVideo = !!p.isCameraOn && hasVideo;
            return (
              <div key={p.id} style={cardStyle(isSpeaking(p.id), '#22c55e')}>
                {showVideo ? (
                  <video
                    ref={(el) => { if (el && rstream && el.srcObject !== rstream) el.srcObject = rstream; }}
                    autoPlay playsInline muted
                    style={{
                      width: '96px', aspectRatio: '16 / 9', borderRadius: '10px', objectFit: 'cover',
                      background: '#111827', marginRight: '1rem', flexShrink: 0,
                    }}
                  />
                ) : p.isCameraOn ? (
                  <div style={{
                    width: '96px', aspectRatio: '16 / 9', borderRadius: '10px', background: '#111827',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9ca3af', fontSize: '1.2rem', marginRight: '1rem', flexShrink: 0,
                  }}>
                    📷…
                  </div>
                ) : (
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginRight: '1rem', flexShrink: 0,
                  }}>
                    {p.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#1f2937' }}>
                    {p.name}{p.isCameraOn ? ' 📷' : ''}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{statusFor(p, p.id)}</p>
                </div>
                {connectedPeers.includes(p.id) && (
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>● live</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={toggleMute}
            style={{
              flex: 1,
              background: isMuted ? '#10b981' : '#374151',
              color: '#fff', border: 'none', borderRadius: '14px',
              padding: '1.1rem 0.5rem', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {isMuted ? '🔓 Unmute' : '🔇 Mute'}
          </button>
          {VIDEO_ENABLED && (
            <button
              onClick={toggleCamera}
              style={{
                flex: 1,
                background: cameraOn ? '#7c3aed' : '#374151',
                color: '#fff', border: 'none', borderRadius: '14px',
                padding: '1.1rem 0.5rem', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {cameraOn ? '📷 On' : '📷 Off'}
            </button>
          )}
          <button
            onClick={leaveRoom}
            style={{
              flex: 1,
              background: '#dc2626', color: '#fff', border: 'none', borderRadius: '14px',
              padding: '1.1rem 0.5rem', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
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
            listening. If someone can't hear you, both of you leaving and
            rejoining fixes most issues.
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default VoiceRoom;
