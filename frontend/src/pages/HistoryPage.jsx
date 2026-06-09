import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api.getHistory()
      .then((d)   => { if (!cancelled) setHistory(d.history || []); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Backup History</h1>
        <p>All completed and running backup jobs.</p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-subtle)' }}>
          <span className="spinner" /> Loading history…
        </div>
      )}
      {error && <div className="message error">{error}</div>}

      {!loading && !error && (
        <>
          {history.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>🗄</div>
              <p>No backups yet. Go to the Dashboard and back up a folder.</p>
            </div>
          ) : (
            <div className="table-wrap">
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
                      <td>
                        <code style={{ fontSize: 12 }}>
                          {entry.backupId.slice(0, 12)}…
                        </code>
                      </td>
                      <td>{entry.fileCount ?? '—'}</td>
                      <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}</td>
                      <td><StatusBadge status={entry.status || 'completed'} /></td>
                      <td>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => navigate(`/restore?backupId=${encodeURIComponent(entry.backupId)}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
