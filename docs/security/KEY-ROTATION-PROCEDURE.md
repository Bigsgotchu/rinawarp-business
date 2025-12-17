# Key Rotation Procedure (Template)

1. Generate new keys in the relevant provider dashboard (Stripe, Cloudflare, etc.)
2. Update the corresponding file in ./secrets/*.env (never commit the real values)
3. Redeploy affected services
4. Invalidate old keys in provider dashboards
5. Record change in CHANGELOG or internal runbook

