import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Reload user data
      window.location.href = '/';
    } else {
      // No token, redirect to home
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px'
    }}>
      <div>
        <h2>✅ Authentication Successful!</h2>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}

export default AuthSuccess;

