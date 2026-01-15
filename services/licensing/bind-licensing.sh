#!/bin/bash
# Bind licensing service to API

API_PORT=5656
LICENSE_ENDPOINT="http://localhost:$API_PORT/license"

# Check if API is running
if ! curl -s "http://localhost:$API_PORT/health" > /dev/null; then
    echo "ERROR: API server is not running on port $API_PORT"
    echo "Please start the API server first using: bash start-api.sh"
    exit 1
fi

# Create licensing service directory
mkdir -p rinawarp/services/licensing
mkdir -p rinawarp/services/licensing/logs

# Create licensing service with proper module system
cat > rinawarp/services/licensing/license-service.js << 'EOF'
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const logFile = path.join(__dirname, "logs", "licensing.log");

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(logMessage.trim());
}

// License generation endpoint
app.post("/license", (req, res) => {
    try {
        const { userId, email } = req.body;
        const licenseKey = `RINA-LIC-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
        
        log(`License generated for user: ${userId} (${email})`);
        
        res.json({
            success: true,
            licenseKey,
            expires: "2026-12-31",
            userId,
            email
        });
    } catch (err) {
        log(`License error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.listen(5657, () => {
    log("🔑 Licensing service running on port 5657");
});
EOF

# Create package.json for licensing service
cat > rinawarp/services/licensing/package.json << 'EOF'
{
  "name": "rinawarp-licensing",
  "version": "1.0.0",
  "description": "RinaWarp Licensing Service",
  "main": "license-service.js",
  "type": "module",
  "scripts": {
    "start": "node license-service.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Install dependencies
cd rinawarp/services/licensing
npm install

# Start licensing service
node license-service.js &
LICENSE_PID=$!

echo "✅ Licensing service bound to API"
echo "License endpoint: http://localhost:5657/license"
echo "Service PID: $LICENSE_PID"
