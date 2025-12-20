#!/bin/bash

# STRIPE-FIRST METRICS DASHBOARD
# Source of Truth: Stripe CLI Monitoring System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="stripe-metrics.log"
METRICS_FILE="stripe-metrics.json"
PID_FILE="stripe-monitor.pid"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if Stripe CLI is installed
check_stripe_cli() {
    if ! command -v stripe &> /dev/null; then
        echo -e "${RED}❌ Stripe CLI not found. Please install it first.${NC}"
        echo "Visit: https://stripe.com/docs/stripe-cli"
        exit 1
    fi
    echo -e "${GREEN}✅ Stripe CLI found${NC}"
}

# Function to initialize metrics file
init_metrics() {
    cat > "$METRICS_FILE" << 'EOF'
{
  "payments": {
    "successful": 0,
    "failed": 0,
    "total_volume": 0,
    "by_method": {},
    "by_country": {}
  },
  "failures": {
    "issuer_declined": 0,
    "insufficient_funds": 0,
    "authentication_required": 0,
    "api_errors": 0,
    "other": 0
  },
  "customers": {
    "new_customers": 0,
    "returning_customers": 0
  },
  "events": {
    "checkout_session_created": 0,
    "checkout_session_completed": 0
  },
  "last_updated": null
}
EOF
    log "Initialized metrics file"
}

# Function to update metrics
update_metrics() {
    local event_type="$1"
    local event_data="$2"
    
    case "$event_type" in
        "payment_intent.succeeded")
            # Update successful payments
            jq ".payments.successful += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            # Update volume
            local amount=$(echo "$event_data" | jq -r '.amount')
            jq ".payments.total_volume += $amount" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            # Update payment method
            local method=$(echo "$event_data" | jq -r '.payment_method_types[0] // "unknown"')
            jq ".payments.by_method[\"$method\"] = (.payments.by_method[\"$method\"] // 0) + 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            # Update country (if available)
            local country=$(echo "$event_data" | jq -r '.charges.data[0].billing_details.address.country // "unknown"')
            jq ".payments.by_country[\"$country\"] = (.payments.by_country[\"$country\"] // 0) + 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            ;;
        "payment_intent.payment_failed")
            # Update failed payments
            jq ".payments.failed += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            # Categorize failure
            local last_payment_error=$(echo "$event_data" | jq -r '.last_payment_error.code // "unknown"')
            case "$last_payment_error" in
                "card_declined")
                    jq ".failures.issuer_declined += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
                    ;;
                "insufficient_funds")
                    jq ".failures.insufficient_funds += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
                    ;;
                "authentication_required")
                    jq ".failures.authentication_required += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
                    ;;
                "api_error"|"rate_limit"|"invalid_request_error")
                    jq ".failures.api_errors += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
                    ;;
                *)
                    jq ".failures.other += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
                    ;;
            esac
            ;;
        "customer.created")
            # New customer
            jq ".customers.new_customers += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            ;;
        "checkout.session.created")
            jq ".events.checkout_session_created += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            ;;
        "checkout.session.completed")
            jq ".events.checkout_session_completed += 1" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
            ;;
    esac
    
    # Update last updated timestamp
    jq ".last_updated = \"$(date -Iseconds)\"" "$METRICS_FILE" > temp.json && mv temp.json "$METRICS_FILE"
}

# Function to display dashboard
show_dashboard() {
    clear
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}    STRIPE-FIRST METRICS DASHBOARD${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo ""
    
    # Read metrics
    successful=$(jq -r '.payments.successful' "$METRICS_FILE")
    failed=$(jq -r '.payments.failed' "$METRICS_FILE")
    volume=$(jq -r '.payments.total_volume' "$METRICS_FILE")
    new_customers=$(jq -r '.customers.new_customers' "$METRICS_FILE")
    checkout_created=$(jq -r '.events.checkout_session_created' "$METRICS_FILE")
    checkout_completed=$(jq -r '.events.checkout_session_completed' "$METRICS_FILE")
    last_updated=$(jq -r '.last_updated' "$METRICS_FILE")
    
    # Heartbeat Section
    echo -e "${GREEN}💓 PAYMENT HEARTBEAT${NC}"
    echo -e "  Successful Payments: ${GREEN}$successful${NC}"
    echo -e "  Failed Payments: ${RED}$failed${NC}"
    echo -e "  Total Volume: $${scale_amount $volume}"
    echo ""
    
    # Failure Analysis
    echo -e "${YELLOW}📊 FAILURE ANALYSIS${NC}"
    issuer_declined=$(jq -r '.failures.issuer_declined' "$METRICS_FILE")
    insufficient_funds=$(jq -r '.failures.insufficient_funds' "$METRICS_FILE")
    auth_required=$(jq -r '.failures.authentication_required' "$METRICS_FILE")
    api_errors=$(jq -r '.failures.api_errors' "$METRICS_FILE")
    
    echo -e "  Issuer Declined: ${GREEN}$issuer_declined${NC} (NORMAL)"
    echo -e "  Insufficient Funds: ${GREEN}$insufficient_funds${NC} (NORMAL)"
    echo -e "  Auth Required (3DS): ${GREEN}$auth_required${NC} (NORMAL)"
    echo -e "  API Errors: ${RED}$api_errors${NC} (BAD)"
    echo ""
    
    # Customer Metrics
    echo -e "${BLUE}👥 CUSTOMER METRICS${NC}"
    echo -e "  New Customers: ${GREEN}$new_customers${NC}"
    echo ""
    
    # Checkout Funnel
    echo -e "${PURPLE}🛒 CHECKOUT FUNNEL${NC}"
    if [ "$checkout_created" -gt 0 ]; then
        conversion_rate=$(echo "scale=2; $checkout_completed * 100 / $checkout_created" | bc -l 2>/dev/null || echo "0")
        echo -e "  Checkout Started: ${BLUE}$checkout_created${NC}"
        echo -e "  Checkout Completed: ${GREEN}$checkout_completed${NC}"
        echo -e "  Conversion Rate: ${YELLOW}${conversion_rate}%${NC}"
    else
        echo -e "  No checkout sessions yet"
    fi
    echo ""
    
    # Payment Methods
    echo -e "${CYAN}💳 PAYMENT METHODS${NC}"
    jq -r '.payments.by_method | to_entries[] | "  \(.key): \(.value)"' "$METRICS_FILE" 2>/dev/null || echo "  No data yet"
    echo ""
    
    # Countries
    echo -e "${MAGENTA}🌍 COUNTRIES${NC}"
    jq -r '.payments.by_country | to_entries[] | "  \(.key): \(.value)"' "$METRICS_FILE" 2>/dev/null || echo "  No data yet"
    echo ""
    
    # Health Check
    echo -e "${BLUE}🏥 HEALTH STATUS${NC}"
    total_attempts=$((successful + failed))
    if [ "$total_attempts" -eq 0 ]; then
        echo -e "  Status: ${YELLOW}No Stripe activity${NC}"
        echo -e "  Action: Check traffic or messaging"
    elif [ "$failed" -gt 0 ]; then
        echo -e "  Status: ${GREEN}People are trying${NC}"
        echo -e "  Signal: Real humans reached checkout"
    else
        echo -e "  Status: ${GREEN}Healthy conversion${NC}"
    fi
    echo ""
    
    echo -e "Last Updated: $last_updated"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
}

