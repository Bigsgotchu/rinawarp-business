#!/bin/bash
# Load environment variables from .env file for Terminal Pro Desktop

# Check if .env file exists
if [ -f ".env" ]; then
    # Export variables from .env file
    export $(grep -v '^#' .env | xargs)
    echo "✅ Loaded environment variables from .env"
    echo "   FEEDS_ORIGIN: $FEEDS_ORIGIN"
    echo "   ARTIFACTS_ORIGIN: $ARTIFACTS_ORIGIN"
else
    echo "❌ .env file not found in current directory"
    exit 1
fi

# Run the provided command or start a shell
if [ $# -eq 0 ]; then
    echo "🚀 Starting shell with loaded environment..."
    exec bash
else
    echo "🚀 Running command with loaded environment: $@"
    exec "$@"
fi