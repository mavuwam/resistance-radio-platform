#!/bin/bash
set -e

echo "Running after install script..."

cd /opt/resistance-radio/backend

# Copy .env file from parent directory if it exists
if [ -f "/opt/resistance-radio/.env" ]; then
    echo "Copying .env file..."
    cp /opt/resistance-radio/.env /opt/resistance-radio/backend/.env
fi

# Ensure correct permissions
sudo chown -R ec2-user:ec2-user /opt/resistance-radio/backend

# Run database migrations
echo "Running database migrations..."
if [ -f "package.json" ]; then
    npm run migrate || echo "Migration failed or no migrations to run"
else
    echo "WARNING: package.json not found, skipping migrations"
fi

echo "After install completed successfully"
