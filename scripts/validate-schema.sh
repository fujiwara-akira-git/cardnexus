#!/bin/bash
# Database Schema Validation Script
# Usage: ./scripts/validate-schema.sh [local|neon]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_DB_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"
NEON_DB_URL="${DATABASE_URL:-$NEON_DATABASE_URL}"

echo -e "${BLUE}🔍 Card Nexus - Database Schema Validation${NC}"
echo "=================================================="

# Function to get table list
get_tables() {
    local db_url=$1
    local db_name=$2
    
    echo -e "${YELLOW}📋 Checking tables in ${db_name}...${NC}"
    
    if [[ $db_url == *"localhost"* ]]; then
        # Local Docker database
        PGPASSWORD=cardnexus_password psql -h localhost -p 5433 -U cardnexus_user -d cardnexus -t -c "
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            AND table_name != '_prisma_migrations'
            ORDER BY table_name;
        " | sed 's/^[ \t]*//' | grep -v '^$'
    else
        # Neon database
        psql "$db_url" -t -c "
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            AND table_name != '_prisma_migrations'
            ORDER BY table_name;
        " | sed 's/^[ \t]*//' | grep -v '^$'
    fi
}

# Function to get table schema
get_table_schema() {
    local db_url=$1
    local table_name=$2
    
    if [[ $db_url == *"localhost"* ]]; then
        # Local Docker database
        PGPASSWORD=cardnexus_password psql -h localhost -p 5433 -U cardnexus_user -d cardnexus -t -c "
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '$table_name'
            ORDER BY ordinal_position;
        "
    else
        # Neon database
        psql "$db_url" -t -c "
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '$table_name'
            ORDER BY ordinal_position;
        "
    fi
}

# Check if databases are accessible
check_database_connection() {
    local db_url=$1
    local db_name=$2
    
    echo -e "${YELLOW}🔗 Testing connection to ${db_name}...${NC}"
    
    if [[ $db_url == *"localhost"* ]]; then
        if ! docker ps | grep -q cardnexus-postgres; then
            echo -e "${RED}❌ Docker PostgreSQL container is not running!${NC}"
            echo -e "${YELLOW}💡 Start it with: docker-compose up -d${NC}"
            exit 1
        fi
        
        if ! PGPASSWORD=cardnexus_password psql -h localhost -p 5433 -U cardnexus_user -d cardnexus -c "SELECT 1;" &>/dev/null; then
            echo -e "${RED}❌ Cannot connect to local Docker database!${NC}"
            exit 1
        fi
    else
        if ! psql "$db_url" -c "SELECT 1;" &>/dev/null; then
            echo -e "${RED}❌ Cannot connect to Neon database!${NC}"
            echo -e "${YELLOW}💡 Check your DATABASE_URL environment variable${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ ${db_name} connection successful${NC}"
}

# Main validation function
validate_schemas() {
    echo -e "\n${BLUE}🏗️  Validating Database Schemas...${NC}"
    
    # Check connections
    check_database_connection "$LOCAL_DB_URL" "Local Docker DB"
    
    if [ -z "$NEON_DB_URL" ]; then
        echo -e "${YELLOW}⚠️  NEON_DATABASE_URL not set, skipping Neon validation${NC}"
        echo -e "${YELLOW}💡 Set NEON_DATABASE_URL environment variable for full validation${NC}"
        exit 0
    fi
    
    check_database_connection "$NEON_DB_URL" "Neon DB"
    
    # Get table lists
    echo -e "\n${YELLOW}📊 Comparing table structures...${NC}"
    
    LOCAL_TABLES=$(get_tables "$LOCAL_DB_URL" "Local")
    NEON_TABLES=$(get_tables "$NEON_DB_URL" "Neon")
    
    # Compare table counts
    LOCAL_COUNT=$(echo "$LOCAL_TABLES" | wc -l | tr -d ' ')
    NEON_COUNT=$(echo "$NEON_TABLES" | wc -l | tr -d ' ')
    
    echo -e "Local Docker DB: ${GREEN}$LOCAL_COUNT tables${NC}"
    echo -e "Neon DB: ${GREEN}$NEON_COUNT tables${NC}"
    
    if [ "$LOCAL_COUNT" != "$NEON_COUNT" ]; then
        echo -e "${RED}❌ Table count mismatch!${NC}"
        echo -e "${YELLOW}Local tables:${NC}"
        echo "$LOCAL_TABLES"
        echo -e "${YELLOW}Neon tables:${NC}"
        echo "$NEON_TABLES"
        exit 1
    fi
    
    # Compare individual tables
    echo -e "\n${YELLOW}🔍 Detailed schema comparison...${NC}"
    
    SCHEMA_DIFF=false
    
    while IFS= read -r table; do
        if [ -n "$table" ]; then
            echo -n "Checking $table... "
            
            LOCAL_SCHEMA=$(get_table_schema "$LOCAL_DB_URL" "$table" | sort)
            NEON_SCHEMA=$(get_table_schema "$NEON_DB_URL" "$table" | sort)
            
            if [ "$LOCAL_SCHEMA" = "$NEON_SCHEMA" ]; then
                echo -e "${GREEN}✅${NC}"
            else
                echo -e "${RED}❌${NC}"
                echo -e "${RED}Schema mismatch in table: $table${NC}"
                SCHEMA_DIFF=true
            fi
        fi
    done <<< "$LOCAL_TABLES"
    
    if [ "$SCHEMA_DIFF" = true ]; then
        echo -e "\n${RED}❌ Schema validation failed!${NC}"
        echo -e "${YELLOW}💡 Run 'npm run db:sync' to synchronize schemas${NC}"
        exit 1
    fi
    
    echo -e "\n${GREEN}🎉 All schemas are synchronized!${NC}"
}

# Run migration status check
check_migration_status() {
    echo -e "\n${BLUE}📋 Checking migration status...${NC}"
    
    echo -e "${YELLOW}Local Docker migration status:${NC}"
    DATABASE_URL="$LOCAL_DB_URL" npx prisma migrate status
    
    if [ -n "$NEON_DB_URL" ]; then
        echo -e "\n${YELLOW}Neon migration status:${NC}"
        DATABASE_URL="$NEON_DB_URL" npx prisma migrate status
    fi
}

# Main execution
case "${1:-validate}" in
    "local")
        check_database_connection "$LOCAL_DB_URL" "Local Docker DB"
        echo -e "${GREEN}✅ Local database validation passed${NC}"
        ;;
    "neon")
        if [ -z "$NEON_DB_URL" ]; then
            echo -e "${RED}❌ NEON_DATABASE_URL not set${NC}"
            exit 1
        fi
        check_database_connection "$NEON_DB_URL" "Neon DB"
        echo -e "${GREEN}✅ Neon database validation passed${NC}"
        ;;
    "migrate")
        check_migration_status
        ;;
    *)
        validate_schemas
        check_migration_status
        ;;
esac

echo -e "\n${GREEN}🚀 Schema validation completed successfully!${NC}"