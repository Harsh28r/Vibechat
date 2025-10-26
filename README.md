# ✨ VibeChat - Connect. Vibe. Chat.

A modern, scalable random video chat platform built with the MERN stack (MongoDB, Express, React, Node.js). Meet amazing people from around the world through instant video connections powered by WebRTC.

![VibeChat](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node](https://img.shields.io/badge/Node-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Live Demo
Coming soon!

## 📸 Screenshots
![VibeChat Welcome Screen](https://via.placeholder.com/800x400?text=VibeChat+Welcome+Screen)
![VibeChat Video Chat](https://via.placeholder.com/800x400?text=VibeChat+Video+Chat)

## ✨ Features

- 🎯 **Random Matching**: Intelligent queue system pairs users instantly
- 📹 **HD Video Chat**: WebRTC-powered peer-to-peer video streaming
- 💬 **Real-time Messaging**: Text chat alongside video with typing indicators
- ⚡ **Lightning Fast**: Optimized for performance and low latency
- 🔄 **Skip Function**: Instantly connect with a new partner
- 📊 **Scalable Architecture**: Built to handle thousands of concurrent connections
- 🛡️ **Rate Limited**: Protection against abuse and DDoS
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ Architecture

### Backend
- **Express.js** - Fast, minimalist web framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **MongoDB** - NoSQL database for session tracking and analytics
- **WebRTC Signaling** - Peer-to-peer connection establishment
- **Rate Limiting** - Traffic management and security
- **Compression** - Response compression for better performance
- **Helmet** - Security headers

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **WebRTC API** - Browser-native video/audio streaming
- **Socket.IO Client** - Real-time connection to backend
- **Lucide Icons** - Beautiful, consistent iconography
- **CSS3 Animations** - Smooth, modern UI transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Modern browser (Chrome/Edge/Firefox)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vibechat
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_CONNECTIONS=10000
EOL

# Start development server
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_SOCKET_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

The frontend will be running on `http://localhost:5173`

### MongoDB Setup

If you don't have MongoDB installed:

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## 📦 Project Structure

```
ometv/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── ChatSession.js       # Chat session schema
│   │   └── User.js              # User schema
│   ├── utils/
│   │   └── MatchingQueue.js     # User matching logic
│   ├── server.js                # Main server file
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx    # Landing page
│   │   │   ├── VideoChat.jsx        # Main video chat
│   │   │   └── ChatBox.jsx          # Text chat
│   │   ├── context/
│   │   │   └── SocketContext.jsx    # Socket.IO context
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
└── README.md                    # This file
```

## 🔌 Socket.IO Events

### Client → Server
- `start-search` - Join the matching queue
- `skip-partner` - Skip current partner and find new one
- `stop-search` - Leave the queue
- `webrtc-offer` - Send WebRTC offer
- `webrtc-answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `chat-message` - Send text message
- `typing` - Typing indicator

### Server → Client
- `match-found` - Partner found, includes partner ID
- `searching` - Still searching for partner
- `partner-disconnected` - Partner left/disconnected
- `webrtc-offer` - Received WebRTC offer
- `webrtc-answer` - Received WebRTC answer
- `ice-candidate` - Received ICE candidate
- `chat-message` - Received text message
- `partner-typing` - Partner is typing
- `server-full` - Server at capacity

## 🛠️ API Endpoints

### `GET /api/health`
Health check endpoint
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "connections": 42,
  "stats": {
    "waitingUsers": 5,
    "activeChats": 18,
    "totalUsers": 41
  }
}
```

### `GET /api/stats`
Server statistics
```json
{
  "waitingUsers": 5,
  "activeChats": 18,
  "totalUsers": 41,
  "activeConnections": 42,
  "maxConnections": 10000
}
```

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ometv |
| `NODE_ENV` | Environment (development/production) | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `MAX_CONNECTIONS` | Maximum concurrent connections | 10000 |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SOCKET_URL` | Backend Socket.IO URL | http://localhost:5000 |

## 🚀 Production Deployment

### Backend

1. **Build optimization:**
   - Set `NODE_ENV=production`
   - Use PM2 for process management
   - Configure MongoDB Atlas for cloud database
   - Set up Nginx as reverse proxy
   - Enable SSL/TLS certificates

2. **Scaling:**
   - Use Redis adapter for Socket.IO horizontal scaling
   - Implement load balancing
   - Set up multiple server instances
   - Configure MongoDB replica sets

### Frontend

1. **Build for production:**
```bash
npm run build
```

2. **Deploy:**
   - Use Vercel, Netlify, or any static hosting
   - Configure environment variables
   - Enable CDN for assets
   - Set up proper caching headers

## 📊 Performance Optimization

### Backend
- Connection pooling for MongoDB
- Compression middleware
- Rate limiting
- Efficient in-memory queue system
- WebSocket transport preferred over polling

### Frontend
- Code splitting with Vite
- Lazy loading components
- Optimized video constraints
- Debounced typing indicators
- Efficient re-renders with React

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting per IP
- Input validation
- WebRTC encryption (DTLS-SRTP)
- No data persistence of video streams

## 🐛 Troubleshooting

### Camera/Microphone not working
- Check browser permissions
- Ensure HTTPS in production (required for WebRTC)
- Verify no other app is using the devices

### Connection issues
- Check MongoDB is running
- Verify CORS settings
- Ensure firewall allows WebSocket connections
- Check Socket.IO version compatibility

### Video not connecting
- Verify STUN servers are accessible
- Check NAT/firewall settings
- Consider adding TURN servers for difficult networks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- WebRTC for peer-to-peer technology
- Socket.IO for real-time communication
- MongoDB for data persistence
- React team for amazing UI library
- Lucide for beautiful icons

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using the MERN Stack**

