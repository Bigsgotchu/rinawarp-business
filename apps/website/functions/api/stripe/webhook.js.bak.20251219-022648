import Stripe from "stripe";

export async function onRequestPost(context) {
    const secret = context.env.STRIPE_WEBHOOK_SECRET;
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);

    const body = await context.request.text();
    const signature = context.request.headers.get("stripe-signature");

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err) {
        return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        console.log("Checkout completed:", event.data.object.id);
    }

    return new Response("ok", { status: 200 });
}
