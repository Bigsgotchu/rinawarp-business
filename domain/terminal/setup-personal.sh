#!/bin/bash

# RinaWarp Terminal Pro - Personal Version Setup Script
echo "🚀 Setting up RinaWarp Terminal Pro - Personal Version (Unlocked)"

# Set personal mode flag
echo "✅ Enabling personal mode..."
echo 'true' > ~/.rinawarp_personal_mode

# Create personal license in localStorage simulation
echo "✅ Setting up personal license..."
mkdir -p ~/.rinawarp-terminal
cat > ~/.rinawarp-terminal/personal-license.json << 'EOF'
{
  "licenseKey": "RINAWARP-PERSONAL-LIFETIME-001",
  "type": "Personal Lifetime (Unlocked)",
  "features": [
    "Unlimited AI requests",
    "Voice control and TTS",
    "All premium themes",
    "Advanced commands",
    "Priority support",
    "Data export capabilities",
    "Full API access",
    "Custom integrations",
    "Lifetime access",
    "All premium features"
  ],
  "status": "active",
  "unlocked": true
}
EOF

# Enable all features by creating feature flags
echo "✅ Enabling all premium features..."
cat > ~/.rinawarp-terminal/feature-flags.json << 'EOF'
{
  "aiRequests": "unlimited",
  "voiceEnabled": true,
  "themes": "all",
  "advancedCommands": true,
  "prioritySupport": true,
  "exportData": true,
  "apiAccess": true,
  "customIntegrations": true,
  "lifetimeAccess": true,
  "premiumFeatures": true,
  "restrictions": "none"
}
EOF

# Set environment variables for development
echo "✅ Configuring development environment..."
export RINAWARP_PERSONAL_MODE=true
export NODE_ENV=development

echo ""
echo "🎉 Personal version setup complete!"
echo ""
echo "📋 Your personal license includes:"
echo "   • Unlimited AI requests per day"
echo "   • Voice control and TTS features"
echo "   • All premium themes"
echo "   • Advanced commands"
echo "   • Priority support"
echo "   • Data export capabilities"
echo "   • Full API access"
echo "   • Custom integrations"
echo "   • Lifetime access to all features"
echo ""
echo "🔑 License Key: RINAWARP-PERSONAL-LIFETIME-001"
echo ""
echo "To start using your personal version:"
echo "   cd production/terminal"
echo "   npm start"
echo ""
echo "All features are now unlocked and ready to use! 🚀"