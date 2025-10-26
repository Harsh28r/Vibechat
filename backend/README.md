# OmeTV Backend

## Setup Instructions

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file with the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ometv
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_CONNECTIONS=10000
```

3. Make sure MongoDB is running locally or update MONGODB_URI

4. Start the development server:
```bash
npm run dev
```

## Features
- WebRTC signaling via Socket.IO
- Efficient user matching queue
- MongoDB session tracking
- Rate limiting for traffic management
- Compression and security headers
- Scalable architecture

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/stats` - Server statistics

## Socket.IO Events
- `start-search` - Join matching queue
- `match-found` - Match found with another user
- `webrtc-offer` - WebRTC offer signal
- `webrtc-answer` - WebRTC answer signal
- `ice-candidate` - ICE candidate exchange
- `chat-message` - Text message
- `skip-partner` - Skip current partner
- `stop-search` - Leave queue
- `partner-disconnected` - Partner left

