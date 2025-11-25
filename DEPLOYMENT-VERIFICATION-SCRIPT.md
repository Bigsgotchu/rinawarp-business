# Deployment Verification Script

## Quick Health Check Commands

Run these commands to verify your deployment is working correctly:

### 1. Backend API Health
```bash
# Test local health (on VM)
curl http://localhost/health

# Test external health
curl https://api.rinawarptech.com/health
curl https://api.rinawarptech.com/api/health
```

### 2. DNS Resolution Test
```bash
# Test DNS resolution
dig api.rinawarptech.com
dig rinawarptech.com
dig www.rinawarptech.com

# Test HTTP connectivity
curl -I https://api.rinawarptech.com
curl -I https://rinawarptech.com
curl -I https://www.rinawarptech.com
```

### 3. Backend Services Status
```bash
# On your Oracle VM, check services
pm2 status
pm2 logs rinawarp-api --lines 20
sudo systemctl status nginx
```

### 4. SSL Certificate Check
```bash
# Check SSL certificate
curl -I https://api.rinawarptech.com
openssl s_client -connect api.rinawarptech.com:443 -servername api.rinawarptech.com
```

### 5. Stripe Webhook Test
```bash
# Test webhook endpoint directly
curl -X POST https://api.rinawarptech.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "data": {"object": {}}}'

# Check webhook logs
pm2 logs rinawarp-api | grep webhook
```

## Expected Responses

### Health Endpoint Response
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T11:06:15.000Z",
  "database": "connected",
  "stripe": "configured"
}
```

### API Health Response
```json
{
  "ok": true,
  "uptime": 3600,
  "timestamp": "2025-11-24T11:06:15.000Z",
  "version": "1.0.0"
}
```

### DNS Resolution
```bash
# Should return IP 158.101.1.38
api.rinawarptech.com.    300    IN    A    158.101.1.38
rinawarptech.com.        300    IN    A    158.101.1.38
www.rinawarptech.com.    300    IN    A    158.101.1.38
```

## Troubleshooting

### If API Health Fails
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs rinawarp-api`
3. Restart if needed: `pm2 restart rinawarp-api`

### If DNS Not Working
1. Wait 5-15 minutes for propagation
2. Check DNS settings in your provider
3. Verify A records point to 158.101.1.38

### If SSL Issues
1. Check certbot status: `sudo certbot certificates`
2. Renew if needed: `sudo certbot renew`
3. Check NGINX config: `sudo nginx -t`

### If Webhook Issues
1. Check webhook URL in Stripe dashboard
2. Test webhook endpoint: `curl -X POST https://api.rinawarptech.com/api/stripe/webhook`
3. Verify STRIPE_WEBHOOK_SECRET in .env file

## Final Checklist

- [ ] Oracle VM deployment completed
- [ ] DNS configured: api.rinawarptech.com → 158.101.1.38
- [ ] Backend API responding at https://api.rinawarptech.com
- [ ] SSL certificate installed and working
- [ ] Stripe webhook configured and testing
- [ ] All services running (PM2, NGINX)
- [ ] Database accessible and working
- [ ] Health endpoints responding correctly

## Success Indicators

✅ **Your deployment is successful when:**
- `curl https://api.rinawarptech.com/health` returns healthy status
- DNS resolves api.rinawarptech.com to 158.101.1.38
- SSL certificate is valid (no browser warnings)
- PM2 shows rinawarp-api as online
- Stripe webhook test returns 200 status