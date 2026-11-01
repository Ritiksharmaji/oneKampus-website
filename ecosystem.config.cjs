// PM2 process file for the VPS: `pm2 start ecosystem.config.cjs` (after `npm ci && npm run build`).
module.exports = {
  apps: [
    {
      name: "onekampus-website",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3300",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
      max_memory_restart: "600M",
    },
  ],
};
