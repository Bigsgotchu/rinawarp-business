'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);
var create_checkout_session_exports = {};
__export(create_checkout_session_exports, {
  default: () => create_checkout_session_default,
});
module.exports = __toCommonJS(create_checkout_session_exports);
var import_crypto = __toESM(require('crypto'), 1);
var import_stripe = __toESM(require('stripe'), 1);
const stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});
var create_checkout_session_default = async (request, context) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { email, price_id, success_url, cancel_url } = await request.json();
    if (!email || !price_id) {
      return new Response(JSON.stringify({ error: 'Missing email or price_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const license_key = 'RW-' + import_crypto.default.randomBytes(8).toString('hex').toUpperCase();
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existingCustomers.data.length > 0
        ? existingCustomers.data[0]
        : await stripe.customers.create({
            email,
            metadata: { license_key },
          });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: success_url || `${process.env.DOMAIN_URL}/success?license_key=${license_key}`,
      cancel_url: cancel_url || `${process.env.DOMAIN_URL}/cancel`,
      metadata: {
        license_key,
        customer_email: email,
      },
      subscription_data: {
        metadata: {
          license_key,
        },
      },
    });
    return new Response(
      JSON.stringify({
        url: session.url,
        license_key,
        session_id: session.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('\u274C Stripe Checkout error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
