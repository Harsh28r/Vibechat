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
      {/* Animated Video Background */}
      <div className="video-background">
        <div className="video-overlay"></div>
        <div className="animated-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="top-bar">
        {/* Dark Mode Toggle */}
        <button className="dark-mode-toggle" onClick={onToggleDarkMode}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Auth Buttons - Small for logged in users */}
        {isAuthenticated && (
          <div className="auth-buttons">
            <div className="user-info">
              {user?.avatar && (
                <img src={user.avatar} alt="Avatar" className="user-avatar" />
              )}
              <span className="user-name">{user?.displayName || user?.username}</span>
              <button className="logout-btn" onClick={logout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="welcome-container">
        {/* Left Side - Video Preview */}
        <div className="video-preview-section">
          <div className="video-preview-box">
            {/* Background Video - Using animated gradient for now */}
            {/* To add your own video: Put video.mp4 in frontend/public/ folder and uncomment below */}
            {/* <video className="preview-video" autoPlay loop muted playsInline>
              <source src="/video.mp4" type="video/mp4" />
            </video> */}
            
            {/* Animated Background Fallback */}
            <div className="video-fallback"></div>
            
            <div className="preview-overlay">
              <div className="live-badge-top">
                <span className="live-dot"></span>
                <span>LIVE NOW</span>
              </div>
              
              <div className="preview-content">
                <div className="preview-icon">
                  <Video size={50} />
                </div>
                <h2>See Who's Online</h2>
                <p>Thousands of people ready to chat</p>
                <div className="video-stats">
                  <div className="stat-pill">
                    <Users size={20} />
                    <span>5K+ Online</span>
                  </div>
                  <div className="stat-pill">
                    <Zap size={20} />
                    <span>Instant Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Welcome Form */}
        <div className="welcome-content fade-in">

        <div className="logo">
          <div className="logo-icon-wrapper">
            <div className="logo-circle">
              <Video size={32} className="logo-icon" />
            </div>
            <Sparkles size={16} className="sparkle-icon" />
          </div>
          <div className="brand-name">
            <h1>VibeChat</h1>
            <span className="brand-subtitle">🌍 Connect instantly. Chat globally. 🚀</span>
          </div>
        </div>
        
        <div className="tagline-wrapper">
          <p className="tagline">
            <span className="tagline-item">🌎 Meet new people worldwide</span>
            <span className="tagline-divider">•</span>
            <span className="tagline-item">⚡ Instant connections</span>
            <span className="tagline-divider">•</span>
            <span className="tagline-item">🎉 100% Free</span>
          </p>
        </div>

        <div className="stats-banner">
          <div className="stat-item">
            <Users size={20} className="stat-icon" />
            <div className="stat-content">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Online Now</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Zap size={20} className="stat-icon" />
            <div className="stat-content">
              <span className="stat-number">&lt;3s</span>
              <span className="stat-label">Avg Match Time</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Shield size={20} className="stat-icon" />
            <div className="stat-content">
              <span className="stat-number">100%</span>
              <span className="stat-label">Secure</span>
            </div>
          </div>
        </div>

        <button 
          className="preferences-btn"
          onClick={() => setShowPreferences(true)}
        >
          <Settings size={16} />
          Set Preferences
        </button>

        <button 
          className={`start-btn ${!isConnected ? 'disabled' : ''}`}
          onClick={onStart}
          disabled={!isConnected}
        >
          {isConnected ? '🎥 Start Video Chat' : 'Connecting...'}
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


        {/* Regular connection status for guests */}
        {!isAuthenticated && (
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{isConnected ? 'Connected' : 'Connecting to server...'}</span>
          </div>
        )}

        <div className="disclaimer">
          <p>📹 Camera required • Be respectful • Have fun! 🌟</p>
        </div>
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

