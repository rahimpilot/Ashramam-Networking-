
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import AdminPanel from './AdminPanel';
import Account from './Account';
import Profile from './Profile';
import Dashboard from './Dashboard';
import Stories from './Stories';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
