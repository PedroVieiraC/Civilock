#!/bin/bash

# DepÃ³sito Vieira - Project Startup Script
# This script starts the backend server and opens the frontend

echo "🏗️  DepÃ³sito Vieira - Construction Equipment Rental System"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get absolute project root path
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    netstat -tuln 2>/dev/null | grep ":$1 " >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js (v14 or higher)${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo -e "${RED}❌ Node.js version 14 or higher is required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"
echo -e "${GREEN}✅ npm $(npm --version) detected${NC}"

# Check if PostgreSQL is running
if ! command_exists psql; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed and running${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL client detected${NC}"
fi

echo ""

# Check if database is set up
echo -e "${BLUE}Checking database setup...${NC}"
DB_CONFIG_FILE="$PROJECT_ROOT/Back-end/server/config/db.js"
DATABASE_SETUP_NEEDED=false

# Check if database configuration exists and looks correct
if [ ! -f "$DB_CONFIG_FILE" ]; then
    DATABASE_SETUP_NEEDED=true
    echo -e "${YELLOW}⚠️  Database configuration file not found${NC}"
elif ! grep -q "database.*deposito_vieira" "$DB_CONFIG_FILE" 2>/dev/null; then
    DATABASE_SETUP_NEEDED=true
    echo -e "${YELLOW}⚠️  Database configuration appears incomplete${NC}"
else
    # Try to test database connection by checking if we can read from db config
    DB_HOST=$(grep -o "host.*'[^']*'" "$DB_CONFIG_FILE" 2>/dev/null | cut -d"'" -f2 || echo "localhost")
    DB_USER=$(grep -o "user.*'[^']*'" "$DB_CONFIG_FILE" 2>/dev/null | cut -d"'" -f2 || echo "postgres")
    DB_NAME=$(grep -o "database.*'[^']*'" "$DB_CONFIG_FILE" 2>/dev/null | cut -d"'" -f2 || echo "deposito_vieira")
    
    if command_exists psql; then
        # Try to connect and check if tables exist (non-interactive test)
        if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM EQUIPAMENTO LIMIT 1;" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Database connection successful${NC}"
        else
            DATABASE_SETUP_NEEDED=true
            echo -e "${YELLOW}⚠️  Cannot connect to database or tables don't exist${NC}"
        fi
    fi
fi

# Run database setup if needed
if [ "$DATABASE_SETUP_NEEDED" = true ]; then
    echo -e "${BLUE}🗄️  Database setup required${NC}"
    echo -e "${YELLOW}Running database setup script...${NC}"
    
    if [ -f "$PROJECT_ROOT/setup-database.sh" ]; then
        # Make sure the setup script is executable
        chmod +x "$PROJECT_ROOT/setup-database.sh"
        
        # Run the database setup script
        if "$PROJECT_ROOT/setup-database.sh"; then
            echo -e "${GREEN}✅ Database setup completed${NC}"
        else
            echo -e "${RED}❌ Database setup failed${NC}"
            echo -e "${YELLOW}Please run ./setup-database.sh manually${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Database setup script not found${NC}"
        echo -e "${YELLOW}Please create and run ./setup-database.sh manually${NC}"
        exit 1
    fi
    echo ""
fi

# Navigate to backend directory
echo -e "${BLUE}Setting up backend...${NC}"
cd "$PROJECT_ROOT/Back-end/server" || {
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
}

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found in backend directory${NC}"
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if port 3000 is already in use
if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Trying to kill existing process...${NC}"
    # More aggressive process killing
    pkill -f "node.*server.js" 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 3
    if port_in_use 3000; then
        echo -e "${RED}❌ Could not free port 3000. Please manually stop any process using this port${NC}"
        echo -e "${YELLOW}Try: sudo lsof -ti:3000 | xargs kill -9${NC}"
        exit 1
    fi
fi

echo ""

# Start the backend server in background
echo -e "${BLUE}🚀 Starting backend server...${NC}"
nohup npm start > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait a bit for the server to start
sleep 3

# Check if the server is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend server started successfully (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}📍 Server running at: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    echo -e "${YELLOW}Check backend.log for details${NC}"
    exit 1
fi

# Save PID for later cleanup
echo $BACKEND_PID > "$PROJECT_ROOT/backend.pid"

echo ""

# Navigate back to project root
cd "$PROJECT_ROOT" || exit 1

# Check if frontend exists
if [ ! -f "Front-end/index.html" ]; then
    echo -e "${RED}❌ Frontend files not found${NC}"
    exit 1
fi

# Open frontend in default browser
echo -e "${BLUE}🌐 Opening frontend in browser...${NC}"
FRONTEND_PATH="$(pwd)/Front-end/index.html"

# Try different commands to open browser (prioritize Chrome)
if command_exists google-chrome; then
    google-chrome "file://$FRONTEND_PATH" 2>/dev/null &
elif command_exists chromium-browser; then
    chromium-browser "file://$FRONTEND_PATH" 2>/dev/null &
elif command_exists google-chrome-stable; then
    google-chrome-stable "file://$FRONTEND_PATH" 2>/dev/null &
elif command_exists xdg-open; then
    xdg-open "file://$FRONTEND_PATH" 2>/dev/null &
elif command_exists open; then
    open "file://$FRONTEND_PATH" 2>/dev/null &
elif command_exists start; then
    start "file://$FRONTEND_PATH" 2>/dev/null &
else
    echo -e "${YELLOW}⚠️  Could not automatically open browser${NC}"
    echo -e "${BLUE}Please manually open: file://$FRONTEND_PATH${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DepÃ³sito Vieira is now running!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} file://$FRONTEND_PATH"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:3000"
echo -e "${BLUE}📊 Admin Panel:${NC} file://$(pwd)/Front-end/html/Admin.html"
echo ""
echo -e "${YELLOW}📋 Useful commands:${NC}"
echo -e "  • View backend logs: ${BLUE}tail -f backend.log${NC}"
echo -e "  • Stop the server: ${BLUE}./stop.sh${NC} or kill the process manually"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Make sure PostgreSQL is running and configured"
echo -e "  • Check backend.log if you encounter any issues"
echo -e "  • Use the admin panel for equipment and user management"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop this script (backend will continue running)${NC}"

# Wait for user input or keep script alive
while true; do
    sleep 1
done
