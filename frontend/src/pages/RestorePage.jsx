import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

// Per-file download button — tracks its own loading/error state so individual
// downloads don't block or reset the rest of the page.
function DownloadButton({ backupId, file }) {
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState(null);

  async function handleDownload() {
    setBusy(true);
    setError(null);
    try {
      await api.downloadFile(backupId, file.fileId, file.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <button
        className="btn-ghost btn-sm"
        onClick={handleDownload}
        disabled={busy}
        title={`Download ${file.name}`}
      >
        {busy ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Downloading…</> : '⬇ Download'}
      </button>
      {error && <span style={{ fontSize: 11, color: 'var(--error)' }}>{error}</span>}
    </span>
  );
}

function fileIcon(name = '') {
  const ext = name.split('.').pop().toLowerCase();
  const map = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
                jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', mp4: '🎬',
                zip: '🗜', txt: '📄', csv: '📊' };
  return map[ext] || '📄';
}

export default function RestorePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const preloaded = searchParams.get('backupId');

  useEffect(() => {
    if (!preloaded) return;
    setLoading(true);
    setError(null);
    setResult(null);

    api.getRestore(preloaded)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [preloaded]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Restore</h1>
        <p>Review backed-up files and restore from a previous backup.</p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-subtle)' }}>
          <span className="spinner" /> Loading backup details…
        </div>
      )}
      {error && <div className="message error">{error}</div>}

      {!loading && !result && !error && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗄</div>
          <p style={{ color: 'var(--text-subtle)', marginBottom: 16 }}>
            Select a backup from the History page to view its contents.
          </p>
          <button onClick={() => navigate('/history')}>Go to History</button>
        </div>
      )}

      {result && (
        <>
          {/* ── Clean overview card ── */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Backup Details</h2>
              <StatusBadge status={result.status || 'completed'} />
            </div>

            <div className="restore-meta-grid">
              <div className="restore-meta-item">
                <span className="restore-meta-label">Backup Date</span>
                <span className="restore-meta-value">
                  {result.backupDate ? new Date(result.backupDate).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="restore-meta-item">
                <span className="restore-meta-label">Time</span>
                <span className="restore-meta-value">
                  {result.backupDate ? new Date(result.backupDate).toLocaleTimeString() : '—'}
                </span>
              </div>
              <div className="restore-meta-item">
                <span className="restore-meta-label">Files</span>
                <span className="restore-meta-value">{(result.files || []).length}</span>
              </div>
            </div>

            {/* ── Collapsible technical details ── */}
            <details className="tech-details">
              <summary>Technical Details</summary>
              <table className="tech-table">
                <tbody>
                  <tr>
                    <td>Backup ID</td>
                    <td>{result.backupId}</td>
                  </tr>
                  {(result.files || []).map((f) => (
                    <tr key={f.fileId || f.gcsPath}>
                      <td>{f.name || f.fileId}</td>
                      <td>{f.gcsPath}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>

          {/* ── File list ── */}
          <div className="section-header">
            <h2>Backed-up Files</h2>
          </div>

          {(!result.files || result.files.length === 0) ? (
            <div className="empty-state">
              <p>No files found in this backup.</p>
            </div>
          ) : (
            <ul className="file-list">
              {result.files.map((file) => (
                <li key={file.fileId || file.gcsPath}>
                  <span className="file-icon">{fileIcon(file.name)}</span>
                  <span className="file-name">{file.name || file.fileId}</span>
                  <DownloadButton backupId={result.backupId} file={file} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
