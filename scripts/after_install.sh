#!/bin/bash
set -e

echo "Running after install script..."

cd /opt/resistance-radio/backend

# Ensure correct permissions
sudo chown -R ec2-user:ec2-user /opt/resistance-radio/backend

# Run database migrations
echo "Running database migrations..."
npm run migrate || echo "Migration failed or no migrations to run"

echo "After install completed successfully"
