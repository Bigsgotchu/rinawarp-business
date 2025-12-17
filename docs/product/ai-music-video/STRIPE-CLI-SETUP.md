# 🔧 STRIPE CLI SETUP AND PRODUCT CREATION

## 📋 STEP 1: Authenticate with Stripe CLI

Run this command in your terminal:

```bash
stripe login
```

This will:

1. Open your browser to Stripe dashboard
2. Ask you to confirm authentication
3. Link your local CLI to your Stripe account

## 📋 STEP 2: Create Products Using CLI

Once authenticated, run these commands:

### Create Founder Basic Product

```bash
stripe products create --name "RinaWarp Founder Basic" --description "Lifetime access to RinaWarp AI Music Creator" --active
```

### Create Founder Pro Product

```bash
stripe products create --name "RinaWarp Founder Pro" --description "Lifetime access with advanced features" --active
```

### Create Founder Premium Product

```bash
stripe products create --name "RinaWarp Founder Premium" --description "Lifetime access with premium features" --active
```

## 📋 STEP 3: Create Prices for Each Product

After creating products, you'll get product IDs. Use them to create prices:

### Founder Basic Price ($197)

```bash
stripe prices create --product "PRODUCT_ID_FROM_ABOVE" --unit-amount 19700 --currency usd --nickname "Founder Basic Lifetime"
```

### Founder Pro Price ($497)

```bash
stripe prices create --product "PRODUCT_ID_FROM_ABOVE" --unit-amount 49700 --currency usd --nickname "Founder Pro Lifetime"
```

### Founder Premium Price ($997)

```bash
stripe prices create --product "PRODUCT_ID_FROM_ABOVE" --unit-amount 99700 --currency usd --nickname "Founder Premium Lifetime"
```

## 📋 STEP 4: Get Price IDs

Run this to see all your prices:

```bash
stripe prices list --limit 10
```

Copy the price IDs and update your backend.

## 📋 STEP 5: Update Backend

Update `backend/src/services/StripeService.ts` with the real price IDs:

```typescript
// Replace these placeholder IDs with real ones from Stripe
priceId: 'price_1234567890abcdef', // Real price ID from Stripe
```

## 🎯 QUICK COMMANDS

If you want to run everything at once:

```bash
# Login first
stripe login

# Then run the automated script
powershell -ExecutionPolicy Bypass -File create-stripe-products-automated.ps1
```

## ✅ VERIFICATION

After creating products, verify they exist:

```bash
stripe products list
stripe prices list
```

Your products should appear in your Stripe dashboard at: <https://dashboard.stripe.com/products>
