# 🚀 Deploy VibeChat to Vercel (Monorepo - Single Deployment)

## ✨ Deploy Everything from Root Repository

This guide shows how to deploy **both frontend and backend** to Vercel from a single repository.

---

## ⚠️ Important Notes

### Socket.IO on Vercel:
- Vercel serverless functions have **10-second timeout** for WebSocket connections
- For production with many users, consider **Railway for backend**
- This setup works for **testing and small-scale deployment**

### For Production at Scale:
- **Frontend**: Vercel ✅
- **Backend**: Railway/Render (better for Socket.IO) ✅

---

## 🎯 Deploy to Vercel (Complete App)

### Step 1: Prepare MongoDB

1. Go to https://cloud.mongodb.com
2. Create **FREE** cluster
3. Create database user (username + password)
4. Network Access → Add IP: `0.0.0.0/0`
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/vibechat
   ```

### Step 2: Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Configure for Vercel deployment"
git push
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your **GitHub repository**: `Vibechat`
4. **Configure Project:**
   - **Framework Preset**: Other
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `npm run vercel-build` (auto-detected)
   - **Output Directory**: `frontend/dist`

5. **Add Environment Variables:**

Click "Environment Variables" and add:

| Name | Value | Description |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/vibechat` | Your MongoDB connection string |
| `NODE_ENV` | `production` | Environment |
| `PORT` | `5000` | Server port |
| `MAX_CONNECTIONS` | `10000` | Max users |
| `VITE_SOCKET_URL` | Leave blank initially | Will be set after first deploy |

6. Click **"Deploy"** 🚀

### Step 4: Update Frontend Socket URL

After first deployment:

1. Copy your Vercel URL: `https://vibechat-xyz.vercel.app`
2. Go to Project Settings → Environment Variables
3. Update or add:
   ```
   VITE_SOCKET_URL=https://vibechat-xyz.vercel.app
   ```
   (Use your actual Vercel URL)
4. Click "Redeploy" to apply changes

### Step 5: Set CORS

1. In Vercel Environment Variables, add:
   ```
   CORS_ORIGIN=https://vibechat-xyz.vercel.app
   ```
   (Use your actual Vercel URL - same as frontend)
2. Redeploy

### Step 6: Test Your App! 🎉

Visit: `https://vibechat-xyz.vercel.app`

- Should show "Connected" (green dot)
- Open 2 browser tabs
- Click "Start Chatting" in both
- Should match and start video chat!

---

## 📋 Environment Variables Summary

Set these in Vercel dashboard:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibechat

# Server
NODE_ENV=production
PORT=5000
MAX_CONNECTIONS=10000

# CORS (same as your Vercel URL)
CORS_ORIGIN=https://your-app.vercel.app

# Frontend (same as your Vercel URL)
VITE_SOCKET_URL=https://your-app.vercel.app
```

---

## 🔧 Vercel CLI Deployment (Alternative)

### Install Vercel CLI:
```bash
npm install -g vercel
```

### Deploy from root:
```bash
vercel login
vercel
```

Follow prompts and set environment variables when asked.

### Deploy to Production:
```bash
vercel --prod
```

---

## 🏗️ Project Structure (What Gets Deployed)

```
Vibechat/                          ← Deploy from here
├── backend/
│   ├── server.js                  → Vercel Serverless Function
│   ├── models/
│   ├── utils/
│   └── package.json
├── frontend/
│   ├── dist/                      → Static files (after build)
│   ├── src/
│   └── package.json
├── vercel.json                    ← Routing config
└── package.json                   ← Root config
```

### How It Works:

1. **Frontend**: Built to `frontend/dist/` → Served as static files
2. **Backend**: `backend/server.js` → Runs as serverless function
3. **Routing**: 
   - `/socket.io/*` → Backend
   - `/api/*` → Backend  
   - `/*` → Frontend

---

## 🐛 Troubleshooting

### Issue 1: Build Failed

**Error**: `Build failed`

**Solution**:
```bash
# Test build locally
npm run vercel-build

# If it works locally, make sure all changes are pushed
git add .
git commit -m "Fix build"
git push
```

### Issue 2: Backend Not Responding

**Error**: `Cannot connect to server`

**Check**:
1. Vercel Functions logs
2. Make sure `MONGODB_URI` is set correctly
3. Check MongoDB IP whitelist includes `0.0.0.0/0`
4. Verify `backend/server.js` has no syntax errors

### Issue 3: CORS Error

**Error**: `Access-Control-Allow-Origin`

**Solution**:
1. Set `CORS_ORIGIN` to your Vercel URL
2. Must match exactly (including `https://`)
3. No trailing slash
4. Redeploy after changing

### Issue 4: WebSocket Timeout

**Error**: `WebSocket closed unexpectedly`

**Solution**:
- Vercel serverless has 10s timeout
- For production, use Railway for backend:
  - Deploy backend to Railway
  - Deploy frontend to Vercel
  - Set `VITE_SOCKET_URL` to Railway URL

### Issue 5: Module Not Found

**Error**: `Cannot find module`

**Solution**:
```bash
# Make sure package-lock.json is committed
cd frontend
npm install
cd ../backend
npm install
cd ..
git add package-lock.json */package-lock.json
git commit -m "Add package-lock files"
git push
```

---

## 🔄 Update Deployment

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push

# Vercel auto-deploys on push!
```

