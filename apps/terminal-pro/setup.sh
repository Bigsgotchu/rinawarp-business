#!/bin/bash
echo "🛠 Setting up Rinawarp Terminal Pro..."

# Install dependencies
npm install

# Build TypeScript
npx tsc

# Done
echo "✅ Setup complete! Run 'npm start' to launch."
