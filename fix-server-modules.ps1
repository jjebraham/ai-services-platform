# Fix kiani.exchange server module issues
Write-Host "🔧 Fixing kiani.exchange server module issues..." -ForegroundColor Yellow

# Create the SSH command script
$sshScript = @"
cd /home/kianirad2020/ai-services-platform

echo "📋 Current PM2 status:"
pm2 status

echo "🛑 Stopping kiani-exchange..."
pm2 stop kiani-exchange

echo "🔍 Checking production-server.js for mixed module syntax..."
# Check if production-server.js has mixed import/require
if grep -q "import.*from" production-server.js; then
    echo "⚠️  Found ESM imports in production-server.js, converting to CommonJS..."
    # Convert any ESM imports to CommonJS requires
    sed -i "s/import \(.*\) from '\(.*\)';/const \1 = require('\2');/g" production-server.js
fi

echo "🔧 Ensuring all route files use CommonJS exports..."
# Make sure auth-routes.js uses module.exports
if [ -f "routes/auth-routes.js" ]; then
    if ! grep -q "module.exports" routes/auth-routes.js; then
        echo "Fixing auth-routes.js export..."
        sed -i 's/export default router;/module.exports = router;/g' routes/auth-routes.js
    fi
fi

echo "🔄 Restarting kiani-exchange with updated environment..."
pm2 restart kiani-exchange --update-env

echo "⏳ Waiting 5 seconds for startup..."
sleep 5

echo "📊 Final PM2 status:"
pm2 status

echo "📝 Recent logs:"
pm2 logs kiani-exchange --lines 20 --nostream

echo "✅ Server fix complete!"
"@

# Execute SSH command
Write-Host "🔗 Connecting to server..." -ForegroundColor Cyan
ssh kianirad2020@34.169.105.176 $sshScript

Write-Host "🌐 Testing server health..." -ForegroundColor Green
Start-Sleep 3

try {
    $healthResponse = Invoke-RestMethod -Uri "https://kiani.exchange/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Health check passed: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🔗 Testing OTP endpoint..." -ForegroundColor Green
try {
    $otpBody = @'
{"phoneNumber":"09121958296"}
'@
    $otpResponse = Invoke-RestMethod -Uri "https://kiani.exchange/api/auth/send-otp" -Method Post -ContentType "application/json" -Body $otpBody -TimeoutSec 15
    Write-Host "✅ OTP endpoint working: $($otpResponse.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ OTP endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "✨ Fix deployment complete!" -ForegroundColor Magenta