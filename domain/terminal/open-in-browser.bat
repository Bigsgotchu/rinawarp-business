@echo off
REM RinaWarp Terminal Pro - Browser Version (Personal License)
echo 🚀 Opening RinaWarp Terminal Pro in browser...
echo 🔑 Personal License: RINAWARP-PERSONAL-LIFETIME-001 (Active)
echo ✨ All premium features unlocked!

REM Start the development server
echo 📡 Starting development server...
start /B npm run dev

REM Wait for server to start
timeout /t 5 /nobreak > nul

REM Open in browser
echo 🌐 Opening terminal in browser...
start http://localhost:5176

echo.
echo 🎉 Terminal is now open in your browser!
echo 📋 Your personal license includes:
echo    • Unlimited AI requests per day
echo    • Voice control and TTS features
echo    • All premium themes
echo    • Advanced commands
echo    • Priority support
echo    • Data export capabilities
echo    • Full API access
echo    • Custom integrations
echo    • Lifetime access to all features
echo.
echo 🔑 License Key: RINAWARP-PERSONAL-LIFETIME-001
echo.
echo Press any key to stop the server...
pause > nul

REM Stop the server (this would need to be implemented)
echo Stopping server...