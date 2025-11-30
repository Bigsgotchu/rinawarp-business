#!/bin/bash

echo "🛡️ RinaWarp File Integrity Scanner"
echo "==================================="
echo ""

# Check if we're in the right directory
if [ ! -d "website" ]; then
    echo "❌ Error: website/ directory not found"
    echo "   Run from RinaWarp project root"
    exit 1
fi

INTEGRITY_FILE=".integrity.hash"
SHA256_CMD="sha256sum"

# Check if sha256sum is available
if ! command -v $SHA256_CMD &> /dev/null; then
    echo "❌ Error: $SHA256_CMD not found"
    echo "   This tool is required for integrity checking"
    exit 1
fi

case "${1:-baseline}" in
    "baseline"|"save")
        echo "📊 Creating integrity baseline for website/ files..."
        echo "💾 Saving to: $INTEGRITY_FILE"
        
        # Create baseline hash
        $SHA256_CMD $(find website -type f | sort) > "$INTEGRITY_FILE"
        
        if [ $? -eq 0 ]; then
            echo "✅ Integrity baseline created successfully"
            echo "📋 File count: $(wc -l < "$INTEGRITY_FILE") files"
            echo "🕒 Timestamp: $(date)"
        else
            echo "❌ Failed to create integrity baseline"
            exit 1
        fi
        ;;
        
    "check"|"verify")
        if [ ! -f "$INTEGRITY_FILE" ]; then
            echo "❌ Error: Integrity baseline not found"
            echo "   Run with: $0 baseline"
            exit 1
        fi
        
        echo "🔍 Verifying website file integrity..."
        echo "📋 Using baseline: $INTEGRITY_FILE"
        echo ""
        
        # Check integrity
        if $SHA256_CMD --check "$INTEGRITY_FILE" --quiet; then
            echo "✅ INTEGRITY CHECK: PASSED"
            echo "🛡️  All website files are intact and unmodified"
        else
            echo "❌ INTEGRITY CHECK: FAILED"
            echo "⚠️  One or more files have been modified:"
            echo ""
            
            # Show which files failed
            $SHA256_CMD --check "$INTEGRITY_FILE" 2>/dev/null | grep -v "OK$" || true
            
            echo ""
            echo "💡 To update baseline after fixing issues:"
            echo "   $0 baseline"
        fi
        ;;
        
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  baseline   Create integrity baseline (default)"
        echo "  check      Verify files against baseline"
        echo "  help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                 # Create baseline"
        echo "  $0 baseline        # Create baseline"
        echo "  $0 check          # Verify integrity"
        echo ""
        echo "💡 Run 'check' after any updates to detect issues"
        echo "💡 Run 'baseline' after successful updates to save new state"
        ;;
        
    *)
        echo "❌ Unknown command: $1"
        echo "   Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
echo "==================================="