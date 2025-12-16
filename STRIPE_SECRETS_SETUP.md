# Stripe Secrets Setup for Cloudflare

To complete the Cloudflare environment setup, you need to set the following Stripe secrets in the `apps/website` project:

## Required Commands

```bash
cd apps/website

# Set the Stripe webhook secret
pnpm dlx wrangler secret put STRIPE_WEBHOOK_SECRET

# Set the Stripe secret key
pnpm dlx wrangler secret put STRIPE_SECRET_KEY

# Set the Stripe publishable key
pnpm dlx wrangler secret put STRIPE_PUBLISHABLE_KEY
```

## Verification

After setting the secrets, verify they exist (values will not be shown):

```bash
pnpm dlx wrangler secret list
```

## Notes

- These secrets are required for the website's payment processing functionality
- The STRIPE_PUBLISHABLE_KEY can be safely stored and is used on the client side
- The STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET should be kept confidential
- Once set, these secrets will be available to your Cloudflare Workers functions

## Cloudflare Project Details

- **Project Name**: rinawarp-website
- **Account ID**: ba2f14cefa19dbdc42ff88d772410689
- **Database**: licenses (D1)
- **R2 Bucket**: rinawarp-downloads
