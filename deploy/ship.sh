#!/bin/bash
# RinaWarp Ship Safely — Production Deployment Script
# Fully integrated with Terminal Pro AI error handling and guardrails

LOG_FILE="./logs/ship.log"
mkdir -p ./logs

# Centralized error handler
handle_error() {
  local msg="$1"
  echo "❌ $msg" | tee -a "$LOG_FILE"
  
  # Try Terminal Pro first, fall back to KiloCode, then to Continue
  if command -v terminal-pro &> /dev/null; then
    terminal-pro explain-error "$msg" | tee -a "$LOG_FILE"
    read -p "Replay last command with Terminal Pro suggestion? (y/N) " yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      terminal-pro replay-last-command
    fi
  elif command -v kilocode &> /dev/null; then
    kilocode explain-error "$msg" | tee -a "$LOG_FILE"
    read -p "Replay last command with KiloCode suggestion? (y/N) " yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      kilocode replay-last-command
    fi
  elif command -v continue-cli &> /dev/null; then
    continue-cli explain-error "$msg" | tee -a "$LOG_FILE"
    read -p "Replay last command with Continue suggestion? (y/N) " yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      continue-cli replay-last-command
    fi
  else
    echo "💡 Error details logged to: $LOG_FILE"
    echo "💡 Manual intervention required: $msg"
  fi
  
  exit 1
}

# Guarded command check
confirm_deploy() {
  echo "⚠️  You are about to DEPLOY TO PRODUCTION"
  read -p "Type EXACTLY 'DEPLOY TO PRODUCTION' to continue: " input
  [[ "$input" == "DEPLOY TO PRODUCTION" ]] || handle_error "Confirmation failed"
  
  # Optional Slack approval
  if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"Production deploy triggered on branch '"$BRANCH"'"}' \
      "$SLACK_WEBHOOK_URL" || echo "⚠️ Slack notification failed"
  fi
}

# Main deployment sequence
main() {
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  [[ "$BRANCH" == "main" ]] || handle_error "Not on main branch"

  git diff --quiet || handle_error "Working tree is not clean"

  echo "🔍 Verifying DNS..."
  bash scripts/check-dns.sh || handle_error "DNS verification failed"

  confirm_deploy

  echo "✅ Running smoke tests..."
  npm run test:smoke || handle_error "Smoke tests failed"

  echo "✅ Verifying production environment..."
  node scripts/verify-prod.js || handle_error "Production verification failed"

  echo "✅ Deploying to production..."
  bash deploy/deploy-prod.sh || handle_error "Production deploy failed"

  echo "✅ Tagging and pushing release..."
  git tag -a "v$(date +%Y.%m.%d)" -m "Production release" || handle_error "Git tagging failed"
  git push --tags || handle_error "Git push failed"

  echo "🚀 Production deployment completed successfully!"
}

main