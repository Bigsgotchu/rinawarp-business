#!/bin/bash
# AWS Console Setup Script for RinaWarp Deployment

echo "Setting up RinaWarp deployment on AWS EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create deployment directory
mkdir -p ~/rinawarp-production
cd ~/rinawarp-production

# Create package.json
cat > package.json << 'EOF'
{
  "name": "rinawarp-production",
  "version": "1.0.0",
  "description": "RinaWarp AI Music Video Creator",
  "main": "backend/index.js",
  "scripts": {
    "start": "node backend/index.js",
    "build": "cd frontend && npm run build",
    "install-all": "npm install && cd frontend && npm install"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "ws": "^8.14.2"
  }
}
EOF

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DOMAIN=rinawarptech.com
FRONTEND_URL=https://ai-music-creator.rinawarptech.com
EOF

echo "✅ Basic setup complete!"
echo "Next: Upload your frontend and backend files to ~/rinawarp-production/"
echo "Then run: npm run install-all && npm start"
