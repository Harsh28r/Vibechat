import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { io } from 'socket.io-client'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
import VideoChat from './components/VideoChat'
import Login from './components/Login'
import Signup from './components/Signup'
import AuthSuccess from './components/AuthSuccess'
import { SocketProvider } from './context/SocketContext'
import { AuthProvider, useAuth } from './context/AuthContext'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

function MainApp() {
  const { isAuthenticated, loading } = useAuth()
  const [isStarted, setIsStarted] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [preferences, setPreferences] = useState({
    myGender: 'other',
    gender: 'any',
    country: 'ANY',
    interests: []
  })

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.body.classList.add('dark-mode')
    }
  }, [])

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('preferences')
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs))
    }
  }, [])

  // Initialize socket connection (only once, regardless of auth)
  useEffect(() => {
    console.log('🔌 Connecting to:', SOCKET_URL)
    
    // For Render.com free tier, increase timeout for cold starts
    const isRender = SOCKET_URL.includes('render.com')
    const connectionTimeout = isRender ? 30000 : 20000 // 30s for Render, 20s for others
    
    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Try polling first for better cold start handling
      upgrade: true,
      reconnection: true,
      reconnectionDelay: isRender ? 2000 : 1000, // Wait longer for Render
      reconnectionAttempts: 15, // More attempts for Render
      timeout: connectionTimeout,
      withCredentials: true,
      auth: {
        token: localStorage.getItem('token')
      },
      // Add forceNew to handle reconnections better
      forceNew: false,
      // Ensure proper connection
      autoConnect: true
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id)
      console.log('🔌 Socket URL:', SOCKET_URL)
      console.log('🌐 Connection state:', newSocket.connected ? 'CONNECTED' : 'DISCONNECTED')
      setIsConnected(true)
    })
    
    // Listen for connection state changes
    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message)
      console.error('🔌 Trying to connect to:', SOCKET_URL)
      console.error('🔌 Socket connected?', newSocket.connected)
      setIsConnected(false)
      
      // Don't spam alerts for Render cold starts
      if (error.message.includes('timeout') && SOCKET_URL.includes('render.com')) {
        console.log('⏳ Render.com cold start detected - retrying...')
      } else if (SOCKET_URL.includes('localhost')) {
        console.error('⚠️ Backend connection failed! Troubleshooting:')
        console.error('1. Make sure backend server is running: cd backend && npm run dev')
        console.error('2. Check backend .env has: CORS_ORIGIN=http://localhost:5173')
        console.error('3. Check frontend .env has: VITE_SOCKET_URL=http://localhost:5000')
        console.error('4. Restart both frontend and backend after updating .env files')
      }
    })
    
    // Handle successful reconnection
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
    })
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`)
    })
    
    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message)
    })
    
    newSocket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts')
      alert('⚠️ Could not connect to server. Please refresh the page.')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('server-full', ({ message }) => {
      alert(message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Reconnect socket with new token after authentication
  useEffect(() => {
    if (isAuthenticated && socket) {
      const token = localStorage.getItem('token')
      console.log('🔐 Authenticated! Updating socket with token...')
      
      // Update socket auth
      socket.auth = { token }
      
      // Reconnect if needed
      if (!socket.connected) {
        socket.connect()
      }
    }
  }, [isAuthenticated, socket])

  const handleStart = () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    
    if (isConnected && socket) {
      console.log('🚀 Starting video chat...')
      setIsStarted(true)
    } else {
      alert('Not connected to server. Please wait or refresh the page.')
    }
  }

  const handlePreferencesChange = (newPreferences) => {
    setPreferences(newPreferences)
    localStorage.setItem('preferences', JSON.stringify(newPreferences))
    console.log('✅ Preferences saved:', newPreferences)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)
    document.body.classList.toggle('dark-mode', newDarkMode)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-animation">
          <div className="loader-container">
            <div className="loader-circle loader-circle-1"></div>
            <div className="loader-circle loader-circle-2"></div>
            <div className="loader-circle loader-circle-3"></div>
            <div className="loader-circle loader-circle-4"></div>
          </div>
          <div className="loading-wave">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SocketProvider socket={socket}>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        {!isStarted ? (
          <WelcomeScreen 
            onStart={handleStart} 
            isConnected={isConnected}
            preferences={preferences}
            onPreferencesChange={handlePreferencesChange}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            isAuthenticated={isAuthenticated}
            onShowLogin={() => setShowLogin(true)}
            onShowSignup={() => setShowSignup(true)}
          />
        ) : (
          <VideoChat preferences={preferences} />
        )}

        {showLogin && (
          <Login
            onClose={() => setShowLogin(false)}
            onSwitchToSignup={() => {
              setShowLogin(false)
              setShowSignup(true)
            }}
          />
        )}

        {showSignup && (
          <Signup
            onClose={() => setShowSignup(false)}
            onSwitchToLogin={() => {
              setShowSignup(false)
              setShowLogin(true)
            }}
          />
        )}
      </div>
    </SocketProvider>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

