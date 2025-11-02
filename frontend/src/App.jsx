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
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
      withCredentials: true,
      auth: {
        token: localStorage.getItem('token')
      }
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id)
      console.log('🔌 Socket URL:', SOCKET_URL)
      console.log('🌐 Connection state:', newSocket.connected ? 'CONNECTED' : 'DISCONNECTED')
      setIsConnected(true)
    })
    
    // Listen for connection state changes
    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      console.error('🔌 Trying to connect to:', SOCKET_URL)
      console.error('🔌 Socket connected?', newSocket.connected)
      setIsConnected(false)
      // Show alert if connection fails in production
      if (SOCKET_URL.includes('localhost')) {
        alert('⚠️ Backend URL not configured! Please set VITE_SOCKET_URL environment variable.')
      }
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
        <h2>Loading...</h2>
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

