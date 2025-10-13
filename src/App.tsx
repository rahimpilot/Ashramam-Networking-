
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import AdminPanel from './AdminPanel';
import Account from './Account';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
