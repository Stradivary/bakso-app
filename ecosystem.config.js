module.exports = {
    apps: [{
      name: 'bakso-app',
      script: 'npm',
      args: 'run preview',
      cwd: './dist',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }]
  };