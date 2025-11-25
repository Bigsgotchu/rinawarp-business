# Stripe $1 Test Product Setup

## Manual Steps Required (User Action)

### 1. Access Stripe Dashboard
1. Go to [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2. **IMPORTANT**: Make sure you're in **LIVE MODE** (toggle in top-left)
3. Sign in with your account

### 2. Create New Product
1. Go to **Products** in the left sidebar
2. Click **"+ Add product"**
3. Fill out the form:
   - **Name**: `RinaWarp Terminal Pro - $1 Test`
   - **Description**: `Test purchase for RinaWarp Terminal Pro licensing system`
   - **Pricing**: 
     - **Price**: `$1.00`
     - **Billing**: `One-time payment`

### 3. Create Price
After creating the product, make sure you create a price:
1. The product should automatically create a default $1.00 price
2. Copy the **Price ID** (starts with `price_`) - you'll need this

### 4. Get Product and Price IDs
1. **Product ID**: Copy the Product ID from the URL when viewing the product
2. **Price ID**: Copy from the pricing section (starts with `price_`)

### 5. Webhook Configuration
If not already set up:
1. Go to **Developers → Webhooks**
2. **Endpoint URL**: `https://api.rinawarptech.com/api/stripe/webhook`
3. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the **Webhook signing secret** (starts with `whsec_`)

### 6. Environment Variables to Update

After getting your IDs, update the backend `.env` file:

```bash
# Add these for your test product
STRIPE_TEST_PRODUCT_ID=prod_your_actual_product_id
STRIPE_TEST_PRICE_ID=price_your_actual_price_id
```

### 7. Restart Backend
After updating environment variables:
```bash
pm2 restart rinawarp-api
```

## Next Steps After Setup
Once you've completed these manual steps, I can help you:
1. Configure the price ID in the system
2. Test the $1 purchase flow
3. Verify license generation
4. Check database records
5. Test success page redirect

## What You'll Need to Share
Please provide:
1. **Product ID**: `prod_xxxxxxxxxx`
2. **Price ID**: `price_xxxxxxxxxx`
3. **Webhook Secret**: `whsec_xxxxxxxxxx` (if you need to update it)

I'll handle the technical integration once you provide these details!