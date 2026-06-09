import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { clearSessionId, getSessionId } from './api/client';

import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import BackupPage from './pages/BackupPage';
import HistoryPage from './pages/HistoryPage';
import RestorePage from './pages/RestorePage';

function RequireSession({ children }) {
  if (!getSessionId()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function NavBar() {
  const navigate = useNavigate();
  const hasSession = !!getSessionId();

  function handleLogout() {
    clearSessionId();
    navigate('/');
  }

  if (!hasSession) return null;

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/backup">Backup</Link>
      <Link to="/history">History</Link>
      <Link to="/restore">Restore</Link>
      <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
        Logout
      </a>
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
        <Route
          path="/dashboard"
          element={
            <RequireSession>
              <DashboardPage />
            </RequireSession>
          }
        />
        <Route
          path="/backup"
          element={
            <RequireSession>
              <BackupPage />
            </RequireSession>
          }
        />
        <Route
          path="/history"
          element={
            <RequireSession>
              <HistoryPage />
            </RequireSession>
          }
        />
        <Route
          path="/restore"
          element={
            <RequireSession>
              <RestorePage />
            </RequireSession>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
