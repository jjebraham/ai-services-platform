# Manual Deployment Instructions for OTP Fix

## Problem
The frontend on kiani.exchange is still using the old incorrect OTP endpoints:
- ❌ `/api/otp/start` (incorrect)
- ❌ `/api/otp/verify` (incorrect)

Instead of the correct backend endpoints:
- ✅ `/api/auth/send-otp` (correct)
- ✅ `/api/auth/verify-otp` (correct)

## Solution
Upload the corrected frontend files to the server manually.

## Files to Upload
The following files have been corrected and need to be uploaded to kiani.exchange:

1. **LoginPage.jsx** - Fixed OTP endpoints
2. **RegisterPage.jsx** - Fixed OTP endpoints  
3. **api.js** - Fixed authAPI functions

## Manual Upload Steps

### Step 1: Connect to Server
```bash
ssh kianirad2020@34.169.105.176
cd /home/kianirad2020/ai-services-platform
```

### Step 2: Backup Current Files
```bash
cp LoginPage.jsx LoginPage.jsx.backup.$(date +%Y%m%d_%H%M%S)
cp RegisterPage.jsx RegisterPage.jsx.backup.$(date +%Y%m%d_%H%M%S)
cp api.js api.js.backup.$(date +%Y%m%d_%H%M%S)
```

### Step 3: Upload Files
From your local machine, run these commands:

```bash
scp LoginPage.jsx kianirad2020@34.169.105.176:/home/kianirad2020/ai-services-platform/
scp RegisterPage.jsx kianirad2020@34.169.105.176:/home/kianirad2020/ai-services-platform/
scp api.js kianirad2020@34.169.105.176:/home/kianirad2020/ai-services-platform/
```

### Step 4: Restart Application
```bash
ssh kianirad2020@34.169.105.176
cd /home/kianirad2020/ai-services-platform
pm2 restart kiani-exchange
```

### Step 5: Verify Deployment
```bash
pm2 status kiani-exchange
pm2 logs kiani-exchange --lines 20
```

## Alternative: Use File Transfer Tool
If command line doesn't work, you can use:
- **WinSCP** (Windows)
- **FileZilla** (Cross-platform)
- **VS Code Remote SSH** extension

Upload the three files to: `/home/kianirad2020/ai-services-platform/`

## Test After Deployment
1. Visit https://kiani.exchange
2. Try to login with a phone number
3. Check if OTP is sent successfully
4. If issues persist, check logs: `pm2 logs kiani-exchange --lines 50`

## What Was Fixed
- Changed `/api/otp/start` → `/api/auth/send-otp`
- Changed `/api/otp/verify` → `/api/auth/verify-otp`
- Updated parameter names: `phone` → `phoneNumber`, `code` → `otp`
- Fixed both login and registration flows