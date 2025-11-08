import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Facebook, Mail, Lock, User, Eye, EyeOff, UserPlus, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

function Signup({ onSwitchToLogin, onClose }) {
  const { signup, loginWithGoogle, loginWithFacebook } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName || formData.username
    });
    
    if (result.success) {
      console.log('✅ Signup successful!');
      // Small delay to ensure token is saved and socket updates
      setTimeout(() => {
        onClose();
      }, 300);
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
          <UserPlus size={40} className="auth-icon" />
          <h2>Create Account</h2>
          <p>Register for a new account</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <User size={18} />
            <input
              type="text"
              name="username"
              placeholder="Username (3-20 characters)"
              value={formData.username}
              onChange={handleChange}
              minLength="3"
              maxLength="20"
              required
            />
          </div>

          <div className="form-group">
            <User size={18} />
            <input
              type="text"
              name="displayName"
              placeholder="Display Name (optional)"
              value={formData.displayName}
              onChange={handleChange}
            />
          </div>

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
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
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

          <div className="form-group">
            <Lock size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or sign up with</span>
        </div>

        <div className="social-buttons">
          <button className="auth-btn google" onClick={handleGoogleLogin} disabled={loading}>
            <FcGoogle size={20} />
            Sign up with Google
          </button>

          <button className="auth-btn facebook" onClick={handleFacebookLogin} disabled={loading}>
            <Facebook size={20} />
            Sign up with Facebook
          </button>
        </div>

        <div className="auth-footer">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="link-btn">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;

