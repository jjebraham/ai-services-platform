# Deploy OTP functionality to server
Write-Host "Deploying OTP functionality..."

# Create services directory if it doesn't exist
Write-Host "Creating services directory..."
ssh kianirad2020@selenium.us-west1-a.t-slate-312420 "mkdir -p /home/kianirad2020/ai-services-platform/services"

# Copy OTP service
Write-Host "Copying OTP service..."
scp otp-service.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/services/

# Copy auth service
Write-Host "Copying auth service..."
scp auth-service.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/services/

# Copy auth routes
Write-Host "Copying auth routes..."
scp auth-routes.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/routes/

# Copy API file
Write-Host "Copying API file..."
scp api.js kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/

# Copy React components
Write-Host "Copying React components..."
scp LoginPage.jsx kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/src/
scp AuthContext.jsx kianirad2020@selenium.us-west1-a.t-slate-312420:/home/kianirad2020/ai-services-platform/src/

# Build and restart
Write-Host "Building and restarting application..."
ssh kianirad2020@selenium.us-west1-a.t-slate-312420 "cd /home/kianirad2020/ai-services-platform && npm run build && pm2 restart kiani-exchange"

Write-Host "Deployment complete!"