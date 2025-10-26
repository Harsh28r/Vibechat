# 🚀 Push VibeChat to GitHub (Monorepo)

## 📁 Project Structure
```
Vibechat/
├── backend/           # Node.js + Express + Socket.IO
├── frontend/          # React + Vite
├── .gitignore        # Git ignore file
├── package.json      # Root package.json (monorepo)
├── README.md         # Main documentation
└── DEPLOYMENT.md     # Deployment guide
```

## 🔧 Step-by-Step Guide

### Step 1: Initialize Git Repository
```bash
cd C:\Users\Lenovo\Desktop\ometv
git init
```

### Step 2: Add All Files
```bash
git add .
```

### Step 3: Create First Commit
```bash
git commit -m "🎉 Initial commit - VibeChat v1.0 with all features"
```

### Step 4: Rename Branch to Main
```bash
git branch -M main
```

### Step 5: Add Remote Repository
```bash
git remote add origin https://github.com/Harsh28r/Vibechat.git
```

### Step 6: Push to GitHub
```bash
git push -u origin main
```

---

## ⚠️ If Repository Already Exists

If you get an error saying the repository already has content:

### Option 1: Force Push (Overwrites GitHub)
```bash
git push -u origin main --force
```

### Option 2: Pull First, Then Push
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📋 Quick Copy-Paste Commands

Run these commands in order:

```powershell
# Navigate to project
cd C:\Users\Lenovo\Desktop\ometv

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "🎉 Initial commit - VibeChat v1.0

Features:
- Random video chat with WebRTC
- Interest-based matching
- Gender and country filters
- Dark mode
- Smart matching algorithm
- Beautiful modern UI
- Mobile responsive
- Production ready"

# Set branch name
git branch -M main

# Add remote
git remote add origin https://github.com/Harsh28r/Vibechat.git

# Push to GitHub
git push -u origin main
```

---

## 🎯 After Pushing

### View Your Repo:
https://github.com/Harsh28r/Vibechat

### Add Description on GitHub:
1. Go to your repository
2. Click "About" (top right)
3. Add description: "Modern random video chat platform - Better than Omegle!"
4. Add topics: `video-chat`, `webrtc`, `mern-stack`, `socket-io`, `omegle-alternative`
5. Add website (after deployment)

### Add Repository Secrets (for deployment):
1. Go to Settings → Secrets → Actions
2. Add:
   - `MONGODB_URI` - Your MongoDB connection string
   - `VITE_SOCKET_URL` - Your backend URL

---

## 📝 Update README Later

Add these sections to README.md after deployment:
- Live demo link
- Screenshots/GIFs
- Video demo
- Star the repo reminder

---

## 🔄 Future Updates

To push new changes:
```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 🌟 Make Repository Public

1. Go to repository Settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Make it Public
5. Share with the world!

---

## 📱 Clone on Another Machine

```bash
git clone https://github.com/Harsh28r/Vibechat.git
cd Vibechat
npm run install:all
```

Then setup:
- Copy `.env.example` to `.env` in backend
- Add your environment variables
- Run `npm run dev`

---

## ✅ Checklist

- [ ] Git initialized
- [ ] All files added
- [ ] First commit created
- [ ] Remote added
- [ ] Pushed to GitHub
- [ ] Repository is public
- [ ] Description added
- [ ] Topics added
- [ ] README looks good
- [ ] Ready to share!

---

**Your VibeChat is now on GitHub! 🎉**

