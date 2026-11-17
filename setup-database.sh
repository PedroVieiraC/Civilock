#!/bin/bash

# DepÃ³sito Vieira - Database Setup Script
# This script creates and populates the PostgreSQL database

echo "🗄️  DepÃ³sito Vieira - Database Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration (adjust these if needed)
DB_NAME="deposito_vieira"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${BLUE}Checking PostgreSQL installation...${NC}"

# Check if PostgreSQL is installed
if ! command_exists psql; then
    echo -e "${RED}❌ PostgreSQL is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install PostgreSQL and make sure it's running${NC}"
    echo -e "${YELLOW}Ubuntu/Debian: sudo apt install postgresql postgresql-contrib${NC}"
    echo -e "${YELLOW}Then start the service: sudo systemctl start postgresql${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL client found${NC}"

# Check if PostgreSQL service is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}⚠️  PostgreSQL service is not running. Starting it...${NC}"
    sudo systemctl start postgresql
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to start PostgreSQL service${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ PostgreSQL service started${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL service is running${NC}"
fi

echo ""

# Prompt for database password
echo -e "${BLUE}Database Configuration:${NC}"
echo -e "Database: ${YELLOW}$DB_NAME${NC}"
echo -e "User: ${YELLOW}$DB_USER${NC}"
echo -e "Host: ${YELLOW}$DB_HOST${NC}"
echo -e "Port: ${YELLOW}$DB_PORT${NC}"
echo ""

read -s -p "Enter PostgreSQL password for user '$DB_USER': " DB_PASSWORD
echo ""
echo ""

# Test database connection
echo -e "${BLUE}Testing database connection...${NC}"
export PGPASSWORD="$DB_PASSWORD"

# Check if we can connect to PostgreSQL
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to PostgreSQL${NC}"
    echo -e "${YELLOW}Please check your password and PostgreSQL configuration${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Check if database exists
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to recreate it? This will delete all existing data! (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "DROP DATABASE IF EXISTS $DB_NAME;" >/dev/null 2>&1
    else
        echo -e "${BLUE}Skipping database creation${NC}"
        echo -e "${YELLOW}Note: If you're having issues, you might need to recreate the database${NC}"
        exit 0
    fi
fi

# Create database
echo -e "${BLUE}Creating database '$DB_NAME'...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE $DB_NAME;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database '$DB_NAME' created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

# Execute the database script
echo -e "${BLUE}Executing database schema and data...${NC}"
if [ ! -f "bd.txt" ]; then
    echo -e "${RED}❌ Database script 'bd.txt' not found${NC}"
    exit 1
fi

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "bd.txt" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database schema and data loaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to execute database script${NC}"
    echo -e "${YELLOW}Check bd.txt for syntax errors${NC}"
    exit 1
fi

# Update database configuration in the backend
echo -e "${BLUE}Updating backend database configuration...${NC}"
DB_CONFIG_FILE="Back-end/server/config/db.js"

if [ -f "$DB_CONFIG_FILE" ]; then
    # Create a backup
    cp "$DB_CONFIG_FILE" "$DB_CONFIG_FILE.backup"
    
    # Update the configuration
    cat > "$DB_CONFIG_FILE" << EOF
const { Client } = require('pg');

const con = new Client({
  host: '$DB_HOST',
  user: '$DB_USER',
  password: '$DB_PASSWORD',
  database: '$DB_NAME',
  port: $DB_PORT,
});

con.connect()
  .then(() => console.log("Banco de dados conectado"))
  .catch(err => console.error("Erro ao conectar ao banco:", err));

module.exports = con;
EOF

    echo -e "${GREEN}✅ Database configuration updated${NC}"
else
    echo -e "${YELLOW}⚠️  Database configuration file not found${NC}"
    echo -e "${YELLOW}Please manually update: $DB_CONFIG_FILE${NC}"
fi

# Verify data was loaded correctly
echo -e "${BLUE}Verifying database setup...${NC}"
EQUIPMENT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM EQUIPAMENTO;" 2>/dev/null)

if [ "$EQUIPMENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Database verification successful${NC}"
    echo -e "${GREEN}Found $EQUIPMENT_COUNT equipment records${NC}"
else
    echo -e "${YELLOW}⚠️  No equipment data found. The application might not display equipment properly${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  • Database: ${GREEN}$DB_NAME${NC}"
echo -e "  • Host: ${GREEN}$DB_HOST:$DB_PORT${NC}"
echo -e "  • User: ${GREEN}$DB_USER${NC}"
echo -e "  • Equipment records: ${GREEN}$EQUIPMENT_COUNT${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "  1. Run: ${BLUE}./start.sh${NC} to start the application"
echo -e "  2. Open the frontend in your browser"
echo -e "  3. Check if equipment is now loading properly"
echo ""
echo -e "${YELLOW}📝 Note:${NC} Your database configuration has been saved to $DB_CONFIG_FILE"
echo -e "         A backup of the original file was created as $DB_CONFIG_FILE.backup"

# Clean up
unset PGPASSWORD
