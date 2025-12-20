# ===============================
# RinaWarp Terminal Pro Signing
# ===============================

# Prerequisites:
# - Windows SDK installed (winget install Microsoft.WindowsSDK)
# - Code signing certificate (.pfx file)
# - Unsigned build copied to C:\rinawarp\build\

$CertPath = "C:\rinawarp\certs\rinawarp-code-signing.pfx"
$CertPassword = "YOUR_PFX_PASSWORD"
$ExePath = "C:\rinawarp\build\RinaWarp Terminal Pro.exe"
$TimestampUrl = "http://timestamp.digicert.com"

# Sign the executable
signtool sign `
  /f $CertPath `
  /p $CertPassword `
  /fd SHA256 `
  /tr $TimestampUrl `
  /td SHA256 `
  /v `
  $ExePath

# Verify signature
signtool verify /pa /v $ExePath

# Expected output:
# Successfully signed
# Successfully verified
