import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">☁</div>
        <h1>OneDrive Backup</h1>
        <p>Securely back up your OneDrive folders to Google Cloud Storage.</p>

        {errorParam && (
          <div className="message error" style={{ width: '100%' }}>
            Sign-in failed or was cancelled. Please try again.
          </div>
        )}

        <button
          className="btn-login"
          style={{ marginTop: 8, width: '100%' }}
          onClick={() => { window.location.href = api.loginUrl(); }}
        >
          Sign in with Microsoft
        </button>

        <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 8 }}>
          Your files remain private. We only read what you select.
        </p>
      </div>
    </div>
  );
}
