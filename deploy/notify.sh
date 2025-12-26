#!/bin/bash
set -e

# Slack/Teams notification script
# Requires webhook URLs set as environment variables

MESSAGE=${1:-"Deployment notification"}
CHANNEL=${2:-"deployments"}

# Slack webhook integration
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$MESSAGE\", \"channel\":\"$CHANNEL\"}" \
        "$SLACK_WEBHOOK_URL"
    echo "✅ Slack notification sent"
fi

# Teams webhook integration
if [ -n "$TEAMS_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$MESSAGE\"}" \
        "$TEAMS_WEBHOOK_URL"
    echo "✅ Teams notification sent"
fi

# Email notification (fallback)
if [ -n "$EMAIL_RECIPIENTS" ]; then
    echo "$MESSAGE" | mail -s "Deployment Notification" "$EMAIL_RECIPIENTS"
    echo "✅ Email notification sent"
fi