---

## 🌐 Custom Domain

1. Go to Project Settings → Domains
2. Add your domain: `vibechat.com`
3. Configure DNS as instructed
4. Update environment variables:
   ```
   CORS_ORIGIN=https://vibechat.com
   VITE_SOCKET_URL=https://vibechat.com
   ```
5. Redeploy

---

## 📊 Vercel Limits (Free Tier)

| Resource | Limit | Notes |
|----------|-------|-------|
| Bandwidth | 100 GB/month | Good for testing |
| Function Execution | 100 GB-hours | Sufficient for small apps |
| Function Duration | 10 seconds | ⚠️ May timeout for long WebSocket connections |
| Deployments | Unlimited | Deploy as much as you want |

**For heavy traffic**: Use Railway for backend ($5/month, no limits)

---

## ✅ Deployment Checklist

### Pre-Deploy:
- [x] Code committed to GitHub
- [x] MongoDB Atlas cluster created
- [x] Database user created
- [x] IP whitelist set to 0.0.0.0/0
- [x] Connection string copied

### Deploy:
- [ ] Project imported to Vercel
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] VITE_SOCKET_URL updated
- [ ] CORS_ORIGIN set correctly
- [ ] Redeployed with updated env vars

### Test:
- [ ] Open app URL
- [ ] See "Connected" status
- [ ] Open 2 browser tabs
- [ ] Both match successfully
- [ ] Video chat works
- [ ] Text chat works
- [ ] Skip button works

---

## 🎯 Alternative: Hybrid Deployment (Recommended for Production)

### Best Setup:
- **Frontend on Vercel**: FREE, fast CDN
- **Backend on Railway**: $5/month, better for Socket.IO
- **Database on Atlas**: FREE tier

### Quick Setup:
1. Deploy backend to Railway (see VERCEL_DEPLOYMENT.md)
2. Deploy frontend to Vercel (set VITE_SOCKET_URL to Railway)
3. No serverless timeout issues!

---

## 📝 Quick Commands

```bash
# Deploy to Vercel (from root)
vercel --prod

# View logs
vercel logs

# Check domains
vercel domains ls

# Remove deployment
vercel remove vibechat
```

---

## 🎉 Success!

Your VibeChat is now deployed!

**Access your app**: `https://your-app.vercel.app`

### Next Steps:
1. ✅ Test all features
2. 📱 Test on mobile
3. 🌟 Add to GitHub README
4. 📢 Share with friends
5. 🚀 Scale when needed

---

## 💡 Pro Tips

1. **Monitoring**: Enable Vercel Analytics
2. **Performance**: Use Vercel Edge Network
3. **Errors**: Set up Sentry integration
4. **Scaling**: Consider Railway for backend when you hit limits

---

**Your VibeChat is LIVE! 🎊**

Deployed from a single repository with both frontend and backend on Vercel!

