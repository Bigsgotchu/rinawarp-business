# 🚀 RinaWarp One-Command Oracle Deployment - READY

## ✅ Complete FastAPI Backend Implementation

Your FastAPI backend with all public endpoints is **100% ready** for production deployment!

### 📁 Files Created

1. **`fastapi_server.py`** - Complete FastAPI implementation
2. **`requirements.txt`** - Python dependencies  
3. **`scripts/oracle-full-deploy.sh`** - One-command deployment script
4. **`build-output/`** - Directory for installer files

### 🎯 FastAPI Endpoints Ready

- ✅ **Public License Count**: `GET /api/license-count`
- ✅ **Public Downloads**: `GET /downloads/{filename}`  
- ✅ **Anonymous Checkout**: `POST /api/terminal-pro/checkout`
- ✅ **CORS Configured**: Frontend + VS Code + local dev

## 🛠️ ONE COMMAND DEPLOYMENT

### Step 1: Make Script Executable
```bash
cd /home/karina/Documents/RinaWarp/scripts
chmod +x oracle-full-deploy.sh
```

### Step 2: Run Deployment
```bash
./oracle-full-deploy.sh
```

### What This Script Does (Automatically):

1. **📤 Uploads FastAPI backend** to Oracle VM
2. **📤 Uploads installer files** from `build-output/`
3. **🐍 Creates Python virtualenv** and installs dependencies
4. **🧩 Creates systemd service** `rinawarp-api` on port 8000
5. **🌐 Configures nginx** for `api.rinawarptech.com`
6. **🔁 Restarts all services** and verifies health

## 🧪 Test After Deployment

### From Your Machine:
```bash
# Health check
curl https://api.rinawarptech.com/health

# License count (public)  
curl https://api.rinawarptech.com/api/license-count

# Download test
curl -I https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage

# Checkout test
curl -X POST https://api.rinawarptech.com/api/terminal-pro/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan": "founder", "email": "test@example.com"}'
```

### Expected Results:
- **Health**: `{"status": "healthy", "service": "RinaWarp FastAPI"}`
- **License Count**: `{"total": 500, "used": 0, "remaining": 500}`  
- **Download**: `HTTP/1.1 200 OK` with file content
- **Checkout**: `{"url": "https://checkout.stripe.com/..."}`

## 🔧 Manual Setup (If Needed)

### Upload Files Only:
```bash
scp fastapi_server.py ubuntu@158.101.1.38:/var/www/rinawarp-api/backend/
scp requirements.txt ubuntu@158.101.1.38:/var/www/rinawarp-api/backend/
```

### SSH and Setup Manually:
```bash
ssh ubuntu@158.101.1.38 "
  cd /var/www/rinawarp-api/backend
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  uvicorn fastapi_server:app --host 127.0.0.1 --port 8000 &
"
```

## 🌐 Nginx Configuration

The deployment script automatically configures nginx:

```nginx
server {
    server_name api.rinawarptech.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔐 Environment Variables

For full functionality, add these on Oracle VM:
```bash
# Edit systemd service
sudo systemctl edit rinawarp-api --full

# Add these environment variables:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_FOUNDER_PRICE_ID=price_...
STRIPE_SUCCESS_URL=https://rinawarptech.com/terminal-pro-success.html
STRIPE_CANCEL_URL=https://rinawarptech.com/pricing.html
FOUNDER_TOTAL_SEATS=500
RINAWARP_DOWNLOADS_DIR=/var/www/rinawarp-api/downloads
```

## 🎯 Frontend Integration

### JavaScript Examples:

```javascript
// License count for seat counter
fetch('https://api.rinawarptech.com/api/license-count')
  .then(res => res.json())
  .then(data => {
    document.getElementById('seats-remaining').textContent = data.remaining;
  });

// Start checkout
async function buyNow(email) {
  const response = await fetch('https://api.rinawarptech.com/api/terminal-pro/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: 'founder', email })
  });
  
  const { url } = await response.json();
  window.location.href = url;
}
```

## ✅ DEPLOYMENT STATUS: READY

### Files Ready:
- ✅ FastAPI backend implementation
- ✅ Python dependencies  
- ✅ One-command deployment script
- ✅ Sample installer files
- ✅ Complete documentation

### Infrastructure Ready:
- ✅ Systemd service configuration
- ✅ Nginx reverse proxy setup
- ✅ Python virtual environment
- ✅ File permissions and security

### Testing Ready:
- ✅ Health check endpoints
- ✅ Public API endpoints
- ✅ Download serving
- ✅ Stripe integration

**🚀 Deploy now with**: `./scripts/oracle-full-deploy.sh`