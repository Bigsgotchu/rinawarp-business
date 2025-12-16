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
var license_verify_exports = {};
__export(license_verify_exports, {
  default: () => license_verify_default,
});
module.exports = __toCommonJS(license_verify_exports);
var import_stripe = __toESM(require('stripe'), 1);
const stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});
var license_verify_default = async (request, context) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { license_key } = await request.json();
    if (!license_key) {
      return new Response(JSON.stringify({ error: 'license_key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const validKeys = (process.env.VALID_LICENSE_KEYS || '').split(',');
    const isValid = validKeys.includes(license_key.trim());
    if (isValid) {
      return new Response(
        JSON.stringify({
          valid: true,
          license_key,
          plan: 'Professional',
          status: 'active',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    try {
      const customers = await stripe.customers.search({
        query: `metadata['license_key']:'${license_key}'`,
        limit: 1,
      });
      if (!customers.data.length) {
        return new Response(JSON.stringify({ error: 'Invalid license key' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const customer = customers.data[0];
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });
      if (!subscriptions.data.length) {
        return new Response(JSON.stringify({ error: 'License inactive or expired' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const subscription = subscriptions.data[0];
      const planName = subscription.items.data[0].plan.nickname || 'Standard';
      return new Response(
        JSON.stringify({
          valid: true,
          customer_email: customer.email,
          license_key,
          plan: planName,
          subscription_id: subscription.id,
          product_id: subscription.items.data[0].plan.product,
          status: subscription.status,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (stripeErr) {
      console.error('Stripe error:', stripeErr);
      return new Response(JSON.stringify({ error: 'License verification service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('\u274C License check failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
