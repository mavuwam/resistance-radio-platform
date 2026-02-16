#!/bin/bash
set -e

echo "Starting application..."

cd /opt/resistance-radio/backend

# Start or restart the application with PM2
if pm2 list | grep -q "resistance-radio-backend"; then
    echo "Restarting existing PM2 process..."
    pm2 restart resistance-radio-backend
else
    echo "Starting new PM2 process..."
    pm2 start dist/index.js --name resistance-radio-backend
fi

# Save PM2 configuration
pm2 save

echo "Application started successfully"
