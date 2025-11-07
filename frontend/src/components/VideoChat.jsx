import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { SkipForward, X, Mic, MicOff, Video as VideoIcon, VideoOff, MapPin, Flag, AlertOctagon, Clock } from 'lucide-react'
import './VideoChat.css'
import ChatBox from './ChatBox'

// Country list for filter (same as Preferences)
const COUNTRIES = [
  { code: 'ANY', name: 'Any Country', flag: '🌍' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' }
]

const API_BASE = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const REPORT_REASONS = [
  'Inappropriate behavior',
  'Harassment or bullying',
  'Explicit content',
  'Spam or scam',
  'Impersonation',
  'Other'
]

// Country code to flag emoji mapping
const getCountryFlag = (countryCode) => {
  if (!countryCode || countryCode === 'ANY' || countryCode === 'Unknown') return '🌍'
  
  const countryFlags = {
    'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'AU': '🇦🇺', 'NZ': '🇳🇿',
    'IN': '🇮🇳', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'NP': '🇳🇵',
    'FR': '🇫🇷', 'DE': '🇩🇪', 'ES': '🇪🇸', 'IT': '🇮🇹', 'PT': '🇵🇹',
    'BR': '🇧🇷', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴',
    'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'TH': '🇹🇭', 'VN': '🇻🇳',
    'PH': '🇵🇭', 'ID': '🇮🇩', 'MY': '🇲🇾', 'SG': '🇸🇬', 'TW': '🇹🇼',
    'RU': '🇷🇺', 'UA': '🇺🇦', 'PL': '🇵🇱', 'RO': '🇷🇴', 'CZ': '🇨🇿',
    'TR': '🇹🇷', 'SA': '🇸🇦', 'AE': '🇦🇪', 'IL': '🇮🇱', 'EG': '🇪🇬',
    'ZA': '🇿🇦', 'NG': '🇳🇬', 'KE': '🇰🇪', 'MA': '🇲🇦', 'DZ': '🇩🇿',
    'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'NL': '🇳🇱',
    'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'GR': '🇬🇷', 'IE': '🇮🇪'
  }
  
  return countryFlags[countryCode.toUpperCase()] || '🌍'
}

const formatBanDate = (input) => {
  if (!input) return null
  const date = typeof input === 'string' ? new Date(input) : input
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null
  }
  return date.toLocaleString()
}

