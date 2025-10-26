# 🚀 VibeChat Deployment Guide

## Quick Start - Deploy in 15 Minutes!

### Option 1: Railway + Vercel (Recommended - Easiest)

#### **Backend on Railway:**

1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your backend folder
4. Add MongoDB:
   - Click "New" → "Database" → "MongoDB"
   - Copy the connection string
5. Set Environment Variables:
   ```
   MONGODB_URI=<your_railway_mongodb_url>
   CORS_ORIGIN=https://your-app.vercel.app
   PORT=5000
   NODE_ENV=production
   MAX_CONNECTIONS=10000
   ```
6. Deploy automatically!
7. Get your backend URL: `https://your-app.railway.app`

#### **Frontend on Vercel:**

1. Sign up at https://vercel.com
2. Import your GitHub repository
3. Set Root Directory: `frontend`
4. Add Environment Variable:
   ```
   VITE_SOCKET_URL=https://your-backend.railway.app
   ```
5. Deploy!
6. Your app is live: `https://your-app.vercel.app`

---

### Option 2: Digital Ocean Droplet (VPS)

#### **1. Create Droplet ($12/month)**
```bash
# Choose Ubuntu 22.04 LTS
# Size: Basic - 2GB RAM / 1 CPU
```

#### **2. SSH into server:**
```bash
ssh root@your_droplet_ip
```

#### **3. Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

#### **4. Install MongoDB:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### **5. Clone & Setup:**
```bash
cd /var/www
git clone your_repository.git vibechat
cd vibechat

# Backend
cd backend
npm install
cp .env.example .env
nano .env  # Edit with your settings

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Frontend
cd ../frontend
npm install
npm run build
```

#### **6. Setup Nginx:**
```bash
sudo apt-get install nginx

# Create config
sudo nano /etc/nginx/sites-available/vibechat
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/vibechat/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/vibechat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **7. SSL Certificate (Free):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Scaling for High Traffic

### **When you have 1,000+ concurrent users:**

1. **Add Redis for Socket.IO scaling:**
```bash
npm install @socket.io/redis-adapter redis
```

Update `backend/server.js`:
```javascript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

2. **Use Multiple Servers with Load Balancer**
3. **Enable MongoDB Replica Set**
4. **Use CDN for Frontend (Cloudflare)**

---

## 🔒 Production Security Checklist

- [ ] Environment variables set properly
- [ ] MongoDB has strong password
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] MongoDB not exposed to internet
- [ ] Regular backups enabled
- [ ] Monitoring setup (PM2 or DataDog)
- [ ] Error logging configured

---

## 📈 Monitoring & Maintenance

### **PM2 Monitoring:**
```bash
pm2 monit           # Real-time monitoring
pm2 logs            # View logs
pm2 restart all     # Restart servers
pm2 delete all      # Stop servers
```

### **Railway/Vercel:**
- Built-in monitoring dashboards
- Automatic deployments on git push
- Easy rollback to previous versions

---

## 💰 Cost Breakdown

### **Small Scale (0-100 users):**
- Railway: $5/month
- Vercel: FREE
- MongoDB Atlas: FREE
- **Total: $5/month**

### **Medium Scale (100-1000 users):**
- Railway: $20/month
- Vercel: FREE
- MongoDB Atlas: $9/month
- **Total: $29/month**

### **Large Scale (1000-10000 users):**
- Digital Ocean: $24/month (4GB droplet)
- MongoDB Atlas M10: $57/month
- Redis: $15/month
- CDN: $10/month
- **Total: $106/month**

---

## 🆘 Troubleshooting

### **WebSocket not connecting:**
- Check CORS_ORIGIN matches frontend URL
- Ensure WebSocket transport is enabled
- Check firewall allows WebSocket connections

### **MongoDB connection failed:**
- Verify connection string
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Railway)
- Ensure network access configured

### **Video not working:**
- HTTPS required for WebRTC (use SSL)
- Check STUN server accessibility
- Verify camera/microphone permissions

---

## 📞 Need Help?

- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://discord.gg/vercel
- MongoDB Support: https://support.mongodb.com/

---

**Your VibeChat is ready to go global! 🌍✨**

