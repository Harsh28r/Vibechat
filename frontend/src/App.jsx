import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
import VideoChat from './components/VideoChat'
import { SocketProvider } from './context/SocketContext'

const SOCKET_URL = 'http://localhost:5000'

function App() {
  const [isStarted, setIsStarted] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
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

  useEffect(() => {
    console.log('🔌 Connecting to:', SOCKET_URL)
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
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

  const handleStart = () => {
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
          />
        ) : (
          <VideoChat preferences={preferences} />
        )}
      </div>
    </SocketProvider>
  )
}

export default App

