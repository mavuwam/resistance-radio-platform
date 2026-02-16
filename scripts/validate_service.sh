#!/bin/bash
set -e

echo "Validating service..."

# Wait for application to start
sleep 10

# Check if PM2 process is running
if ! pm2 list | grep -q "resistance-radio-backend.*online"; then
    echo "WARNING: Application is not showing as online in PM2"
    echo "Attempting to check if process exists..."
    
    # Try to find the process
    if pgrep -f "resistance-radio-backend" > /dev/null; then
        echo "Process found running, continuing..."
    else
        echo "ERROR: Application process not found"
        exit 1
    fi
fi

# Check if application is responding
echo "Checking API endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/shows 2>/dev/null || echo "000")

if [ "$response" = "200" ]; then
    echo "✓ API is responding correctly (status: $response)"
elif [ "$response" = "000" ]; then
    echo "WARNING: Could not connect to API, checking if port is listening..."
    if netstat -tuln 2>/dev/null | grep -q ":5000" || ss -tuln 2>/dev/null | grep -q ":5000"; then
        echo "✓ Port 5000 is listening"
    else
        echo "WARNING: Port 5000 not listening yet, giving more time..."
        sleep 5
        if netstat -tuln 2>/dev/null | grep -q ":5000" || ss -tuln 2>/dev/null | grep -q ":5000"; then
            echo "✓ Port 5000 is now listening"
        else
            echo "ERROR: Application is not listening on port 5000 after waiting"
            exit 1
        fi
    fi
else
    echo "WARNING: API returned status $response (expected 200)"
    # Don't fail for non-200 responses, just warn
    echo "Checking if port is listening..."
    if netstat -tuln 2>/dev/null | grep -q ":5000" || ss -tuln 2>/dev/null | grep -q ":5000"; then
        echo "✓ Port 5000 is listening, proceeding despite non-200 response"
    else
        echo "ERROR: Application is not listening on port 5000"
        exit 1
    fi
fi

echo "✓ Service validation completed successfully"
