#!/bin/bash

# AI Services Platform Deployment Script
# This script sets up and deploys the full-stack application

set -e  # Exit on any error

echo "🚀 Starting AI Services Platform Deployment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
}

# Build frontend for production
build_frontend() {
    print_status "Building frontend for production..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        print_warning "Backend .env file not found, creating from example..."
        cp backend/.env.example backend/.env
        print_warning "Please update backend/.env with your actual configuration"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        print_warning "Frontend .env file not found, creating default..."
        echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
        print_warning "Please update frontend/.env with your actual API URL"
    fi
    
    print_success "Environment setup complete"
}

# Start backend server
start_backend() {
    print_status "Starting backend server..."
    cd backend
    
    # Check if PM2 is available for production deployment
    if command -v pm2 &> /dev/null; then
        print_status "Using PM2 for process management..."
        pm2 start server.js --name "ai-services-backend"
        pm2 save
        pm2 startup
    else
        print_warning "PM2 not found, starting with npm..."
        npm start &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../backend.pid
        print_status "Backend started with PID: $BACKEND_PID"
    fi
    
    cd ..
    print_success "Backend server started"
}

# Serve frontend (for development)
serve_frontend_dev() {
    print_status "Starting frontend development server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    cd ..
    print_status "Frontend development server started with PID: $FRONTEND_PID"
}

# Deploy frontend to static hosting (production)
deploy_frontend_static() {
    print_status "Deploying frontend to static hosting..."
    
    # Copy built files to a deployment directory
    mkdir -p deployment/frontend
    cp -r frontend/dist/* deployment/frontend/
    
    print_success "Frontend deployed to deployment/frontend/"
    print_status "You can serve this directory with any static file server"
    print_status "Example: python3 -m http.server 8080 --directory deployment/frontend"
}

# Create systemd service files for production
create_systemd_services() {
    print_status "Creating systemd service files..."
    
    # Backend service
    cat > ai-services-backend.service << EOF
[Unit]
Description=AI Services Platform Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$(pwd)/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    print_success "Systemd service files created"
    print_status "To install services, run:"
    print_status "sudo cp ai-services-backend.service /etc/systemd/system/"
    print_status "sudo systemctl enable ai-services-backend"
    print_status "sudo systemctl start ai-services-backend"
}

# Main deployment function
deploy() {
    local mode=${1:-"development"}
    
    print_status "Deploying in $mode mode..."
    
    check_dependencies
    setup_environment
    install_backend_deps
    install_frontend_deps
    build_frontend
    
    if [ "$mode" = "production" ]; then
        create_systemd_services
        deploy_frontend_static
        print_status "Production deployment files created"
        print_status "Please review and configure environment variables before starting services"
    else
        start_backend
        serve_frontend_dev
        print_success "Development servers started!"
        print_status "Backend: http://localhost:5000"
        print_status "Frontend: http://localhost:5173"
        print_status "To stop servers, run: ./deploy.sh stop"
    fi
}

# Stop development servers
stop_servers() {
    print_status "Stopping development servers..."
    
    if [ -f "backend.pid" ]; then
        kill $(cat backend.pid) 2>/dev/null || true
        rm backend.pid
        print_success "Backend server stopped"
    fi
    
    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null || true
        rm frontend.pid
        print_success "Frontend server stopped"
    fi
    
    # Stop PM2 processes if they exist
    if command -v pm2 &> /dev/null; then
        pm2 stop ai-services-backend 2>/dev/null || true
        pm2 delete ai-services-backend 2>/dev/null || true
    fi
}

# Show help
show_help() {
    echo "AI Services Platform Deployment Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  deploy [development|production]  Deploy the application (default: development)"
    echo "  stop                            Stop development servers"
    echo "  build                           Build frontend only"
    echo "  help                            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                       Deploy in development mode"
    echo "  $0 deploy production            Create production deployment files"
    echo "  $0 stop                         Stop all development servers"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy "${2:-development}"
        ;;
    "stop")
        stop_servers
        ;;
    "build")
        build_frontend
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

print_success "Script completed successfully!"

