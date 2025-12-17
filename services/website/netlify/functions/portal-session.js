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
var portal_session_exports = {};
__export(portal_session_exports, {
  default: () => portal_session_default
});
module.exports = __toCommonJS(portal_session_exports);
var import_stripe = __toESM(require("stripe"), 1);
const stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover"
});
var portal_session_default = async (request, context) => {
  try {
    const { customerId } = await request.json();
    if (!customerId) {
      return new Response(JSON.stringify({ error: "Missing customerId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.DOMAIN_URL}/account`
    });
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("\u274C Portal session error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
