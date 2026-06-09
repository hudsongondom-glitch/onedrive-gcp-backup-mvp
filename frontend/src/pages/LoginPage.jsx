import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  function handleLogin() {
    window.location.href = api.loginUrl();
  }

  return (
    <div className="page login-page">
      <h1>OneDrive Backup MVP</h1>
      <p>Back up your OneDrive folders to Google Cloud Storage.</p>

      {errorParam && (
        <div className="message error">Sign-in failed. Please try again.</div>
      )}

      <button className="btn-login" onClick={handleLogin}>
        Login with Microsoft
      </button>
    </div>
  );
}
