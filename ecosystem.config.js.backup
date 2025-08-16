module.exports = {
  apps: [
    {
      name: 'kiani-exchange',
      script: 'production-server.js',
      instances: 1, // or 'max' for cluster mode
      exec_mode: 'fork', // or 'cluster'
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto restart
      watch: false, // Set to true if you want to watch for file changes
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Resource limits
      max_memory_restart: '1G',
      
      // Restart policy
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Advanced features
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // Environment variables
      env_file: '.env'
    }
  ],
  
  deploy: {
    production: {
      user: 'kianirad2020',
      host: '34.169.105.176',
      ref: 'origin/main',
      repo: 'git@github.com:jjebraham/ai-services-platform.git',
      path: '/home/kianirad2020/ai-services-platform',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};