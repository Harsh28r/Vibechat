import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { SkipForward, X, Mic, MicOff, Video as VideoIcon, VideoOff, Send } from 'lucide-react'
import './VideoChat.css'
import ChatBox from './ChatBox'

function VideoChat({ preferences }) {
  const socket = useSocket()
  const [status, setStatus] = useState('searching') // searching, connected, disconnected
  const [partnerId, setPartnerId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)

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

    const initMedia = async () => {
      try {
        console.log('📹 Requesting camera and microphone access...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })

        console.log('✅ Media access granted')
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Start searching for partner with preferences
        console.log('🔍 Emitting start-search event with preferences...')
        socket.emit('start-search', {
          gender: preferences?.myGender || 'other',
          country: preferences?.country || 'ANY',
          interests: preferences?.interests || [],
          preferences: {
            gender: preferences?.gender || 'any',
            country: preferences?.country || 'ANY'
          }
        })
        console.log('✅ start-search event emitted with preferences:', preferences)
      } catch (error) {
        console.error('❌ Error accessing media devices:', error)
        alert('📹 Please allow camera and microphone access to start vibing with people!')
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
  }, [socket])

  // Socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not ready for event listeners')
      return
    }

    console.log('🎧 Setting up socket event listeners')

    socket.on('searching', ({ message }) => {
      console.log('🔍', message)
      if (message.includes('Found someone')) {
        setStatus('connecting')
      } else {
        setStatus('searching')
      }
    })

    socket.on('match-found', async ({ partnerId: newPartnerId, sessionId }) => {
      console.log('🎯 Match found with:', newPartnerId)
      setPartnerId(newPartnerId)
      setStatus('connected')
      
      // Clear chat for new person
      setMessages([])
      console.log('💬 Chat cleared for new match')
      
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
      
      // Only create peer connection if we don't have one
      if (!peerConnectionRef.current) {
        console.log('🔧 Creating peer connection as answerer')
        await createPeerConnection(from, false)
      }
      
      try {
        console.log('📝 Setting remote description')
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
        
        console.log('💬 Creating answer')
        const answer = await peerConnectionRef.current.createAnswer()
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
      setTimeout(() => {
        socket.emit('start-search', { country: 'Unknown' })
        setStatus('searching')
      }, 1000)
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
    }
  }, [socket])

  // Create peer connection
  const createPeerConnection = async (remoteId, isOfferer) => {
    try {
      console.log('🔧 Creating new RTCPeerConnection')
      const pc = new RTCPeerConnection(iceServers)
      peerConnectionRef.current = pc

      // Add local stream tracks to peer connection
      if (localStreamRef.current) {
        console.log('📹 Adding local tracks to peer connection')
        localStreamRef.current.getTracks().forEach(track => {
          console.log('➕ Adding track:', track.kind)
          pc.addTrack(track, localStreamRef.current)
        })
      } else {
        console.error('❌ No local stream available!')
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log('✅ Received remote track:', event.track.kind)
        if (remoteVideoRef.current && event.streams[0]) {
          console.log('📺 Setting remote video stream')
          remoteVideoRef.current.srcObject = event.streams[0]
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
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.log('❌ Peer connection failed/disconnected')
          handlePartnerDisconnected()
        }
      }

      // Monitor ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState)
      }

      // If we're the offerer, create and send offer
      if (isOfferer) {
        console.log('📤 Creating and sending offer to:', remoteId)
        const offer = await pc.createOffer()
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
    socket.emit('skip-partner')
    handlePartnerDisconnected()
  }

  // Stop chat and return to welcome
  const handleStop = () => {
    socket.emit('stop-search')
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    window.location.reload()
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

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
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
              className="video"
            />
            {status === 'searching' && (
              <div className="status-overlay">
                <div className="spinner"></div>
                <h2>Searching for someone...</h2>
                <p>Please wait while we find you a chat partner</p>
              </div>
            )}
            {status === 'connecting' && (
              <div className="status-overlay">
                <div className="spinner"></div>
                <h2>Found someone! 🎉</h2>
                <p>Connecting you now...</p>
              </div>
            )}
            {status === 'disconnected' && (
              <div className="status-overlay">
                <h2>Partner Disconnected</h2>
                <p>Searching for a new partner...</p>
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
          <div className="video-wrapper local-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="video"
            />
            <div className="local-label">You</div>
            {isVideoOff && (
              <div className="video-off-overlay">
                <VideoOff size={48} />
              </div>
            )}
          </div>
        </div>

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
            className={`control-btn ${isVideoOff ? 'active' : ''}`}
            onClick={toggleVideo}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
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
      </div>

      {/* Chat box */}
      <ChatBox
        messages={messages}
        onSendMessage={sendMessage}
        onTyping={handleTyping}
        partnerTyping={partnerTyping}
        isConnected={status === 'connected'}
      />
    </div>
  )
}

export default VideoChat

