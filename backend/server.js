require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
};

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibechat';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Matching Queue (in-memory)
const matchingQueue = [];
const activeChats = new Map();
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS) || 10000;

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    stats: {
      waitingUsers: matchingQueue.length,
      activeChats: activeChats.size,
      totalUsers: io.engine.clientsCount
    }
  });
});

// Stats Endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    waitingUsers: matchingQueue.length,
    activeChats: activeChats.size,
    totalUsers: io.engine.clientsCount,
    activeConnections: io.engine.clientsCount,
    maxConnections: MAX_CONNECTIONS
  });
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Check server capacity
  if (io.engine.clientsCount > MAX_CONNECTIONS) {
    socket.emit('server-full', { 
      message: 'Server is at maximum capacity. Please try again later.' 
    });
    socket.disconnect();
    return;
  }

  // Join matching queue
  socket.on('start-search', (preferences) => {
    console.log('🔍 User searching for partner:', socket.id);
    
    // Check if there's a matching partner
    const partnerIndex = matchingQueue.findIndex(user => 
      user.socketId !== socket.id && 
      isMatchCompatible(user.preferences, preferences)
    );

    if (partnerIndex !== -1) {
      // Partner found
      const partner = matchingQueue.splice(partnerIndex, 1)[0];
      const partnerSocket = io.sockets.sockets.get(partner.socketId);

      if (partnerSocket && partnerSocket.connected) {
        // Create chat session
        const chatId = `${socket.id}-${partner.socketId}`;
        activeChats.set(chatId, {
          user1: socket.id,
          user2: partner.socketId,
          startTime: Date.now()
        });

        // Notify both users
        socket.emit('match-found', { 
          partnerId: partner.socketId,
          isInitiator: true 
        });
        partnerSocket.emit('match-found', { 
          partnerId: socket.id,
          isInitiator: false 
        });

        console.log('✅ Match found:', chatId);
      } else {
        // Partner disconnected, add to queue
        matchingQueue.push({
          socketId: socket.id,
          preferences: preferences,
          joinTime: Date.now()
        });
        socket.emit('searching');
      }
    } else {
      // No partner found, add to queue
      matchingQueue.push({
        socketId: socket.id,
        preferences: preferences,
        joinTime: Date.now()
      });
      socket.emit('searching');
    }
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', (data) => {
    const { targetId, offer } = data;
    io.to(targetId).emit('webrtc-offer', {
      offer,
      senderId: socket.id
    });
  });

  socket.on('webrtc-answer', (data) => {
    const { targetId, answer } = data;
    io.to(targetId).emit('webrtc-answer', {
      answer,
      senderId: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    const { targetId, candidate } = data;
    io.to(targetId).emit('ice-candidate', {
      candidate,
      senderId: socket.id
    });
  });

  // Chat messaging
  socket.on('chat-message', (data) => {
    const { targetId, message } = data;
    io.to(targetId).emit('chat-message', {
      message,
      senderId: socket.id
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { targetId, isTyping } = data;
    io.to(targetId).emit('partner-typing', { isTyping });
  });

  // Skip partner
  socket.on('skip-partner', () => {
    // Find and end current chat
    for (const [chatId, chat] of activeChats.entries()) {
      if (chat.user1 === socket.id || chat.user2 === socket.id) {
        const partnerId = chat.user1 === socket.id ? chat.user2 : chat.user1;
        const partnerSocket = io.sockets.sockets.get(partnerId);
        
        if (partnerSocket && partnerSocket.connected) {
          partnerSocket.emit('partner-disconnected');
        }
        
        activeChats.delete(chatId);
        console.log('🔄 Chat ended:', chatId);
        break;
      }
    }
  });

  // Stop searching
  socket.on('stop-search', () => {
    const queueIndex = matchingQueue.findIndex(user => user.socketId === socket.id);
    if (queueIndex !== -1) {
      matchingQueue.splice(queueIndex, 1);
      console.log('🛑 User stopped searching:', socket.id);
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);

    // Remove from matching queue
    const queueIndex = matchingQueue.findIndex(user => user.socketId === socket.id);
    if (queueIndex !== -1) {
      matchingQueue.splice(queueIndex, 1);
    }

    // End active chats
    for (const [chatId, chat] of activeChats.entries()) {
      if (chat.user1 === socket.id || chat.user2 === socket.id) {
        const partnerId = chat.user1 === socket.id ? chat.user2 : chat.user1;
        const partnerSocket = io.sockets.sockets.get(partnerId);
        
        if (partnerSocket && partnerSocket.connected) {
          partnerSocket.emit('partner-disconnected');
        }
        
        activeChats.delete(chatId);
        console.log('🔄 Chat ended due to disconnect:', chatId);
      }
    }
  });
});

// Helper function for matching compatibility
function isMatchCompatible(pref1, pref2) {
  if (!pref1 || !pref2) return true;
  
  // Gender preference check
  if (pref1.gender !== 'any' && pref2.myGender !== pref1.gender) return false;
  if (pref2.gender !== 'any' && pref1.myGender !== pref2.gender) return false;
  
  // Country preference check
  if (pref1.country !== 'ANY' && pref2.country !== pref1.country) return false;
  if (pref2.country !== 'ANY' && pref1.country !== pref2.country) return false;
  
  return true;
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('✨ VibeChat Server Running ✨');
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`Max Connections: ${MAX_CONNECTIONS}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
