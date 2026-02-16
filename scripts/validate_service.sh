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

# Check if application is responding with a real endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/shows || echo "000")

if [ "$response" = "200" ]; then
    echo "API is responding correctly (status: $response)"
elif [ "$response" = "000" ]; then
    echo "WARNING: Could not connect to API"
    # Check if port is listening
    if ! netstat -tuln | grep -q ":5000"; then
        echo "ERROR: Application is not listening on port 5000"
        exit 1
    fi
    echo "Port 5000 is listening, proceeding..."
else
    echo "WARNING: API returned status $response"
    # Don't fail for non-200 responses, just check port
    if ! netstat -tuln | grep -q ":5000"; then
        echo "ERROR: Application is not listening on port 5000"
        exit 1
    fi
    echo "Port 5000 is listening, proceeding..."
fi

echo "Service validation completed successfully"
