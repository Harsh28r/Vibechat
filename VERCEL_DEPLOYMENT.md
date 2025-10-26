# 🚀 Deploy VibeChat to Vercel

## 📋 Deployment Strategy

### Recommended Setup:
- **Frontend**: Vercel (FREE)
- **Backend**: Railway ($5/month) or Render (FREE)
- **Database**: MongoDB Atlas (FREE)

> **Note**: Vercel is optimized for frontend. For backend, Railway or Render is better for Socket.IO apps.

---

## 🎯 Option 1: Frontend on Vercel + Backend on Railway (RECOMMENDED)

### Step 1: Deploy Backend to Railway

1. **Go to Railway**: https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `Vibechat` repository
5. Set **Root Directory**: `backend`
6. Add **Environment Variables**:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibechat
   CORS_ORIGIN=https://your-app.vercel.app
   MAX_CONNECTIONS=10000
   ```
7. Add **MongoDB** database (optional):
   - Click "New" → "Database" → "MongoDB"
   - Copy connection string to `MONGODB_URI`
8. Deploy! 🚀
9. **Copy your Railway URL**: `https://vibechat-production.up.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. Click **"Add New Project"**
3. **Import** your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   ```
   VITE_SOCKET_URL=https://vibechat-production.up.railway.app
   ```
   (Use your Railway URL from Step 1)
6. Click **"Deploy"** 🚀
7. Your app is live! 🎉

### Step 3: Update Backend CORS

1. Go back to Railway dashboard
2. Update `CORS_ORIGIN` with your Vercel URL:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
3. Redeploy backend

### Step 4: Test Your App

Visit your Vercel URL: `https://your-app.vercel.app`
- ✅ Should connect to backend
- ✅ Should show "Connected" status
- ✅ Should match users successfully

---

## 🎯 Option 2: Both on Vercel (Advanced)

> ⚠️ **Not Recommended**: Vercel serverless functions have limitations for WebSocket/Socket.IO

If you still want to try:

### Backend Adjustments Needed:

1. Convert to Vercel Serverless Functions
2. Use Vercel's WebSocket support (limited)
3. May have cold start issues
4. May have connection limits

**For production, use Railway/Render for backend instead!**

---

## 📊 Deployment Checklist

### Pre-Deployment:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist set to `0.0.0.0/0`
- [ ] Connection string copied

### Backend (Railway):

- [ ] Deployed to Railway
- [ ] Environment variables set
- [ ] MongoDB connected
- [ ] Backend URL copied
- [ ] Health check working: `https://your-backend.railway.app/api/health`

### Frontend (Vercel):

- [ ] Deployed to Vercel
- [ ] `VITE_SOCKET_URL` set to backend URL
- [ ] Build successful
- [ ] Site is live

### Final Steps:

- [ ] Update backend `CORS_ORIGIN` with Vercel URL
- [ ] Test video chat functionality
- [ ] Test with 2 browser windows
- [ ] Verify WebSocket connection
- [ ] Check mobile responsiveness

---

## 🔧 Vercel CLI Deployment (Alternative)

### Install Vercel CLI:
```bash
npm install -g vercel
```

### Deploy Frontend:
```bash
cd frontend
vercel login
vercel --prod
```

**Set environment variables when prompted:**
- `VITE_SOCKET_URL`: Your backend URL

---

## 🌐 Environment Variables

### Frontend (Vercel):

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SOCKET_URL` | https://your-backend.railway.app | Backend Socket.IO URL |

### Backend (Railway):

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | production | Environment |
| `MONGODB_URI` | mongodb+srv://... | MongoDB connection |
| `CORS_ORIGIN` | https://your-app.vercel.app | Frontend URL |
| `MAX_CONNECTIONS` | 10000 | Max concurrent users |

---

## 🐛 Troubleshooting

### Issue 1: CORS Error
**Error**: `Access-Control-Allow-Origin`

**Solution**:
1. Check `CORS_ORIGIN` in Railway matches Vercel URL exactly
2. Include `https://` protocol
3. No trailing slash
4. Redeploy backend after changes

