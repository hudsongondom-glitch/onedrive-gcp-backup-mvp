import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DashboardPage() {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(
    sessionStorage.getItem('selectedFolderId') || null
  );
  const [summary, setSummary] = useState({ total: 0, lastDate: null });
  const [backupStatus, setBackupStatus] = useState(null); // { status, backupId, filesBackedUp }
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.getFolders(), api.getHistory()])
      .then(([folderData, historyData]) => {
        if (cancelled) return;
        setFolders(folderData.items || []);

        const history = historyData.history || [];
        setSummary({
          total: history.length,
          lastDate: history.length > 0 ? history[0].createdAt : null,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingFolders(false);
      });

    return () => { cancelled = true; };
  }, []);

  function selectFolder(folder) {
    setSelectedFolderId(folder.id);
    sessionStorage.setItem('selectedFolderId', folder.id);
    sessionStorage.setItem('selectedFolderName', folder.name);
    setBackupStatus(null);
  }

  async function handleBackup() {
    if (!selectedFolderId) return;

    setLoadingBackup(true);
    setBackupStatus({ status: 'running' });
    setError(null);

    try {
      const result = await api.startBackup(selectedFolderId);
      setBackupStatus({ status: 'completed', ...result });
    } catch (err) {
      setBackupStatus({ status: 'failed', error: err.message });
    } finally {
      setLoadingBackup(false);
    }
  }

  const visibleFolders = folders.filter((item) => !!item.folder);

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="summary-bar">
        <div className="summary-card">
          <span className="summary-label">Total Backups</span>
          <span className="summary-value">{summary.total}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Last Backup</span>
          <span className="summary-value">
            {summary.lastDate ? new Date(summary.lastDate).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      <h2>OneDrive Folders</h2>
      {loadingFolders && <p>Loading folders...</p>}
      {error && <div className="message error">{error}</div>}

      {!loadingFolders && !error && (
        <>
          <div className="folder-grid">
            {visibleFolders.map((folder) => (
              <div
                key={folder.id}
                className={`folder-card${folder.id === selectedFolderId ? ' selected' : ''}`}
                onClick={() => selectFolder(folder)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && selectFolder(folder)}
              >
                <span className="folder-icon">📁</span>
                <span className="folder-name">{folder.name}</span>
                {folder.id === selectedFolderId && (
                  <span className="folder-selected-badge">Selected</span>
                )}
              </div>
            ))}
            {visibleFolders.length === 0 && <p>No folders found.</p>}
          </div>

          <button
            onClick={handleBackup}
            disabled={!selectedFolderId || loadingBackup}
            style={{ marginTop: 16 }}
          >
            {loadingBackup ? 'Backing up...' : 'Backup Selected Folder'}
          </button>
        </>
      )}

      {backupStatus && (
        <div className={`message ${backupStatus.status === 'completed' ? 'success' : backupStatus.status === 'failed' ? 'error' : 'info'}`} style={{ marginTop: 12 }}>
          {backupStatus.status === 'running' && 'Backup in progress...'}
          {backupStatus.status === 'completed' && (
            <>Backup complete — ID: <strong>{backupStatus.backupId}</strong>, {backupStatus.filesBackedUp} file(s) backed up.</>
          )}
          {backupStatus.status === 'failed' && `Backup failed: ${backupStatus.error}`}
        </div>
      )}
    </div>
  );
}
