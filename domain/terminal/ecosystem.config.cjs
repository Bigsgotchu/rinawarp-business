module.exports = {
  apps: [
    {
      name: 'rinawarp-terminal-pro',
      script: 'npm',
      args: 'run build && npm run preview',
      cwd: '/home/karina/Documents/Rinawarp Platforms/1-rinawarp-terminal-pro',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DOMAIN: 'rinawarptech.com',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DOMAIN: 'rinawarptech.com',
      },
    },
    {
      name: 'rinawarp-backend-server',
      script: 'server.js',
      cwd: '/home/karina/Documents/Rinawarp-Platforms/src/domain/terminal',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DOMAIN: 'rinawarptech.com',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DOMAIN: 'rinawarptech.com',
      },
    },
  ],
};
