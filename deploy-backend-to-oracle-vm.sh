#!/bin/bash

# RinaWarp Backend Deployment Script for Oracle VM
# Run this script on your Oracle VM (158.101.1.38) after uploading backend-deployment.tar.gz

set -e

echo "🚀 RinaWarp Backend Deployment to Oracle VM"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VM Configuration
VM_IP="158.101.1.38"
DOMAIN="api.rinawarptech.com"
PROJECT_DIR="/var/www/rinawarp-api"
BACKUP_DIR="/var/backups/rinawarp-api"

# Function to print colored output
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

# Function to check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        SUDO=""
    else
        SUDO="sudo"
        if ! $SUDO -n true 2>/dev/null; then
            print_error "This script requires sudo access. Please run with sudo or as root."
            exit 1
        fi
    fi
}

# Function to install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update system
    $SUDO apt update && $SUDO apt upgrade -y
    
    # Install Node.js 20.x
    print_status "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs
    
    # Install PM2
    print_status "Installing PM2..."
    $SUDO npm install -g pm2
    
    # Install NGINX
    print_status "Installing NGINX..."
    $SUDO apt install nginx -y
    $SUDO systemctl enable nginx
    
    # Install Certbot for SSL
    print_status "Installing Certbot..."
    $SUDO apt install snapd -y
    $SUDO snap install core; $SUDO snap refresh core
    $SUDO snap install --classic certbot
    
    # Create symlink for certbot
    $SUDO ln -sf /usr/bin/certbot /usr/local/bin/certbot
    
    print_success "All dependencies installed"
}

# Function to create project directories
setup_project() {
    print_status "Setting up project directories..."
    
    # Create project directory
    $SUDO mkdir -p $PROJECT_DIR
    $SUDO mkdir -p $BACKUP_DIR
    $SUDO mkdir -p $PROJECT_DIR/logs
    $SUDO mkdir -p $PROJECT_DIR/data
    
    # Create logs directory with proper permissions
    $SUDO chown -R ubuntu:ubuntu $PROJECT_DIR
    $SUDO chown -R ubuntu:ubuntu $BACKUP_DIR
    
    print_success "Project directories created"
}

# Function to deploy backend files
deploy_backend() {
    print_status "Deploying backend files..."
    
    # Check if deployment package exists
    if [ ! -f "backend-deployment.tar.gz" ]; then
        print_error "backend-deployment.tar.gz not found. Please upload it first."
        print_status "Upload command: scp -i ~/.ssh/id_rsa backend-deployment.tar.gz ubuntu@158.101.1.38:~/"
        exit 1
    fi
    
    # Extract deployment package
    cd $PROJECT_DIR
    tar -xzf ~/backend-deployment.tar.gz --strip-components=1
    
    # Install dependencies
    npm install --only=production
    
    # Generate Prisma client
    npx prisma generate
    
    # Set permissions
    $SUDO chown -R ubuntu:ubuntu $PROJECT_DIR
    
    print_success "Backend files deployed"
}

# Function to create production environment
setup_production_env() {
    print_status "Setting up production environment..."
    
    cd $PROJECT_DIR
    
    # Create production environment file
    cat > .env << 'EOF'
# RinaWarp Backend Production Configuration
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL="file:./data/prod.db"

# Stripe Configuration (REPLACE WITH YOUR ACTUAL VALUES)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here

# Security
RINAWARP_API_KEYS=rinawarp_secure_api_key_2024_production
JWT_SECRET=rinawarp_jwt_secret_production_2024
SESSION_SECRET=rinawarp_session_secret_production_2024

# CORS Origins
CORS_ORIGIN=https://rinawarptech.com,https://www.rinawarptech.com,https://app.rinawarptech.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Configuration
RW_API_URL=https://api.rinawarptech.com
APP_BASE_URL=https://rinawarptech.com
EOF

    # Initialize database
    npx prisma db push
    
    print_success "Production environment configured"
}

