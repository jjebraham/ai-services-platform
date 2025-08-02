#!/bin/bash

# Production Deployment Script for kiani.exchange
# This script sets up the AI Services Platform for production deployment

echo "🚀 Starting production deployment for kiani.exchange..."

# Set production environment
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Checking Node.js version..."
node_version=$(node --version)
print_status "Node.js version: $node_version"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production

# Build the frontend for production
print_status "Building frontend for production..."
if npm run build; then
    print_success "Frontend build completed successfully"
else
    print_warning "Frontend build failed, continuing with existing files"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please configure your .env file with production values"
fi

# Check Supabase configuration
print_status "Checking Supabase configuration..."
if grep -q "your-supabase-url" .env; then
    print_warning "Supabase URL not configured. Please run: node setup-supabase.js"
fi

# Stop any existing Node.js processes
print_status "Stopping existing Node.js processes..."
pkill -f "node.*server" || true
sleep 2

# Create logs directory
mkdir -p logs

# Start the production server
print_status "Starting production server..."
nohup node production-server.js > logs/production.log 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    print_success "Production server started successfully (PID: $SERVER_PID)"
    print_success "Server is running on:"
    print_success "  🌐 Domain: http://kiani.exchange:3000"
    print_success "  📍 IP: http://34.169.105.176:3000"
    print_success "  🔧 Admin: http://kiani.exchange:3000/admin"
    
    # Test the health endpoint
    sleep 2
    if curl -s http://localhost:3000/health > /dev/null; then
        print_success "Health check passed"
    else
        print_warning "Health check failed - server may still be starting"
    fi
    
    echo ""
    print_status "Deployment completed! Server logs are available at: logs/production.log"
    print_status "To view logs: tail -f logs/production.log"
    print_status "To stop server: kill $SERVER_PID"
    
else
    print_error "Failed to start production server"
    print_error "Check logs/production.log for details"
    exit 1
fi

# Display important information
echo ""
echo "=================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
echo "Domain: http://kiani.exchange:3000"
echo "IP: http://34.169.105.176:3000"
echo "Admin Panel: http://kiani.exchange:3000/admin"
echo "Health Check: http://kiani.exchange:3000/health"
echo "Server PID: $SERVER_PID"
echo "Logs: tail -f logs/production.log"
echo "=================================================="
echo ""
echo "🔧 Next Steps:"
echo "1. Configure your domain DNS to point to 34.169.105.176"
echo "2. Set up SSL certificate for HTTPS (recommended)"
echo "3. Configure firewall to allow port 3000"
echo "4. Set up process manager (PM2) for auto-restart"
echo ""
echo "🔐 Security Reminders:"
echo "1. Change default admin credentials in .env"
echo "2. Set strong SESSION_SECRET in .env"
echo "3. Configure proper ADMIN_KEY in .env"
echo "4. Enable HTTPS in production"
echo ""