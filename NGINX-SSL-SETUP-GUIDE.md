# RinaWarp Terminal Pro - Nginx + SSL Manual Setup Guide

## 🚨 DNS Issue Detected
- **Current:** `api.rinawarptech.com` → `158.101.1.38` 
- **Should be:** `api.rinawarptech.com` → `137.131.48.124`

## STEP 0: Fix DNS First (IMPORTANT!)
1. Go to **Cloudflare Dashboard**
2. Select **`rinawarptech.com`** domain
3. Navigate to **DNS settings**
4. Find **`api`** record (Type: A)
5. **Change IP from `158.101.1.38` to `137.131.48.124`**
6. Set **Proxy status:** 🟡 **DNS Only** (gray cloud)
7. Wait 5-15 minutes for DNS propagation

## STEP 1: Install Nginx + Certbot
```bash
sudo apt update
sudo apt install -y nginx
sudo ufw allow 'Nginx Full'
sudo apt install -y certbot python3-certbot-nginx
```

## STEP 2: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/rinawarp-api.conf
```

**Paste this EXACT configuration:**
```nginx
server {
    server_name api.rinawarptech.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Save and exit:** `Ctrl+O` → `Enter` → `Ctrl+X`

## STEP 3: Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/rinawarp-api.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## STEP 4: Install SSL Certificate
```bash
sudo certbot --nginx -d api.rinawarptech.com
```

**When prompted:**
1. **Enter email:** your-email@example.com
2. **Agree to Terms:** `Y`
3. **Redirect HTTP to HTTPS:** Choose **Yes** (option 2)
4. **Auto-renewal:** Yes

## STEP 5: Test Setup
```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://api.rinawarptech.com

# Test HTTPS directly
curl -I https://api.rinawarptech.com

# Test health endpoint
curl https://api.rinawarptech.com/health
```

## STEP 6: Enable Cloudflare Proxy (Optional)
After SSL is working:
1. Go to **Cloudflare DNS**
2. **Turn ON** the orange cloud (proxy)
3. This enables: DDoS protection, WAF, SSL edge protection

## ✅ Final Result
You will have:
- ✅ **HTTPS API:** `https://api.rinawarptech.com`
- ✅ **Auto-renewing SSL certificate**
- ✅ **Reverse proxy to your backend on port 3001**
- ✅ **Security headers**
- ✅ **Production-ready API endpoint**

## 🔍 Verification Commands
```bash
# Check if nginx is running
sudo systemctl status nginx

# Check if PM2 backend is running
pm2 status

# Test the API locally
curl http://localhost:3001/health

# Test the API via domain
curl https://api.rinawarptech.com/health
```

## 🆘 Troubleshooting
- **Nginx errors:** `sudo nginx -t` to check configuration
- **SSL issues:** Check if DNS is properly pointing to your server
- **Backend errors:** Check `pm2 logs rinawarp-api`