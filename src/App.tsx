
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState, ReactNode } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Login from './Login';
import AdminPanel from './AdminPanel';
import Account from './Account';
import Profile from './Profile';
import Dashboard from './Dashboard';
import Stories from './Stories';
import Residents from './Residents';
import Hangout from './Hangout';
import PowerGroup from './PowerGroup';
import MeetingMinutes from './MeetingMinutes';
import RoyalBank from './RoyalBank';
import VoiceRoom from './VoiceRoom';
import UnoGame from './UnoGame';
import OurTrips from './OurTrips';
import AshramamExclusive from './AshramamExclusive';
import BelovedArticles from './BelovedArticles';
import CinemaReviews from './CinemaReviews';
import SplashScreen from './SplashScreen';
import Krabi from './Krabi';
import Baku from './Baku';
import September7th2025Meeting from './September7th2025Meeting';
import October5th2025Meeting from './October5th2025Meeting';
import November2nd2025Meeting from './November2nd2025Meeting';

/** Sends logged-out visitors to the login page. Everything except the
 *  login screen and the public Beloved Articles links sits behind this. */
function RequireAuth({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Redirects old /beloved-articles/* links (shared before the rename) to /articles/*. */
function LegacyArticleRedirect() {
  const { articleId } = useParams<{ articleId: string }>();
  return <Navigate to={`/articles/${articleId}`} replace />;
}

/** Routes where a fresh visitor sees the brand splash before the page loads. */
const SPLASH_PATHS = ['/', '/articles', '/cinema-reviews', '/beloved-articles'];
function isSplashEntryPath(pathname: string) {
  return SPLASH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** Replays the soft page-entrance animation on every navigation. */
function AnimatedRoutes() {
  const location = useLocation();
  // Brand splash: once per tab session, visitors landing on a public link
  // see the logo loading screen first, then land on the page.
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('ashramam-splash-shown') && isSplashEntryPath(window.location.pathname)
  );
  const [splashFading, setSplashFading] = useState(false);

  useEffect(() => {
    if (!showSplash) return;
    sessionStorage.setItem('ashramam-splash-shown', '1');
    const fadeTimer = window.setTimeout(() => setSplashFading(true), 1900);
    const hideTimer = window.setTimeout(() => setShowSplash(false), 2450);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [showSplash]);

  return (
    <>
      {showSplash && <SplashScreen fading={splashFading} />}
      <div key={location.pathname} className="iv-page-enter">
      <Routes location={location}>
        <Route path="/" element={<Login />} />
        {/* Public: article links (Abdu shares these outside the app) */}
        <Route path="/articles" element={<BelovedArticles />} />
        <Route path="/articles/:articleId" element={<BelovedArticles />} />
        {/* Public: cinema reviews — anyone with the link can read and post */}
        <Route path="/cinema-reviews" element={<CinemaReviews />} />
        <Route path="/cinema-reviews/:reviewId" element={<CinemaReviews />} />
        {/* Legacy /beloved-articles URLs redirect so old shared links keep working */}
        <Route path="/beloved-articles" element={<Navigate to="/articles" replace />} />
        <Route path="/beloved-articles/:articleId" element={<LegacyArticleRedirect />} />
        {/* Everything else requires login */}
        <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/stories" element={<RequireAuth><Stories /></RequireAuth>} />
        <Route path="/residents" element={<RequireAuth><Residents /></RequireAuth>} />
        <Route path="/hangout" element={<RequireAuth><Hangout /></RequireAuth>} />
        <Route path="/hangout/games/uno" element={<RequireAuth><UnoGame /></RequireAuth>} />
        <Route path="/power-group" element={<RequireAuth><PowerGroup /></RequireAuth>} />
        <Route path="/meeting-minutes" element={<RequireAuth><MeetingMinutes /></RequireAuth>} />
        <Route path="/meeting-minutes/september-7th-2025" element={<RequireAuth><September7th2025Meeting /></RequireAuth>} />
        <Route path="/meeting-minutes/october-5th-2025" element={<RequireAuth><October5th2025Meeting /></RequireAuth>} />
        <Route path="/meeting-minutes/november-2nd-2025" element={<RequireAuth><November2nd2025Meeting /></RequireAuth>} />
        <Route path="/royal-bank" element={<RequireAuth><RoyalBank /></RequireAuth>} />
        <Route path="/voice-room" element={<RequireAuth><VoiceRoom /></RequireAuth>} />
        <Route path="/our-trips" element={<RequireAuth><OurTrips /></RequireAuth>} />
        <Route path="/ashramam-exclusive" element={<RequireAuth><AshramamExclusive /></RequireAuth>} />
        <Route path="/ashramam-exclusive/:storyId" element={<RequireAuth><AshramamExclusive /></RequireAuth>} />
        <Route path="/our-trips/krabi" element={<RequireAuth><Krabi /></RequireAuth>} />
        <Route path="/our-trips/baku" element={<RequireAuth><Baku /></RequireAuth>} />
        <Route path="/krabi" element={<RequireAuth><Krabi /></RequireAuth>} />
        {/* Unknown URLs go to the login screen instead of a blank page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
