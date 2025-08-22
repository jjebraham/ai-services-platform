# Deploy to kiani.exchange - Persian Translation + Vazirmatn Font Update

## 🎯 What This Update Includes
- ✅ Complete Persian translations for all services
- ✅ Persian UI labels and navigation
- ✅ Language switching functionality
- ✅ **NEW: Vazirmatn font for beautiful Persian typography**
- ✅ **NEW: Enhanced RTL layout and styling**
- ✅ Provider names in Persian (OpenAI → اوپن‌ای‌آی, etc.)
- ✅ Response times in Persian (< 1s → کمتر از ۱ ثانیه)
- ✅ Service descriptions and features in Persian
- ✅ Basket functionality with Persian translations
- ✅ Site name changed to "kiani.exchange"

## 📦 Deployment Package
The file `kiani-exchange-vazirmatn-update.zip` contains all the updated files with Vazirmatn font support.

## 🚀 Deployment Steps

### Option 1: If you have SSH access to the server
```bash
# 1. Upload the deployment package
scp kiani-exchange-vazirmatn-update.zip user@kiani.exchange:/path/to/project/

# 2. SSH into the server
ssh user@kiani.exchange

# 3. Navigate to project directory
cd /path/to/project/

# 4. Stop the current server
pm2 stop kiani-exchange
# or
pkill node

# 5. Backup current files (optional)
cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S)

# 6. Extract the new files
unzip -o kiani-exchange-vazirmatn-update.zip

# 7. Install/update dependencies
npm install

# 8. Start the server
pm2 start production-server.js --name kiani-exchange
# or
node production-server.js
```

### Option 2: If using a hosting panel (cPanel, etc.)
1. Upload `kiani-exchange-vazirmatn-update.zip` to your hosting account
2. Extract the files in the public_html or web directory
3. Ensure the Node.js application is restarted
4. Verify the Vazirmatn font loads correctly

### Option 3: If using a cloud service (AWS, Google Cloud, etc.)
1. Upload the files to your server instance
2. Replace the existing files with the new ones
3. Restart the Node.js application service
4. Check that the Google Fonts API is accessible

## 🔧 Server Configuration
The server should run on port 3000 and nginx should proxy to it:
- Server: `http://localhost:3000`
- Domain: `https://kiani.exchange` (via nginx proxy)
- **Important**: Ensure Google Fonts API (fonts.googleapis.com) is accessible

## ✅ Verification Steps
After deployment, check:
1. Visit `https://kiani.exchange/`
2. Switch language to Persian using the language toggle (FA button)
3. **Verify Vazirmatn font is applied to Persian text**
4. Check that all Persian text appears with proper typography
5. Test RTL layout and navigation
6. Verify basket functionality works
7. Check login/register pages have Persian translations
8. Confirm site name shows as "kiani.exchange"

## 🎨 Font Features
The Vazirmatn font implementation includes:
- **Multiple weights**: 300, 400, 500, 600, 700
- **Proper RTL support**: Right-to-left text direction
- **Enhanced readability**: Optimized line-height and letter-spacing
- **Fallback fonts**: System fonts for compatibility
- **Automatic switching**: Font applies when Persian is selected

## 🔍 Troubleshooting
If the update doesn't appear:
1. Clear browser cache (Ctrl+F5)
2. Check if the server restarted properly
3. Verify the files were uploaded to the correct directory
4. Check server logs for any errors
5. **Font issues**: Ensure fonts.googleapis.com is accessible
6. **RTL issues**: Verify CSS files are properly loaded

## 📞 Support
Key files in this update:
- `dist/index.html` - Contains Vazirmatn font import
- `dist/assets/index-*.css` - Contains RTL and Persian typography styles
- `dist/assets/index-*.js` - Contains updated translations and functionality
- `production-server.js` - The server file
- `package.json` - Dependencies

## 🌐 Current Status
- ✅ Local development: Updated with Persian translations + Vazirmatn font
- ✅ Production build: Created with latest changes including font support
- ✅ Deployment package: Ready with `kiani-exchange-vazirmatn-update.zip`
- ⏳ Live server: Needs manual deployment of this package

## 🆕 What's New in This Version
1. **Vazirmatn Font**: Beautiful Persian typography with Google Fonts
2. **Enhanced RTL**: Improved right-to-left layout and styling
3. **Better Typography**: Optimized spacing and readability for Persian text
4. **Complete Integration**: Font automatically applies when Persian is selected
5. **Production Ready**: All changes built and packaged for deployment

The Persian translations are complete and tested locally with beautiful Vazirmatn typography. Once deployed, https://kiani.exchange will have full Persian language support with professional Persian fonts.