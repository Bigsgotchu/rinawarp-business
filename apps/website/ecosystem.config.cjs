module.exports = {
  apps: [
    {
      name: 'rinawarp-website',
      script: 'npm',
      args: 'run build && npm run preview',
      cwd: '/home/karina/Documents/Rinawarp Platforms/2-rinawarp-website',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        DOMAIN: 'rinawarptech.com',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        DOMAIN: 'rinawarptech.com',
      },
    },
  ],
};
