import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Facebook, Mail, Lock, User, Eye, EyeOff, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

function Login({ onSwitchToSignup, onClose }) {
  const { login, loginAsGuest, loginWithGoogle, loginWithFacebook } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    const result = await loginWithFacebook();
    if (result.success) {
      console.log('✅ Facebook login successful!');
      onClose();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const result = await loginWithGoogle();
    if (result.success) {
      console.log('✅ Google login successful!');
      onClose();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="auth-header">
          <User size={40} className="auth-icon" />
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
            <Mail size={18} />
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
            <Lock size={18} />
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-buttons">
          <button className="auth-btn google" onClick={handleGoogleLogin} disabled={loading}>
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <button className="auth-btn facebook" onClick={handleFacebookLogin} disabled={loading}>
            <Facebook size={20} />
            Continue with Facebook
          </button>
        </div>

        <div className="guest-section">
          <button className="auth-btn guest" onClick={handleGuestLogin} disabled={loading}>
            Continue as Guest
          </button>
        </div>

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

