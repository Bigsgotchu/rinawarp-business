@echo off
REM RinaWarp Terminal Pro - Personal Version Setup Script (Windows)
echo 🚀 Setting up RinaWarp Terminal Pro - Personal Version (Unlocked)
echo.

REM Create personal configuration directory
if not exist "%USERPROFILE%\.rinawarp-terminal" (
    mkdir "%USERPROFILE%\.rinawarp-terminal"
)

REM Set personal mode flag
echo ✅ Enabling personal mode...
echo true > "%USERPROFILE%\.rinawarp-terminal\personal-mode.txt"

REM Create personal license configuration
echo ✅ Setting up personal license...
(
echo {
echo   "licenseKey": "RINAWARP-PERSONAL-LIFETIME-001",
echo   "type": "Personal Lifetime (Unlocked)",
echo   "features": [
echo     "Unlimited AI requests",
echo     "Voice control and TTS",
echo     "All premium themes",
echo     "Advanced commands",
echo     "Priority support",
echo     "Data export capabilities",
echo     "Full API access",
echo     "Custom integrations",
echo     "Lifetime access",
echo     "All premium features"
echo   ],
echo   "status": "active",
echo   "unlocked": true
echo }
) > "%USERPROFILE%\.rinawarp-terminal\personal-license.json"

REM Enable all features by creating feature flags
echo ✅ Enabling all premium features...
(
echo {
echo   "aiRequests": "unlimited",
echo   "voiceEnabled": true,
echo   "themes": "all",
echo   "advancedCommands": true,
echo   "prioritySupport": true,
echo   "exportData": true,
echo   "apiAccess": true,
echo   "customIntegrations": true,
echo   "lifetimeAccess": true,
echo   "premiumFeatures": true,
echo   "restrictions": "none"
echo }
) > "%USERPROFILE%\.rinawarp-terminal\feature-flags.json"

REM Set environment variables for development
echo ✅ Configuring development environment...
set RINAWARP_PERSONAL_MODE=true
set NODE_ENV=development

echo.
echo 🎉 Personal version setup complete!
echo.
echo 📋 Your personal license includes:
echo   • Unlimited AI requests per day
echo   • Voice control and TTS features
echo   • All premium themes
echo   • Advanced commands
echo   • Priority support
echo   • Data export capabilities
echo   • Full API access
echo   • Custom integrations
echo   • Lifetime access to all features
echo.
echo 🔑 License Key: RINAWARP-PERSONAL-LIFETIME-001
echo.
echo To start using your personal version:
echo   cd production\terminal
echo   npm start
echo.
echo All features are now unlocked and ready to use! 🚀
pause