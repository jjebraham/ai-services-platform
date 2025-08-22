# Deploy to kiani.exchange - RTL and Theme Color Update

## 🎯 What This Update Includes
- ✅ Enhanced RTL support for Persian text and UI elements
- ✅ Fixed RTL styling for paragraphs, headings, and flex containers
- ✅ Updated theme colors (dark theme to dark gray with white text)
- ✅ Updated light theme text color to dark gray

## 📦 Deployment Package
The file `kiani-exchange-rtl-update.zip` contains the updated App.css file with all the RTL and theme color changes.

## 🚀 Deployment Steps

### Option 1: If you have SSH access to the server
1. Upload `kiani-exchange-rtl-update.zip` to the server
2. Extract the files: `unzip kiani-exchange-rtl-update.zip`
3. Stop the current server: `pm2 stop all` or `pkill node`
4. Copy the new files to the project directory, replacing the existing App.css file
5. Start the server: `node production-server.js` or `pm2 start production-server.js`

### Option 2: If using a hosting panel (cPanel, etc.)
1. Upload `kiani-exchange-rtl-update.zip` to your hosting account
2. Extract the files in the public_html or web directory, replacing the existing App.css file
3. Ensure the Node.js application is restarted

### Option 3: If using a cloud service (AWS, Google Cloud, etc.)
1. Upload the files to your server instance
2. Replace the existing App.css file with the new one
3. Restart the Node.js application service

## ✅ Verification Steps
After deployment, check:
1. Visit `https://kiani.exchange/services`
2. Switch language to Persian using the language toggle
3. Verify all Persian text appears correctly with RTL formatting
4. Check that paragraphs, flex containers, and UI elements are properly aligned right-to-left
5. Verify the dark theme appears as dark gray with white text
6. Verify the light theme text appears as dark gray

## 🔍 Troubleshooting
If the update doesn't appear:
1. Clear browser cache (Ctrl+F5)
2. Check if the server restarted properly
3. Verify the App.css file was properly replaced
4. Check browser console for any CSS errors
