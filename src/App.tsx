
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import OurTrips from './OurTrips';
import Krabi from './Krabi';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/account" element={<Account />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/residents" element={<Residents />} />
        <Route path="/hangout" element={<Hangout />} />
        <Route path="/power-group" element={<PowerGroup />} />
        <Route path="/meeting-minutes" element={<MeetingMinutes />} />
        <Route path="/royal-bank" element={<RoyalBank />} />
        <Route path="/voice-room" element={<VoiceRoom />} />
        <Route path="/our-trips" element={<OurTrips />} />
        <Route path="/krabi" element={<Krabi />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
