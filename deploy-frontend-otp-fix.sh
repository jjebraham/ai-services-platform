#!/bin/bash

# Frontend OTP Fix Deployment Script
# This script deploys the corrected frontend files with proper OTP endpoints

echo "🔧 Deploying frontend OTP endpoint fixes to kiani.exchange..."

# Server details
SERVER="kianirad2020@34.169.105.176"
PROJECT_DIR="/home/kianirad2020/ai-services-platform"

echo "📋 Backing up current frontend files..."
ssh $SERVER "cd $PROJECT_DIR && cp LoginPage.jsx LoginPage.jsx.backup.$(date +%Y%m%d_%H%M%S)"
ssh $SERVER "cd $PROJECT_DIR && cp RegisterPage.jsx RegisterPage.jsx.backup.$(date +%Y%m%d_%H%M%S)"
ssh $SERVER "cd $PROJECT_DIR && cp api.js api.js.backup.$(date +%Y%m%d_%H%M%S)"

echo "🚀 Uploading corrected frontend files..."
scp LoginPage.jsx $SERVER:$PROJECT_DIR/
scp RegisterPage.jsx $SERVER:$PROJECT_DIR/
scp api.js $SERVER:$PROJECT_DIR/

echo "🔄 Restarting the application..."
ssh $SERVER "cd $PROJECT_DIR && pm2 restart kiani-exchange"

echo "⏳ Waiting for service to stabilize..."
sleep 10

echo "✅ Checking service status..."
ssh $SERVER "pm2 status kiani-exchange"

echo "📊 Checking recent logs..."
ssh $SERVER "pm2 logs kiani-exchange --lines 10 --timestamp"

echo ""
echo "🎯 Frontend OTP fix deployment complete!"
echo ""
echo "🔍 To test the fix:"
echo "1. Visit https://kiani.exchange"
echo "2. Try to login with phone number"
echo "3. Check if OTP is sent successfully"
echo ""
echo "📝 If issues persist, check logs with:"
echo "ssh $SERVER 'pm2 logs kiani-exchange --lines 50'"