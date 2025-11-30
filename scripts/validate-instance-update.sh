#!/bin/bash

echo "Validating instance updates..."

OLD_IP="158.101.1.38"
NEW_IP="137.131.48.124"

echo "Checking for remaining old IP references..."
old_refs=$(grep -r "$OLD_IP" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" 2>/dev/null | wc -l)

if [[ $old_refs -eq 0 ]]; then
    echo "✅ No remaining old IP references found!"
else
    echo "❌ Found $old_refs remaining references to old IP"
    echo "Manual cleanup needed:"
    grep -r "$OLD_IP" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" 2>/dev/null | head -5
fi

echo "Checking new IP references..."
new_refs=$(grep -r "$NEW_IP" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" 2>/dev/null | wc -l)
echo "✅ Found $new_refs references to new IP"

echo "Validation complete!"