### Issue 2: WebSocket Connection Failed
**Error**: `WebSocket connection failed`

**Solution**:
1. Verify `VITE_SOCKET_URL` in Vercel environment variables
2. Make sure backend is running on Railway
3. Check Railway logs for errors
4. Test backend health: `https://your-backend.railway.app/api/health`

### Issue 3: Build Failed on Vercel
**Error**: `Build failed`

**Solution**:
1. Make sure `frontend` is set as root directory
2. Check `package.json` has `build` script
3. Verify all dependencies are in `package.json`
4. Check build logs for specific errors

### Issue 4: "Module not found" errors
**Solution**:
```bash
cd frontend
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

---

## 📱 Custom Domain (Optional)

### On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update backend `CORS_ORIGIN` with new domain

### On Railway:
1. Go to Settings → Domains
2. Add custom domain
3. Configure DNS
4. Update frontend `VITE_SOCKET_URL`

---

## 🚀 Deployment Commands Summary

```bash
# 1. Make sure everything is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy Frontend to Vercel
cd frontend
vercel --prod
# Follow prompts, set VITE_SOCKET_URL

# 3. Deploy Backend to Railway
# Use Railway dashboard - easier than CLI
# Or use Railway CLI:
npm install -g @railway/cli
cd backend
railway login
railway init
railway up
```

---

## 📊 Expected Costs

| Service | Cost | Purpose |
|---------|------|---------|
| **Vercel** | FREE | Frontend hosting |
| **Railway** | $5/month | Backend + MongoDB |
| **MongoDB Atlas** | FREE (512MB) | Database |
| **Total** | **$5/month** | Full stack app |

### Alternative (All Free):
- Frontend: Vercel (FREE)
- Backend: Render (FREE tier)
- Database: MongoDB Atlas (FREE)
- Total: **$0/month** (with limitations)

---

## 🎉 After Deployment

### Update Repository:
1. Add live URL to README.md
2. Add screenshots
3. Update "Live Demo" link
4. Add deployment status badges

### Share Your App:
```markdown
## 🌟 Live Demo
https://your-app.vercel.app

## 🔗 Links
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.railway.app
- GitHub: https://github.com/Harsh28r/Vibechat
```

---

## 📝 Quick Deploy Checklist

```bash
# 1. Create MongoDB Atlas cluster
✓ Sign up at cloud.mongodb.com
✓ Create free cluster
✓ Create database user
✓ Whitelist all IPs (0.0.0.0/0)
✓ Get connection string

# 2. Deploy Backend to Railway
✓ Go to railway.app
✓ New project from GitHub
✓ Select backend folder
✓ Add environment variables
✓ Deploy
✓ Copy Railway URL

# 3. Deploy Frontend to Vercel
✓ Go to vercel.com
✓ New project from GitHub
✓ Select frontend folder
✓ Add VITE_SOCKET_URL env var
✓ Deploy
✓ Copy Vercel URL

# 4. Update CORS
✓ Update Railway CORS_ORIGIN with Vercel URL
✓ Redeploy backend

# 5. Test
✓ Open Vercel URL
✓ Check "Connected" status
✓ Test video chat with 2 windows
✓ Celebrate! 🎉
```

---

## 🎯 Next Steps After Deployment

1. **Monitor Performance**
   - Railway: Check logs and metrics
   - Vercel: Check Analytics
   - MongoDB: Monitor connections

2. **Add Monitoring** (Optional)
   - Sentry for error tracking
   - Google Analytics for usage
   - Uptime monitoring

3. **Optimize**
   - Enable Vercel Edge Network
   - Add CDN for assets
   - Optimize images

4. **Scale** (When needed)
   - Upgrade Railway plan
   - Add Redis for Socket.IO scaling
   - Use MongoDB replica sets

---

**Your VibeChat is ready to deploy! 🚀**

Follow Option 1 (Vercel + Railway) for best results!

