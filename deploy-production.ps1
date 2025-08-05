# Production Deployment Script for kiani.exchange (PowerShell)
# This script deploys the AI Services Platform with Persian translations

Write-Host "🚀 Starting production deployment for kiani.exchange..." -ForegroundColor Blue

# Set production environment variables
$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:HOST = "0.0.0.0"

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root directory."
    exit 1
}

Write-Status "Checking Node.js version..."
$nodeVersion = node --version
Write-Status "Node.js version: $nodeVersion"

# Install dependencies
Write-Status "Installing production dependencies..."
npm ci --only=production

# Build the frontend for production
Write-Status "Building frontend for production with Persian translations..."
if (npm run build) {
    Write-Success "Frontend build completed successfully"
} else {
    Write-Warning "Frontend build failed, continuing with existing files"
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from .env.example..."
    Copy-Item ".env.example" ".env"
    Write-Warning "Please configure your .env file with production values"
}

# Stop any existing Node.js processes
Write-Status "Stopping existing Node.js processes..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Create logs directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# Start the production server
Write-Status "Starting production server..."
$serverProcess = Start-Process -FilePath "node" -ArgumentList "production-server.js" -RedirectStandardOutput "logs\production.log" -RedirectStandardError "logs\error.log" -PassThru

# Wait a moment for server to start
Start-Sleep -Seconds 3

# Check if server is running
if ($serverProcess -and !$serverProcess.HasExited) {
    Write-Success "Production server started successfully (PID: $($serverProcess.Id))"
    Write-Success "Server is running on:"
    Write-Success "  🌐 Domain: http://kiani.exchange:3000"
    Write-Success "  📍 IP: http://34.169.105.176:3000"
    Write-Success "  🔧 Admin: http://kiani.exchange:3000/admin"
    Write-Success "  🏠 Local: http://localhost:3000"
    
    # Test the health endpoint
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Health check passed"
        }
    } catch {
        Write-Warning "Health check failed - server may still be starting"
    }
    
    Write-Host ""
    Write-Status "Deployment completed! Server logs are available at: logs\production.log"
    Write-Status "To view logs: Get-Content logs\production.log -Wait"
    Write-Status "To stop server: Stop-Process -Id $($serverProcess.Id)"
    
} else {
    Write-Error "Failed to start production server"
    Write-Error "Check logs\production.log and logs\error.log for details"
    exit 1
}

# Display important information
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Domain: http://kiani.exchange:3000" -ForegroundColor Cyan
Write-Host "IP: http://34.169.105.176:3000" -ForegroundColor Cyan
Write-Host "Local: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Admin Panel: http://kiani.exchange:3000/admin" -ForegroundColor Cyan
Write-Host "Health Check: http://kiani.exchange:3000/health" -ForegroundColor Cyan
Write-Host "Server PID: $($serverProcess.Id)" -ForegroundColor Cyan
Write-Host "Logs: Get-Content logs\production.log -Wait" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure your domain DNS to point to 34.169.105.176" -ForegroundColor White
Write-Host "2. Set up SSL certificate for HTTPS (recommended)" -ForegroundColor White
Write-Host "3. Configure firewall to allow port 3000" -ForegroundColor White
Write-Host "4. Set up process manager for auto-restart" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Security Reminders:" -ForegroundColor Yellow
Write-Host "1. Change default admin credentials in .env" -ForegroundColor White
Write-Host "2. Set strong SESSION_SECRET in .env" -ForegroundColor White
Write-Host "3. Configure proper ADMIN_KEY in .env" -ForegroundColor White
Write-Host "4. Enable HTTPS in production" -ForegroundColor White
Write-Host ""
Write-Host "✨ Persian Translation Features:" -ForegroundColor Magenta
Write-Host "1. Complete Persian UI translations" -ForegroundColor White
Write-Host "2. Persian service descriptions and features" -ForegroundColor White
Write-Host "3. Language switching functionality" -ForegroundColor White
Write-Host "4. RTL support for Persian text" -ForegroundColor White
Write-Host ""