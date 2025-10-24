export default {
  apps: [
    {
      name: "Usof_Backend",
      script: "./dist/index.js",
      args: "--env-file=.env",
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      log_date_format: "MM-DD HH:mm:ss",
      kill_timeout: 60000,
      no_pmx: true
    }
  ]
};
