#!/bin/bash
# Setup Script for Database Schema Validation System
# Run this after cloning the repository

set -e

echo "🚀 Setting up Card Nexus Schema Validation System"
echo "================================================="

# Make scripts executable
echo "📝 Setting up executable permissions..."
chmod +x scripts/validate-schema.sh
chmod +x scripts/pre-commit-hook.sh

# Setup git hooks
echo "🎣 Setting up Git hooks..."
mkdir -p .git/hooks
ln -sf ../../scripts/pre-commit-hook.sh .git/hooks/pre-commit

echo "✅ Git pre-commit hook installed"

# Test script functionality
echo "🔍 Testing schema validation system..."

if [ -f ".env.local" ] && docker ps | grep -q cardnexus-postgres; then
    echo "🐳 Docker PostgreSQL detected, testing validation..."
    
    if ./scripts/validate-schema.sh local; then
        echo "✅ Local database validation works"
    else
        echo "⚠️  Local database validation test failed (this is normal if DB is not set up yet)"
    fi
else
    echo "ℹ️  Docker database not running, skipping local test"
fi

# Create validation configuration
echo "⚙️  Creating validation configuration..."

cat > .env.validation.example << 'EOF'
# Database Schema Validation Configuration
# Copy to .env.local and update values

# Local Docker Database (for development)
DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"

# Neon Production Database (for validation against production)
NEON_DATABASE_URL="postgresql://neondb_owner:password@host/database?sslmode=require"
EOF

echo "📋 Available commands:"
echo "  npm run db:validate      - Validate schema consistency"
echo "  npm run db:status        - Check migration status"
echo "  npm run db:sync          - Synchronize schemas"
echo "  npm run pre-commit       - Run pre-commit validation"
echo "  npm run deploy:validate  - Validate before deployment"

echo ""
echo "🎯 Next steps:"
echo "  1. Update .env.local with correct database URLs"
echo "  2. Start Docker: docker-compose up -d"
echo "  3. Run validation: npm run db:validate"

echo ""
echo "🎉 Schema validation system setup complete!"