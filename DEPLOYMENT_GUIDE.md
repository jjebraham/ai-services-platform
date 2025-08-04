# 🚀 Production Deployment Guide for kiani.exchange

This guide will help you deploy the AI Services Platform to your production server with the domain `kiani.exchange` and IP `34.169.105.176`.

## 📋 Prerequisites

- Server with IP `34.169.105.176`
- Domain `kiani.exchange` configured in Cloudflare
- Node.js 16+ installed on the server
- Git installed on the server
- SSH access to the server

## 🔧 Step 1: Server Setup

### 1.1 Connect to your server
```bash
ssh kianirad2020@selenium.us-west1-a.t-slate-312420
```

### 1.2 Navigate to project directory
```bash
cd ai-services-platform
```

### 1.3 Pull latest code
```bash
git pull origin main
```

### 1.4 Install dependencies
```bash
npm install
```

## 🔐 Step 2: Environment Configuration

### 2.1 Create environment file
```bash
cp .env.example .env
```

### 2.2 Configure Supabase
```bash
node setup-supabase.js
```

Follow the prompts to enter your Supabase credentials:
- Supabase Project URL
- Anon/Public Key
- Service Role Key (optional)

### 2.3 Update production environment variables
Edit the `.env` file with production values:
```bash
nano .env
```

Add/update these variables:
```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=https://kiani.exchange

# Admin credentials (CHANGE THESE!)
ADMIN_EMAIL=admin@kiani.exchange
ADMIN_PASSWORD=your-secure-password
ADMIN_KEY=your-secure-admin-key

# Session security
SESSION_SECRET=your-very-secure-session-secret

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

## 🏗️ Step 3: Build for Production

### 3.1 Build the frontend
```bash
npm run build
```

### 3.2 Test the production server locally
```bash
npm run start:production
```

## 🚀 Step 4: Deploy with PM2 (Recommended)

### 4.1 Install PM2 globally
```bash
npm install -g pm2
```

### 4.2 Start the application with PM2
```bash
npm run deploy:pm2
```

### 4.3 Save PM2 configuration
```bash
pm2 save
pm2 startup
```

### 4.4 Useful PM2 commands
```bash
# View logs
npm run deploy:logs

# Restart application
npm run deploy:restart

# Stop application
npm run deploy:stop

# Monitor application
pm2 monit
```

## 🌐 Step 5: Domain Configuration

### 5.1 Cloudflare DNS Settings
In your Cloudflare dashboard for `kiani.exchange`:

1. **A Record**: 
   - Name: `@` (root domain)
   - Content: `34.169.105.176`
   - TTL: Auto
   - Proxy status: Proxied (orange cloud)

2. **A Record** (for www):
   - Name: `www`
   - Content: `34.169.105.176`
   - TTL: Auto
   - Proxy status: Proxied (orange cloud)

### 5.2 Cloudflare SSL/TLS Settings
1. Go to SSL/TLS → Overview
2. Set encryption mode to "Full" or "Full (strict)"
3. Enable "Always Use HTTPS"

## 🔒 Step 6: Security Setup (Optional but Recommended)

### 6.1 Install and configure Nginx
```bash
sudo apt update
sudo apt install nginx

# Copy the nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/kiani.exchange
sudo ln -s /etc/nginx/sites-available/kiani.exchange /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6.2 Configure firewall
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

## 🧪 Step 7: Testing

### 7.1 Test endpoints
```bash
# Health check
curl http://34.169.105.176:3000/health

# API health check
curl http://34.169.105.176:3000/api/health

# Test with domain (after DNS propagation)
curl http://kiani.exchange:3000/health
```

### 7.2 Access the application
- **Main site**: http://kiani.exchange:3000
- **Admin panel**: http://kiani.exchange:3000/admin
- **API**: http://kiani.exchange:3000/api/

## 📊 Step 8: Monitoring

### 8.1 View application logs
```bash
# PM2 logs
pm2 logs kiani-exchange

# Application logs
tail -f logs/production.log
```

### 8.2 Monitor system resources
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

## 🔄 Step 9: Updates and Maintenance

### 9.1 Deploy updates
```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Rebuild frontend
npm run build

# Restart application
npm run deploy:restart
```

### 9.2 Database maintenance
```bash
# Run database migrations (if any)
# Create tables in Supabase dashboard using create-supabase-tables.sql
```

## 🆘 Troubleshooting

### Common Issues

1. **Port 3000 not accessible**
   - Check firewall: `sudo ufw status`
   - Check if process is running: `pm2 status`

2. **Domain not resolving**
   - Check DNS propagation: `nslookup kiani.exchange`
   - Wait for DNS propagation (up to 24 hours)

3. **CORS errors**
   - Verify domain is added to CORS configuration in `production-server.js`

4. **Supabase connection issues**
   - Check `.env` file configuration
   - Verify Supabase credentials

### Log Locations
- PM2 logs: `~/.pm2/logs/`
- Application logs: `./logs/`
- Nginx logs: `/var/log/nginx/`

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables are set
3. Ensure all services are running
4. Check firewall and network configuration

## 🎉 Success!

Once deployed, your AI Services Platform will be accessible at:
- **http://kiani.exchange:3000** (main application)
- **http://kiani.exchange:3000/admin** (admin panel)
- **http://34.169.105.176:3000** (direct IP access)

The application is now ready for production use!