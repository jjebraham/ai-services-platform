# PowerShell script to deploy files to server
$serverFiles = @{
    "services/otp-service.js" = "c:\Users\DELL\Pictures\aiweb\otp-service.js"
    "routes/auth-routes.js" = "c:\Users\DELL\Pictures\aiweb\auth-routes.js"
    "services/auth-service.js" = "c:\Users\DELL\Pictures\aiweb\auth-service.js"
    "api.js" = "c:\Users\DELL\Pictures\aiweb\api.js"
    "LoginPage.jsx" = "c:\Users\DELL\Pictures\aiweb\LoginPage.jsx"
    "AuthContext.jsx" = "c:\Users\DELL\Pictures\aiweb\AuthContext.jsx"
}

foreach ($serverPath in $serverFiles.Keys) {
    $localPath = $serverFiles[$serverPath]
    Write-Host "Copying $localPath to server:$serverPath"
    scp $localPath "kianirad2020@kiani.exchange:/home/kianirad2020/ai-services-platform/$serverPath"
}

Write-Host "Building and restarting application..."
ssh kianirad2020@kiani.exchange "cd /home/kianirad2020/ai-services-platform && npm run build && pm2 restart kiani-exchange"