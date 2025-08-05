#!/bin/bash

# React Application Deployment Script
# This script deploys the built React application to the server

echo "Starting React Application Deployment..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "Error: index.html not found. Make sure you're in the deployment package directory."
    exit 1
fi

# Create backup of current files
echo "Creating backup of current files..."
if [ -f "/var/www/html/index.html" ]; then
    cp /var/www/html/index.html /var/www/html/index.html.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy React application files
echo "Copying React application files..."
cp index.html /var/www/html/
cp -r assets /var/www/html/

# Set proper permissions
echo "Setting file permissions..."
chown -R www-data:www-data /var/www/html/
chmod -R 644 /var/www/html/*
chmod 755 /var/www/html/assets

# Restart web server (if using nginx)
echo "Restarting web server..."
systemctl reload nginx 2>/dev/null || echo "Nginx not found, skipping reload"

# Restart Node.js server (if using PM2)
echo "Restarting Node.js server..."
pm2 restart all 2>/dev/null || echo "PM2 not found, skipping restart"

echo "Deployment completed successfully!"
echo "Visit https://kiani.exchange to see the React application"