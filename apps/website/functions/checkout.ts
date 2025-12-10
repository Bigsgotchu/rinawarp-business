import { stripe } from '../utils/stripe'

// Product mapping from slugs to Stripe product IDs
const PRODUCT_MAP = {
  "terminal-pro": "prod_TSMDTIPKWO80Qb",
  "ai-mvc-starter": "prod_TWku0VTZJqcJtR",
  "ai-mvc-pro": "prod_TSMDU4N4jowxyl",
  "bundle": "prod_TSMDU4N4jowxyl"
}

// Helper function for JSON responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status
  })
}

export async function onRequest(context: any) {
  const { request, env } = context
  const url = new URL(request.url)
  const productSlug = url.searchParams.get('product')

  if (!productSlug) {
    return jsonResponse({ error: "Missing product parameter" }, 400)
  }

  const productId = PRODUCT_MAP[productSlug as keyof typeof PRODUCT_MAP]

  if (!productId) {
    return jsonResponse({ error: "Invalid product" }, 400)
  }

  try {
    // Get pricing config from KV
    const pricingConfig = await env.PRICING_KV.get("pricing_config_v1", "json")

    if (!pricingConfig || !pricingConfig[productId]) {
      return jsonResponse({ error: "Pricing configuration not found" }, 404)
    }

    const priceId = pricingConfig[productId]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${url.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/cancel.html`,
      metadata: {
        product_slug: productSlug,
        product_id: productId
      }
    })

    // Redirect to Stripe checkout
    return Response.redirect(session.url || '', 303)

  } catch (error) {
    console.error('Checkout error:', error)
    return jsonResponse({ error: "Failed to create checkout session" }, 500)
  }
}