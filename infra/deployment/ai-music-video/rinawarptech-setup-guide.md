# RinaWarp Technologies - Quick Setup Guide

## Multi-Application Hosting on rinawarptech.com

### 🚀 Quick Start (Windows Development → Linux Production)

#### 1. Current Development Status

- ✅ **Frontend**: Running on <http://localhost:5175>
- ✅ **Backend**: Running on <http://localhost:3001>
- ✅ **Real Video Generation**: Enabled and working
- ✅ **Multi-App Architecture**: Configured for rinawarptech.com

#### 2. Production Deployment Options

##### Option A: VPS/Cloud Server (Recommended)

```bash
# On your Linux server:
git clone https://github.com/your-repo/ai-music-video-creator.git
cd ai-music-video-creator
chmod +x deploy-multi-app.sh
./deploy-multi-app.sh
```

##### Option B: AWS EC2 + S3

- Deploy backend to EC2
- Host frontend on S3 + CloudFront
- Use Route 53 for DNS

##### Option C: Vercel + Railway

- Frontend: Deploy to Vercel
- Backend: Deploy to Railway
- Custom domains: Point to services

### 3. Domain Structure for rinawarptech.com

```
rinawarptech.com (Main Company Website)
├── ai-music-creator.rinawarptech.com (RinaWarp AI Music Creator)
├── api.rinawarptech.com (Backend API)
├── admin.rinawarptech.com (Admin Dashboard)
└── app2.rinawarptech.com (Future Applications)
```

### 4. DNS Configuration Required

```
# A Records (Point to your server IP)
rinawarptech.com → YOUR_SERVER_IP
www.rinawarptech.com → YOUR_SERVER_IP
ai-music-creator.rinawarptech.com → YOUR_SERVER_IP
api.rinawarptech.com → YOUR_SERVER_IP
admin.rinawarptech.com → YOUR_SERVER_IP
```

### 5. SSL Certificate Setup

#### Option A: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get wildcard certificate
sudo certbot certonly --manual --preferred-challenges dns -d "*.rinawarptech.com" -d "rinawarptech.com"
```

#### Option B: Commercial SSL

- Purchase from your domain registrar
- Upload certificate files to server

### 6. Environment Variables for Production

Create these files on your production server:

#### Frontend (.env.production)

```env
VITE_API_BASE_URL=https://api.rinawarptech.com
VITE_WS_URL=wss://api.rinawarptech.com
VITE_APP_NAME=RinaWarp AI Music Creator
VITE_APP_DOMAIN=ai-music-creator.rinawarptech.com
VITE_COMPANY_DOMAIN=rinawarptech.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

#### Backend (.env.production)

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://ai-music-creator.rinawarptech.com
CORS_ORIGIN=https://ai-music-creator.rinawarptech.com,https://admin.rinawarptech.com,https://rinawarptech.com

# AWS Production
AWS_ACCESS_KEY_ID=your_production_aws_key
AWS_SECRET_ACCESS_KEY=your_production_aws_secret
AWS_REGION=us-east-1
S3_BUCKET=rinawarp-production

# AI Services
OPENAI_API_KEY=your_production_openai_key
PIXVERSE_API_KEY=your_production_pixverse_key
STABLE_DIFFUSION_API_KEY=your_production_stable_diffusion_key
RUNWAY_API_KEY=your_production_runway_key

# Stripe Production
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 7. Build Commands for Production

```bash
# Build everything for production
npm run build:production

# This creates:
# - frontend/dist/ (for web hosting)
# - backend/dist/ (for Node.js server)
```

### 8. Server Requirements

#### Minimum Server Specs

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Node.js**: v18+
- **Nginx**: Latest version
- **PM2**: For process management

#### Recommended Server Specs

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **CDN**: CloudFlare (free tier)

### 9. Quick Deployment Commands

```bash
# 1. Build for production
npm run build:production

# 2. Copy files to server (replace with your server details)
scp -r frontend/dist/* user@your-server:/var/www/ai-music-creator.rinawarptech.com/
scp -r backend/dist/* user@your-server:/var/www/api.rinawarptech.com/

# 3. On server: Start services
pm2 start ecosystem.config.js
sudo systemctl reload nginx
```

### 10. Health Check URLs

After deployment, verify these URLs work:

- **Main Site**: <https://rinawarptech.com>
- **AI Music Creator**: <https://ai-music-creator.rinawarptech.com>
- **Admin Dashboard**: <https://admin.rinawarptech.com>
- **API Health**: <https://api.rinawarptech.com/health>

### 11. Monitoring Commands

```bash
# Check backend status
pm2 status
pm2 logs rinawarp-backend

# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# Check disk space
df -h

# Check memory usage
free -h
```

### 12. Troubleshooting

#### Common Issues

1. **Port 3001 already in use**: Kill existing process or change port
2. **Nginx config errors**: Check syntax with `sudo nginx -t`
3. **Permission denied**: Fix file permissions with `sudo chown -R www-data:www-data /var/www/`
4. **SSL errors**: Ensure certificate paths are correct

#### Log Locations

- **Backend logs**: `/var/log/rinawarp/`
- **Nginx logs**: `/var/log/nginx/`
- **PM2 logs**: `pm2 logs`

### 13. Security Checklist

- [ ] SSL certificates installed
- [ ] HTTPS redirects configured
- [ ] Security headers set
- [ ] File upload limits configured
- [ ] API rate limiting enabled
- [ ] Environment variables secured
- [ ] Firewall configured
- [ ] Regular backups scheduled

### 14. Performance Optimization

- [ ] Enable gzip compression
- [ ] Set up CDN (CloudFlare)
- [ ] Optimize images
- [ ] Enable browser caching
- [ ] Use PM2 cluster mode
- [ ] Set up Redis for sessions

---

## 🎯 Your RinaWarp AI Music Creator will be live at

**<https://ai-music-creator.rinawarptech.com>**

With full multi-application support for future expansion!
