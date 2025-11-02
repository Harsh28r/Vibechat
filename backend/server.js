import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import geoip from 'geoip-lite';
import connectDB from './config/database.js';
import MatchingQueue from './utils/MatchingQueue.js';
import ChatSession from './models/ChatSession.js';
import User from './models/User.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import facebookRoutes from './routes/facebook.js';
import googleRoutes from './routes/google.js';
import firebaseRoutes from './routes/firebase.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: false
  },
  maxHttpBufferSize: 1e6, // 1MB
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true // Enable credentials for auth
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'vibechat-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', facebookRoutes);
app.use('/api/auth', googleRoutes);
app.use('/api/auth', firebaseRoutes);

// Initialize matching queue
const matchingQueue = new MatchingQueue();

// Auto-retry matching for waiting users every 1.5 seconds
setInterval(async () => {
  const waitingUsers = Array.from(matchingQueue.waitingUsers.entries());
  
  for (const [socketId, userData] of waitingUsers) {
    // Skip if recently tried
    if (Date.now() - userData.lastMatchAttempt < 1000) continue;
    
    const result = matchingQueue.findMatch(socketId, true);
    
    if (result.matched) {
      const { user1, user2 } = result;
      
      console.log(`⚡ Auto-matched: ${user1} <-> ${user2}`);
      
      // Notify users
      io.to(user1).emit('searching', { message: 'Found someone! Connecting...' });
      io.to(user2).emit('searching', { message: 'Found someone! Connecting...' });
      
      // Connect immediately
      setImmediate(async () => {
        try {
          await User.updateMany(
            { socketId: { $in: [user1, user2] } },
            { inChat: true, partnerId: user1 === socketId ? user2 : user1 }
          );

          const session = await ChatSession.create({
            user1,
            user2,
            startTime: Date.now()
          });

          // Get partner countries
          const user1Data = await User.findOne({ socketId: user1 });
          const user2Data = await User.findOne({ socketId: user2 });

          io.to(user1).emit('match-found', { 
            partnerId: user2, 
            sessionId: session._id,
            partnerCountry: user2Data?.country || 'Unknown'
          });
          io.to(user2).emit('match-found', { 
            partnerId: user1, 
            sessionId: session._id,
            partnerCountry: user1Data?.country || 'Unknown'
          });
        } catch (error) {
          console.error('Error in auto-match:', error);
        }
      });
    }
  }
}, 1500); // Check every 1.5 seconds for super fast matching

// Track active connections
let activeConnections = 0;
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS) || 10000;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: activeConnections,
    stats: matchingQueue.getStats()
  });
});

