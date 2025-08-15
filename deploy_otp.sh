#!/bin/bash

# Deploy OTP functionality to server
echo "Deploying OTP functionality..."

# Create services directory if it doesn't exist
ssh kianirad2020@selenium.us-west1-a.t-slate-312420 "mkdir -p /home/kianirad2020/ai-services-platform/services"

# Copy OTP service
echo "Copying OTP service..."
scp otp-service.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/services/

# Copy auth service
echo "Copying auth service..."
scp auth-service.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/services/

# Copy auth routes
echo "Copying auth routes..."
scp auth-routes.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/routes/

# Copy API file
echo "Copying API file..."
scp api.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/

# Copy React components
echo "Copying React components..."
scp LoginPage.jsx kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/src/
scp AuthContext.jsx kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/src/

# Build and restart
echo "Building and restarting application..."
ssh kianirad2020@selenium.us-west1-a.t-slate-312420 "cd /home/kianirad2020/ai-services-platform && npm run build && pm2 restart kiani-exchange"

echo "Deployment complete!"