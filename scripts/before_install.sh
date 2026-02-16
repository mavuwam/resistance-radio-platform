#!/bin/bash
set -e

echo "Running before install script..."

# Stop the application if it's running
if pm2 list | grep -q "resistance-radio-backend"; then
    echo "Stopping existing application..."
    pm2 stop resistance-radio-backend || true
fi

# Backup current deployment
if [ -d "/opt/resistance-radio/backend" ]; then
    echo "Backing up current deployment..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    sudo mkdir -p /opt/resistance-radio/backups
    sudo cp -r /opt/resistance-radio/backend "/opt/resistance-radio/backups/backend_${timestamp}"
    
    # Keep only last 5 backups
    cd /opt/resistance-radio/backups
    ls -t | tail -n +6 | xargs -r rm -rf
fi

echo "Before install completed successfully"
