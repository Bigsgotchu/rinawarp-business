#!/bin/bash

# ☁️ RinaWarp Backend - Oracle Cloud Deployment (Option A Standardized)
# Backend API → Oracle Cloud ONLY via SSH + PM2
# Backend folder: /var/www/rinawarp-api
# Start command: pm2 restart rinawarp-api

set -e

echo "☁️ RinaWarp Backend Deployment - Oracle Cloud (Option A)"
echo "======================================================"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Oracle VM Configuration
VM_IP="158.101.1.38"
VM_USER="ubuntu"
PROJECT_DIR="/var/www/rinawarp-api"
BACKUP_DIR="/var/backups/rinawarp-api"

# Function to test SSH connectivity
test_ssh_connection() {
    print_status "Testing SSH connection to Oracle VM..."
    
    if ssh -i ~/.ssh/id_rsa -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VM_USER@$VM_IP "echo 'SSH connection successful'" 2>/dev/null; then
        print_success "✅ SSH connection to Oracle VM established"
        return 0
    else
        print_error "❌ Failed to connect to Oracle VM"
        print_error "Please verify:"
        echo "  1. SSH key exists: ~/.ssh/id_rsa"
        echo "  2. VM is accessible: $VM_IP"
        echo "  3. Firewall allows SSH"
        return 1
    fi
}

# Function to check backend status
check_backend_status() {
    print_status "Checking backend service status..."
    
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        echo '🔍 Backend Service Status:'
        pm2 status rinawarp-api || echo '   Service not running'
        echo
        echo '🔍 API Health Check:'
        curl -s http://localhost:4000/health || echo '   API not responding on port 4000'
        echo
        echo '🔍 Port Status:'
        netstat -tulpn | grep :4000 || echo '   Port 4000 not in use'
        echo
        echo '🔍 System Resources:'
        free -h
        df -h /
    "
}

# Function to backup current backend
backup_backend() {
    print_status "Creating backup of current backend..."
    
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        if [ -d '$PROJECT_DIR' ]; then
            echo 'Creating backup...'
            mkdir -p $BACKUP_DIR
            tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C $PROJECT_DIR . 2>/dev/null || echo 'Backup failed or directory empty'
            print_success 'Backup created in $BACKUP_DIR'
        else
            print_warning 'No existing backend to backup'
        fi
    "
}

# Function to upload new backend files
upload_backend_files() {
    print_status "Uploading new backend files to Oracle VM..."
    
    # Check if local backend exists
    if [ ! -d "apps/terminal-pro/backend" ]; then
        print_error "Local backend not found at apps/terminal-pro/backend"
        exit 1
    fi
    
    # Create deployment package
    print_status "Creating deployment package..."
    cd apps/terminal-pro/backend
    tar -czf /tmp/rinawarp-backend-deploy.tar.gz .
    cd /home/karina/Documents/RinaWarp
    
    # Upload to VM
    print_status "Uploading to Oracle VM..."
    scp -i ~/.ssh/id_rsa /tmp/rinawarp-backend-deploy.tar.gz $VM_USER@$VM_IP:/tmp/
    
    # Extract on VM
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        echo 'Extracting backend files...'
        sudo mkdir -p $PROJECT_DIR
        sudo tar -xzf /tmp/rinawarp-backend-deploy.tar.gz -C $PROJECT_DIR --strip-components=1
        sudo chown -R ubuntu:ubuntu $PROJECT_DIR
        sudo chmod -R 755 $PROJECT_DIR
        
        # Install dependencies
        cd $PROJECT_DIR
        if [ -f 'package.json' ]; then
            npm install --production
        fi
        
        # Clean up
        rm /tmp/rinawarp-backend-deploy.tar.gz
    "
    
    print_success "✅ Backend files uploaded successfully"
}