function VideoChat({ preferences, initialBanInfo = null }) {
  const socket = useSocket()
  const { user, refreshBackendToken } = useAuth()
  const [status, setStatus] = useState('searching') // searching, connected, disconnected
  const [partnerId, setPartnerId] = useState(null)
  const [partnerCountry, setPartnerCountry] = useState(null)
  const [messages, setMessages] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [showVideoWarning, setShowVideoWarning] = useState(false)
  const [banInfo, setBanInfo] = useState(initialBanInfo)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportFeedback, setReportFeedback] = useState(null)
  const [reportError, setReportError] = useState(null)
  
  // Country filter state
  const [selectedCountry, setSelectedCountry] = useState(preferences?.country || 'ANY')
  const [showCountryFilter, setShowCountryFilter] = useState(false)
  
  // Face tracking state - COMMENTED OUT
  // const [facePosition, setFacePosition] = useState(null)
  // const faceDetectionRef = useRef(null)
  // const canvasRef = useRef(null)
  // const processedStreamRef = useRef(null)
  // const animationFrameRef = useRef(null)
  
  // Draggable video state
  const [isDragging, setIsDragging] = useState(false)
  const [videoPosition, setVideoPosition] = useState({ x: 20, y: null, bottom: 120 })
  const dragRef = useRef({ startX: 0, startY: 0 })

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const partnerIdRef = useRef(null)
  const banInfoRef = useRef(null)
  const tokenRefreshInFlightRef = useRef(false)

  useEffect(() => {
    banInfoRef.current = banInfo
  }, [banInfo])

  useEffect(() => {
    if (initialBanInfo === null) {
      setBanInfo(null)
      setStatus(prev => (prev === 'banned' ? 'searching' : prev))
    } else if (initialBanInfo) {
      setBanInfo(initialBanInfo)
      if (initialBanInfo.isBanned) {
        setStatus('banned')
      } else {
        setStatus(prev => (prev === 'banned' ? 'searching' : prev))
      }
    }
  }, [initialBanInfo])

  useEffect(() => {
    if (!banInfo?.isBanned && status === 'banned') {
      setStatus('searching')
    }
  }, [banInfo, status])

  useEffect(() => {
    if (user && !user.token && typeof refreshBackendToken === 'function' && !tokenRefreshInFlightRef.current) {
      tokenRefreshInFlightRef.current = true
      refreshBackendToken().finally(() => {
        tokenRefreshInFlightRef.current = false
      })
    }
  }, [user, refreshBackendToken])

  useEffect(() => {
    const fetchBanStatus = async () => {
      const authToken = user?.token || localStorage.getItem('token')
      if (!authToken) return

      try {
        const response = await fetch(`${API_BASE}/api/moderation/ban-status`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        if (!response.ok) return

        const data = await response.json()
        if (data?.success && data.data?.isBanned) {
          setBanInfo(data.data)
          setStatus('banned')
        } else {
          setBanInfo(null)
        }
      } catch (error) {
        console.error('Failed to fetch ban status:', error)
      }
    }

    fetchBanStatus()
  }, [user?.token])

  // ICE servers for WebRTC (using free STUN servers)
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  }

  // Initialize media stream
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not ready yet')
      return
    }

    if (banInfo?.isBanned) {
      console.log('🚫 User is banned. Skipping media initialization.')
      setStatus('banned')
      return
    }

    const initMedia = async () => {
      try {
        console.log('📹 Requesting camera and microphone access...')
        
        // Simplified, robust approach: try best quality first, then fallback gracefully
        let stream = null
        let lastError = null
        
        // Strategy 1: Try high quality with ideal values (most flexible)
        try {
          console.log('🎯 Attempting high quality (1080p @ 60fps)...')
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 60 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
          console.log('✅ High quality obtained!')
        } catch (error1) {
          console.log('⚠️ High quality failed, trying medium quality...', error1.message)
          lastError = error1
          
          // Strategy 2: Try medium quality
          try {
            console.log('🎯 Attempting medium quality (720p @ 30fps)...')
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
                facingMode: 'user'
              },
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              }
            })
            console.log('✅ Medium quality obtained!')
          } catch (error2) {
            console.log('⚠️ Medium quality failed, trying basic quality...', error2.message)
            lastError = error2
            
            // Strategy 3: Try basic quality (minimal constraints)
            try {
              console.log('🎯 Attempting basic quality (any resolution)...')
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: 'user'
                },
                audio: true
              })
              console.log('✅ Basic quality obtained!')
            } catch (error3) {
              console.error('❌ All quality attempts failed!')
              lastError = error3
              throw error3
            }
          }
        }

        console.log('✅ Media access granted')
        
        // Check if video track is actually enabled
        const videoTrack = stream.getVideoTracks()[0]
        if (!videoTrack || !videoTrack.enabled) {
          alert('📹 Camera must be ON to use this platform!')
          return
        }
        
        // Log actual video quality settings
        if (videoTrack.getSettings) {
          const settings = videoTrack.getSettings()
          console.log('📹 Video Quality Settings:', {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            aspectRatio: settings.aspectRatio
          })
        } else if (videoTrack.getCapabilities) {
          const capabilities = videoTrack.getCapabilities()
          console.log('📹 Video Capabilities:', capabilities)
        }
        
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        
        // Face tracking initialization - COMMENTED OUT
        // if (currentFilter !== 'none') {
        //   await initFaceTracking(stream)
        // } else {
        //   if (localVideoRef.current) {
        //     localVideoRef.current.srcObject = stream
        //   }
        // }
        
        // Monitor if user tries to disable video
        videoTrack.onended = () => {
          console.warn('⚠️ Video track ended')
          alert('📹 Camera is required! Please keep your camera on.')
          window.location.reload()
        }

        // Start searching for partner with preferences
        console.log('🔍 Emitting start-search event with preferences...')
        const countryToUse = selectedCountry || preferences?.country || 'ANY'
        socket.emit('start-search', {
          gender: preferences?.myGender || 'other',
          country: countryToUse,
          interests: preferences?.interests || [],
          preferences: {
            gender: preferences?.gender || 'any',
            country: countryToUse
          },
          userId: user?.backendId || null
        })
        console.log('✅ start-search event emitted with country:', countryToUse)
      } catch (error) {
        console.error('❌ Error accessing media devices:', error)
        console.error('❌ Error name:', error.name)
        console.error('❌ Error message:', error.message)
        
        let errorMessage = '📹 Camera and microphone access is REQUIRED!\n\n'
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += 'Permission denied! Please:\n1. Click the lock icon in your browser\n2. Allow camera/microphone access\n3. Refresh the page'
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage += 'No camera/microphone found! Please:\n1. Check your devices are connected\n2. Make sure they are not being used by another app'
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage += 'Camera/microphone is already in use! Please:\n1. Close other apps using your camera\n2. Refresh the page'
        } else {
          errorMessage += 'Failed to access camera/microphone:\n' + error.message + '\n\nPlease:\n1. Check browser permissions\n2. Make sure no other app is using your camera\n3. Try refreshing the page'
        }
        
        alert(errorMessage)
      }
    }

    initMedia()

    return () => {
      // Cleanup on unmount
      console.log('🧹 Cleaning up media stream')
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [socket, banInfo?.isBanned, user?.backendId])

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not ready for event listeners')
      return
    }

    console.log('🎧 Setting up socket event listeners')

    socket.on('searching', ({ message }) => {
      console.log('🔍 Server says:', message)
      
      // Don't override 'connected' status if we already have a partner
      // Use ref to avoid stale closure issue
      if (partnerIdRef.current || peerConnectionRef.current) {
        console.log('ℹ️ Already have partner/connection, ignoring searching event')
        return
      }
      
      if (message.includes('Found someone') || message.includes('Connecting')) {
        setStatus('connecting')
        console.log('✨ Status changed to: connecting')
      } else {
        setStatus('searching')
        console.log('⏳ Status changed to: searching')
      }
    })
    
    socket.on('error', ({ message }) => {
      console.error('❌ Socket error:', message)
      alert(`Socket error: ${message}`)
    })

    socket.on('match-found', async ({ partnerId: newPartnerId, sessionId, partnerCountry: country }) => {
      console.log('🎯 Match found with:', newPartnerId)
      setPartnerId(newPartnerId)
      partnerIdRef.current = newPartnerId
      setPartnerCountry(country || null)
      setStatus('connected')
      
      // Clear chat for new person
      setMessages([])
      console.log('💬 Chat cleared for new match')
      setReportFeedback(null)
      setReportError(null)
      
      // Determine who should be the offerer (alphabetically earlier socket ID)
      const shouldOffer = socket.id < newPartnerId
      console.log('📊 My ID:', socket.id, 'Partner ID:', newPartnerId)
      console.log('🎲 Should I create offer?', shouldOffer)
      
      if (shouldOffer) {
        console.log('📤 Creating peer connection as offerer')
        await createPeerConnection(newPartnerId, true)
      } else {
        console.log('⏳ Waiting for offer from partner...')
      }
    })

    socket.on('webrtc-offer', async ({ offer, from }) => {
      console.log('📥 Received offer from:', from)
      
      // Set status to connected when we receive an offer (means match is established)
      setStatus('connected')
      setPartnerId(from)
      partnerIdRef.current = from
      console.log('✅ Status set to connected (received offer)')
      
      // Only create peer connection if we don't have one
      if (!peerConnectionRef.current) {
        console.log('🔧 Creating peer connection as answerer')
        await createPeerConnection(from, false)
      }
      
      try {
        console.log('📝 Setting remote description')
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
        
        console.log('💬 Creating answer')
        
        // Set high quality video encoding before creating answer
        try {
          const senders = peerConnectionRef.current.getSenders()
          for (const sender of senders) {
            if (sender.track && sender.track.kind === 'video') {
              const params = sender.getParameters()
              if (!params.encodings) {
                params.encodings = [{}]
              }
              // Get current video settings to determine optimal bitrate
              const videoSettings = sender.track?.getSettings() || {}
              const width = videoSettings.width || 1920
              const height = videoSettings.height || 1080
              
              let maxBitrate = 4000000 // Default 4 Mbps for 1080p
              if (width >= 2560 || height >= 1440) {
                maxBitrate = 8000000 // 8 Mbps for 1440p/4K
              } else if (width >= 1920 || height >= 1080) {
                maxBitrate = 4000000 // 4 Mbps for 1080p
              }
              
              params.encodings[0] = {
                ...params.encodings[0],
                maxBitrate: maxBitrate,
                minBitrate: Math.floor(maxBitrate * 0.5),
                maxFramerate: 60,
                scaleResolutionDownBy: 1.0,
                networkPriority: 'high'
              }
              await sender.setParameters(params)
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not set encoding before answer:', error)
        }
        
        const answer = await peerConnectionRef.current.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        
        // Set local description without modifying SDP (SDP modification was causing parse errors)
        await peerConnectionRef.current.setLocalDescription(answer)
        
        console.log('📤 Sending answer to:', from)
        socket.emit('webrtc-answer', {
          answer: answer,
          to: from
        })
      } catch (error) {
        console.error('❌ Error handling offer:', error)
      }
    })

    socket.on('webrtc-answer', async ({ answer, from }) => {
      console.log('📥 Received answer from:', from)
      try {
        if (peerConnectionRef.current) {
          console.log('📝 Setting remote description from answer')
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
          console.log('✅ WebRTC connection established!')
          // Ensure status is set to connected when we receive answer
          setStatus('connected')
          setPartnerId(from)
          partnerIdRef.current = from
        }
      } catch (error) {
        console.error('❌ Error handling answer:', error)
      }
    })

    socket.on('ice-candidate', async ({ candidate, from }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          console.log('🧊 Adding ICE candidate')
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error)
      }
    })

    socket.on('chat-message', ({ message, timestamp }) => {
      setMessages(prev => [...prev, { text: message, sender: 'partner', timestamp }])
    })

    socket.on('partner-typing', ({ isTyping }) => {
      setPartnerTyping(isTyping)
    })

    socket.on('partner-disconnected', ({ reason }) => {
      console.log('Partner disconnected:', reason)
      handlePartnerDisconnected()
      
      // Auto-search for new partner after 1 second
      if (banInfoRef.current?.isBanned) {
        return
      }
      setTimeout(() => {
        const countryToUse = selectedCountry || preferences?.country || 'ANY'
        socket.emit('start-search', {
          gender: preferences?.myGender || 'other',
          country: countryToUse,
          interests: preferences?.interests || [],
          preferences: {
            gender: preferences?.gender || 'any',
            country: countryToUse
          }
        })
        setStatus('searching')
      }, 1000)
    })

    socket.on('banned', ({ message, bannedUntil, banReason }) => {
      console.warn('🚫 Banned from server:', message)
      const info = {
        isBanned: true,
        message: message || 'Your account is temporarily suspended.',
        bannedUntil: bannedUntil ? new Date(bannedUntil) : null,
        banReason: banReason || 'Community guidelines violation'
      }
      setBanInfo(info)
      setStatus('banned')
      setShowReportModal(false)
      setReportSubmitting(false)
      partnerIdRef.current = null
      setPartnerId(null)

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
    })

    return () => {
      socket.off('searching')
      socket.off('match-found')
      socket.off('webrtc-offer')
      socket.off('webrtc-answer')
      socket.off('ice-candidate')
      socket.off('chat-message')
      socket.off('partner-typing')
      socket.off('partner-disconnected')
      socket.off('banned')
    }
  }, [socket])

  // Create peer connection
  const createPeerConnection = async (remoteId, isOfferer) => {
    try {
      console.log('🔧 Creating new RTCPeerConnection')
      const pc = new RTCPeerConnection(iceServers)
      peerConnectionRef.current = pc

      // Add local stream tracks to peer connection with quality settings
      if (localStreamRef.current) {
        console.log('📹 Adding local tracks to peer connection')
        localStreamRef.current.getTracks().forEach(async track => {
          console.log('➕ Adding track:', track.kind)
          const sender = pc.addTrack(track, localStreamRef.current)
          
          // Configure video encoding for high quality
          if (track.kind === 'video' && sender) {
            try {
              const params = sender.getParameters()
              if (!params.encodings) {
                params.encodings = [{}]
              }
              // Set maximum quality encoding parameters
              // Determine bitrate based on resolution
              const videoSettings = track.getSettings()
              const width = videoSettings.width || 1920
              const height = videoSettings.height || 1080
              
              // Calculate optimal bitrate: higher resolution = higher bitrate
              let maxBitrate = 4000000 // 4 Mbps for 1080p default
              if (width >= 2560 || height >= 1440) {
                maxBitrate = 8000000 // 8 Mbps for 1440p/4K
              } else if (width >= 1920 || height >= 1080) {
                maxBitrate = 4000000 // 4 Mbps for 1080p
              } else {
                maxBitrate = 2500000 // 2.5 Mbps for 720p
              }
              
              params.encodings[0] = {
                ...params.encodings[0],
                maxBitrate: maxBitrate,
                minBitrate: Math.floor(maxBitrate * 0.5), // 50% of max as minimum
                maxFramerate: 60, // Try 60fps
                scaleResolutionDownBy: 1.0, // No downscaling
                rid: 'high',
                networkPriority: 'high'
              }
              
              // Add codec preferences for better quality
              if (params.codecs) {
                // Prefer VP9, VP8, then H264
                params.codecs.sort((a, b) => {
                  const priority = { 'VP9': 3, 'VP8': 2, 'H264': 1 }
                  return (priority[b.mimeType.split('/')[1]] || 0) - (priority[a.mimeType.split('/')[1]] || 0)
                })
              }
              await sender.setParameters(params)
              console.log('✅ High quality video encoding configured')
            } catch (error) {
              console.warn('⚠️ Could not set video encoding parameters:', error)
            }
          }
        })
      } else {
        console.error('❌ No local stream available!')
      }

      // Handle incoming tracks - CRITICAL for remote video display
      pc.ontrack = (event) => {
        console.log('✅ Received remote track:', event.track.kind)
        console.log('📊 Track event details:', {
          trackId: event.track.id,
          trackKind: event.track.kind,
          trackLabel: event.track.label,
          streams: event.streams.length,
          streamId: event.streams[0]?.id
        })
        
        if (event.streams && event.streams.length > 0) {
          const remoteStream = event.streams[0]
          console.log('📺 Remote stream received:', {
            id: remoteStream.id,
            active: remoteStream.active,
            videoTracks: remoteStream.getVideoTracks().length,
            audioTracks: remoteStream.getAudioTracks().length
          })
          
          if (remoteVideoRef.current) {
            // Check if we already have this stream
            if (remoteVideoRef.current.srcObject !== remoteStream) {
              console.log('📺 Setting remote video stream to video element')
              remoteVideoRef.current.srcObject = remoteStream
              
              // Force play in case autoplay is blocked
              remoteVideoRef.current.play().catch(error => {
                console.warn('⚠️ Could not autoplay remote video:', error)
              })
              
              // Log video track details
              const videoTrack = remoteStream.getVideoTracks()[0]
              if (videoTrack) {
                console.log('📹 Remote video track:', {
                  id: videoTrack.id,
                  label: videoTrack.label,
                  enabled: videoTrack.enabled,
                  readyState: videoTrack.readyState,
                  settings: videoTrack.getSettings ? videoTrack.getSettings() : 'N/A'
                })
                
                // Monitor track state changes
                videoTrack.onended = () => {
                  console.warn('⚠️ Remote video track ended')
                }
                
                videoTrack.onmute = () => {
                  console.warn('⚠️ Remote video track muted')
                }
                
                videoTrack.onunmute = () => {
                  console.log('✅ Remote video track unmuted')
                }
              }
            } else {
              console.log('ℹ️ Remote stream already set')
            }
          } else {
            console.error('❌ remoteVideoRef.current is null!')
          }
        } else {
          console.warn('⚠️ No streams in track event')
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate to:', remoteId)
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            to: remoteId
          })
        }
      }

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', pc.connectionState)
        if (pc.connectionState === 'connected') {
          console.log('✅ Peer connection established!')
          // Ensure status is set to connected
          setStatus('connected')
          
          // Check if we have remote tracks
          const receivers = pc.getReceivers()
          console.log('📊 Receivers count:', receivers.length)
          receivers.forEach((receiver, index) => {
            const track = receiver.track
            console.log(`📹 Receiver ${index}:`, {
              kind: track.kind,
              id: track.id,
              enabled: track.enabled,
              readyState: track.readyState
            })
            
            // If we have a video track but no stream set, create one
            if (track.kind === 'video' && remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
              console.log('🔧 Creating stream from receiver track')
              const stream = new MediaStream([track])
              remoteVideoRef.current.srcObject = stream
              remoteVideoRef.current.play().catch(error => {
                console.warn('⚠️ Could not play video:', error)
              })
            }
          })
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.log('❌ Peer connection failed/disconnected')
          handlePartnerDisconnected()
        }
      }

      // Monitor ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState)
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          console.log('✅ ICE connection established!')
        }
      }
      
      // Monitor track events (alternative to ontrack)
      pc.addEventListener('track', (event) => {
        console.log('📡 Track event received via addEventListener')
        if (event.streams && event.streams.length > 0 && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
          remoteVideoRef.current.play().catch(error => {
            console.warn('⚠️ Could not play video:', error)
          })
        }
      })

      // If we're the offerer, create and send offer
      if (isOfferer) {
        console.log('📤 Creating and sending offer to:', remoteId)
        
        // Set maximum quality video encoding before creating offer
        try {
          const senders = pc.getSenders()
          for (const sender of senders) {
            if (sender.track && sender.track.kind === 'video') {
              const params = sender.getParameters()
              if (!params.encodings) {
                params.encodings = [{}]
              }
              // Get current video settings to determine optimal bitrate
              const videoSettings = sender.track?.getSettings() || {}
              const width = videoSettings.width || 1920
              const height = videoSettings.height || 1080
              
              let maxBitrate = 4000000 // Default 4 Mbps for 1080p
              if (width >= 2560 || height >= 1440) {
                maxBitrate = 8000000 // 8 Mbps for 1440p/4K
              } else if (width >= 1920 || height >= 1080) {
                maxBitrate = 4000000 // 4 Mbps for 1080p
              }
              
              params.encodings[0] = {
                ...params.encodings[0],
                maxBitrate: maxBitrate,
                minBitrate: Math.floor(maxBitrate * 0.5),
                maxFramerate: 60,
                scaleResolutionDownBy: 1.0,
                networkPriority: 'high'
              }
              await sender.setParameters(params)
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not set encoding before offer:', error)
        }
        
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        
        // Set local description without modifying SDP (SDP modification was causing parse errors)
        await pc.setLocalDescription(offer)
        
        socket.emit('webrtc-offer', {
          offer: offer,
          to: remoteId
        })
        console.log('✅ Offer sent')
      }
    } catch (error) {
      console.error('❌ Error creating peer connection:', error)
    }
  }

  // Handle partner disconnected
  const handlePartnerDisconnected = () => {
    setStatus('disconnected')
    setPartnerId(null)
    partnerIdRef.current = null
    setReportFeedback(null)
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }

  // Skip current partner
  const handleSkip = () => {
    if (banInfoRef.current?.isBanned) return
    socket.emit('skip-partner')
    handlePartnerDisconnected()
  }

  // Stop chat and return to welcome
  const handleStop = () => {
    if (banInfoRef.current?.isBanned) return
    socket.emit('stop-search')
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    window.location.reload()
  }

  const openReportModal = async () => {
    setReportFeedback(null)
    setReportError(null)
    setShowReportModal(true)
    if (typeof refreshBackendToken === 'function') {
      const existingToken = user?.token || localStorage.getItem('token')
      if (!existingToken) {
        await refreshBackendToken()
      }
    }
  }

  const closeReportModal = () => {
    setShowReportModal(false)
    setReportSubmitting(false)
  }

  const handleReportSubmit = async (event) => {
    event.preventDefault()

    if (!partnerIdRef.current) {
      setReportError('Partner disconnected. Try reporting from your recent history if needed.')
      return
    }

    let authToken = user?.token || localStorage.getItem('token')

    if (!authToken && typeof refreshBackendToken === 'function') {
      authToken = await refreshBackendToken()
    }

    if (!authToken) {
      setReportError('We could not verify your login. Please refresh the page and try again.')
      return
    }

    setReportSubmitting(true)
    setReportFeedback(null)
    setReportError(null)

    try {
      const response = await fetch(`${API_BASE}/api/moderation/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          reportedSocketId: partnerIdRef.current,
          reason: reportReason,
          details: reportDetails.trim() || undefined
        })
      })

      const result = await response.json()

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Failed to send report. Please try again later.')
      }

      setReportFeedback(result.message || 'Report submitted. Thanks for helping keep the community safe!')
      setReportDetails('')
      setShowReportModal(false)
    } catch (error) {
      console.error('Failed to submit report:', error)
      setReportError(error.message || 'Unexpected error while submitting report.')
    } finally {
      setReportSubmitting(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // Toggle video (but warn if trying to turn off)
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        // If trying to turn OFF video, show warning
        if (videoTrack.enabled) {
          setShowVideoWarning(true)
          
          // Auto-hide warning after 3 seconds
          setTimeout(() => {
            setShowVideoWarning(false)
          }, 3000)
          
          // Don't actually turn off the video - it's mandatory!
          return
        }
        
        // Allow turning video back ON
        videoTrack.enabled = true
        setIsVideoOff(false)
      }
    }
  }

  // Send message
  const sendMessage = (message) => {
    if (partnerId && message.trim()) {
      socket.emit('chat-message', {
        message: message.trim(),
        to: partnerId
      })
      setMessages(prev => [...prev, { text: message.trim(), sender: 'me', timestamp: Date.now() }])
    }
  }

  // Handle typing
  const handleTyping = (isTyping) => {
    if (partnerId) {
      socket.emit('typing', { to: partnerId, isTyping })
    }
  }

  // Drag handlers for local video
  const handleMouseDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    
    setIsDragging(true)
    dragRef.current = {
      startX: clientX - videoPosition.x,
      startY: videoPosition.bottom !== null 
        ? window.innerHeight - videoPosition.bottom - clientY
        : clientY - videoPosition.y
    }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    
    const newX = clientX - dragRef.current.startX
    const newY = clientY - dragRef.current.startY

    // Get video dimensions
    const videoWidth = 240
    const videoHeight = 180

    // Constrain within viewport
    const maxX = window.innerWidth - videoWidth - 20
    const maxY = window.innerHeight - videoHeight - 20

    const constrainedX = Math.max(20, Math.min(newX, maxX))
    const constrainedY = Math.max(20, Math.min(newY, maxY))

    setVideoPosition({
      x: constrainedX,
      y: constrainedY,
      bottom: null
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add/remove mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove)
      document.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Close country filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCountryFilter && !e.target.closest('.country-filter-container')) {
        setShowCountryFilter(false)
      }
    }

    if (showCountryFilter) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCountryFilter])
  
  // Update selectedCountry when preferences change
  useEffect(() => {
    if (preferences?.country) {
      setSelectedCountry(preferences.country)
    }
  }, [preferences?.country])


  // Initialize face tracking with TensorFlow.js - COMMENTED OUT
  /* const initFaceTracking = async (stream) => {
    if (!window.faceLandmarksDetection) {
      console.error('TensorFlow.js Face Landmarks Detection not loaded')
      // Fallback to static position
      setFacePosition({
        x: 80,
        y: 40,
        width: 80,
        height: 100,
        angle: 0,
        leftEye: { x: 0.35, y: 0.4 },
        rightEye: { x: 0.65, y: 0.4 },
        nose: { x: 0.5, y: 0.55 },
        mouth: { x: 0.5, y: 0.7 }
      })
      return
    }

    try {
      const model = await window.faceLandmarksDetection.load(
        window.faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { maxFaces: 1 }
      )

      faceDetectionRef.current = model

      // Create canvas for video processing
      const video = localVideoRef.current
      if (!video || !canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Set canvas size to match video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      // Process video frames
      const processFrame = async () => {
        if (!video || video.readyState !== 4) {
          if (animationFrameRef.current) {
            requestAnimationFrame(processFrame)
          }
          return
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Detect face
        const faces = await model.estimateFaces({
          input: canvas,
          returnTensors: false,
          flipHorizontal: false,
          staticImageMode: false
        })

        if (faces.length > 0) {
          const face = faces[0]
          const keypoints = face.keypoints

          // Find key facial points
          const leftEye = keypoints.find(kp => kp.name === 'leftEye')
          const rightEye = keypoints.find(kp => kp.name === 'rightEye')
          const noseTip = keypoints.find(kp => kp.name === 'noseTip')
          const mouthCenter = keypoints.find(kp => kp.name === 'mouthCenter')

          // Calculate face bounding box
          const box = face.box
          
          const facePos = {
            x: box.xMin * canvas.width,
            y: box.yMin * canvas.height,
            width: (box.xMax - box.xMin) * canvas.width,
            height: (box.yMax - box.yMin) * canvas.height,
            angle: 0,
            leftEye: leftEye ? { x: leftEye.x / canvas.width, y: leftEye.y / canvas.height } : null,
            rightEye: rightEye ? { x: rightEye.x / canvas.width, y: rightEye.y / canvas.height } : null,
            nose: noseTip ? { x: noseTip.x / canvas.width, y: noseTip.y / canvas.height } : null,
            mouth: mouthCenter ? { x: mouthCenter.x / canvas.width, y: mouthCenter.y / canvas.height } : null
          }
          
          setFacePosition(facePos)
          
          // Draw filter on canvas (so other person can see it)
          drawFilterOnCanvas(ctx, canvas, facePos, currentFilter)
        } else {
          setFacePosition(null)
        }

        // Continue processing
        if (animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(processFrame)
        }
      }

      // Start processing
      animationFrameRef.current = requestAnimationFrame(processFrame)

      // Get processed stream from canvas for WebRTC
      const processedStream = canvas.captureStream(30)
      processedStreamRef.current = processedStream

      // Update WebRTC stream
      if (peerConnectionRef.current) {
        const videoTrack = processedStream.getVideoTracks()[0]
        if (videoTrack) {
          peerConnectionRef.current.getSenders().forEach(sender => {
            if (sender.track && sender.track.kind === 'video') {
              sender.replaceTrack(videoTrack)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error initializing face tracking:', error)
      // Fallback to static position
      setFacePosition({
        x: 80,
        y: 40,
        width: 80,
        height: 100,
        angle: 0,
        leftEye: { x: 0.35, y: 0.4 },
        rightEye: { x: 0.65, y: 0.4 },
        nose: { x: 0.5, y: 0.55 },
        mouth: { x: 0.5, y: 0.7 }
      })
    }
  } */

  // Draw filter on canvas - COMMENTED OUT
  /* const drawFilterOnCanvas = (ctx, canvas, facePos, filterType) => {
    if (!facePos) return

    ctx.save()

    try {
      switch(filterType) {
        case 'eyemask':
          if (facePos.leftEye && facePos.rightEye) {
            // Draw eye mask
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
            ctx.beginPath()
            ctx.ellipse(facePos.leftEye.x * canvas.width, facePos.leftEye.y * canvas.height, 18, 12, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.ellipse(facePos.rightEye.x * canvas.width, facePos.rightEye.y * canvas.height, 18, 12, 0, 0, Math.PI * 2)
            ctx.fill()
            // Bridge
            if (facePos.nose) {
              ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'
              ctx.beginPath()
              ctx.arc(facePos.nose.x * canvas.width, facePos.nose.y * canvas.height, 6, 0, Math.PI * 2)
              ctx.fill()
            }
          }
          break
          
        case 'sunglasses':
          if (facePos.leftEye && facePos.rightEye) {
            // Draw sunglasses
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)')
            gradient.addColorStop(1, 'rgba(20, 20, 20, 0.9)')
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.ellipse(facePos.leftEye.x * canvas.width, facePos.leftEye.y * canvas.height, 20, 11, -2, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.ellipse(facePos.rightEye.x * canvas.width, facePos.rightEye.y * canvas.height, 20, 11, 2, 0, Math.PI * 2)
            ctx.fill()
            // Bridge
            if (facePos.nose) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
              ctx.beginPath()
              ctx.arc(facePos.nose.x * canvas.width, facePos.nose.y * canvas.height, 7, 0, Math.PI * 2)
              ctx.fill()
            }
          }
          break
          
        case 'medicalmask':
          if (facePos.mouth) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
            ctx.beginPath()
            ctx.ellipse(facePos.mouth.x * canvas.width, (facePos.mouth.y * canvas.height) + 20, facePos.width * 0.35, facePos.height * 0.15, 0, 0, Math.PI * 2)
            ctx.fill()
          }
          break
          
        case 'bandana':
          ctx.fillStyle = 'rgba(139, 0, 0, 0.9)'
          ctx.beginPath()
          ctx.moveTo(facePos.x, facePos.y)
          ctx.lineTo(facePos.x + facePos.width, facePos.y)
          ctx.lineTo(facePos.x + facePos.width * 0.9, facePos.y + facePos.height * 0.4)
          ctx.lineTo(facePos.x + facePos.width * 0.1, facePos.y + facePos.height * 0.4)
          ctx.closePath()
          ctx.fill()
          break
          
        case 'catears':
          // Left ear
          ctx.fillStyle = '#ff69b4'
          ctx.beginPath()
          ctx.moveTo(facePos.x + facePos.width * 0.2, facePos.y)
          ctx.lineTo(facePos.x + facePos.width * 0.35, facePos.y - facePos.height * 0.2)
          ctx.lineTo(facePos.x + facePos.width * 0.3, facePos.y + facePos.height * 0.1)
          ctx.closePath()
          ctx.fill()
          // Right ear
          ctx.beginPath()
          ctx.moveTo(facePos.x + facePos.width * 0.8, facePos.y)
          ctx.lineTo(facePos.x + facePos.width * 0.65, facePos.y - facePos.height * 0.2)
          ctx.lineTo(facePos.x + facePos.width * 0.7, facePos.y + facePos.height * 0.1)
          ctx.closePath()
          ctx.fill()
          break
          
        case 'crown':
          ctx.fillStyle = '#ffd700'
          const crownX = facePos.x + facePos.width * 0.2
          const crownY = facePos.y - facePos.height * 0.2
          ctx.fillRect(crownX, crownY, facePos.width * 0.6, facePos.height * 0.2)
          // Spikes
          for (let i = 0; i < 5; i++) {
            ctx.beginPath()
            ctx.moveTo(crownX + (facePos.width * 0.6 * i / 4), crownY)
            ctx.lineTo(crownX + (facePos.width * 0.6 * (i + 0.5) / 4), crownY - facePos.height * 0.15)
            ctx.lineTo(crownX + (facePos.width * 0.6 * (i + 1) / 4), crownY)
            ctx.closePath()
            ctx.fill()
          }
          break
          
        default:
          break
      }
    } catch (error) {
      console.error('Error drawing filter:', error)
    }

    ctx.restore()
  } */

  // Calculate face bounding box from landmarks - COMMENTED OUT
  /* const calculateFaceBox = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return null

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    landmarks.forEach(landmark => {
      minX = Math.min(minX, landmark.x)
      minY = Math.min(minY, landmark.y)
      maxX = Math.max(maxX, landmark.x)
      maxY = Math.max(maxY, landmark.y)
    })

    const video = localVideoRef.current
    if (!video) return null

    const width = video.videoWidth || 640
    const height = video.videoHeight || 480

    return {
      x: minX * width,
      y: minY * height,
      width: (maxX - minX) * width,
      height: (maxY - minY) * height,
      angle: 0
    }
  } */

  // Update face tracking when filter changes - COMMENTED OUT
  /* useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      if (currentFilter !== 'none') {
        // Wait a bit for video to load
        setTimeout(() => {
          initFaceTracking(localStreamRef.current)
        }, 500)
      } else {
        // Stop face tracking
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        if (faceDetectionRef.current) {
          faceDetectionRef.current = null
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
        }
        if (processedStreamRef.current) {
          processedStreamRef.current.getTracks().forEach(track => track.stop())
          processedStreamRef.current = null
        }
        setFacePosition(null)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [currentFilter]) */

  return (
    <div className="video-chat">
      <div className="video-container">
        <div className="videos-grid">
          {/* Remote video */}
          <div className="video-wrapper remote-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="video"
              onLoadedMetadata={() => {
                console.log('✅ Remote video metadata loaded')
                if (remoteVideoRef.current) {
                  console.log('📹 Remote video dimensions:', {
                    videoWidth: remoteVideoRef.current.videoWidth,
                    videoHeight: remoteVideoRef.current.videoHeight,
                    readyState: remoteVideoRef.current.readyState
                  })
                }
              }}
              onLoadedData={() => {
                console.log('✅ Remote video data loaded')
              }}
              onCanPlay={() => {
                console.log('✅ Remote video can play')
              }}
              onPlaying={() => {
                console.log('▶️ Remote video is playing!')
              }}
              onError={(e) => {
                console.error('❌ Remote video error:', e)
                console.error('❌ Video error code:', remoteVideoRef.current?.error)
              }}
            />
            {/* TV Static Effect - Like Omegle/OmeTV */}
            {(status === 'searching' || status === 'connecting') && (
              <div className="tv-static"></div>
            )}
            {status === 'searching' && (
              <div className="status-overlay">
                <div className="spinner"></div>
                <h2>Searching for Partner</h2>
                <p>Matching in progress...</p>
              </div>
            )}
            {status === 'connecting' && (
              <div className="status-overlay">
                <div className="spinner fast"></div>
                <h2>Partner Found</h2>
                <p>Establishing connection...</p>
              </div>
            )}
            {status === 'connected' && partnerCountry && partnerCountry !== 'Unknown' && partnerCountry !== 'ANY' && (
              <div className="country-badge">
                <span className="country-flag">{getCountryFlag(partnerCountry)}</span>
                <span className="country-name">{partnerCountry}</span>
              </div>
            )}
            {status === 'disconnected' && (
              <div className="status-overlay">
                <h2>Partner Disconnected</h2>
                <p>Searching for a new partner...</p>
              </div>
            )}
            {status === 'banned' && (
              <div className="status-overlay banned">
                <AlertOctagon size={48} />
                <h2>Account Suspended</h2>
                <p>{banInfo?.message || 'You have been temporarily banned for violating community guidelines.'}</p>
                {banInfo?.banReason && (
                  <p className="ban-reason">Reason: {banInfo.banReason}</p>
                )}
                {banInfo?.bannedUntil && (
                  <div className="ban-timer">
                    <Clock size={18} />
                    <span>Ban lifts {formatBanDate(banInfo.bannedUntil)}</span>
                  </div>
                )}
              </div>
            )}
            {status === 'connected' && (
              <div className="connection-indicator">
                <div className="pulse-dot"></div>
                <span>Connected</span>
              </div>
            )}
          </div>

          {/* Local video */}
          <div 
            className={`video-wrapper local-video ${isDragging ? 'dragging' : ''}`}
            style={{
              left: `${videoPosition.x}px`,
              top: videoPosition.y !== null ? `${videoPosition.y}px` : 'auto',
              bottom: videoPosition.bottom !== null ? `${videoPosition.bottom}px` : 'auto',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="video"
            />
            {/* Canvas for face tracking - COMMENTED OUT */}
            {/* <canvas
              ref={canvasRef}
              className="video"
              style={{ 
                display: 'none',
                objectFit: 'cover'
              }}
            /> */}
            {/* Filter Overlays - REMOVED */}
            {/* {currentFilter !== 'none' && facePosition && (
              <div className={`filter-overlay filter-${currentFilter}`} style={{
                transform: `translate(${facePosition.x - (localVideoRef.current?.offsetWidth || 240) * 0.35}px, ${facePosition.y - (localVideoRef.current?.offsetHeight || 180) * 0.2}px) scale(${facePosition.width / ((localVideoRef.current?.offsetWidth || 240) * 0.7)})`,
                transformOrigin: 'center center'
              }}>
                {currentFilter === 'eyemask' && facePosition.leftEye && facePosition.rightEye && (
                  <>
                    <div className="eye-mask-left" style={{
                      left: `${(facePosition.leftEye.x * (localVideoRef.current?.offsetWidth || 240)) - 15}px`,
                      top: `${(facePosition.leftEye.y * (localVideoRef.current?.offsetHeight || 180)) - 10}px`
                    }}></div>
                    <div className="eye-mask-right" style={{
                      right: `${(localVideoRef.current?.offsetWidth || 240) - (facePosition.rightEye.x * (localVideoRef.current?.offsetWidth || 240)) - 15}px`,
                      top: `${(facePosition.rightEye.y * (localVideoRef.current?.offsetHeight || 180)) - 10}px`
                    }}></div>
                    <div className="eye-mask-bridge" style={{
                      left: `${(facePosition.nose.x * (localVideoRef.current?.offsetWidth || 240)) - 6}px`,
                      top: `${(facePosition.nose.y * (localVideoRef.current?.offsetHeight || 180)) - 3}px`
                    }}></div>
                  </>
                )}
                {currentFilter === 'sunglasses' && facePosition.leftEye && facePosition.rightEye && (
                  <>
                    <div className="sunglass-left" style={{
                      left: `${(facePosition.leftEye.x * (localVideoRef.current?.offsetWidth || 240)) - 18}px`,
                      top: `${(facePosition.leftEye.y * (localVideoRef.current?.offsetHeight || 180)) - 11}px`
                    }}></div>
                    <div className="sunglass-right" style={{
                      right: `${(localVideoRef.current?.offsetWidth || 240) - (facePosition.rightEye.x * (localVideoRef.current?.offsetWidth || 240)) - 18}px`,
                      top: `${(facePosition.rightEye.y * (localVideoRef.current?.offsetHeight || 180)) - 11}px`
                    }}></div>
                    <div className="sunglass-bridge" style={{
                      left: `${(facePosition.nose.x * (localVideoRef.current?.offsetWidth || 240)) - 7}px`,
                      top: `${(facePosition.nose.y * (localVideoRef.current?.offsetHeight || 180)) - 2}px`
                    }}></div>
                  </>
                )}
                {currentFilter === 'medicalmask' && facePosition.mouth && (
                  <>
                    <div className="medical-mask" style={{
                      left: `${(facePosition.mouth.x * (localVideoRef.current?.offsetWidth || 240)) - (facePosition.width * 0.35)}px`,
                      bottom: `${(localVideoRef.current?.offsetHeight || 180) - (facePosition.mouth.y * (localVideoRef.current?.offsetHeight || 180)) + (facePosition.height * 0.1)}px`,
                      width: `${facePosition.width * 0.7}px`,
                      height: `${facePosition.height * 0.3}px`
                    }}></div>
                    <div className="medical-mask-strap-left" style={{
                      left: `${(facePosition.mouth.x * (localVideoRef.current?.offsetWidth || 240)) - (facePosition.width * 0.5)}px`,
                      top: `${(facePosition.mouth.y * (localVideoRef.current?.offsetHeight || 180))}px`
                    }}></div>
                    <div className="medical-mask-strap-right" style={{
                      right: `${(localVideoRef.current?.offsetWidth || 240) - (facePosition.mouth.x * (localVideoRef.current?.offsetWidth || 240)) - (facePosition.width * 0.5)}px`,
                      top: `${(facePosition.mouth.y * (localVideoRef.current?.offsetHeight || 180))}px`
                    }}></div>
                  </>
                )}
                {currentFilter === 'bandana' && (
                  <div className="bandana-mask" style={{
                    left: `${facePosition.x - facePosition.width * 0.05}px`,
                    top: `${facePosition.y - facePosition.height * 0.3}px`,
                    width: `${facePosition.width * 1.1}px`,
                    height: `${facePosition.height * 0.6}px`
                  }}></div>
                )}
                {currentFilter === 'catears' && (
                  <>
                    <div className="cat-ear-left" style={{
                      left: `${facePosition.x + facePosition.width * 0.2}px`,
                      top: `${facePosition.y - facePosition.height * 0.2}px`
                    }}></div>
                    <div className="cat-ear-right" style={{
                      right: `${(localVideoRef.current?.offsetWidth || 240) - facePosition.x - facePosition.width * 0.8}px`,
                      top: `${facePosition.y - facePosition.height * 0.2}px`
                    }}></div>
                  </>
                )}
                {currentFilter === 'dogears' && (
                  <>
                    <div className="dog-ear-left" style={{
                      left: `${facePosition.x + facePosition.width * 0.18}px`,
                      top: `${facePosition.y - facePosition.height * 0.15}px`
                    }}></div>
                    <div className="dog-ear-right" style={{
                      right: `${(localVideoRef.current?.offsetWidth || 240) - facePosition.x - facePosition.width * 0.82}px`,
                      top: `${facePosition.y - facePosition.height * 0.15}px`
                    }}></div>
                    {facePosition.mouth && (
                      <div className="dog-tongue" style={{
                        left: `${(facePosition.mouth.x * (localVideoRef.current?.offsetWidth || 240)) - (facePosition.width * 0.125)}px`,
                        bottom: `${(localVideoRef.current?.offsetHeight || 180) - (facePosition.mouth.y * (localVideoRef.current?.offsetHeight || 180)) + (facePosition.height * 0.1)}px`,
                        width: `${facePosition.width * 0.25}px`,
                        height: `${facePosition.height * 0.15}px`
                      }}></div>
                    )}
                  </>
                )}
                {currentFilter === 'crown' && (
                  <div className="crown-filter" style={{
                    left: `${facePosition.x + facePosition.width * 0.2}px`,
                    top: `${facePosition.y - facePosition.height * 0.3}px`,
                    width: `${facePosition.width * 0.6}px`,
                    height: `${facePosition.height * 0.3}px`
                  }}></div>
                )}
                {currentFilter === 'party' && (
                  <>
                    <div className="party-confetti confetti-1"></div>
                    <div className="party-confetti confetti-2"></div>
                    <div className="party-confetti confetti-3"></div>
                    <div className="party-confetti confetti-4"></div>
                    <div className="party-hat" style={{
                      left: `${facePosition.x + facePosition.width * 0.25}px`,
                      top: `${facePosition.y - facePosition.height * 0.2}px`,
                      width: `${facePosition.width * 0.5}px`,
                      height: `${facePosition.height * 0.25}px`
                    }}></div>
                  </>
                )}
                {currentFilter === 'alien' && (
                  <>
                    <div className="alien-head" style={{
                      left: `${facePosition.x - facePosition.width * 0.15}px`,
                      top: `${facePosition.y - facePosition.height * 0.1}px`,
                      width: `${facePosition.width * 1.3}px`,
                      height: `${facePosition.height * 1.2}px`
                    }}></div>
                    {facePosition.leftEye && (
                      <div className="alien-eye-left" style={{
                        left: `${(facePosition.leftEye.x * (localVideoRef.current?.offsetWidth || 240)) - (facePosition.width * 0.09)}px`,
                        top: `${(facePosition.leftEye.y * (localVideoRef.current?.offsetHeight || 180)) - (facePosition.height * 0.125)}px`,
                        width: `${facePosition.width * 0.18}px`,
                        height: `${facePosition.height * 0.25}px`
                      }}></div>
                    )}
                    {facePosition.rightEye && (
                      <div className="alien-eye-right" style={{
                        right: `${(localVideoRef.current?.offsetWidth || 240) - (facePosition.rightEye.x * (localVideoRef.current?.offsetWidth || 240)) - (facePosition.width * 0.09)}px`,
                        top: `${(facePosition.rightEye.y * (localVideoRef.current?.offsetHeight || 180)) - (facePosition.height * 0.125)}px`,
                        width: `${facePosition.width * 0.18}px`,
                        height: `${facePosition.height * 0.25}px`
                      }}></div>
                    )}
                  </>
                )}
              </div>
            )} */}
            <div className="local-label">You</div>
            {isVideoOff && (
              <div className="video-off-overlay">
                <VideoOff size={48} />
              </div>
            )}
          </div>
        </div>

        {/* Video Warning Message */}
        {showVideoWarning && (
          <div className="video-warning">
            <div className="warning-content">
              <VideoIcon size={32} />
              <h3>Camera Required</h3>
              <p>Video is required on this platform to ensure authenticity and safety for all users.</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          <button 
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button 
            className={`control-btn video-required ${isVideoOff ? 'active' : ''}`}
            onClick={toggleVideo}
            title="Camera is required - cannot be turned off"
          >
            <VideoIcon size={24} />
            <span className="required-badge">Required</span>
          </button>

          {/* Country Filter Button */}
          <div className="country-filter-container">
            <button 
              className={`control-btn country-filter-btn ${selectedCountry !== 'ANY' ? 'active-filter' : ''}`}
              onClick={() => setShowCountryFilter(!showCountryFilter)}
              title="Filter by Country"
            >
              <MapPin size={24} />
              {selectedCountry !== 'ANY' && (
                <span className="country-filter-badge">
                  {COUNTRIES.find(c => c.code === selectedCountry)?.flag || '🌍'}
                </span>
              )}
            </button>
            
            {showCountryFilter && (
              <div className="country-filter-dropdown">
                <div className="country-filter-header">
                  <MapPin size={18} />
                  <span>Select Country</span>
                </div>
                <div className="country-filter-list">
                  {COUNTRIES.map(country => (
                    <button
                      key={country.code}
                      className={`country-filter-option ${selectedCountry === country.code ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCountry(country.code)
                        setShowCountryFilter(false)
                        // Re-search with new country
                        if (socket && localStreamRef.current) {
                          socket.emit('stop-search')
                          setTimeout(() => {
                            socket.emit('start-search', {
                              gender: preferences?.myGender || 'other',
                              country: country.code,
                              interests: preferences?.interests || [],
                              preferences: {
                                gender: preferences?.gender || 'any',
                                country: country.code
                              }
                            })
                            setStatus('searching')
                          }, 300)
                        }
                      }}
                    >
                      <span className="country-flag-small">{country.flag}</span>
                      <span className="country-name-small">{country.name}</span>
                      {selectedCountry === country.code && (
                        <span className="check-mark">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="control-btn report-btn"
            onClick={openReportModal}
            disabled={status !== 'connected' || !partnerId}
            title="Report inappropriate behavior"
          >
            <Flag size={22} />
          </button>

          <button 
            className="control-btn skip-btn"
            onClick={handleSkip}
            disabled={status !== 'connected'}
            title="Skip to next person"
          >
            <SkipForward size={24} />
          </button>

          <button 
            className="control-btn stop-btn"
            onClick={handleStop}
            title="Stop chatting"
          >
            <X size={24} />
          </button>
        </div>

        {reportFeedback && (
          <div className="report-feedback">
            <Flag size={16} />
            <span>{reportFeedback}</span>
          </div>
        )}
      </div>

      {/* Chat box */}
      <ChatBox
        messages={messages}
        onSendMessage={sendMessage}
        onTyping={handleTyping}
        partnerTyping={partnerTyping}
        isConnected={status === 'connected'}
      />

      {showReportModal && (
        <div className="report-modal-overlay" onClick={closeReportModal}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="report-close" onClick={closeReportModal}>
              <X size={20} />
            </button>
            <div className="report-header">
              <AlertOctagon size={32} />
              <h3>Report Partner</h3>
              <p>Flag inappropriate behavior. Reports remain anonymous.</p>
            </div>

            {reportError && (
              <div className="report-error">{reportError}</div>
            )}

            <form className="report-form" onSubmit={handleReportSubmit}>
              <label htmlFor="report-reason">Reason</label>
              <select
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                {REPORT_REASONS.map((reasonOption) => (
                  <option key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </option>
                ))}
              </select>

              <label htmlFor="report-details">Details (optional)</label>
              <textarea
                id="report-details"
                rows={4}
                placeholder="Share what happened. Details help our moderation team."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />

              <button type="submit" className="report-submit" disabled={reportSubmitting}>
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoChat

