import { useState, useEffect, useRef } from 'react'
import { Send, X, MessageCircle } from 'lucide-react'
import './ChatBox.css'

function ChatBox({ messages, onSendMessage, onTyping, partnerTyping, isConnected }) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)

    // Emit typing indicator
    if (!isTyping) {
      setIsTyping(true)
      onTyping(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTyping(false)
    }, 1000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (inputValue.trim() && isConnected) {
      onSendMessage(inputValue)
      setInputValue('')
      setIsTyping(false)
      onTyping(false)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <>
      {/* Floating toggle button when minimized */}
      {isMinimized && (
        <button 
          className="chat-toggle-btn" 
          onClick={() => setIsMinimized(false)}
          title="Open Chat"
        >
          <MessageCircle size={24} />
          {messages.length > 0 && (
            <span className="chat-badge">{messages.length}</span>
          )}
        </button>
      )}
      
      {/* Chat box */}
      <div className={`chat-box ${isMinimized ? 'minimized' : ''}`}>
        <div className="chat-header">
          <h3>Chat</h3>
          <div className="chat-header-actions">
            {isConnected && (
              <div className="chat-status">
                <div className="status-dot"></div>
                <span>Online</span>
              </div>
            )}
            <button 
              className="minimize-btn" 
              onClick={() => setIsMinimized(true)}
              title="Minimize Chat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-messages">
            <p>No messages yet</p>
            <p className="hint">Say hi to your chat partner! 👋</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.sender === 'me' ? 'message-sent' : 'message-received'}`}
          >
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {partnerTyping && (
          <div className="message message-received">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder={isConnected ? "Type a message..." : "Wait for connection..."}
          value={inputValue}
          onChange={handleInputChange}
          disabled={!isConnected}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!isConnected || !inputValue.trim()}
        >
          <Send size={20} />
        </button>
      </form>
      </div>
    </>
  )
}

export default ChatBox

