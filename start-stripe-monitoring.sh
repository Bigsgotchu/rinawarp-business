#!/bin/bash

# start-stripe-monitoring.sh
# Quick start script for Stripe CLI monitoring

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 STRIPE CLI MONITORING QUICK START${NC}"
echo "======================================="

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check Stripe CLI
if command -v stripe &> /dev/null; then
    echo -e "${GREEN}✅ Stripe CLI installed: $(stripe --version)${NC}"
else
    echo -e "❌ Stripe CLI not found. Install from: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Check jq
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✅ jq installed${NC}"
else
    echo -e "❌ jq not found. Install with: brew install jq (mac) or apt-get install jq (linux)"
    exit 1
fi

# Check authentication
echo -e "\n${YELLOW}Checking Stripe authentication...${NC}"
if stripe status &> /dev/null; then
    echo -e "${GREEN}✅ Stripe CLI authenticated${NC}"
else
    echo -e "${YELLOW}⚠️  Stripe CLI not authenticated${NC}"
    echo -e "${BLUE}   Run: stripe login${NC}"
    echo -e "${BLUE}   Then run this script again${NC}"
    exit 1
fi

# Initialize metrics
echo -e "\n${YELLOW}Initializing metrics...${NC}"
./stripe-cli-monitor.sh reset > /dev/null 2>&1
echo -e "${GREEN}✅ Metrics initialized${NC}"

# Start monitoring
echo -e "\n${YELLOW}Starting Stripe CLI monitoring...${NC}"
echo -e "${BLUE}   This will start listening for webhook events${NC}"
echo -e "${BLUE}   Dashboard will be available after starting${NC}"
echo ""

# Start monitoring in background
./stripe-cli-monitor.sh start &
sleep 3

# Show status
echo -e "\n${GREEN}🎉 Monitoring started successfully!${NC}"
echo ""
echo -e "${BLUE}📊 QUICK COMMANDS:${NC}"
echo "   View dashboard:     ./stripe-cli-monitor.sh dashboard"
echo "   Check status:       ./stripe-cli-monitor.sh status" 
echo "   View logs:          ./stripe-cli-monitor.sh logs"
echo "   Stop monitoring:    ./stripe-cli-monitor.sh stop"
echo ""
echo -e "${BLUE}🧪 TEST WITH STRIPE CLI:${NC}"
echo "   stripe trigger payment_intent.succeeded"
echo "   stripe trigger payment_intent.payment_failed"
echo "   stripe trigger customer.created"
echo ""
echo -e "${BLUE}📖 DOCUMENTATION:${NC}"
echo "   README_STRIPE_DASHBOARD.md - Complete guide"
echo "   STRIPE_CLI_SETUP_GUIDE.md - Setup details"
echo ""
echo -e "${GREEN}Your Stripe-first metrics dashboard is now live!${NC}"