# Function to scale amount (convert cents to dollars)
scale_amount() {
    local cents=$1
    if [ "$cents" -gt 0 ]; then
        echo "$(echo "scale=2; $cents / 100" | bc -l 2>/dev/null || echo "0")"
    else
        echo "0.00"
    fi
}

# Function to start monitoring
start_monitoring() {
    log "Starting Stripe CLI monitoring..."
    
    # Kill any existing process
    if [ -f "$PID_FILE" ]; then
        local old_pid=$(cat "$PID_FILE")
        if kill -0 "$old_pid" 2>/dev/null; then
            log "Killing existing process $old_pid"
            kill "$old_pid"
        fi
        rm "$PID_FILE"
    fi
    
    # Start Stripe CLI listen in background
    nohup stripe listen --forward-to localhost:3000/webhook > stripe-cli.log 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    log "Started Stripe CLI with PID $pid"
    
    # Monitor the events
    tail -f stripe-cli.log | while read -r line; do
        if [[ $line == *"payment_intent.succeeded"* ]]; then
            log "✅ Payment succeeded"
        elif [[ $line == *"payment_intent.payment_failed"* ]]; then
            log "❌ Payment failed"
        elif [[ $line == *"customer.created"* ]]; then
            log "👤 New customer created"
        elif [[ $line == *"checkout.session"* ]]; then
            log "🛒 Checkout session event"
        fi
    done &
}

# Function to stop monitoring
stop_monitoring() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            log "Stopped monitoring process $pid"
        fi
        rm "$PID_FILE"
    fi
    
    # Kill any stripe listen processes
    pkill -f "stripe listen" 2>/dev/null || true
}

# Function to show status
show_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✅ Monitoring is running (PID: $pid)${NC}"
        else
            echo -e "${RED}❌ Monitoring process not running${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Monitoring not started${NC}"
    fi
}

# Main menu
main_menu() {
    while true; do
        echo ""
        echo "STRIPE CLI METRICS DASHBOARD"
        echo "1) Start Monitoring"
        echo "2) Stop Monitoring"
        echo "3) Show Status"
        echo "4) Show Dashboard"
        echo "5) View Logs"
        echo "6) Reset Metrics"
        echo "7) Exit"
        echo ""
        read -p "Choose option: " choice
        
        case $choice in
            1) start_monitoring ;;
            2) stop_monitoring ;;
            3) show_status ;;
            4) show_dashboard ;;
            5) echo "=== LOGS ==="; tail -20 "$LOG_FILE" ;;
            6) init_metrics; log "Metrics reset" ;;
            7) stop_monitoring; exit 0 ;;
            *) echo "Invalid option" ;;
        esac
    done
}

# Parse command line arguments
case "${1:-menu}" in
    "start")
        check_stripe_cli
        init_metrics
        start_monitoring
        main_menu
        ;;
    "dashboard")
        check_stripe_cli
        if [ ! -f "$METRICS_FILE" ]; then
            init_metrics
        fi
        show_dashboard
        ;;
    "status")
        show_status
        ;;
    "stop")
        stop_monitoring
        ;;
    "logs")
        tail -20 "$LOG_FILE"
        ;;
    "reset")
        init_metrics
        ;;
    "menu"|*)
        check_stripe_cli
        if [ ! -f "$METRICS_FILE" ]; then
            init_metrics
        fi
        main_menu
        ;;
esac