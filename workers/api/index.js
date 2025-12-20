/**
 * RinaWarp API Worker
 * Provides checkout-v2 endpoint using official Stripe SDK
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS (CORS preflight)
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        worker: 'rinawarp-api',
        version: '1.0.0',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Checkout-v2 endpoint
    if (path === '/api/checkout-v2') {
      if (method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const requestData = await request.json();
        const { plan, successUrl, cancelUrl } = requestData;

        if (!plan) {
          return new Response(JSON.stringify({ error: 'Plan is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if Stripe secret is configured
        console.log('DEBUG: env keys:', Object.keys(env));
        console.log('DEBUG: Has STRIPE_SECRET_KEY:', !!env.STRIPE_SECRET_KEY);
        console.log('DEBUG: STRIPE_SECRET_KEY length:', env.STRIPE_SECRET_KEY ? env.STRIPE_SECRET_KEY.length : 0);
        
        if (!env.STRIPE_SECRET_KEY) {
          return new Response(JSON.stringify({ 
            error: "Stripe secret not configured",
            message: "STRIPE_SECRET_KEY environment variable is missing",
            debug: {
              envKeys: Object.keys(env),
              hasSecret: !!env.STRIPE_SECRET_KEY,
              secretLength: env.STRIPE_SECRET_KEY ? env.STRIPE_SECRET_KEY.length : 0
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Import Stripe dynamically (for Workers compatibility)
        const { default: Stripe } = await import('stripe');
        
        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });

        // Map plan to Stripe price IDs
        // Real live mode price IDs retrieved from Stripe CLI
        const priceMap = {
          'terminal-pro': 'price_1SdxmFGZrRdZy3W9skXi3jvE',
          'starter-monthly': 'price_1Sdxl7GZrRdZy3W9INQvidPf',
          'creator-monthly': 'price_1SdxlKGZrRdZy3W9TvaLugc7',
          'pro-monthly': 'price_1SdxlXGZrRdZy3W9Wr1XLBIe',
          'enterprise-yearly': 'price_1SdxlXGZrRdZy3W9Wr1XLBIe',
          'pioneer-lifetime': 'price_1Sdxm2GZrRdZy3W9C5tQcWiW',
          'founder-lifetime': 'price_1SdxlmGZrRdZy3W9ncwPfgFr'
        };

        const priceId = priceMap[plan];
        if (!priceId) {
          return new Response(JSON.stringify({ error: 'Invalid plan code' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Determine checkout mode based on plan type
        const isSubscription = plan.includes('-monthly') || plan.includes('-yearly');
        const mode = isSubscription ? 'subscription' : 'payment';

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          mode: mode,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: successUrl || 'https://rinawarptech.com/success.html',
          cancel_url: cancelUrl || 'https://rinawarptech.com/cancel.html',
          metadata: {
            plan: plan,
            product: 'rinawarp-terminal-pro'
          }
        });

        const response = {
          success: true,
          sessionId: session.id,
          checkoutUrl: session.url,
          plan,
          successUrl: successUrl || 'https://rinawarptech.com/success.html',
          cancelUrl: cancelUrl || 'https://rinawarptech.com/cancel.html'
        };

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Checkout error:', error);
        return new Response(JSON.stringify({ 
          error: 'Checkout failed',
          message: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // API telemetry endpoint (simplified)
    if (path === '/api/telemetry' && method === 'POST') {
      try {
        const telemetryData = await request.json();
        
        // Basic validation
        if (!telemetryData.appVersion || !telemetryData.os) {
          return new Response(JSON.stringify({ 
            error: 'Missing required fields: appVersion, os' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Log telemetry (in production, you'd store this)
        console.log('Telemetry received:', {
          version: telemetryData.appVersion,
          os: telemetryData.os,
          timestamp: new Date().toISOString(),
        });

        return new Response(JSON.stringify({
          success: true,
          message: 'Telemetry received',
          timestamp: new Date().toISOString(),
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Telemetry error:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to process telemetry' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // API summary endpoint (simplified)
    if (path === '/api/telemetry/summary' && method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          totalReports: 0,
          byOS: {},
          byVersion: {},
          lastReport: null,
          timeRange: {
            from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
          }
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stripe webhook endpoint
    if (path === '/api/stripe-webhook' && method === 'POST') {
      try {
        const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        // For basic webhook handling without signature verification (simplified)
        // In production, you should verify the signature
        const event = JSON.parse(body);

        console.log('Stripe webhook received:', event.type);

        // Handle successful checkout completion
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          console.log('Checkout completed for session:', session.id);
          
          // You can add logic here to:
          // - Update KV storage with purchase data
          // - Send confirmation email
          // - Activate user license
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Lifetime availability endpoint
    if (path === '/api/lifetime-status' && method === 'GET') {
      try {
        const keys = ["founder-lifetime", "pioneer-lifetime", "final-lifetime"];
        const result = {};

        for (const key of keys) {
          const raw = await env.LIFETIME_SALES?.get(key);
          if (!raw) {
            result[key] = { remaining: 0, limit: 0, sold: 0 };
            continue;
          }

          const data = JSON.parse(raw);
          result[key] = {
            sold: data.sold || 0,
            limit: data.limit || 0,
            remaining: Math.max(0, (data.limit || 0) - (data.sold || 0)),
          };
        }

        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Lifetime status failed", details: err.message }),
          { status: 500 }
        );
      }
    }

    // 404 for unknown endpoints
    return new Response(JSON.stringify({
      error: 'Endpoint not found',
      path,
      method,
      timestamp: new Date().toISOString()
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
