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
      script: "npm",
      args: "run preview -- --port 5081 --host",
      cwd: "./skyflow_templates",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
