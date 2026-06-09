import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Completed', cls: 'badge badge-completed' },
    failed: { label: 'Failed', cls: 'badge badge-failed' },
    running: { label: 'Running', cls: 'badge badge-running' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'badge' };
  return <span className={cls}>{label}</span>;
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    api
      .getHistory()
      .then((data) => {
        if (!cancelled) setHistory(data.history || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  function viewRestore(backupId) {
    navigate(`/restore?backupId=${encodeURIComponent(backupId)}`);
  }

  return (
    <div className="page">
      <h1>Backup History</h1>

      {loading && <p>Loading history...</p>}
      {error && <div className="message error">{error}</div>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Backup ID</th>
              <th>File Count</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.backupId}>
                <td><code>{entry.backupId}</code></td>
                <td>{entry.fileCount}</td>
                <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}</td>
                <td><StatusBadge status={entry.status || 'completed'} /></td>
                <td>
                  <button className="btn-sm" onClick={() => viewRestore(entry.backupId)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5}>No backups yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
