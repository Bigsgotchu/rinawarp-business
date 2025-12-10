"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stripe_webhook_exports = {};
__export(stripe_webhook_exports, {
  default: () => stripe_webhook_default
});
module.exports = __toCommonJS(stripe_webhook_exports);
var import_stripe = __toESM(require("stripe"), 1);
const stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover"
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
var stripe_webhook_default = async (request, context) => {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();
  if (!sig) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("\u26A0\uFE0F Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400
    });
  }
  try {
    switch (stripeEvent.type) {
      // Successful Checkout
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        const customerId = session.customer;
        const licenseKey = session.metadata?.license_key || "UNKNOWN";
        console.log(`\u2705 Checkout complete for license ${licenseKey}`);
        if (customerId) {
          await stripe.customers.update(customerId, {
            metadata: {
              license_key: licenseKey,
              license_status: "active",
              last_payment: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
        }
        break;
      }
      // Subscription renewed or updated
      case "invoice.payment_succeeded": {
        const invoice = stripeEvent.data.object;
        const customerId = invoice.customer;
        await stripe.customers.update(customerId, {
          metadata: { license_status: "active" }
        });
        break;
      }
      // Subscription canceled
      case "customer.subscription.deleted": {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;
        await stripe.customers.update(customerId, {
          metadata: { license_status: "inactive" }
        });
        break;
      }
      // Payment failed
      case "invoice.payment_failed": {
        const invoice = stripeEvent.data.object;
        const customerId = invoice.customer;
        await stripe.customers.update(customerId, {
          metadata: { license_status: "suspended" }
        });
        break;
      }
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("\u274C Webhook processing failed:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
