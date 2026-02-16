#!/bin/bash
set -e

echo "Validating service..."

# Wait for application to start
sleep 10

# Check if PM2 process is running
if ! pm2 list | grep -q "resistance-radio-backend.*online"; then
    echo "ERROR: Application is not running"
    exit 1
fi

# Check if application is responding
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || echo "000")

if [ "$response" != "200" ]; then
    echo "WARNING: Health check returned status $response"
    # Don't fail deployment if health endpoint doesn't exist
    echo "Checking if application is listening on port..."
    if ! netstat -tuln | grep -q ":5000"; then
        echo "ERROR: Application is not listening on port 5000"
        exit 1
    fi
fi

echo "Service validation completed successfully"
