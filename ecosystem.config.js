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
      script: "npx",
      args: "serve -s skyflow_templates/dist -l 5173",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
