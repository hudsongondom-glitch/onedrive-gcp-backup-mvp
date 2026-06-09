import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function RestorePage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch when a backupId is present in the URL (coming from History page View button).
  useEffect(() => {
    const preloaded = searchParams.get('backupId');
    if (!preloaded) return;

    setLoading(true);
    setError(null);
    setResult(null);

    api
      .getRestore(preloaded)
      .then((data) => setResult(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="page">
      <h1>Restore Backup</h1>

      {loading && <p>Loading backup details...</p>}
      {error && <div className="message error">{error}</div>}

      {result && (
        <div>
          <table style={{ width: 'auto', marginBottom: 16 }}>
            <tbody>
              <tr>
                <th>Backup ID</th>
                <td><code>{result.backupId}</code></td>
              </tr>
              <tr>
                <th>Backup Date</th>
                <td>{result.backupDate ? new Date(result.backupDate).toLocaleString() : '—'}</td>
              </tr>
              <tr>
                <th>Files</th>
                <td>{(result.files || []).length}</td>
              </tr>
            </tbody>
          </table>

          <h3>File List</h3>
          <ul className="file-list">
            {(result.files || []).map((file) => (
              <li key={file.fileId || file.gcsPath}>
                <span>{file.name || file.fileId}</span>
                <code style={{ fontSize: 12, color: '#555' }}>{file.gcsPath}</code>
              </li>
            ))}
            {(!result.files || result.files.length === 0) && <li>No files in this backup.</li>}
          </ul>
        </div>
      )}

      {!loading && !result && !error && (
        <p>Navigate here from the <a href="/history">History</a> page using the View button.</p>
      )}
    </div>
  );
}
