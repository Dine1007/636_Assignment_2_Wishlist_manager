// ecosystem.config.js
// Place this file in the ROOT of your repo (same level as /backend and /frontend).
// PM2 reads this on every deploy via: pm2 startOrRestart ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: 'gift-wishlist-api',
      script: './backend/server.js',

      // 1 process per EC2 instance. Your AWS ALB handles load balancing
      // between instance-1 and instance-2 — you don't need PM2 cluster mode.
      // If you want to use all CPU cores on each instance instead, change to:
      //   instances: 'max',
      //   exec_mode: 'cluster',
      instances: 1,
      exec_mode: 'fork',

      // Restart automatically if the process crashes
      autorestart: true,
      watch: false,

      // Restart if memory exceeds this — prevents silent memory leaks
      max_memory_restart: '500M',

      // Graceful reload: wait for in-flight requests to finish (ms)
      // before killing the old process during a restart
      kill_timeout: 5000,

      // Environment variables injected by PM2 when --env production is passed.
      // Your actual secrets still come from the .env file written by the
      // CI pipeline. These are just NODE_ENV and fallback values.
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
