#!/bin/bash

# DepÃ³sito Vieira - Database Migration Script
# This script migrates data from 'trabalho' to 'deposito_vieira' database

echo "🔄 DepÃ³sito Vieira - Database Migration"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
OLD_DB_NAME="trabalho"
NEW_DB_NAME="deposito_vieira"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}Migration from '$OLD_DB_NAME' to '$NEW_DB_NAME'${NC}"
echo ""

# Prompt for database password
read -s -p "Enter PostgreSQL password for user '$DB_USER': " DB_PASSWORD
echo ""
echo ""

# Set password for all operations
export PGPASSWORD="$DB_PASSWORD"

# Check if old database exists
echo -e "${BLUE}Checking if old database '$OLD_DB_NAME' exists...${NC}"
OLD_DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$OLD_DB_NAME';" 2>/dev/null)

if [ "$OLD_DB_EXISTS" != "1" ]; then
    echo -e "${YELLOW}⚠️  Old database '$OLD_DB_NAME' not found. Creating new database '$NEW_DB_NAME' from scratch...${NC}"
    
    # Run the regular setup script
    if [ -f "./setup-database.sh" ]; then
        ./setup-database.sh
        exit 0
    else
        echo -e "${RED}❌ setup-database.sh not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Old database '$OLD_DB_NAME' found${NC}"

# Check if new database already exists
NEW_DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$NEW_DB_NAME';" 2>/dev/null)

if [ "$NEW_DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database '$NEW_DB_NAME' already exists${NC}"
    read -p "Do you want to recreate it? This will delete all existing data! (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Dropping existing database '$NEW_DB_NAME'...${NC}"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "DROP DATABASE IF EXISTS \"$NEW_DB_NAME\";" >/dev/null 2>&1
    else
        echo -e "${BLUE}Migration cancelled${NC}"
        exit 0
    fi
fi

# Create new database
echo -e "${BLUE}Creating new database '$NEW_DB_NAME'...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE \"$NEW_DB_NAME\";" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database '$NEW_DB_NAME' created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create database '$NEW_DB_NAME'${NC}"
    exit 1
fi

# Dump data from old database
echo -e "${BLUE}Exporting data from '$OLD_DB_NAME'...${NC}"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$OLD_DB_NAME" > temp_migration.sql 2>/dev/null; then
    echo -e "${GREEN}✅ Data exported successfully${NC}"
else
    echo -e "${RED}❌ Failed to export data${NC}"
    exit 1
fi

# Import data to new database
echo -e "${BLUE}Importing data to '$NEW_DB_NAME'...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$NEW_DB_NAME" -f temp_migration.sql >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Data imported successfully${NC}"
else
    echo -e "${RED}❌ Failed to import data${NC}"
    exit 1
fi

# Clean up temporary file
rm -f temp_migration.sql

# Verify data migration
echo -e "${BLUE}Verifying data migration...${NC}"
EQUIPMENT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$NEW_DB_NAME" -tAc "SELECT COUNT(*) FROM EQUIPAMENTO;" 2>/dev/null)

if [ "$EQUIPMENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Migration verification successful${NC}"
    echo -e "${GREEN}Found $EQUIPMENT_COUNT equipment records in new database${NC}"
else
    echo -e "${YELLOW}⚠️  No equipment data found in new database${NC}"
fi

# Ask if user wants to remove old database
echo ""
read -p "Migration completed! Do you want to remove the old database '$OLD_DB_NAME'? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing old database '$OLD_DB_NAME'...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "DROP DATABASE IF EXISTS \"$OLD_DB_NAME\";" >/dev/null 2>&1
    echo -e "${GREEN}✅ Old database removed${NC}"
else
    echo -e "${BLUE}Old database '$OLD_DB_NAME' preserved${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database migration completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  • Old database: ${YELLOW}$OLD_DB_NAME${NC}"
echo -e "  • New database: ${GREEN}$NEW_DB_NAME${NC}"
echo -e "  • Equipment records: ${GREEN}$EQUIPMENT_COUNT${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "  1. Database configuration has been updated automatically"
echo -e "  2. Run: ${BLUE}./start.sh${NC} to start the application"
echo -e "  3. Verify that everything works correctly"

# Clean up
unset PGPASSWORD
