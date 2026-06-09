import { Navigate, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { clearSessionId, getSessionId, api } from './api/client';
import { FaMicrosoft } from "react-icons/fa";
import { RefreshCw } from "lucide-react";

import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import BackupPage from './pages/BackupPage';
import HistoryPage from './pages/HistoryPage';
import RestorePage from './pages/RestorePage';

function RequireSession({ children }) {
  if (!getSessionId()) return <Navigate to="/" replace />;
  return children;
}

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasSession = !!getSessionId();
  if (!hasSession) return null;

  const active = (path) =>
    location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  function handleLogout() {
    clearSessionId();
    navigate('/');
  }

  function handleReconnect() {
    window.location.href = api.loginUrl();
  }

  return (
  <nav>
<Link to="/dashboard" className="nav-brand">
  <FaMicrosoft
    size={20}
    color="#0078D4"
    style={{ marginRight: 8 }}
  />
  OneDrive Backup
</Link>
    <Link to="/dashboard" className={active('/dashboard')}>Dashboard</Link>
    <Link to="/backup"    className={active('/backup')}>Backup</Link>
    <Link to="/history"   className={active('/history')}>History</Link>
    <Link to="/restore"   className={active('/restore')}>Restore</Link>
    <span className="nav-spacer" />
    <button className="nav-action" onClick={handleReconnect} title="Restart Microsoft OAuth login">
      <RefreshCw size={16} style={{ marginRight: 6 }} />
      Reconnect Account
    </button>
    <button className="nav-action" onClick={handleLogout} style={{ marginLeft: 8 }}>
      Sign out
    </button>
  </nav>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/dashboard" element={<RequireSession><DashboardPage /></RequireSession>} />
        <Route path="/backup"    element={<RequireSession><BackupPage /></RequireSession>} />
        <Route path="/history"   element={<RequireSession><HistoryPage /></RequireSession>} />
        <Route path="/restore"   element={<RequireSession><RestorePage /></RequireSession>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
