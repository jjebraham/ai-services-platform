#!/bin/bash

# Start server for kiani.exchange domain
# This script configures and starts the production server for domain access

echo "🚀 Starting AI Services Platform for kiani.exchange..."

# Set environment variables for domain
export NODE_ENV=production
export PORT=80
export HOST=0.0.0.0
export DOMAIN=kiani.exchange

# Check if running as root (required for port 80)
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Port 80 requires root privileges. Trying with sudo..."
    sudo -E node production-server.js
else
    echo "✅ Running with root privileges"
    node production-server.js
fi