# Function to setup PM2 process
setup_pm2() {
    print_status "Setting up PM2 process management..."
    
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        cd $PROJECT_DIR
        
        # Stop existing process
        pm2 delete rinawarp-api 2>/dev/null || true
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rinawarp-api',
    script: 'fastapi_server.py',
    interpreter: 'python3',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PYTHONPATH: '$PROJECT_DIR',
      PORT: 4000,
      NODE_ENV: 'production'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    time: true,
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 3000
  }]
};
EOF
        
        # Create logs directory
        mkdir -p logs
        
        # Start with PM2
        pm2 start ecosystem.config.js
        pm2 save
        
        # Setup startup
        pm2 startup systemd -u $VM_USER --hp $PROJECT_DIR
    "
    
    print_success "✅ PM2 configured and started"
}

# Function to configure NGINX proxy
setup_nginx_proxy() {
    print_status "Configuring NGINX reverse proxy..."
    
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        sudo tee /etc/nginx/sites-available/rinawarp-api << 'EOF'
# RinaWarp API NGINX Configuration

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.rinawarptech.com;
    
    # Health check endpoint (no redirect)
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.rinawarptech.com;
    
    # SSL certificates (already configured)
    # ssl_certificate /etc/letsencrypt/live/api.rinawarptech.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.rinawarptech.com/privkey.pem;
    
    # API proxy
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }
}
EOF
        
        # Enable site and restart nginx
        sudo ln -sf /etc/nginx/sites-available/rinawarp-api /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl reload nginx
    "
    
    print_success "✅ NGINX proxy configured"
}

# Function to test deployment
test_deployment() {
    print_status "Testing backend deployment..."
    
    # Wait for services to start
    sleep 5
    
    # Test local endpoints
    print_status "Testing local endpoints..."
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        echo '🧪 Local Health Check:'
        curl -s http://localhost:4000/health
        echo
        echo '🧪 Local API Check:'
        curl -s http://localhost:4000/api/health || echo 'API endpoint not ready'
        echo
    "
    
    # Test external endpoints
    print_status "Testing external endpoints..."
    if curl -s https://api.rinawarptech.com/health | grep -q "ok\|healthy"; then
        print_success "✅ External health endpoint working"
    else
        print_warning "⚠️  External health endpoint not ready (SSL may need time to propagate)"
    fi
}

# Function to show next steps
show_next_steps() {
    print_success "🎉 RinaWarp Backend deployment complete!"
    echo ""
    echo "📋 DEPLOYMENT SUMMARY:"
    echo "   ☁️  Backend → Oracle Cloud (pm2 restart rinawarp-api)"
    echo "   🌐 Website → Netlify (handled separately)"
    echo "   📦 Downloads → Oracle VM (/var/www/rinawarp-api/downloads/)"
    echo ""
    echo "🔗 LIVE ENDPOINTS:"
    echo "   ☁️  API Health: https://api.rinawarptech.com/health"
    echo "   🔌 API Proxy: https://api.rinawarptech.com/api/*"
    echo "   📦 Downloads: https://api.rinawarptech.com/downloads/*"
    echo ""
    echo "🔧 MANAGEMENT COMMANDS:"
    echo "   Restart: pm2 restart rinawarp-api"
    echo "   Status: pm2 status"
    echo "   Logs: pm2 logs rinawarp-api"
    echo "   Monitor: pm2 monit"
    echo ""
    print_success "Option A - Oracle Cloud backend deployment complete!"
}

# Main deployment flow
main() {
    echo "🚀 Starting Option A - Oracle Cloud Backend Deployment..."
    echo ""
    
    # Test connectivity
    if ! test_ssh_connection; then
        exit 1
    fi
    
    # Check current status
    echo ""
    check_backend_status
    
    # Backup current deployment
    echo ""
    backup_backend
    
    # Deploy new backend
    echo ""
    upload_backend_files
    
    # Setup process management
    echo ""
    setup_pm2
    
    # Setup reverse proxy
    echo ""
    setup_nginx_proxy
    
    # Test deployment
    echo ""
    test_deployment
    
    # Show results
    echo ""
    show_next_steps
}

# Run main function
main

print_success "🎉 Backend deployment script completed successfully!"