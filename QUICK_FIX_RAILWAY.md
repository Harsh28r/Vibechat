# 🚀 Quick Fix: Deploy Backend to Railway

## ⚠️ The Problem

Vercel monorepo deployment has dependency issues. **Best solution**: Deploy backend separately to Railway!

---

## ✅ Solution: Railway Backend (5 minutes)

### Step 1: Deploy Backend to Railway

1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **`Vibechat`** repository
6. Railway will auto-detect and try to deploy

### Step 2: Configure Backend Path

**IMPORTANT**: Railway needs to know where your backend is!

1. After initial deployment, go to **Settings**
2. Find **"Service Settings"** or **"Root Directory"**
3. Set to: `backend`
4. Or create `railway.json` in backend folder (I'll create it below)

### Step 3: Add Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibechat
CORS_ORIGIN=https://your-app.vercel.app
MAX_CONNECTIONS=10000
```

**MongoDB URI**: Get from MongoDB Atlas (cloud.mongodb.com)

### Step 4: Deploy Backend

Click **"Deploy"** or it deploys automatically.

**Copy your Railway URL**: 
```
https://vibechat-production.up.railway.app
```

---

## 📱 Step 2: Fix Frontend on Vercel

### Update Vercel Settings:

1. Go to Vercel → Your Project → **Settings**
2. **Root Directory**: Change to `frontend`
3. **Framework**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

### Add Environment Variable:

In Vercel → Settings → Environment Variables:

```
VITE_SOCKET_URL=https://vibechat-production.up.railway.app
```
(Use your actual Railway URL)

### Redeploy:

Click **"Redeploy"** in Deployments tab.

---

## 🔄 Update Backend CORS

After Vercel deploys, copy your Vercel URL.

In Railway → Variables → Update:

```
CORS_ORIGIN=https://your-actual-app.vercel.app
```

Redeploy backend.

---

## ✅ Done!

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://vibechat-production.up.railway.app`

Test it:
- Visit Vercel URL
- Should see "Connected" ✅
- Open 2 tabs and test video chat!

---

## 💰 Cost

- **Vercel**: FREE
- **Railway**: $5/month
- **MongoDB Atlas**: FREE (512MB)

**Total**: $5/month for a professional, production-ready app!

---

## 🎯 Why This is Better

| Feature | Vercel Monorepo | Railway + Vercel |
|---------|-----------------|------------------|
| Setup | Complex ⚠️ | Simple ✅ |
| WebSocket | 10s timeout ⚠️ | Unlimited ✅ |
| Reliability | Medium | High ✅ |
| Scaling | Limited | Easy ✅ |
| Cost | FREE | $5/mo |

**Professional apps use split deployment!**

---

## 📋 Quick Checklist

Backend (Railway):
- [ ] Deployed to Railway
- [ ] Root directory set to `backend`
- [ ] Environment variables added
- [ ] Backend URL copied

Frontend (Vercel):
- [ ] Root directory changed to `frontend`
- [ ] VITE_SOCKET_URL added
- [ ] Redeployed
- [ ] Frontend URL copied

Final:
- [ ] Backend CORS_ORIGIN updated with Vercel URL
- [ ] Both apps working
- [ ] Video chat tested
- [ ] 🎉 Celebrate!

---

**This takes 10 minutes and works perfectly!** 🚀

