# 🔐 Environment Variables Setup Guide

## 📁 Files Created

### Backend:
- `backend/.env` - Development environment (git ignored)
- `backend/.env.example` - Template for others
- `backend/.env.production` - Production settings

### Frontend:
- `frontend/.env` - Development environment (git ignored)
- `frontend/.env.example` - Template for others
- `frontend/.env.production` - Production settings

---

## 🚀 Local Development Setup

### Step 1: Backend Environment

```bash
cd backend
cp .env.example .env
```

**Edit `backend/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vibechat
CORS_ORIGIN=http://localhost:5173
MAX_CONNECTIONS=10000
```

**Make sure:**
- ✅ MongoDB is running locally
- ✅ Port 5000 is available
- ✅ CORS_ORIGIN matches your frontend URL

### Step 2: Frontend Environment

```bash
cd frontend
cp .env.example .env
```

**Edit `frontend/.env`:**
```env
VITE_SOCKET_URL=http://localhost:5000
```

**Make sure:**
- ✅ Backend URL is correct
- ✅ Backend is running before starting frontend

---

## 🌐 Production Setup

### 1. MongoDB Atlas (Database)

**Get MongoDB URI:**
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string
6. Replace `<password>` with your password

**Example:**
```
mongodb+srv://vibechat:MyPassword123@cluster0.abc12.mongodb.net/vibechat?retryWrites=true&w=majority
```

### 2. Backend Deployment (Railway)

**Set Environment Variables in Railway Dashboard:**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://vibechat:password@cluster0.mongodb.net/vibechat
CORS_ORIGIN=https://your-app.vercel.app
MAX_CONNECTIONS=10000
```

**Get Backend URL:**
- After deployment: `https://vibechat-production.up.railway.app`

### 3. Frontend Deployment (Vercel)

**Set Environment Variables in Vercel Dashboard:**
```
VITE_SOCKET_URL=https://vibechat-production.up.railway.app
```

**Or edit `frontend/.env.production`:**
```env
VITE_SOCKET_URL=https://your-backend.railway.app
```

---

## 🔄 Environment Variables Reference

### Backend Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `PORT` | 5000 | 5000 | Server port |
| `NODE_ENV` | development | production | Environment |
| `MONGODB_URI` | mongodb://localhost:27017/vibechat | mongodb+srv://... | Database URL |
| `CORS_ORIGIN` | http://localhost:5173 | https://your-app.vercel.app | Frontend URL |
| `MAX_CONNECTIONS` | 10000 | 10000 | Max concurrent users |

### Frontend Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `VITE_SOCKET_URL` | http://localhost:5000 | https://your-backend.railway.app | Backend URL |

---

## 🔍 Verify Environment Variables

### Backend:
```bash
cd backend
npm run dev
```

**Check console for:**
```
✨ VibeChat Server Running ✨
Port: 5000
Environment: development
✅ MongoDB Connected: localhost
```

### Frontend:
```bash
cd frontend
npm run dev
```

**Open browser console (F12):**
```
🔌 Connecting to: http://localhost:5000
✅ Connected to server: [socket-id]
```

---

## ⚠️ Common Issues

### Issue 1: MongoDB Connection Failed
**Error:** `MongoServerError: Authentication failed`

**Solution:**
1. Check username/password in MONGODB_URI
2. Verify IP whitelist includes your IP
3. Make sure database user has read/write permissions

### Issue 2: CORS Error
**Error:** `Access-Control-Allow-Origin`

**Solution:**
1. Update `CORS_ORIGIN` in backend .env
2. Must match exact frontend URL (including https://)
3. Restart backend after changing

### Issue 3: Socket Connection Failed
**Error:** `WebSocket connection failed`

**Solution:**
1. Check `VITE_SOCKET_URL` in frontend .env
2. Make sure backend is running
3. Verify no firewall blocking WebSocket

---

## 🔐 Security Best Practices

### DO:
✅ Keep `.env` files in `.gitignore`
✅ Use strong MongoDB passwords
✅ Whitelist specific IPs in production
✅ Use HTTPS in production
✅ Rotate credentials regularly

### DON'T:
❌ Commit `.env` files to Git
❌ Share credentials publicly
❌ Use weak passwords
❌ Use development settings in production
❌ Expose environment variables in client code

---

## 📝 Quick Copy-Paste

### Development .env files:

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vibechat
CORS_ORIGIN=http://localhost:5173
MAX_CONNECTIONS=10000
```

**frontend/.env:**
```env
VITE_SOCKET_URL=http://localhost:5000
```

### Production .env files:

**backend/.env.production:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibechat
CORS_ORIGIN=https://vibechat.vercel.app
MAX_CONNECTIONS=10000
```

**frontend/.env.production:**
```env
VITE_SOCKET_URL=https://vibechat-backend.railway.app
```

---

## 🎯 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Backend .env.production configured
- [ ] Frontend .env.production configured
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in deployment platforms
- [ ] Both URLs updated in respective .env files
- [ ] Test connection between frontend and backend
- [ ] HTTPS working on both

---

**Environment setup complete! 🎉**

Your VibeChat is ready to run locally and deploy to production!

