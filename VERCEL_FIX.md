# 🔧 Fix Vercel 404 Error

## Quick Fix Steps

### Option 1: Simple Frontend-Only Deploy (Recommended)

Deploy **ONLY frontend** to Vercel, backend to Railway/Render.

#### Step 1: Update Vercel Project Settings

In Vercel Dashboard:
1. Go to Project Settings
2. **Root Directory**: Change to `frontend` 
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

#### Step 2: Set Environment Variable

Add in Vercel:
```
VITE_SOCKET_URL=http://localhost:5000
```
(Or your Railway backend URL when you deploy backend)

#### Step 3: Redeploy

Click "Redeploy" and it should work!

---

### Option 2: Keep Monorepo (Backend + Frontend)

If you want both on Vercel, follow these steps:

#### Step 1: Create `vercel.json` in Root

Use the updated configuration I just provided.

#### Step 2: In Vercel Dashboard

1. **Root Directory**: `.` (leave blank or root)
2. **Framework Preset**: Other
3. **Build Command**: `cd frontend && npm install && npm run build`
4. **Output Directory**: `frontend/dist`
5. **Install Command**: `npm install --prefix frontend && npm install --prefix backend`

#### Step 3: Redeploy

---

## 🎯 Best Practice (Production Ready)

### Split Deployment:

**Frontend on Vercel:**
- Faster
- Better CDN
- No timeout issues
- FREE forever

**Backend on Railway:**
- Better for Socket.IO
- No serverless timeouts
- $5/month
- Unlimited WebSocket connections

### How to Do It:

#### 1. Deploy Backend to Railway:

```bash
# Go to railway.app
# New Project → Deploy from GitHub
# Select: backend folder
# Add env vars
# Deploy
# Copy URL: https://vibechat-production.up.railway.app
```

#### 2. Deploy Frontend to Vercel:

```bash
# Go to vercel.com
# New Project → Import from GitHub
# Root Directory: frontend
# Framework: Vite
# Add env var:
#   VITE_SOCKET_URL=https://vibechat-production.up.railway.app
# Deploy
```

#### 3. Update Backend CORS:

In Railway, add:
```
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🚀 Quick Commands to Fix

### Push Updated Config:

```bash
git add vercel.json
git commit -m "Fix Vercel configuration"
git push
```

### Or Use Vercel CLI:

```bash
# From root directory
vercel --prod
```

---

## ✅ Recommended Solution

**Don't deploy backend to Vercel!**

Use this setup instead:

1. **Frontend → Vercel** (free, fast, perfect)
2. **Backend → Railway** ($5/mo, reliable, no limits)
3. **Database → MongoDB Atlas** (free tier)

This is the professional way and avoids all serverless issues!

---

## 📋 Quick Railway Setup

1. https://railway.app → Sign in
2. New Project → Deploy from GitHub
3. Select repository
4. **Important**: Set root directory to `backend`
5. Add these env vars:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_uri
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   MAX_CONNECTIONS=10000
   ```
6. Deploy → Copy Railway URL

---

## 🔄 Update Frontend

After Railway deployment:

1. Vercel → Settings → Environment Variables
2. Update:
   ```
   VITE_SOCKET_URL=https://vibechat-production.up.railway.app
   ```
3. Redeploy

Done! ✅

---

**This setup is what all professional apps use!**

