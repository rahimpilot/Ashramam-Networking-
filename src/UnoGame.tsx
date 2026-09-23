import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, get, child } from 'firebase/database';
import { auth, rtdb } from './firebase';
import PageHeader from './PageHeader';
import BottomNavigation from './BottomNavigation';

// ---------- Types ----------
type CardColor = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Black';

interface UnoCardT {
  type: 'Number' | 'Action' | 'Wild';
  color: CardColor;
  value: string;
  id: string;
}

interface UnoPlayer {
  id: string;
  name: string;
  hand: UnoCardT[];
}

interface GameState {
  gameStarted: boolean;
  deck: UnoCardT[];
  discardPile: UnoCardT[];
  players: UnoPlayer[];
  currentPlayerIndex: number;
  direction: number;
  hostId: string;
}

interface OpenTable {
  id: string;
  hostName: string;
  playerCount: number;
}

// ---------- Deck ----------
const COLORS: CardColor[] = ['Red', 'Blue', 'Green', 'Yellow'];
const ACTION_CARDS = ['Skip', 'Reverse', 'Draw 2'];

function generateDeck(): UnoCardT[] {
  const deck: UnoCardT[] = [];
  COLORS.forEach((color) => {
    deck.push({ type: 'Number', color, value: '0', id: `${color}-0-1` });
    for (let i = 1; i <= 9; i++) {
      deck.push({ type: 'Number', color, value: i.toString(), id: `${color}-${i}-1` });
      deck.push({ type: 'Number', color, value: i.toString(), id: `${color}-${i}-2` });
    }
    ACTION_CARDS.forEach((action) => {
      deck.push({ type: 'Action', color, value: action, id: `${color}-${action}-1` });
      deck.push({ type: 'Action', color, value: action, id: `${color}-${action}-2` });
    });
  });
  for (let i = 1; i <= 4; i++) {
    deck.push({ type: 'Wild', color: 'Black', value: 'Wild', id: `Wild-${i}` });
    deck.push({ type: 'Wild', color: 'Black', value: 'Draw 4', id: `Wild-Draw4-${i}` });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function getColorHex(color: CardColor): string {
  switch (color) {
    case 'Red': return '#E02424';
    case 'Blue': return '#1D6FE0';
    case 'Green': return '#22A35A';
    case 'Yellow': return '#F5B800';
    case 'Black': return '#232323';
    default: return '#555';
  }
}

// ---------- Small components ----------
const UnoCardView: React.FC<{ card: UnoCardT; onClick?: () => void; small?: boolean }> = ({ card, onClick, small }) => {
  const hex = getColorHex(card.color);
  const w = small ? 54 : 68;
  const h = small ? 76 : 96;
  return (
    <div
      onClick={onClick}
      style={{
        width: w, height: h, borderRadius: 10, background: hex, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        border: '3px solid #fffdf8', position: 'relative', userSelect: 'none',
      }}
    >
      <div style={{
        width: '70%', height: '52%', background: 'rgba(255,255,255,0.92)',
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'rotate(-18deg)',
      }}>
        <span style={{ color: hex, fontWeight: 800, fontSize: small ? 13 : 16, textAlign: 'center', lineHeight: 1.1 }}>
          {card.value}
        </span>
      </div>
      <span style={{ position: 'absolute', top: 3, left: 6, color: '#fffdf8', fontSize: 11, fontWeight: 800 }}>
        {card.value.length > 6 ? card.value.slice(0, 6) : card.value}
      </span>
    </div>
  );
};

const btnPrimary: React.CSSProperties = {
  width: '100%', background: '#9a6b3f', color: '#fffdf8', border: 'none',
  borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
};

const card: React.CSSProperties = {
  background: '#fffdf8', borderRadius: 18, padding: 20,
  boxShadow: '0 1px 4px rgba(15,23,42,0.06)', border: '1px solid #e7ddcc',
};

// ---------- Main component ----------
const UnoGame: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [pendingCard, setPendingCard] = useState<UnoCardT | null>(null);
  const [openTables, setOpenTables] = useState<OpenTable[]>([]);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  // null = still checking, true = RTDB reachable, false = unreachable
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  const myName = user?.displayName || user?.email || 'Player';
  const myId = user?.uid || '';

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Realtime Database connection indicator (.info/connected is a local,
  // client-side flag — it tells us whether THIS device can reach the DB)
  useEffect(() => {
    const connRef = ref(rtdb, '.info/connected');
    const unsub = onValue(connRef, (snap) => setDbConnected(snap.val() === true));
    return () => unsub();
  }, []);

  // Open tables lobby
  useEffect(() => {
    if (!authReady || roomId) return;
    const gamesRef = ref(rtdb, 'games');
    const unsub = onValue(gamesRef, (snap) => {
      const data = snap.val();
      if (data) {
        const tables: OpenTable[] = Object.keys(data)
          .map((id) => ({ id, ...data[id] }))
          .filter((r: any) => !r.gameStarted && r.players?.length > 0 && r.players.length < 10)
          .slice(0, 8)
          .map((r: any) => ({
            id: r.id,
            hostName: r.players?.[0]?.name || 'Someone',
            playerCount: r.players?.length || 0,
          }));
        setOpenTables(tables);
      } else {
        setOpenTables([]);
      }
    }, (err) => {
      console.error('openTables listener failed:', err);
    });
    return () => unsub();
  }, [authReady, roomId]);

  // Room sync
  useEffect(() => {
    if (!roomId) return;
    const gameRef = ref(rtdb, `games/${roomId}`);
    const unsub = onValue(gameRef, (snap) => {
      const data = snap.val();
      setGameState(data || null);
    }, (err) => {
      console.error('room listener failed:', err);
      showNotice(`Connection issue: ${err?.message || 'unknown error'}`);
    });
    return () => unsub();
  }, [roomId]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2600);
  };

  // Deep link: ?room=CODE
  useEffect(() => {
    const code = searchParams.get('room');
    if (code && authReady && user && !roomId) {
      joinSpecificRoom(code.toUpperCase());
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  const [busy, setBusy] = useState(false);

  // Never let a database call hang the UI forever: if the DB doesn't answer
  // in `ms`, fail with a helpful message instead of a stuck "Working…" button.
  const withDbTimeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${label} timed out — no response from the game database. Check VPN, Private DNS, or an ad blocker on this device.`)),
          ms
        )
      ),
    ]);

  const createRoom = async () => {
    if (busy) return;
    setBusy(true);
    showNotice('Creating table…');
    try {
      if (!user) {
        showNotice('Not signed in — please sign in again.');
        return;
      }
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      const initialState: GameState = {
        gameStarted: false,
        deck: [],
        discardPile: [],
        players: [{ id: myId, name: myName, hand: [] }],
        currentPlayerIndex: 0,
        direction: 1,
        hostId: myId,
      };
      await withDbTimeout(set(ref(rtdb, `games/${code}`), initialState), 15000, 'Create table');
      setRoomId(code);
    } catch (err: any) {
      console.error('createRoom failed:', err);
      showNotice(`Couldn't create table: ${err?.message || 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  };

  const joinSpecificRoom = async (code: string) => {
    if (busy) return;
    setBusy(true);
    showNotice('Joining table…');
    try {
      if (!user) {
        showNotice('Not signed in — please sign in again.');
        return;
      }
      const snap = await withDbTimeout(get(child(ref(rtdb), `games/${code}`)), 15000, 'Join table');
      if (!snap.exists()) {
        showNotice('Table not found — check the code.');
        return;
      }
      const game = snap.val() as GameState;
      if (game.gameStarted) {
        showNotice('That game already started.');
        return;
      }
      const players = game.players || [];
      if (!players.find((p) => p.id === myId)) {
        if (players.length >= 10) {
          showNotice('Table is full.');
          return;
        }
        players.push({ id: myId, name: myName, hand: [] });
        await withDbTimeout(set(ref(rtdb, `games/${code}/players`), players), 15000, 'Join table');
      }
      setRoomId(code);
    } catch (err: any) {
      console.error('joinSpecificRoom failed:', err);
      showNotice(`Couldn't join table: ${err?.message || 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  };

  const joinByCode = () => {
    if (!inputCode.trim()) {
      showNotice('Enter a table code.');
      return;
    }
    joinSpecificRoom(inputCode.trim().toUpperCase());
  };

  const startGame = async () => {
    if (!gameState || gameState.hostId !== myId) return;
    try {
      const newDeck = generateDeck();
      const players = [...gameState.players].map((p) => ({ ...p, hand: newDeck.splice(0, 7) }));
      let firstCardIndex = newDeck.findIndex((c) => c.color !== 'Black');
      if (firstCardIndex === -1) firstCardIndex = 0;
      const firstDiscard = newDeck.splice(firstCardIndex, 1);
      await set(ref(rtdb, `games/${roomId}`), {
        ...gameState,
        gameStarted: true,
        deck: newDeck,
        discardPile: firstDiscard,
        players,
        currentPlayerIndex: 0,
        direction: 1,
      });
    } catch (err: any) {
      console.error('startGame failed:', err);
      showNotice(`Couldn't start game: ${err?.message || 'unknown error'}`);
    }
  };

  const leaveRoom = () => {
    setRoomId('');
    setGameState(null);
    setPendingCard(null);
  };

  const copyInvite = async () => {
    const link = `${window.location.origin}/hangout/games/uno?room=${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reshuffleIfNeeded = (deck: UnoCardT[], discardPile: UnoCardT[]) => {
    if (deck.length === 0 && discardPile.length > 1) {
      const top = discardPile.pop()!;
      const newDeck = discardPile;
      for (let j = newDeck.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [newDeck[j], newDeck[k]] = [newDeck[k], newDeck[j]];
      }
      return { deck: newDeck, discardPile: [top] };
    }
    return { deck, discardPile };
  };

  const playCard = (card: UnoCardT) => {
    if (!gameState || !gameState.gameStarted) return;
    const myIndex = gameState.players.findIndex((p) => p.id === myId);
    if (gameState.currentPlayerIndex !== myIndex) {
      showNotice("It's not your turn.");
      return;
    }
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (card.color !== 'Black' && card.color !== topCard.color && card.value !== topCard.value) {
      showNotice("You can't play that card.");
      return;
    }
    if (card.color === 'Black') {
      setPendingCard(card);
      return;
    }
    executePlayCard(card, card.color, gameState);
  };

  const handleColorSelect = (color: CardColor) => {
    if (!pendingCard || !gameState) return;
    executePlayCard(pendingCard, color, gameState);
    setPendingCard(null);
  };

  const executePlayCard = async (card: UnoCardT, chosenColor: CardColor, currentState: GameState) => {
    const cloned: GameState = JSON.parse(JSON.stringify(currentState));
    let { deck, discardPile, players, currentPlayerIndex, direction } = cloned;
    if (!deck) deck = [];
    if (!discardPile) discardPile = [];

    const playedCard = { ...card, color: chosenColor };
    discardPile.push(playedCard);

    const myIndex = players.findIndex((p) => p.id === myId);
    players[myIndex].hand = players[myIndex].hand.filter((c) => c.id !== card.id);

    let skipNext = false;
    let newDir = direction;
    if (card.value === 'Skip') {
      skipNext = true;
    } else if (card.value === 'Reverse') {
      if (players.length <= 2) skipNext = true;
      else newDir = direction * -1;
    } else if (card.value === 'Draw 2' || card.value === 'Draw 4') {
      const drawCount = card.value === 'Draw 2' ? 2 : 4;
      const targetIdx = (currentPlayerIndex + newDir + players.length) % players.length;
      for (let i = 0; i < drawCount; i++) {
        const r = reshuffleIfNeeded(deck, discardPile);
        deck = r.deck; discardPile = r.discardPile;
        const drawn = deck.pop();
        if (drawn) {
          if (!players[targetIdx].hand) players[targetIdx].hand = [];
          players[targetIdx].hand.push(drawn);
        } else break;
      }
      skipNext = true;
    }

    const turnAdvancement = skipNext ? newDir * 2 : newDir;
    const nextIndex = (currentPlayerIndex + turnAdvancement + players.length * 2) % players.length;

    try {
      await set(ref(rtdb, `games/${roomId}`), {
        ...currentState, deck, discardPile, players,
        currentPlayerIndex: nextIndex, direction: newDir,
      });
    } catch (err: any) {
      console.error('executePlayCard failed:', err);
      showNotice(`Couldn't play card: ${err?.message || 'unknown error'}`);
    }
  };

  const drawCard = async () => {
    if (!gameState || !gameState.gameStarted) return;
    const myIndex = gameState.players.findIndex((p) => p.id === myId);
    if (gameState.currentPlayerIndex !== myIndex) return;
    const cloned: GameState = JSON.parse(JSON.stringify(gameState));
    let { deck, discardPile, players, currentPlayerIndex, direction } = cloned;
    if (!deck) deck = [];
    if (!discardPile) discardPile = [];
    const r = reshuffleIfNeeded(deck, discardPile);
    deck = r.deck; discardPile = r.discardPile;
    const drawn = deck.pop();
    if (drawn) {
      if (!players[myIndex].hand) players[myIndex].hand = [];
      players[myIndex].hand.push(drawn);
    }
    const nextIndex = (currentPlayerIndex + direction + players.length) % players.length;
    try {
      await set(ref(rtdb, `games/${roomId}`), {
        ...gameState, deck, discardPile, players, currentPlayerIndex: nextIndex,
      });
    } catch (err: any) {
      console.error('drawCard failed:', err);
      showNotice(`Couldn't draw card: ${err?.message || 'unknown error'}`);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh', background: '#f6f1e8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  };
  const wrapStyle: React.CSSProperties = { maxWidth: 520, margin: '0 auto', padding: '20px 16px 110px 16px' };

  // ---------- Views ----------
  if (!authReady) {
    return (
      <div style={pageStyle}>
        <PageHeader backTo="/hangout" title="UNO" onBack={() => navigate('/hangout')} />
        <div style={wrapStyle}><div style={card}><p style={{ textAlign: 'center', color: '#7a7264' }}>Connecting…</p></div></div>
        <BottomNavigation />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={pageStyle}>
        <PageHeader backTo="/hangout" title="UNO" onBack={() => navigate('/hangout')} />
        <div style={wrapStyle}>
          <div style={card}>
            <p style={{ textAlign: 'center', color: '#7a7264' }}>Please sign in to play UNO with your circle.</p>
            <button style={btnPrimary} onClick={() => navigate('/')}>Go to sign in</button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // ----- Lobby -----
  if (!roomId) {
    return (
      <div style={pageStyle}>
        <PageHeader backTo="/hangout" title="UNO" onBack={() => navigate('/hangout')} />
        <div style={wrapStyle}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 44, marginBottom: 4 }}>🃏</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0', color: '#1e1a14' }}>Game Night</h2>
            <p style={{ fontSize: 14, color: '#7a7264', margin: 0 }}>Start a table and invite your circle.</p>
          </div>

          <div style={{ ...card, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 600, color: dbConnected === false ? '#B91C1C' : dbConnected ? '#15803D' : '#B45309' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dbConnected === false ? '#EF4444' : dbConnected ? '#22C55E' : '#F59E0B' }} />
              {dbConnected === null
                ? 'Connecting to game database…'
                : dbConnected
                  ? 'Game database connected'
                  : 'Game database unreachable — check VPN / Private DNS / ad blocker'}
            </div>
            <button
              style={{ ...btnPrimary, opacity: busy || dbConnected === false ? 0.6 : 1 }}
              onClick={createRoom}
              disabled={busy || dbConnected === false}
            >
              {busy ? 'Working…' : '+ Create a table'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e7ddcc' }} />
              <span style={{ fontSize: 12, color: '#a89a80', fontWeight: 600 }}>OR JOIN WITH CODE</span>
              <div style={{ flex: 1, height: 1, background: '#e7ddcc' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                style={{
                  flex: 1, border: '1px solid #e7ddcc', borderRadius: 12, padding: '12px 14px',
                  fontSize: 16, fontWeight: 700, letterSpacing: 4, textAlign: 'center', textTransform: 'uppercase',
                }}
              />
              <button
                onClick={joinByCode}
                disabled={busy || dbConnected === false}
                style={{ ...btnPrimary, width: 'auto', padding: '12px 22px', opacity: busy || dbConnected === false ? 0.6 : 1 }}
              >
                {busy ? '…' : 'Join'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#a89a80', margin: '4px 0 10px 4px' }}>
            OPEN TABLES
          </div>
          {openTables.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', color: '#a89a80', fontSize: 14 }}>
              No open tables right now. Create one and invite the crew!
            </div>
          ) : (
            openTables.map((t) => (
              <div
                key={t.id}
                onClick={() => joinSpecificRoom(t.id)}
                style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'pointer', padding: '14px 18px' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1e1a14' }}>{t.hostName}'s table</div>
                  <div style={{ fontSize: 12.5, color: '#7a7264' }}>{t.playerCount}/10 players · Code {t.id}</div>
                </div>
                <span style={{ color: '#9a6b3f', fontWeight: 700, fontSize: 14 }}>Join →</span>
              </div>
            ))
          )}
        </div>
        {notice && (
          <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#1e1a14', color: '#fffdf8', padding: '10px 18px', borderRadius: 999, fontSize: 13, zIndex: 200 }}>
            {notice}
          </div>
        )}
        <BottomNavigation />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div style={pageStyle}>
        <PageHeader backTo="/hangout" title="UNO" onBack={leaveRoom} />
        <div style={wrapStyle}><div style={card}><p style={{ textAlign: 'center', color: '#7a7264' }}>Joining table…</p></div></div>
        <BottomNavigation />
      </div>
    );
  }

  // ----- Waiting room -----
  if (!gameState.gameStarted) {
    const isHost = gameState.hostId === myId;
    return (
      <div style={pageStyle}>
        <PageHeader backTo="/hangout" title="UNO" onBack={leaveRoom} />
        <div style={wrapStyle}>
          <div style={{ ...card, textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#a89a80', marginBottom: 8 }}>TABLE CODE</div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 8, color: '#1e1a14', marginBottom: 12 }}>{roomId}</div>
            <button
              onClick={copyInvite}
              style={{
                background: '#EEF4FF', color: '#9a6b3f', border: 'none', borderRadius: 999,
                padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {copied ? '✓ Link copied!' : '🔗 Copy invite link'}
            </button>
            <p style={{ fontSize: 13, color: '#7a7264', margin: '12px 0 0 0' }}>Share the code or link with your circle.</p>
          </div>

          <div style={{ ...card, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#a89a80', marginBottom: 12 }}>
              PLAYERS ({gameState.players?.length || 0}/10)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(gameState.players || []).map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: '#f6f1e8',
                    borderRadius: 999, padding: '8px 14px 8px 8px', fontSize: 14, fontWeight: 600, color: '#1e1a14',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: '#9a6b3f', color: '#fffdf8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
                  }}>
                    {p.name[0]?.toUpperCase() || '?'}
                  </div>
                  {p.name}
                  {p.id === gameState.hostId && <span style={{ fontSize: 11, color: '#B45309', fontWeight: 700 }}>HOST</span>}
                  {p.id === myId && <span style={{ fontSize: 11, color: '#7a7264' }}>(you)</span>}
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button style={btnPrimary} onClick={startGame} disabled={(gameState.players?.length || 0) < 2}
              title={(gameState.players?.length || 0) < 2 ? 'Need at least 2 players' : ''}>
              ▶ Start game
            </button>
          ) : (
            <div style={{ ...card, textAlign: 'center', color: '#7a7264', fontSize: 14 }}>
              Waiting for the host to start…
            </div>
          )}
          {(gameState.players?.length || 0) < 2 && isHost && (
            <p style={{ textAlign: 'center', color: '#a89a80', fontSize: 13, marginTop: 10 }}>
              Need at least 2 players to start.
            </p>
          )}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // ----- Active game -----
  const myIndex = gameState.players.findIndex((p) => p.id === myId);
  const myPlayer = myIndex >= 0 ? gameState.players[myIndex] : null;
  const isMyTurn = gameState.currentPlayerIndex === myIndex;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const winner = gameState.players.find((p) => p.hand && p.hand.length === 0);

  return (
    <div style={pageStyle}>
      <PageHeader backTo="/hangout" title={`UNO · ${roomId}`} onBack={leaveRoom} />
      <div style={wrapStyle}>
        {/* Turn banner */}
        <div style={{
          ...card, marginBottom: 14, padding: '12px 18px', textAlign: 'center',
          background: isMyTurn ? '#9a6b3f' : '#fffdf8',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: isMyTurn ? '#fffdf8' : '#1e1a14' }}>
            {isMyTurn ? "🎯 Your turn — play a card or draw" : `⏳ ${currentPlayer?.name || '…'}'s turn`}
          </span>
        </div>

        {/* Opponents */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
          {gameState.players.map((p, idx) => {
            if (p.id === myId) return null;
            const active = gameState.currentPlayerIndex === idx;
            return (
              <div key={p.id} style={{
                ...card, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
                whiteSpace: 'nowrap', border: active ? '2px solid #22A35A' : '1px solid #e7ddcc',
                background: active ? '#F0FDF4' : '#fffdf8',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: active ? '#22A35A' : '#a89a80',
                  color: '#fffdf8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                }}>
                  {p.name[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1a14' }}>{p.name}</span>
                <span style={{ fontSize: 12, color: '#7a7264' }}>🂠 {p.hand ? p.hand.length : 0}</span>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, padding: '8px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                onClick={drawCard}
                title="Draw a card"
                style={{
                  width: 68, height: 96, borderRadius: 10, cursor: isMyTurn ? 'pointer' : 'default',
                  background: 'repeating-linear-gradient(45deg, #2a241c, #2a241c 8px, #332e26 8px, #332e26 16px)',
                  border: '3px solid #fffdf8', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isMyTurn ? 1 : 0.55,
                }}
              >
                <span style={{ color: '#F5B800', fontWeight: 900, fontSize: 18, transform: 'rotate(-18deg)' }}>UNO</span>
              </div>
              <div style={{ fontSize: 11, color: '#a89a80', marginTop: 6, fontWeight: 600 }}>
                DRAW ({gameState.deck ? gameState.deck.length : 0})
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              {topCard && <UnoCardView card={topCard} />}
              <div style={{ fontSize: 11, color: '#a89a80', marginTop: 6, fontWeight: 600 }}>DISCARD</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/voice-room')}
            style={{
              width: '100%', marginTop: 12, background: '#EEF4FF', color: '#9a6b3f', border: 'none',
              borderRadius: 12, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            🎙️ Talk while you play
          </button>
        </div>

        {/* My hand */}
        {myPlayer && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#a89a80', marginBottom: 12 }}>
              YOUR HAND ({myPlayer.hand ? myPlayer.hand.length : 0})
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
              {(myPlayer.hand || []).map((c) => (
                <UnoCardView key={c.id} card={c} small onClick={() => playCard(c)} />
              ))}
            </div>
            {(!myPlayer.hand || myPlayer.hand.length === 0) && (
              <p style={{ color: '#a89a80', fontSize: 14 }}>No cards.</p>
            )}
          </div>
        )}
      </div>

      {/* Color picker */}
      {pendingCard && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ ...card, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 17, color: '#1e1a14' }}>Choose a color</h3>
            <p style={{ fontSize: 13, color: '#7a7264', margin: '0 0 16px 0' }}>for your {pendingCard.value}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {(['Red', 'Blue', 'Green', 'Yellow'] as CardColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorSelect(c)}
                  aria-label={c}
                  style={{
                    width: 52, height: 52, borderRadius: '50%', background: getColorHex(c),
                    border: '3px solid #fffdf8', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Winner */}
      {winner && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ ...card, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 20, color: '#1e1a14' }}>
              {winner.id === myId ? 'You win!' : `${winner.name} wins!`}
            </h3>
            <p style={{ fontSize: 14, color: '#7a7264', margin: '0 0 16px 0' }}>
              {winner.id === myId ? 'Champion of the table. Rematch?' : 'Better luck next time.'}
            </p>
            <button style={btnPrimary} onClick={leaveRoom}>Back to lobby</button>
          </div>
        </div>
      )}

      {notice && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#1e1a14', color: '#fffdf8', padding: '10px 18px', borderRadius: 999, fontSize: 13, zIndex: 400 }}>
          {notice}
        </div>
      )}
      <BottomNavigation />
    </div>
  );
};

export default UnoGame;
