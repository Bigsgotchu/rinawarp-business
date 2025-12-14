Write-Host "🔍 RinaWarp Deep Audit (Windows)"

$matches = Select-String -Path . -Pattern "sk_live_" -Recurse -ErrorAction SilentlyContinue

if ($matches) {
  Write-Error "LIVE STRIPE KEYS FOUND"
  $matches | Out-File security\stripe-leak.txt
  exit 1
}

Write-Host "✅ No live Stripe keys detected"
exit 0
