# Deploy to kiani.exchange - Persian Translation Update

## 🎯 What This Update Includes
- ✅ Complete Persian translations for all services
- ✅ Persian UI labels and navigation
- ✅ Language switching functionality
- ✅ Provider names in Persian (OpenAI → اوپن‌ای‌آی, etc.)
- ✅ Response times in Persian (< 1s → کمتر از ۱ ثانیه)
- ✅ Service descriptions and features in Persian

## 📦 Deployment Package
The file `kiani-exchange-update.zip` contains all the updated files.

## 🚀 Deployment Steps

### Option 1: If you have SSH access to the server
1. Upload `kiani-exchange-update.zip` to the server
2. Extract the files: `unzip kiani-exchange-update.zip`
3. Stop the current server: `pm2 stop all` or `pkill node`
4. Copy the new files to the project directory
5. Install dependencies: `npm install`
6. Start the server: `node production-server.js` or `pm2 start production-server.js`

### Option 2: If using a hosting panel (cPanel, etc.)
1. Upload `kiani-exchange-update.zip` to your hosting account
2. Extract the files in the public_html or web directory
3. Ensure the Node.js application is restarted

### Option 3: If using a cloud service (AWS, Google Cloud, etc.)
1. Upload the files to your server instance
2. Replace the existing files with the new ones
3. Restart the Node.js application service

## 🔧 Server Configuration
The server should run on port 3000 and nginx should proxy to it:
- Server: `http://localhost:3000`
- Domain: `https://kiani.exchange` (via nginx proxy)

## ✅ Verification Steps
After deployment, check:
1. Visit `https://kiani.exchange/services`
2. Switch language to Persian using the language toggle
3. Verify all text appears in Persian
4. Check that service descriptions, features, and provider names are translated
5. Test navigation and functionality

## 🔍 Troubleshooting
If the update doesn't appear:
1. Clear browser cache (Ctrl+F5)
2. Check if the server restarted properly
3. Verify the files were uploaded to the correct directory
4. Check server logs for any errors

## 📞 Support
If you need help with the deployment, the key files to focus on are:
- `dist/` folder - Contains the built frontend with Persian translations
- `production-server.js` - The server file
- `package.json` - Dependencies

## 🌐 Current Status
- ✅ Local development: Updated with Persian translations
- ✅ Production build: Created with latest changes
- ⏳ Live server: Needs manual deployment of this package

The Persian translations are complete and tested locally. Once deployed, https://kiani.exchange will have full Persian language support.