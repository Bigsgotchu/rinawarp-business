#!/bin/bash

# RinaWarp One-Click Deployment Script
# Complete automated deployment for RinaWarp Tech website and backend

set -e  # Exit on any error

echo "🚀 RinaWarp One-Click Deployment Starting..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as ubuntu user."
   exit 1
fi

print_info "Step 1: Checking system prerequisites..."
# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "Installing PM2..."
    npm install -g pm2
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_warning "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

print_status "System prerequisites verified"

print_info "Step 2: Creating directory structure..."
sudo mkdir -p /var/www/rinawarp-downloads
sudo mkdir -p /var/www/rinawarp-website
sudo mkdir -p /var/log/rinawarp

# Set proper permissions
sudo chown -R ubuntu:ubuntu /var/www/rinawarp-downloads
sudo chown -R ubuntu:ubuntu /var/www/rinawarp-website
sudo chown -R ubuntu:ubuntu /var/log/rinawarp

print_status "Directory structure created"

print_info "Step 3: Installing SSL certificates..."
# Install Certbot
if ! command -v certbot &> /dev/null; then
    print_warning "Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Issue SSL certificates
print_info "Requesting SSL certificates for rinawarptech.com..."
sudo certbot --nginx -d rinawarptech.com -d www.rinawarptech.com -d api.rinawarptech.com --non-interactive --agree-tos --email support@rinawarptech.com

print_status "SSL certificates installed and configured"

print_info "Step 4: Configuring Nginx..."
# Backup existing nginx config if it exists
if [ -f /etc/nginx/sites-available/rinawarptech.com ]; then
    sudo cp /etc/nginx/sites-available/rinawarptech.com /etc/nginx/sites-available/rinawarptech.com.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create comprehensive nginx configuration
sudo tee /etc/nginx/sites-available/rinawarptech.com > /dev/null <<EOF
# RinaWarp Tech - Production Nginx Configuration
server {
    listen 80;
    server_name rinawarptech.com www.rinawarptech.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rinawarptech.com www.rinawarptech.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/rinawarptech.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rinawarptech.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Main website (Netlify deploy here)
    location / {
        root /var/www/rinawarp-website;
        index index.html;
        try_files \$uri \$uri/ =404;
    }
    
    # API routes - Proxy to backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Downloads - Serve directly from filesystem
    location /downloads/ {
        alias /var/www/rinawarp-downloads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Set proper content types
        location ~* \.(AppImage|appimage)$ {
            add_header Content-Type application/octet-stream;
        }
        location ~* \.(deb| DEB)$ {
            add_header Content-Type application/vnd.debian.binary-package;
        }
        location ~* \.(exe| EXE)$ {
            add_header Content-Type application/octet-stream;
        }
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Favicon
    location = /favicon.ico {
        root /var/www/rinawarp-website/assets;
        expires 1y;
    }
    
    # Robots.txt
    location = /robots.txt {
        root /var/www/rinawarp-website;
        expires 1d;
    }
}

# API subdomain
server {
    listen 443 ssl http2;
    server_name api.rinawarptech.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/rinawarptech.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rinawarptech.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # API routes
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/rinawarptech.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

print_status "Nginx configured"

print_info "Step 5: Setting up PM2 process management..."
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rinawarp-backend',
    script: './fastapi_server.py',
    cwd: '/home/ubuntu/Documents/RinaWarp',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/rinawarp/backend-error.log',
    out_file: '/var/log/rinawarp/backend-out.log',
    log_file: '/var/log/rinawarp/backend-combined.log',
    time: true
  }]
};
EOF

# Start backend with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_status "PM2 configured and backend started"

print_info "Step 6: Setting up auto-renewal for SSL certificates..."
# Create renew hook for PM2 restart after cert renewal
sudo tee /etc/letsencrypt/renewal-hooks/post/rinawarp-actions.sh > /dev/null << 'EOF'
#!/bin/bash
# RinaWarp SSL Renewal Hook

# Restart PM2 processes
sudo -u ubuntu pm2 restart rinawarp-backend

# Reload Nginx
sudo nginx -s reload

echo "RinaWarp services restarted after SSL renewal" | logger
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/post/rinawarp-actions.sh

print_status "SSL auto-renewal configured"

print_info "Step 7: Final system checks..."
# Test nginx
sudo systemctl status nginx --no-pager -l

# Test PM2
pm2 status

print_status "System setup complete!"

print_info "Step 8: Deployment Instructions..."
echo ""
echo "🎉 RINAWARP DEPLOYMENT SETUP COMPLETE!"
echo "======================================"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Deploy website to /var/www/rinawarp-website/:"
echo "   - Upload rinawarptech-website-deploy.zip contents"
echo ""
echo "2. Upload download files to /var/www/rinawarp-downloads/:"
echo "   - RinaWarp.Terminal.Pro-1.0.0.AppImage"
echo "   - RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb"
echo "   - RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe"
echo ""
echo "3. Start backend service:"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "4. Verify deployment:"
echo "   curl -I https://rinawarptech.com"
echo "   curl -I https://api.rinawarptech.com/health"
echo ""
echo "🔗 KEY ENDPOINTS:"
echo "   Website: https://rinawarptech.com"
echo "   API: https://api.rinawarptech.com"
echo "   Downloads: https://api.rinawarptech.com/downloads/"
echo ""
echo "📊 MONITORING:"
echo "   pm2 logs rinawarp-backend"
echo "   pm2 monit"
echo "   tail -f /var/log/rinawarp/backend-combined.log"
echo ""
print_status "One-click deployment script completed successfully!"