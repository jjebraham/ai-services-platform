#!/bin/bash

echo "🔧 Fixing kiani.exchange server module issues..."

# SSH into the server and fix the issues
ssh kianirad2020@34.169.105.176 << 'EOF'
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
        echo "export default router;" >> routes/auth-routes.js
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
EOF

echo "🌐 Testing server health..."
sleep 3
curl -s https://kiani.exchange/health | jq . || echo "❌ Health check failed"

echo "🔗 Testing OTP endpoint..."
curl -s -X POST https://kiani.exchange/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"09121958296"}' | jq . || echo "❌ OTP endpoint failed"

echo "✨ Fix deployment complete!"