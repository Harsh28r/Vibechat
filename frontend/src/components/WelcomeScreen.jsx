import { useState } from 'react'
import { Video, Users, Shield, Zap, Sparkles, Settings, Moon, Sun } from 'lucide-react'
import './WelcomeScreen.css'
import Preferences from './Preferences'

function WelcomeScreen({ onStart, isConnected, preferences, onPreferencesChange, darkMode, onToggleDarkMode }) {
  const [showPreferences, setShowPreferences] = useState(false)
  return (
    <div className="welcome-screen">
      {/* Dark Mode Toggle */}
      <button className="dark-mode-toggle" onClick={onToggleDarkMode}>
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

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

        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{isConnected ? 'Connected' : 'Connecting to server...'}</span>
        </div>

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

