# Frontend OTP Fix Deployment Script (PowerShell)
# This script deploys the corrected frontend files with proper OTP endpoints

Write-Host "🔧 Deploying frontend OTP endpoint fixes to kiani.exchange..." -ForegroundColor Green

# Server details
$SERVER = "kianirad2020@34.169.105.176"
$PROJECT_DIR = "/home/kianirad2020/ai-services-platform"

Write-Host "📋 Backing up current frontend files..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

ssh $SERVER "cd $PROJECT_DIR && cp LoginPage.jsx LoginPage.jsx.backup.$timestamp"
ssh $SERVER "cd $PROJECT_DIR && cp RegisterPage.jsx RegisterPage.jsx.backup.$timestamp"
ssh $SERVER "cd $PROJECT_DIR && cp api.js api.js.backup.$timestamp"

Write-Host "🚀 Uploading corrected frontend files..." -ForegroundColor Green
scp LoginPage.jsx "${SERVER}:${PROJECT_DIR}/"
scp RegisterPage.jsx "${SERVER}:${PROJECT_DIR}/"
scp api.js "${SERVER}:${PROJECT_DIR}/"

Write-Host "🔄 Restarting the application..." -ForegroundColor Yellow
ssh $SERVER "cd $PROJECT_DIR && pm2 restart kiani-exchange"

Write-Host "⏳ Waiting for service to stabilize..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "✅ Checking service status..." -ForegroundColor Green
ssh $SERVER "pm2 status kiani-exchange"

Write-Host "📊 Checking recent logs..." -ForegroundColor Cyan
ssh $SERVER "pm2 logs kiani-exchange --lines 10 --timestamp"

Write-Host ""
Write-Host "🎯 Frontend OTP fix deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 To test the fix:" -ForegroundColor Yellow
Write-Host "1. Visit https://kiani.exchange"
Write-Host "2. Try to login with phone number"
Write-Host "3. Check if OTP is sent successfully"
Write-Host ""
Write-Host "📝 If issues persist, check logs with:" -ForegroundColor Yellow
Write-Host "ssh `$SERVER `"pm2 logs kiani-exchange --lines 50`""