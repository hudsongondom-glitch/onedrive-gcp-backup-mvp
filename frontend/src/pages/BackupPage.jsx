import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function BackupPage() {
  const folderId   = sessionStorage.getItem('selectedFolderId');
  const folderName = sessionStorage.getItem('selectedFolderName');

  const [running, setRunning] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const navigate = useNavigate();

  async function handleBackup() {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const response = await api.startBackup(folderId);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Run Backup</h1>
        <p>Back up the selected OneDrive folder to Google Cloud Storage.</p>
      </div>

      {!folderId ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <p style={{ color: 'var(--text-subtle)', marginBottom: 16 }}>
            No folder selected yet.
          </p>
          <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32 }}>📁</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{folderName || folderId}</div>
              <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                Destination: Google Cloud Storage
              </div>
            </div>
          </div>

          <hr className="divider" style={{ margin: 0 }} />

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleBackup} disabled={running}>
              {running ? <><span className="spinner" /> Backing up…</> : '▶ Start Backup'}
            </button>
            <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
              ← Change Folder
            </button>
          </div>
        </div>
      )}

      {error && <div className="message error" style={{ marginTop: 16 }}>{error}</div>}

      {result && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', align: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <h2 style={{ margin: 0 }}>Backup Completed</h2>
          </div>
          <div className="restore-meta-grid">
            <div className="restore-meta-item">
              <span className="restore-meta-label">Files Backed Up</span>
              <span className="restore-meta-value">{result.filesBackedUp}</span>
            </div>
            <div className="restore-meta-item">
              <span className="restore-meta-label">Status</span>
              <span className="restore-meta-value">{result.status}</span>
            </div>
          </div>
          <button
            className="btn-ghost btn-sm"
            onClick={() => navigate(`/restore?backupId=${encodeURIComponent(result.backupId)}`)}
          >
            View backup →
          </button>
        </div>
      )}
    </div>
  );
}
