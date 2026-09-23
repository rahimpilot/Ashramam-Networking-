
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
import UnoGame from './UnoGame';
import OurTrips from './OurTrips';
import Krabi from './Krabi';
import Baku from './Baku';
import September7th2025Meeting from './September7th2025Meeting';
import October5th2025Meeting from './October5th2025Meeting';
import November2nd2025Meeting from './November2nd2025Meeting';
import DesignLab from './DesignLab';

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
        <Route path="/hangout/games/uno" element={<UnoGame />} />
        <Route path="/power-group" element={<PowerGroup />} />
        <Route path="/meeting-minutes" element={<MeetingMinutes />} />
        <Route path="/meeting-minutes/september-7th-2025" element={<September7th2025Meeting />} />
        <Route path="/meeting-minutes/october-5th-2025" element={<October5th2025Meeting />} />
        <Route path="/meeting-minutes/november-2nd-2025" element={<November2nd2025Meeting />} />
        <Route path="/royal-bank" element={<RoyalBank />} />
        <Route path="/voice-room" element={<VoiceRoom />} />
        <Route path="/our-trips" element={<OurTrips />} />
        <Route path="/our-trips/krabi" element={<Krabi />} />
        <Route path="/our-trips/baku" element={<Baku />} />
        <Route path="/krabi" element={<Krabi />} />
        <Route path="/design-lab" element={<DesignLab />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
