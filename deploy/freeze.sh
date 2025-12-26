#!/bin/bash
set -e

ACTION=${1:-status}
REASON=${2:-"Maintenance"}

FREEZE_FILE=".production_freeze"

case $ACTION in
    enable)
        echo "🧊 Enabling production freeze"
        echo "Reason: $REASON" > "$FREEZE_FILE"
        echo "Timestamp: $(date)" >> "$FREEZE_FILE"
        echo "✅ Production freeze enabled - all deployments blocked"

        # Send notifications
        ./deploy/notify.sh "🚨 PRODUCTION FREEZE ENABLED: $REASON" "#alerts"
        ;;
    disable)
        if [ -f "$FREEZE_FILE" ]; then
            echo "🧊 Disabling production freeze"
            rm "$FREEZE_FILE"
            echo "✅ Production freeze disabled"
        else
            echo "❌ No active production freeze"
        fi
        ;;
    status)
        if [ -f "$FREEZE_FILE" ]; then
            echo "🧊 Production freeze is ACTIVE"
            cat "$FREEZE_FILE"
        else
            echo "✅ Production freeze is NOT active"
        fi
        ;;
    *)
        echo "Usage: $0 {enable|disable|status} [reason]"
        exit 1
        ;;
esac