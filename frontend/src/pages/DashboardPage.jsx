import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

// ── helpers ──────────────────────────────────────────────────────

function fileIcon(item) {
  if (item.folder) return '📁';
  const ext = (item.name || '').split('.').pop().toLowerCase();
  const map = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
                jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', mp4: '🎬',
                zip: '🗜', txt: '📄', csv: '📊' };
  return map[ext] || '📄';
}

// ── Breadcrumb ────────────────────────────────────────────────────
function Breadcrumb({ stack, onJump }) {
  return (
    <div className="breadcrumb">
      {stack.map((crumb, i) => (
        <span key={crumb.id || 'root'}>
          {i > 0 && <span className="breadcrumb-sep"> / </span>}
          {i < stack.length - 1
            ? <span className="breadcrumb-item" onClick={() => onJump(i)}>{crumb.name}</span>
            : <span className="breadcrumb-current">{crumb.name}</span>
          }
        </span>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function DashboardPage() {
  // Folder browser state
  const [navStack, setNavStack]             = useState([{ id: null, name: 'OneDrive' }]);
  const [items, setItems]                   = useState([]);
  const [loadingItems, setLoadingItems]     = useState(true);
  const [itemsError, setItemsError]         = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(
    sessionStorage.getItem('selectedFolderId') || null
  );

  // Summary + recent backups state
  const [history, setHistory]               = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Per-card backup state: { [folderId]: 'running' | 'completed' | 'failed' }
  const [backupStates, setBackupStates]     = useState({});

  const navigate = useNavigate();

  const currentFolder = navStack[navStack.length - 1];

  // ── Fetch folder contents ───────────────────────────────────────
  const loadItems = useCallback(async (folder) => {
    setLoadingItems(true);
    setItemsError(null);
    try {
      const data = folder.id
        ? await api.getFolderChildren(folder.id)
        : await api.getFolders();
      setItems(data.items || []);
    } catch (err) {
      setItemsError(err.message);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // Refetch when nav stack changes
  useEffect(() => { loadItems(currentFolder); }, [currentFolder, loadItems]);

  // Fetch backup history once for summary + recent list
  useEffect(() => {
    let cancelled = false;
    api.getHistory()
      .then((d) => { if (!cancelled) setHistory(d.history || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingHistory(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Navigation helpers ──────────────────────────────────────────
  function browseInto(folder) {
    setNavStack((s) => [...s, { id: folder.id, name: folder.name }]);
  }

  function jumpTo(index) {
    setNavStack((s) => s.slice(0, index + 1));
  }

  // ── Folder selection ────────────────────────────────────────────
  function selectFolder(folder) {
    setSelectedFolderId(folder.id);
    sessionStorage.setItem('selectedFolderId', folder.id);
    sessionStorage.setItem('selectedFolderName', folder.name);
  }

  // ── Inline backup ───────────────────────────────────────────────
  async function backupFolder(folder) {
    selectFolder(folder);
    setBackupStates((s) => ({ ...s, [folder.id]: 'running' }));
    try {
      await api.startBackup(folder.id);
      setBackupStates((s) => ({ ...s, [folder.id]: 'completed' }));
      // Refresh history silently
      api.getHistory().then((d) => setHistory(d.history || [])).catch(() => {});
    } catch (_err) {
      setBackupStates((s) => ({ ...s, [folder.id]: 'failed' }));
    }
  }

  // ── Derived summary ─────────────────────────────────────────────
  const totalBackups  = history.length;
  const totalFiles    = history.reduce((acc, h) => acc + (h.fileCount || 0), 0);
  const lastBackupDate = history.length > 0
    ? new Date(history[0].createdAt).toLocaleDateString()
    : null;
  const recentBackups = history.slice(0, 4);

  const folders = items.filter((i) => !!i.folder);
  const files   = items.filter((i) => !i.folder);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Browse your OneDrive and back up folders to Google Cloud Storage.</p>
      </div>

      {/* ── Summary cards ── */}
      <div className="summary-bar">
        <div className="summary-card">
          <span className="summary-label">Total Backups</span>
          <span className="summary-value">{loadingHistory ? '—' : totalBackups}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Files Protected</span>
          <span className="summary-value">{loadingHistory ? '—' : totalFiles}</span>
          <span className="summary-sub">across all backups</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Last Backup</span>
          <span className="summary-value" style={{ fontSize: 18 }}>
            {loadingHistory ? '—' : lastBackupDate || 'Never'}
          </span>
        </div>
      </div>

      {/* ── Folder browser ── */}
      <div className="section-header">
        <h2>Browse OneDrive</h2>
      </div>

      <Breadcrumb stack={navStack} onJump={jumpTo} />

      {loadingItems && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--text-subtle)' }}>
          <span className="spinner" /> Loading…
        </div>
      )}
      {itemsError && <div className="message error">{itemsError}</div>}

      {!loadingItems && !itemsError && (
        <>
          <div className="folder-grid">
            {folders.map((folder) => {
              const bs = backupStates[folder.id];
              return (
                <div
                  key={folder.id}
                  className={`folder-card${folder.id === selectedFolderId ? ' selected' : ''}`}
                >
                  {folder.id === selectedFolderId && (
                    <span className="folder-selected-badge">Selected</span>
                  )}
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">{folder.name}</span>

                  {bs === 'running'   && <div className="badge badge-running">Backing up…</div>}
                  {bs === 'completed' && <div className="badge badge-completed">Backed up ✓</div>}
                  {bs === 'failed'    && <div className="badge badge-failed">Failed</div>}

                  <div className="folder-card-actions">
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => browseInto(folder)}
                    >
                      Browse
                    </button>
                    <button
                      className="btn-sm"
                      disabled={bs === 'running'}
                      onClick={() => backupFolder(folder)}
                    >
                      Backup
                    </button>
                  </div>
                </div>
              );
            })}
            {folders.length === 0 && files.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <p>This folder is empty.</p>
              </div>
            )}
          </div>

          {/* Non-folder files in current directory */}
          {files.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h2>Files</h2>
              <ul className="file-list">
                {files.map((file) => (
                  <li key={file.id}>
                    <span className="file-icon">{fileIcon(file)}</span>
                    <span className="file-name">{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* ── Recent backups ── */}
      {!loadingHistory && recentBackups.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="section-header">
            <h2>Recent Backups</h2>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/history')}>
              View all →
            </button>
          </div>
          <div className="table-wrap">
            <ul className="recent-list">
              {recentBackups.map((b) => (
                <li key={b.backupId} className="recent-item">
                  <span className="recent-item-icon">🗄</span>
                  <div className="recent-item-main">
                    <div className="recent-item-id">{b.folderId || 'Folder backup'}</div>
                    <div className="recent-item-sub">
                      {b.fileCount || 0} files · {b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <StatusBadge status={b.status || 'completed'} />
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => navigate(`/restore?backupId=${encodeURIComponent(b.backupId)}`)}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
