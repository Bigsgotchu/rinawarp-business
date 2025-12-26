# AI Assistant: Backend Services Validation

You are validating RinaWarp backend services.

## Tasks
- Confirm each service starts successfully
- Detect missing environment variables
- Identify port conflicts
- Suggest fixes ONLY if failures occur

## Required Services
1. API Gateway (ports 3000, 3001)
2. Auth Service (port 3002)
3. Licensing Service (port 3003)
4. Billing Service (port 3004)

## Required Environment Variables
- PORT (for each service)
- NODE_ENV
- JWT_SECRET (Auth Service)
- DATABASE_URL (Licensing Service)
- STRIPE_SECRET_KEY (Billing Service)

## Validation Steps
1. Check if service files exist
2. Verify package.json dependencies
3. Validate environment variables are set
4. Confirm ports are available
5. Test service startup

## Response Format
- ✅ Service name: Status
- ❌ Service name: Issue description
- ⚠️  Service name: Warning

## Action Rules
- Only suggest code changes if explicitly requested
- Focus on configuration and environment issues
- Provide specific, actionable fixes
- Do not refactor existing code unless asked
