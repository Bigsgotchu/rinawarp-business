#!/usr/bin/env bash
set -e

DOMAIN="api.rinawarptech.com"

echo "🌐 Checking DNS for $DOMAIN..."

if ! command -v dig >/dev/null 2>&1; then
  echo "❌ dig not installed"
  if command -v terminal-pro &> /dev/null; then
    terminal-pro explain-error "DNS check failed: dig not installed"
  elif command -v kilocode &> /dev/null; then
    kilocode explain-error "DNS check failed: dig not installed"
  elif command -v continue-cli &> /dev/null; then
    continue-cli explain-error "DNS check failed: dig not installed"
  else
    echo "💡 Please install dig (dnsutils package) for DNS verification"
  fi
  exit 1
fi

RESULT=$(dig +short $DOMAIN)

if [ -z "$RESULT" ]; then
  echo "❌ DNS resolution failed for $DOMAIN"
  if command -v terminal-pro &> /dev/null; then
    terminal-pro explain-error "DNS for $DOMAIN does not resolve. Check Cloudflare DNS records."
  elif command -v kilocode &> /dev/null; then
    kilocode explain-error "DNS for $DOMAIN does not resolve. Check Cloudflare DNS records."
  elif command -v continue-cli &> /dev/null; then
    continue-cli explain-error "DNS for $DOMAIN does not resolve. Check Cloudflare DNS records."
  else
    echo "💡 DNS for $DOMAIN does not resolve. Please check Cloudflare DNS records."
  fi
  exit 1
fi

echo "✅ DNS OK: $DOMAIN → $RESULT"