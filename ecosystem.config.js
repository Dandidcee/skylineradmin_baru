module.exports = {
  apps: [
    {
      name: "skyflow-backend",
      script: "./backend/dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "skyflow-frontend",
      script: "serve",
      env: {
        PM2_SERVE_PATH: './skyflow_templates/dist',
        PM2_SERVE_PORT: 5173, // Ganti dengan port yang selama ini diarahin sama Caddy (default vite: 5173)
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