# Function to setup PM2
setup_pm2() {
    print_status "Setting up PM2 process manager..."
    
    cd $PROJECT_DIR
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rinawarp-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
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

    # Set ownership
    $SUDO chown ubuntu:ubuntu ecosystem.config.js
    
    # Start with PM2
    su - ubuntu -c "cd $PROJECT_DIR && pm2 start ecosystem.config.js"
    su - ubuntu -c "cd $PROJECT_DIR && pm2 save"
    su - ubuntu -c "pm2 startup"
    
    print_success "PM2 configured and started"
}

# Function to configure NGINX
setup_nginx() {
    print_status "Configuring NGINX reverse proxy..."
    
    # Create NGINX configuration
    cat > /etc/nginx/sites-available/rinawarp-api << 'EOF'
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
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.rinawarptech.com;
    
    # SSL Configuration (will be updated by certbot)
    # ssl_certificate /etc/letsencrypt/live/api.rinawarptech.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.rinawarptech.com/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # API proxy
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|gitignore|gitattributes|lock)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

    # Enable the site
    $SUDO ln -sf /etc/nginx/sites-available/rinawarp-api /etc/nginx/sites-enabled/
    
    # Test NGINX configuration
    if $SUDO nginx -t; then
        $SUDO systemctl restart nginx
        print_success "NGINX configured and restarted"
    else
        print_error "NGINX configuration test failed"
        exit 1
    fi
}

# Function to setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Stop NGINX temporarily
    $SUDO systemctl stop nginx
    
    # Get SSL certificate
    $SUDO certbot certonly --standalone -d api.rinawarptech.com --non-interactive --agree-tos --email admin@rinawarptech.com
    
    # Update NGINX configuration with SSL
    cat > /etc/nginx/sites-available/rinawarp-api << 'EOF'
# RinaWarp API NGINX Configuration with SSL

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
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.rinawarptech.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.rinawarptech.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.rinawarptech.com/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # API proxy
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|gitignore|gitattributes|lock)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

    # Test and restart NGINX
    if $SUDO nginx -t; then
        $SUDO systemctl restart nginx
        print_success "SSL certificate installed and NGINX restarted"
    else
        print_error "NGINX configuration test failed after SSL setup"
        exit 1
    fi
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | $SUDO crontab -
    print_success "SSL auto-renewal configured"
}

# Function to test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Wait for services to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "Health endpoint working (HTTP)"
    else
        print_warning "Health endpoint not working via HTTP"
    fi
    
    # Test HTTPS health endpoint (if SSL is working)
    if command -v curl > /dev/null 2>&1; then
        print_status "Testing HTTPS health endpoint..."
        curl -f -k https://localhost/health > /dev/null 2>&1 && print_success "HTTPS working" || print_warning "HTTPS not ready yet"
    fi
    
    # Check PM2 status
    su - ubuntu -c "pm2 status" || print_warning "PM2 status check failed"
    
    print_success "Basic deployment testing complete"
}

# Function to display next steps
show_next_steps() {
    print_success "🎉 RinaWarp Backend deployment complete!"
    echo ""
    echo -e "${GREEN}=== NEXT STEPS ===${NC}"
    echo ""
    echo "1. 🌐 DNS Configuration:"
    echo "   - Add A record: api.rinawarptech.com → 158.101.1.38"
    echo "   - Wait for DNS propagation (5-15 minutes)"
    echo ""
    echo "2. 🔑 Update Stripe Configuration:"
    echo "   - Go to https://dashboard.stripe.com/"
    echo "   - Add webhook: https://api.rinawarptech.com/api/stripe/webhook"
    echo "   - Copy webhook secret to .env file"
    echo ""
    echo "3. 🧪 Test the API:"
    echo "   - Health check: https://api.rinawarptech.com/health"
    echo "   - API health: https://api.rinawarptech.com/api/health"
    echo ""
    echo "4. 📊 Monitor:"
    echo "   - View logs: pm2 logs rinawarp-api"
    echo "   - Status: pm2 status"
    echo ""
    echo "5. 🚀 Ready for frontend deployment!"
    echo ""
    print_success "Backend API will be live at: https://api.rinawarptech.com"
}

# Main deployment flow
main() {
    check_permissions
    install_dependencies
    setup_project
    deploy_backend
    setup_production_env
    setup_pm2
    setup_nginx
    setup_ssl
    test_deployment
    show_next_steps
}

# Run main function
main

print_success "🎉 Deployment script completed successfully!"