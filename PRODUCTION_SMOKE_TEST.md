# Production Smoke Test

Comprehensive smoke test script for validating RinaWarp production environment accessibility, API health, and checkout flows.

## Overview

The `production-smoke-test.js` script performs critical validation of the production environment to ensure:

- **Website Accessibility**: Confirms the production website is reachable
- **API Health**: Validates the API health endpoint is responding correctly  
- **Checkout Flows**: Tests all subscription plan checkout endpoints
- **Security Checks**: Validates SSL/TLS and Content Security Policy
- **Performance**: Basic response time validation

## Features

### Critical vs Non-Critical Tests

The script distinguishes between critical and non-critical tests:

**Critical Tests** (will fail the workflow if they fail):
- Website accessibility
- API health endpoint
- All checkout flow tests

**Non-Critical Tests** (will log warnings but not fail the workflow):
- SSL/TLS validation
- Content Security Policy checks
- Performance monitoring

### Retry Logic

All critical tests include automatic retry logic:
- **Retry Attempts**: 3 attempts per test
- **Retry Delay**: 1 second between attempts
- **Timeout**: 5 seconds per request

### Comprehensive Error Handling

- Network timeouts and connection failures are handled gracefully
- Non-critical network issues generate warnings but don't fail the workflow
- Detailed error reporting for debugging

## Usage

### Command Line

```bash
# Run the smoke test
node production-smoke-test.js

# Make executable and run
chmod +x production-smoke-test.js
./production-smoke-test.js
```

### GitHub Actions Integration

```yaml
- name: Run Production Smoke Test
  run: node production-smoke-test.js
  env:
    NODE_ENV: production
```

### Docker

```bash
# Run in Docker container
docker run --rm -v $(pwd):/app node:18-alpine node /app/production-smoke-test.js
```

## Test Configuration

### Environment Variables

- `NODE_ENV`: Set to `production` for production validation
- `TIMEOUT`: Request timeout in milliseconds (default: 5000)
- `RETRY_ATTEMPTS`: Number of retry attempts (default: 3)

### Test Targets

- **Website URL**: `https://www.rinawarptech.com`
- **API URL**: `https://api.rinawarptech.com/api/checkout-v2`
- **Health URL**: `https://api.rinawarptech.com/api/health`
- **Test Plans**: `["basic", "starter", "creator", "enterprise"]`

## Test Results

### Exit Codes

- `0`: All critical tests passed
- `1`: Critical tests failed (workflow should fail)

### Output Format

The script provides detailed output with color coding:

```
[PRODUCTION SMOKE TEST] === RinaWarp Production Smoke Test ===

Target: https://www.rinawarptech.com
API: https://api.rinawarptech.com/api/checkout-v2
Health: https://api.rinawarptech.com/api/health

1. Checking website accessibility...
✅ Website accessibility - OK (200)

2. Checking API health...
✅ API health check passed - Status: healthy

3. Testing checkout flows for all plans...
✅ basic plan checkout passed - URL received
✅ starter plan checkout passed - URL received
✅ creator plan checkout passed - URL received
✅ enterprise plan checkout passed - URL received

4. Running security checks...
✅ SSL/TLS validation passed - HTTPS enforced
✅ Content Security Policy present

5. Basic performance check...
✅ Website response time: 245ms

============================================================
TEST RESULTS SUMMARY
============================================================

🌐 Website Accessibility: ✅ PASSED
🏥 API Health: ✅ PASSED

💳 Checkout Flows:
   ✅ basic: PASSED
   ✅ starter: PASSED
   ✅ creator: PASSED
   ✅ enterprise: PASSED

📊 CRITICAL FAILURES: 0
📊 CHECKOUT FAILURES: 0

✅ WORKFLOW SUCCESS: All critical tests passed
Production smoke test completed successfully
```

### Warning Examples

```
⚠️ Website accessibility failed on attempt 1, retrying in 1000ms...
⚠️ API health check failed: ECONNREFUSED
⚠️ SSL/TLS validation failed: Network timeout
⚠️ Slow response time detected: 3500ms
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Production Smoke Test
on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # Run every 6 hours

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Run Production Smoke Test
        run: node production-smoke-test.js
        env:
          NODE_ENV: production
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    stages {
        stage('Production Smoke Test') {
            steps {
                script {
                    def result = sh(
                        script: 'node production-smoke-test.js',
                        returnStatus: true
                    )
                    if (result != 0) {
                        error("Production smoke test failed")
                    }
                }
            }
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **Network Timeouts**
   - Check internet connectivity
   - Verify target URLs are correct
   - Consider increasing timeout values

2. **SSL Certificate Issues**
   - Ensure production URLs use HTTPS
   - Check certificate validity
   - Verify certificate chain

3. **API Health Failures**
   - Check API service status
   - Verify health endpoint URL
   - Review API logs for errors

4. **Checkout Flow Failures**
   - Verify API endpoints are correct
   - Check request/response format
   - Review checkout service logs

### Debug Mode

For detailed debugging, you can modify the script to include verbose logging:

```javascript
// Add to the beginning of the script
const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) {
  console.log('Debug mode enabled');
}
```

## Security Considerations

- The script uses HTTPS for all requests
- Includes User-Agent header for identification
- Validates SSL/TLS certificates
- Checks Content Security Policy headers
- Uses appropriate timeouts to prevent hanging

## Performance

- Lightweight Node.js script
- Parallel execution where possible
- Efficient retry logic
- Minimal resource usage
- Fast execution (typically under 30 seconds)

## Maintenance

- Update URLs as needed for environment changes
- Adjust timeout values based on network conditions
- Add new test plans as they're introduced
- Review and update security checks regularly
- Monitor performance metrics over time