import React, { useEffect, useState, useRef, useCallback } from 'react';
import { auth, rtdb } from './firebase';
import { ref, set, onValue, remove, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface Participant {
  id: string;
  name: string;
  email: string;
  isMuted: boolean;
  isActive: boolean;
}

const VoiceRoom: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioStats, setAudioStats] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('Checking authentication...');
  const [debugInfo, setDebugInfo] = useState({
    roomId: 'happening-now-room',
    userId: '',
    participantsCount: 0,
    peerConnectionsCount: 0,
    remoteStreamsCount: 0,
    databaseConnected: false
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const remoteStreamsRef = useRef<{ [key: string]: MediaStream }>({});
  const roomIdRef = useRef('happening-now-room');

  // Initialize Firebase Auth
  useEffect(() => {
    console.log('🔐 Auth effect started');
    setCurrentStep('Checking authentication...');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('✅ User authenticated:', currentUser.email);
        setCurrentStep('User authenticated, initializing audio...');
        setUser(currentUser);
      } else {
        console.log('❌ User not authenticated, redirecting to login');
        setCurrentStep('Redirecting to login...');
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  // Create peer connection
  const createPeerConnection = useCallback((peerId: string) => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] },
          { urls: ['stun:stun2.l.google.com:19302'] },
          { urls: ['stun:stun3.l.google.com:19302'] },
          { urls: ['stun:stun4.l.google.com:19302'] }
        ]
      });

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('🎵 Received remote track from', peerId);
        const remoteStream = event.streams[0];
        remoteStreamsRef.current[peerId] = remoteStream;
        setDebugInfo(prev => ({
          ...prev,
          remoteStreamsCount: Object.keys(remoteStreamsRef.current).length
        }));
        
        // Play remote audio
        const remoteAudio = new Audio();
        remoteAudio.srcObject = remoteStream;
        remoteAudio.play().catch(err => {
          console.error('Error playing remote audio:', err);
        });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = async (event) => {
        if (event.candidate && user) {
          try {
            const candidateRef = ref(rtdb, 
              `voiceRooms/${roomIdRef.current}/iceCandidates/${user.uid}/${peerId}`
            );
            await set(candidateRef, {
              candidate: event.candidate.candidate,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              sdpMid: event.candidate.sdpMid,
              timestamp: Date.now()
            });
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`);
        if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          peerConnection.close();
          delete peerConnectionsRef.current[peerId];
          delete remoteStreamsRef.current[peerId];
          setDebugInfo(prev => ({
            ...prev,
            peerConnectionsCount: Object.keys(peerConnectionsRef.current).length,
            remoteStreamsCount: Object.keys(remoteStreamsRef.current).length
          }));
        }
      };

      peerConnectionsRef.current[peerId] = peerConnection;
      setDebugInfo(prev => ({
        ...prev,
        peerConnectionsCount: Object.keys(peerConnectionsRef.current).length
      }));
      return peerConnection;
    } catch (err) {
      console.error('Error creating peer connection:', err);
      return null;
    }
  }, [user]);

  // Make offer to peer
  const makeOffer = useCallback(async (peerId: string) => {
    try {
      console.log('📤 Making offer to peer:', peerId);
      let peerConnection: RTCPeerConnection | undefined | null = peerConnectionsRef.current[peerId];
      if (!peerConnection) {
        console.log('🔌 Creating new peer connection for:', peerId);
        peerConnection = createPeerConnection(peerId);
        if (!peerConnection) {
          console.error('❌ Failed to create peer connection');
          return;
        }
      }

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true
      });
      console.log('✅ Offer created, setting local description');
      await peerConnection.setLocalDescription(offer);

      if (user) {
        const offerRef = ref(rtdb, 
          `voiceRooms/${roomIdRef.current}/offers/${user.uid}/${peerId}`
        );
        console.log('💾 Saving offer to Firebase');
        await set(offerRef, {
          sdp: offer.sdp,
          type: offer.type,
          timestamp: Date.now()
        });
        console.log('✅ Offer saved to Firebase');
      }
    } catch (err) {
      console.error('❌ Error making offer:', err);
    }
  }, [user, createPeerConnection]);

  // Handle offer from peer
  const handleRemoteOffer = useCallback(async (peerId: string, offer: any) => {
    try {
      let peerConnection: RTCPeerConnection | undefined | null = peerConnectionsRef.current[peerId];
      if (!peerConnection) {
        peerConnection = createPeerConnection(peerId);
        if (!peerConnection) return;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: 'offer',
          sdp: offer.sdp
        })
      );

      const answer = await peerConnection.createAnswer({
        offerToReceiveAudio: true
      });
      await peerConnection.setLocalDescription(answer);

      if (user) {
        const answerRef = ref(rtdb, 
          `voiceRooms/${roomIdRef.current}/answers/${user.uid}/${peerId}`
        );
        await set(answerRef, {
          sdp: answer.sdp,
          type: answer.type,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  }, [user, createPeerConnection]);

  // Handle answer from peer
  const handleRemoteAnswer = useCallback(async (peerId: string, answer: any) => {
    try {
      const peerConnection = peerConnectionsRef.current[peerId];
      if (peerConnection && peerConnection.signalingState === 'have-local-offer') {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'answer',
            sdp: answer.sdp
          })
        );
      }
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  }, []);

  // Handle ICE candidates
  const handleRemoteICECandidate = useCallback(async (peerId: string, candidate: any) => {
    try {
      const peerConnection = peerConnectionsRef.current[peerId];
      if (peerConnection) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate({
            candidate: candidate.candidate,
            sdpMLineIndex: candidate.sdpMLineIndex,
            sdpMid: candidate.sdpMid
          })
        );
      }
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }, []);

  // Get user's audio stream and join room
  useEffect(() => {
    console.log('🎤 Audio initialization effect started, user:', user?.email);
    if (!user) {
      console.log('⏳ Waiting for user...');
      return;
    }

    const initializeAudio = async () => {
      try {
        console.log('📡 Requesting microphone access...');
        setCurrentStep('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });

        console.log('✅ Microphone access granted, stream:', stream);
        setCurrentStep('Initializing audio context...');
        localStreamRef.current = stream;
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
          localAudioRef.current.muted = true; // Mute local audio to prevent echo
        }

        // Initialize audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('🎵 Audio context initialized');

        // Add participant to room with better error handling
        console.log('📝 Adding participant to room:', user.uid);
        console.log('🔗 RTDB instance:', rtdb);
        console.log('🔗 RTDB URL:', rtdb.app.options.databaseURL);
        setCurrentStep('Joining voice room...');
        
        const participantRef = ref(rtdb, `voiceRooms/${roomIdRef.current}/participants/${user.uid}`);
        console.log('📍 Ref path:', participantRef.toString());
        
        // Add timeout for database operation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database operation timed out after 10 seconds')), 10000);
        });
        
        let databaseConnected = false;
        try {
          await Promise.race([
            set(participantRef, {
              id: user.uid,
              name: user.displayName || user.email || 'Anonymous',
              email: user.email,
              isMuted: false,
              isActive: true,
              joinedAt: Date.now()
            }),
            timeoutPromise
          ]);
          
          console.log('✅ Participant added to database successfully');
          databaseConnected = true;
          setDebugInfo(prev => ({
            ...prev,
            userId: user.uid,
            databaseConnected: true
          }));
          setConnectionStatus('connected');
        } catch (participantError) {
          console.error('❌ Participant write failed:', participantError);
          const errorMessage = participantError instanceof Error ? participantError.message : 'Unknown error';
          console.log('⚠️ Database error details:', {
            error: participantError,
            message: errorMessage,
            userId: user.uid,
            path: participantRef.toString()
          });
          
          // Continue anyway - the voice room can work locally
          console.log('🔄 Continuing without database connection...');
          databaseConnected = false;
          setDebugInfo(prev => ({
            ...prev,
            userId: user.uid,
            databaseConnected: false
          }));
          setConnectionStatus('connected');
        }

        // Always complete loading and show the UI
        setCurrentStep(databaseConnected ? 'Connected successfully!' : 'Connected (local mode)');
        setIsLoading(false);
        setAudioStats('✅ Microphone connected');
        
        console.log('✅ Voice room initialization complete. Database:', databaseConnected ? 'Connected' : 'Disconnected');

        // Listen to other participants
        console.log('👥 Setting up participant listener...');
        const participantsRef = ref(rtdb, `voiceRooms/${roomIdRef.current}/participants`);
        onValue(participantsRef, async (snapshot) => {
          const data = snapshot.val();
          console.log('👥 Participants raw data:', data);
          console.log('👥 Current user ID:', user.uid);
          
          if (data) {
            const allParticipants = Object.values(data) as any[];
            console.log('👥 All participants before filtering:', allParticipants);
            
            const participantList: Participant[] = allParticipants.filter(
              (p: any) => p.id !== user.uid && p.isActive
            ) as Participant[];
            
            console.log('👥 Filtered participants (excluding self):', participantList);
            console.log('👥 Setting participants count:', participantList.length);
            setParticipants(participantList);
            setDebugInfo(prev => ({
              ...prev,
              participantsCount: participantList.length
            }));

            // Create connections with all other participants
            for (const participant of participantList) {
              if (!peerConnectionsRef.current[participant.id]) {
                // Make offer to new participant (only if our UID is greater to avoid duplicates)
                if (user.uid > participant.id) {
                  console.log('🤝 Making offer to peer:', participant.id);
                  setTimeout(() => makeOffer(participant.id), 100);
                }
              }
            }
          } else {
            console.log('👥 No participant data found');
            setParticipants([]);
            setDebugInfo(prev => ({
              ...prev,
              participantsCount: 0
            }));
          }
        }, (error) => {
          console.error('❌ Error listening to participants:', error);
          setError(`Failed to sync with other participants: ${error.message}`);
        });

        // Listen to offers from peers
        const offersRef = ref(rtdb, `voiceRooms/${roomIdRef.current}/offers`);
        onValue(offersRef, (snapshot) => {
          const data = snapshot.val();
          console.log('📥 Offers data received:', data);
          if (data) {
            Object.entries(data).forEach(([peerId, offers]: any) => {
              if (peerId !== user.uid) {
                Object.entries(offers).forEach(([targetId, offer]: any) => {
                  if (targetId === user.uid && offer.sdp) {
                    console.log('📥 Processing offer from', peerId, 'to', targetId);
                    handleRemoteOffer(peerId, offer);
                  }
                });
              }
            });
          }
        }, (error) => {
          console.error('❌ Error listening to offers:', error);
        });

        // Listen to answers from peers
        const answersRef = ref(rtdb, `voiceRooms/${roomIdRef.current}/answers`);
        onValue(answersRef, (snapshot) => {
          const data = snapshot.val();
          console.log('📥 Answers data received:', data);
          if (data) {
            Object.entries(data).forEach(([peerId, answers]: any) => {
              if (peerId !== user.uid) {
                Object.entries(answers).forEach(([targetId, answer]: any) => {
                  if (targetId === user.uid && answer.sdp) {
                    console.log('📥 Processing answer from', peerId, 'to', targetId);
                    handleRemoteAnswer(peerId, answer);
                  }
                });
              }
            });
          }
        }, (error) => {
          console.error('❌ Error listening to answers:', error);
        });

        // Listen to ICE candidates
        const iceCandidatesRef = ref(rtdb, `voiceRooms/${roomIdRef.current}/iceCandidates`);
        onValue(iceCandidatesRef, (snapshot) => {
          const data = snapshot.val();
          console.log('📥 ICE candidates data received:', data);
          if (data) {
            Object.entries(data).forEach(([peerId, candidates]: any) => {
              if (peerId !== user.uid) {
                Object.entries(candidates).forEach(([targetId, candidatesObj]: any) => {
                  if (targetId === user.uid) {
                    Object.entries(candidatesObj).forEach(([, candidate]: any) => {
                      if (candidate.candidate) {
                        console.log('📥 Processing ICE candidate from', peerId, 'to', targetId);
                        handleRemoteICECandidate(peerId, candidate);
                      }
                    });
                  }
                });
              }
            });
          }
        }, (error) => {
          console.error('❌ Error listening to ICE candidates:', error);
        });

      } catch (err) {
        console.error('❌ Error initializing voice room:', err);
        setCurrentStep('Initialization failed');
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('Microphone access denied. Please allow microphone access and refresh the page.');
          } else if (err.name === 'NotFoundError') {
            setError('No microphone found. Please check your audio devices.');
          } else if (err.message.includes('Firebase')) {
            setError('Database connection failed. Please check your internet connection.');
          } else {
            setError(`Initialization failed: ${err.message}`);
          }
        } else {
          setError('An unknown error occurred during initialization.');
        }
        setAudioStats('❌ Initialization failed');
        setIsLoading(false);
      }
    };

    initializeAudio();

    // Store ref values for cleanup
    const currentPeerConnections = peerConnectionsRef.current;
    const currentRoomId = roomIdRef.current;

    return () => {
      console.log('🧹 Cleaning up audio resources');
      // Cleanup when component unmounts
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(currentPeerConnections).forEach(pc => {
        pc.close();
      });
      
      // Remove participant from database when leaving
      if (user) {
        const participantRef = ref(rtdb, `voiceRooms/${currentRoomId}/participants/${user.uid}`);
        remove(participantRef).catch(err => {
          console.error('Error removing participant on cleanup:', err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, makeOffer, handleRemoteOffer, handleRemoteAnswer, handleRemoteICECandidate]);

  // Toggle mute
  const toggleMute = async () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });

      const newMutedState = !isMuted;
      setIsMuted(newMutedState);

      // Update mute status in database
      if (user) {
        const participantRef = ref(rtdb, `voiceRooms/${roomIdRef.current}/participants/${user.uid}`);
        await update(participantRef, {
          isMuted: newMutedState
        });
      }

      setAudioStats(newMutedState ? '🔇 Microphone muted' : '🎤 Microphone active');
    }
  };

  // Leave room
  const leaveRoom = async () => {
    // Stop all audio tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => {
      pc.close();
    });

    // Remove from database
    if (user) {
      const participantRef = ref(rtdb, `voiceRooms/${roomIdRef.current}/participants/${user.uid}`);
      await remove(participantRef);
    }

    navigate('/hangout');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: 'pulse 2s infinite'
          }}>🎙️</div>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280'
          }}>{currentStep}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6'
      }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#991b1b',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}>❌ {error}</p>
          <button
            onClick={() => navigate('/hangout')}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            Back to Hangout
          </button>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}
            style={{
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              margin: 0,
              color: '#991b1b'
            }}>
              🔥 Happening Now - Voice Room
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: connectionStatus === 'connected' ? '#dcfce7' : 
                         connectionStatus === 'error' ? '#fee2e2' : '#fef3c7',
              border: `1px solid ${
                connectionStatus === 'connected' ? '#16a34a' : 
                connectionStatus === 'error' ? '#dc2626' : '#f59e0b'
              }`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: connectionStatus === 'connected' ? '#16a34a' : 
                           connectionStatus === 'error' ? '#dc2626' : '#f59e0b',
                animation: connectionStatus === 'connecting' ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: connectionStatus === 'connected' ? '#15803d' : 
                       connectionStatus === 'error' ? '#991b1b' : '#92400e'
              }}>
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </span>
            </div>
          </div>
          <button
            onClick={leaveRoom}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626';
            }}
          >
            Leave Room
          </button>
        </div>

        {/* Main Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Participants List */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              margin: '0 0 1.5rem 0',
              color: '#1f2937'
            }}>
              👥 Participants ({participants.length + 1})
            </h2>

            {/* You */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: '#eff6ff',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '2px solid #3b82f6'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1f2937 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1.2rem',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: '0 0 0.25rem 0',
                  fontWeight: 600,
                  color: '#1f2937'
                }}>
                  {user?.displayName || user?.email} (You)
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#6b7280'
                }}>
                  {isMuted ? '🔇 Muted' : '🎤 Speaking'}
                </p>
              </div>
            </div>

            {/* Other Participants */}
            {participants.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280'
              }}>
                <p style={{ fontSize: '1rem', margin: 0 }}>No other participants yet</p>
                <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>Be the first one here! 🎉</p>
              </div>
            ) : (
              participants.map(participant => (
                <div
                  key={participant.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    marginRight: '1rem',
                    flexShrink: 0
                  }}>
                    {participant.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: '0 0 0.25rem 0',
                      fontWeight: 600,
                      color: '#1f2937'
                    }}>
                      {participant.name}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: '#6b7280'
                    }}>
                      {participant.isMuted ? '🔇 Muted' : '🎤 Speaking'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Audio Status */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                animation: isMuted ? 'none' : 'pulse 1s infinite'
              }}>
                {isMuted ? '🔇' : '🎤'}
              </div>
              <p style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#1f2937',
                margin: '0 0 0.5rem 0'
              }}>
                {isMuted ? 'Microphone Off' : 'Microphone On'}
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: 0
              }}>
                {isMuted ? 'Your voice is muted' : 'You are speaking'}
              </p>
            </div>

            {/* Audio Stats */}
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                color: '#78350f',
                fontWeight: 600
              }}>
                {audioStats}
              </p>
            </div>

            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              style={{
                background: isMuted ? '#10b981' : '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '1.5rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>
                {isMuted ? '🔓' : '🔒'}
              </span>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            {/* Debug Info */}
            <div style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#374151',
                  margin: 0,
                  fontWeight: 600
                }}>
                  🔧 Connection Status
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: '#6b7280',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Refresh
                </button>
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                <p>Room ID: {debugInfo.roomId}</p>
                <p>User ID: {debugInfo.userId || 'Not set'}</p>
                <p>Participants Found: {debugInfo.participantsCount}</p>
                <p>Peer Connections: {Object.keys(peerConnectionsRef.current).length}</p>
                <p>Remote Streams: {Object.keys(remoteStreamsRef.current).length}</p>
                <p>Database: {debugInfo.databaseConnected ? '✅ Connected' : '⚠️ Limited Mode'}</p>
                {debugInfo.participantsCount === 0 && debugInfo.databaseConnected && (
                  <p style={{ color: '#f59e0b', fontWeight: 600, marginTop: '0.5rem' }}>
                    💡 No other participants yet - invite friends!
                  </p>
                )}
                {!debugInfo.databaseConnected && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: '#fef3c7',
                    borderRadius: '6px',
                    border: '1px solid #fcd34d'
                  }}>
                    <p style={{ color: '#92400e', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                      ℹ️ Database Not Connected
                    </p>
                    <p style={{ color: '#78350f', fontSize: '0.75rem', margin: 0 }}>
                      Voice room is in limited mode. To enable multi-user features, update Firebase Realtime Database rules. Check FIREBASE_SETUP.md for instructions.
                    </p>
                  </div>
                )}
                {debugInfo.participantsCount > 0 && Object.keys(peerConnectionsRef.current).length === 0 && (
                  <p style={{ color: '#f59e0b', fontWeight: 600, marginTop: '0.5rem' }}>
                    🔄 Establishing connections...
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              background: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <p style={{
                fontSize: '0.95rem',
                color: '#1e40af',
                margin: '0 0 0.75rem 0',
                fontWeight: 600
              }}>
                💡 Getting Started
              </p>
              <ul style={{
                margin: 0,
                paddingLeft: '1.5rem',
                fontSize: '0.85rem',
                color: '#1e3a8a',
                lineHeight: '1.6'
              }}>
                <li>Make sure microphone permission is granted</li>
                <li>Unmute to speak to others</li>
                <li>You'll hear others when they speak</li>
                <li>Mute when not speaking to save bandwidth</li>
                <li>Click "Leave Room" to exit</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={localAudioRef}
          autoPlay
          muted
          style={{ display: 'none' }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceRoom;
