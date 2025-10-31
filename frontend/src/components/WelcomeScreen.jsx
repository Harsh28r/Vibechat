import { useState } from 'react'
import { Video, Users, Shield, Zap, Sparkles, Settings, Moon, Sun, LogIn, UserPlus, LogOut } from 'lucide-react'
import './WelcomeScreen.css'
import Preferences from './Preferences'
import { useAuth } from '../context/AuthContext'

function WelcomeScreen({ onStart, isConnected, preferences, onPreferencesChange, darkMode, onToggleDarkMode, isAuthenticated, onShowLogin, onShowSignup }) {
  const [showPreferences, setShowPreferences] = useState(false)
  const { user, logout } = useAuth()
  
  return (
    <div className="welcome-screen">
      {/* Top Bar */}
      <div className="top-bar">
        {/* Dark Mode Toggle */}
        <button className="dark-mode-toggle" onClick={onToggleDarkMode}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <div className="user-info">
              {user?.avatar && (
                <img src={user.avatar} alt="Avatar" className="user-avatar" />
              )}
              <span className="user-name">{user?.displayName || user?.username}</span>
              <button className="logout-btn" onClick={logout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <button className="auth-btn-small login" onClick={onShowLogin}>
                <LogIn size={18} />
                Login
              </button>
              <button className="auth-btn-small signup" onClick={onShowSignup}>
                <UserPlus size={18} />
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      <div className="welcome-content fade-in">
        <div className="logo">
          <div className="logo-icon-wrapper">
            <Video size={48} className="logo-icon" />
            <Sparkles size={24} className="sparkle-icon" />
          </div>
          <div className="brand-name">
            <h1>VibeChat</h1>
            <span className="brand-subtitle">Connect. Vibe. Chat.</span>
          </div>
        </div>
        
        <p className="tagline">
          Meet amazing people from around the world through instant video connections
        </p>

        <div className="features">
          <div className="feature">
            <Users size={32} />
            <h3>Random Matching</h3>
            <p>Instant connection with people worldwide</p>
          </div>
          <div className="feature">
            <Zap size={32} />
            <h3>Lightning Fast</h3>
            <p>WebRTC powered real-time communication</p>
          </div>
          <div className="feature">
            <Shield size={32} />
            <h3>Safe & Secure</h3>
            <p>Your privacy is our priority</p>
          </div>
        </div>

        <button 
          className="preferences-btn"
          onClick={() => setShowPreferences(true)}
        >
          <Settings size={20} />
          Set Preferences
        </button>

        <button 
          className={`start-btn ${!isConnected ? 'disabled' : ''}`}
          onClick={onStart}
          disabled={!isConnected}
        >
          {isConnected ? 'Start Chatting' : 'Connecting...'}
        </button>

        {/* Connection Status - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="connection-status-card">
            <div className={`status-badge ${isConnected ? 'connected' : 'connecting'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            {isConnected && user && (
              <div className="welcome-message">
                <span className="wave">👋</span> Welcome back, <strong>{user.displayName || user.username}</strong>!
              </div>
            )}
          </div>
        )}

        {/* Guest Notice - Show for non-authenticated users */}
        {!isAuthenticated && isConnected && (
          <div className="guest-notice">
            <span className="info-icon">ℹ️</span>
            <span>Login or sign up to save your preferences and chat history!</span>
          </div>
        )}

        {/* Regular connection status for guests */}
        {!isAuthenticated && (
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{isConnected ? 'Connected' : 'Connecting to server...'}</span>
          </div>
        )}

        <div className="disclaimer">
          <p>✨ By clicking "Start Chatting", you agree to be awesome and respectful.</p>
          <p>Let's create positive vibes together! 🌟</p>
        </div>
      </div>

      <Preferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferences={preferences}
        onSave={onPreferencesChange}
      />
    </div>
  )
}

export default WelcomeScreen

