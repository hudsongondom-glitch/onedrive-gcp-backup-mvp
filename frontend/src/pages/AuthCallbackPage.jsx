import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setSessionId } from '../api/client';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId) {
      setSessionId(sessionId);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/?error=missing_session', { replace: true });
    }
  }, [searchParams, navigate]);

  return <p style={{ padding: 24 }}>Signing in...</p>;
}
