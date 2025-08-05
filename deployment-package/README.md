# React Application Deployment Package

This package contains the built React application ready for deployment to the server.

## Contents
- `index.html` - Main HTML file for the React application
- `assets/` - Directory containing compiled CSS and JavaScript files
- `deploy.sh` - Deployment script for Linux servers
- `README.md` - This file

## Deployment Instructions

### Method 1: Using the deployment script (Linux/Unix servers)
1. Upload this entire package to your server
2. Make the script executable: `chmod +x deploy.sh`
3. Run the deployment script: `sudo ./deploy.sh`

### Method 2: Manual deployment
1. Copy `index.html` to your web server's document root (e.g., `/var/www/html/`)
2. Copy the `assets/` folder to the same location
3. Ensure proper file permissions are set
4. Restart your web server if necessary

### Method 3: For Node.js servers
1. Upload the files to your server's project directory
2. Ensure the `production-server.js` is configured to serve from the `dist` directory
3. Copy `index.html` to the `dist/` directory on the server
4. Copy `assets/` to the `dist/` directory on the server
5. Restart your Node.js application

## Verification
After deployment, visit your website to verify:
- The React application loads correctly
- Navigation between pages works
- No console errors in the browser
- API endpoints are accessible

## File Information
- Built on: $(date)
- React version: Latest
- Build tool: Vite
- CSS framework: Tailwind CSS

## Support
If you encounter issues, check:
1. File permissions are correct
2. Web server configuration
3. Node.js server logs
4. Browser console for errors