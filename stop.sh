#!/bin/bash

# ====================================
# RitterConstruct Project Stop Script
# ====================================
# Este script para todos os processos relacionados ao projeto
# e fecha as aplicações abertas de forma ordenada

echo "🛑 RitterConstruct - Stopping All Services"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to stop Node.js server
stop_node_server() {
    echo -e "${BLUE}📱 Checking Node.js server...${NC}"
    
    # Check PID file first
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        echo -e "${BLUE}Found backend PID file: $BACKEND_PID${NC}"
        
        if kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${YELLOW}Stopping backend server via PID...${NC}"
            kill $BACKEND_PID
            sleep 2
            
            if kill -0 $BACKEND_PID 2>/dev/null; then
                echo -e "${YELLOW}Force stopping backend server...${NC}"
                kill -9 $BACKEND_PID 2>/dev/null
            fi
            echo -e "${GREEN}✅ Backend server stopped${NC}"
        fi
        rm -f backend.pid
    fi
    
    # Find any other Node.js processes running server.js
    NODE_PIDS=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')
    
    if [ ! -z "$NODE_PIDS" ]; then
        echo -e "${YELLOW}Found additional Node.js processes: $NODE_PIDS${NC}"
        for PID in $NODE_PIDS; do
            echo -e "${YELLOW}Stopping Node.js process $PID...${NC}"
            kill -TERM $PID 2>/dev/null
        done
        sleep 2
        
        # Force kill if still running
        for PID in $NODE_PIDS; do
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${RED}Force killing process $PID...${NC}"
                kill -KILL $PID 2>/dev/null
            fi
        done
        echo -e "${GREEN}✅ All Node.js servers stopped${NC}"
    else
        echo -e "${BLUE}ℹ️  No additional Node.js servers found${NC}"
    fi
}

# Function to close project browser tabs
close_project_browser() {
    echo -e "${PURPLE}🌐 Managing browser processes...${NC}"
    
    # Count Chrome processes
    CHROME_COUNT=$(ps aux | grep -E "(chrome|chromium)" | grep -v grep | wc -l)
    
    if [ $CHROME_COUNT -gt 0 ]; then
        echo -e "${BLUE}Found $CHROME_COUNT Chrome processes running${NC}"
        echo -e "${YELLOW}📋 Browser management options:${NC}"
        echo -e "   ${BLUE}• Close project tabs: Use Ctrl+W on localhost tabs${NC}"
        echo -e "   ${BLUE}• Close all Chrome: Use Ctrl+Shift+Q${NC}"
        echo -e "   ${BLUE}• Keep browsing: Chrome will continue running${NC}"
        
        # Check for localhost tabs specifically
        LOCALHOST_PROCESSES=$(ps aux | grep "chrome.*localhost" | grep -v grep | wc -l)
        if [ $LOCALHOST_PROCESSES -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Found $LOCALHOST_PROCESSES localhost-related processes${NC}"
        fi
        
        echo -e "${GREEN}✅ Browser management info provided${NC}"
    else
        echo -e "${BLUE}ℹ️  No Chrome processes found${NC}"
    fi
}

# Function to show database connections
show_database_status() {
    echo -e "${PURPLE}🗄️  Database status:${NC}"
    
    # Check for active RitterConstruct connections
    DB_CONNECTIONS=$(ps aux | grep "postgres.*RitterConstruct" | grep -v grep | wc -l)
    
    if [ $DB_CONNECTIONS -gt 0 ]; then
        echo -e "${BLUE}Found $DB_CONNECTIONS active connection(s) to RitterConstruct${NC}"
        echo -e "${YELLOW}These connections will close automatically when clients disconnect${NC}"
    else
        echo -e "${BLUE}No active connections to RitterConstruct database${NC}"
    fi
    
    echo -e "${BLUE}PostgreSQL server continues running (system service)${NC}"
    echo -e "${GREEN}✅ Database status checked${NC}"
}

# Function to clean up project files
cleanup_project_files() {
    echo -e "${PURPLE}🧹 Cleaning up project files...${NC}"
    
    # Clean up log file
    if [ -f "backend.log" ]; then
        echo -e "${BLUE}Clearing backend.log...${NC}"
        > backend.log
    fi
    
    # Remove any temporary files
    rm -f *.tmp 2>/dev/null || true
    
    echo -e "${GREEN}✅ Project cleanup completed${NC}"
}

# Function to show final status
show_final_status() {
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}🎉 RitterConstruct shutdown completed!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "   ${GREEN}• Node.js server: Stopped${NC}"
    echo -e "   ${GREEN}• Project processes: Cleaned${NC}"
    echo -e "   ${GREEN}• Log files: Cleared${NC}"
    echo -e "   ${BLUE}• PostgreSQL: Running (system service)${NC}"
    echo -e "   ${YELLOW}• Chrome: Manual closure recommended${NC}"
    echo ""
    echo -e "${PURPLE}💡 Restart options:${NC}"
    echo -e "   ${BLUE}• Full restart: ./start.sh${NC}"
    echo -e "   ${BLUE}• Database only: ./setup-database.sh${NC}"
    echo -e "   ${BLUE}• Close VS Code: Ctrl+Shift+P > 'quit'${NC}"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting shutdown process...${NC}"
    echo ""
    
    stop_node_server
    echo ""
    
    close_project_browser
    echo ""
    
    show_database_status
    echo ""
    
    cleanup_project_files
    echo ""
    
    show_final_status
}

# Execute main function
main
