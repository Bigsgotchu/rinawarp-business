#!/bin/bash

# Quick Production Verification Runner
# Run this script before announcing RinaWarp publicly

echo "🔍 Running RinaWarp Production Verification..."
echo "============================================="

# Check if verification script exists
if [ ! -f "./final-production-verification.sh" ]; then
    echo "❌ Error: verification script not found!"
    exit 1
fi

# Run the verification
./final-production-verification.sh

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Verification successful! Ready for public announcement."
    echo ""
    echo "Next steps:"
    echo "1. git tag v1.0.0"
    echo "2. git push origin v1.0.0"
    echo "3. Announce publicly! 🚀"
else
    echo ""
    echo "⚠️  Verification failed! Please fix issues before announcing."
    exit 1
fi