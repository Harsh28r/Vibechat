import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Facebook, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

function Login({ onSwitchToSignup, onClose }) {
  const { login, loginAsGuest } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      console.log('✅ Login successful!');
      // Small delay to ensure token is saved and socket updates
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    const result = await loginAsGuest();
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_URL}/api/auth/facebook`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <User size={48} className="auth-icon" />
          <h2>Welcome Back!</h2>
          <p>Login to continue chatting</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <Mail size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <Lock size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="auth-btn facebook" onClick={handleFacebookLogin}>
          <Facebook size={20} />
          Continue with Facebook
        </button>

        <button className="auth-btn google" onClick={handleGoogleLogin}>
          <FcGoogle size={20} />
          Continue with Google
        </button>

        <button className="auth-btn guest" onClick={handleGuestLogin} disabled={loading}>
          Continue as Guest
        </button>

        <div className="auth-footer">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="link-btn">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

