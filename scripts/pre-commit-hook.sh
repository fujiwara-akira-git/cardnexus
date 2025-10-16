#!/bin/bash
# Pre-commit Hook - Database Schema Validation
# This script runs before every git commit to ensure schema consistency

set -e

echo "🔍 Pre-commit: Database Schema Validation"
echo "========================================"

# Check if Prisma schema files have changed
if git diff --cached --name-only | grep -E "(prisma/|\.env)" > /dev/null; then
    echo "📋 Prisma-related files detected in commit, running schema validation..."
    
    # Check if validation script exists
    if [ ! -f "./scripts/validate-schema.sh" ]; then
        echo "❌ Schema validation script not found!"
        echo "💡 Run: chmod +x scripts/validate-schema.sh"
        exit 1
    fi
    
    # Set environment variables for validation
    export NEON_DATABASE_URL="${DATABASE_URL:-}"
    
    # Run schema validation
    if ./scripts/validate-schema.sh; then
        echo "✅ Schema validation passed"
    else
        echo "❌ Schema validation failed"
        echo ""
        echo "💡 To fix schema issues:"
        echo "   1. Check migration status: npm run db:status"
        echo "   2. Synchronize databases: npm run db:sync"
        echo "   3. Re-run validation: npm run db:validate"
        echo ""
        exit 1
    fi
else
    echo "ℹ️  No Prisma-related changes detected, skipping schema validation"
fi

echo "🚀 Pre-commit validation completed successfully!"