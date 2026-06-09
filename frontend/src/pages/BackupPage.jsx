import { useState } from 'react';
import { api } from '../api/client';

export default function BackupPage() {
  const folderId = sessionStorage.getItem('selectedFolderId');
  const folderName = sessionStorage.getItem('selectedFolderName');

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      <h1>Backup Folder</h1>

      {!folderId && <p>No folder selected. Go to the Dashboard and select a folder first.</p>}

      {folderId && (
        <>
          <p>
            Selected folder: <strong>{folderName || folderId}</strong> (id: {folderId})
          </p>
          <button onClick={handleBackup} disabled={running}>
            {running ? 'Backing up...' : 'Start Backup'}
          </button>
        </>
      )}

      {error && <div className="message error">{error}</div>}

      {result && (
        <div className="message success">
          Backup completed — Backup ID: <strong>{result.backupId}</strong>, Files backed up:{' '}
          <strong>{result.filesBackedUp}</strong>, Status: <strong>{result.status}</strong>
        </div>
      )}
    </div>
  );
}