app.get('/api/stats', (req, res) => {
  const stats = matchingQueue.getStats();
  res.json({
    ...stats,
    activeConnections,
    maxConnections: MAX_CONNECTIONS
  });
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  activeConnections++;
  console.log(`🔌 New connection: ${socket.id} | Total: ${activeConnections}`);

  // Detect country from IP
  const clientIP = socket.handshake.address || socket.conn.remoteAddress || '127.0.0.1';
  const geo = geoip.lookup(clientIP);
  const detectedCountry = geo?.country || 'Unknown';
  console.log(`🌍 IP: ${clientIP} | Country: ${detectedCountry}`);

  // Check max connections
  if (activeConnections > MAX_CONNECTIONS) {
    socket.emit('server-full', { message: 'Server is at capacity. Please try again later.' });
    socket.disconnect();
    activeConnections--;
    return;
  }

  // User joins and starts searching
  socket.on('start-search', async (userData) => {
    try {
      console.log(`🔍 ${socket.id} started searching`);
      console.log('Preferences:', userData);
      
      // Add to database
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        {
          socketId: socket.id,
          isOnline: true,
          inChat: false,
          lastActive: Date.now(),
          country: userData?.country || detectedCountry || 'Unknown',
          gender: userData?.gender || 'other',
          interests: userData?.interests || [],
          preferences: {
            gender: userData?.preferences?.gender || 'any',
            country: userData?.preferences?.country || 'ANY'
          }
        },
        { upsert: true, new: true }
      );

      // Add to matching queue
      const result = matchingQueue.addToQueue(socket.id, userData);

      if (result.matched) {
        // Match found! Connect immediately for fast experience
        const { user1, user2 } = result;
        
        const stats = matchingQueue.getStats();
        console.log(`⚡ Instant match: ${user1} <-> ${user2}`);
        console.log(`📊 Queue Stats - Waiting: ${stats.waitingUsers}, Active Chats: ${stats.activeChats}`);
        
        // Notify users they're being matched (no delay!)
        io.to(user1).emit('searching', { message: 'Found someone! Connecting...' });
        io.to(user2).emit('searching', { message: 'Found someone! Connecting...' });
        
        // Connect immediately - no artificial delay!
        setImmediate(async () => {
          try {
            // Update both users in database
            await User.updateMany(
              { socketId: { $in: [user1, user2] } },
              { inChat: true, partnerId: user1 === socket.id ? user2 : user1 }
            );

            // Create chat session
            const session = await ChatSession.create({
              user1,
              user2,
              startTime: Date.now()
            });

            // Get partner countries
            const user1Data = await User.findOne({ socketId: user1 });
            const user2Data = await User.findOne({ socketId: user2 });

            // Notify both users immediately
            io.to(user1).emit('match-found', { 
              partnerId: user2, 
              sessionId: session._id,
              partnerCountry: user2Data?.country || 'Unknown'
            });
            io.to(user2).emit('match-found', { 
              partnerId: user1, 
              sessionId: session._id,
              partnerCountry: user1Data?.country || 'Unknown'
            });

            console.log(`💑 Match created: ${user1} <-> ${user2}`);
          } catch (error) {
            console.error('Error creating match:', error);
          }
        }, 2000); // 2 second delay
      } else {
        const stats = matchingQueue.getStats();
        console.log(`⏰ ${socket.id} waiting in queue. Total waiting: ${stats.waitingUsers}`);
        socket.emit('searching', { message: 'Searching for someone...' });
      }
    } catch (error) {
      console.error('Error in start-search:', error);
      socket.emit('error', { message: 'Failed to start search' });
    }
  });

  // WebRTC Signaling: Offer
  socket.on('webrtc-offer', ({ offer, to }) => {
    console.log(`📞 Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit('webrtc-offer', { offer, from: socket.id });
  });

  // WebRTC Signaling: Answer
  socket.on('webrtc-answer', ({ answer, to }) => {
    console.log(`📞 Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit('webrtc-answer', { answer, from: socket.id });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('ice-candidate', ({ candidate, to }) => {
    io.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  // Text chat message
  socket.on('chat-message', async ({ message, to }) => {
    try {
      const partnerId = matchingQueue.getPartner(socket.id);
      
      if (partnerId && partnerId === to) {
        io.to(to).emit('chat-message', {
          message,
          from: socket.id,
          timestamp: Date.now()
        });

        // Update message count
        await ChatSession.findOneAndUpdate(
          {
            $or: [
              { user1: socket.id, user2: to },
              { user1: to, user2: socket.id }
            ],
            endTime: null
          },
          { $inc: { messagesCount: 1 } }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Skip / Next partner
  socket.on('skip-partner', async () => {
    try {
      const partnerId = matchingQueue.cleanup(socket.id);
      
      if (partnerId) {
        // Notify partner they were skipped
        io.to(partnerId).emit('partner-disconnected', {
          reason: 'Partner skipped'
        });

        // Update database
        await User.updateMany(
          { socketId: { $in: [socket.id, partnerId] } },
          { inChat: false, partnerId: null }
        );

        // End chat session
        await endChatSession(socket.id, partnerId);

        // Remove partner from queue too
        matchingQueue.cleanup(partnerId);
      }

      // Start new search for current user
      socket.emit('partner-disconnected', { reason: 'You skipped' });
      
      // Auto-restart search with delay
      setTimeout(() => {
        const result = matchingQueue.addToQueue(socket.id);
        if (result.matched) {
          const { user1, user2 } = result;
          
          // Same delay for skip reconnection
          io.to(user1).emit('searching', { message: 'Found someone! Connecting...' });
          io.to(user2).emit('searching', { message: 'Found someone! Connecting...' });
          
          setTimeout(async () => {
            await handleNewMatch(user1, user2);
          }, 2000);
        } else {
          socket.emit('searching', { message: 'Searching for someone...' });
        }
      }, 500);

    } catch (error) {
      console.error('Error skipping partner:', error);
    }
  });

  // Stop searching
  socket.on('stop-search', async () => {
    try {
      const partnerId = matchingQueue.cleanup(socket.id);
      
      if (partnerId) {
        io.to(partnerId).emit('partner-disconnected', {
          reason: 'Partner left'
        });
        await endChatSession(socket.id, partnerId);
      }

      await User.findOneAndUpdate(
        { socketId: socket.id },
        { inChat: false, partnerId: null }
      );

      socket.emit('search-stopped');
    } catch (error) {
      console.error('Error stopping search:', error);
    }
  });

  // Typing indicator
  socket.on('typing', ({ to, isTyping }) => {
    const partnerId = matchingQueue.getPartner(socket.id);
    if (partnerId && partnerId === to) {
      io.to(to).emit('partner-typing', { isTyping });
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    try {
      activeConnections--;
      console.log(`🔌 Disconnected: ${socket.id} | Total: ${activeConnections}`);

      const partnerId = matchingQueue.cleanup(socket.id);
      
      if (partnerId) {
        io.to(partnerId).emit('partner-disconnected', {
          reason: 'Partner disconnected'
        });
        
        await User.findOneAndUpdate(
          { socketId: partnerId },
          { inChat: false, partnerId: null }
        );

        await endChatSession(socket.id, partnerId);
      }

      // Remove from database
      await User.findOneAndDelete({ socketId: socket.id });

    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Helper function to end chat session
async function endChatSession(user1, user2) {
  try {
    const session = await ChatSession.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
      ],
      endTime: null
    });

    if (session) {
      const duration = Math.floor((Date.now() - session.startTime) / 1000);
      session.endTime = Date.now();
      session.duration = duration;
      await session.save();

      // Update user stats
      await User.updateMany(
        { socketId: { $in: [user1, user2] } },
        { $inc: { totalChats: 1 } }
      );
    }
  } catch (error) {
    console.error('Error ending chat session:', error);
  }
}

// Helper function to handle new match
async function handleNewMatch(user1, user2) {
  try {
    await User.updateMany(
      { socketId: { $in: [user1, user2] } },
      { inChat: true }
    );

    await User.findOneAndUpdate(
      { socketId: user1 },
      { partnerId: user2 }
    );

    await User.findOneAndUpdate(
      { socketId: user2 },
      { partnerId: user1 }
    );

    const session = await ChatSession.create({
      user1,
      user2,
      startTime: Date.now()
    });

    // Get partner countries
    const user1Data = await User.findOne({ socketId: user1 });
    const user2Data = await User.findOne({ socketId: user2 });

    io.to(user1).emit('match-found', { 
      partnerId: user2, 
      sessionId: session._id,
      partnerCountry: user2Data?.country || 'Unknown'
    });
    io.to(user2).emit('match-found', { 
      partnerId: user1, 
      sessionId: session._id,
      partnerCountry: user1Data?.country || 'Unknown'
    });
  } catch (error) {
    console.error('Error handling new match:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   ✨ VibeChat Server Running ✨      ║
║   Port: ${PORT}                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
║   Max Connections: ${MAX_CONNECTIONS}             ║
║   Status: Ready to vibe! 🎉          ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

