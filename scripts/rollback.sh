#!/bin/bash
set -e

# Rollback script for resistance-radio backend deployment
# This script can restore from either:
# 1. The most recent backup created by CodeDeploy
# 2. The original manual deployment

echo "=== Resistance Radio Backend Rollback Script ==="
echo ""

# Check if we're on the EC2 instance
if [ ! -d "/opt/resistance-radio" ]; then
    echo "ERROR: This script must be run on the EC2 instance"
    exit 1
fi

# Function to list available backups
list_backups() {
    echo "Available backups:"
    if [ -d "/opt/resistance-radio/backups" ]; then
        ls -lth /opt/resistance-radio/backups/ | tail -n +2
    else
        echo "No backups directory found"
    fi
    
    echo ""
    echo "Original manual deployment:"
    if [ -d "/opt/resistance-radio/dist" ]; then
        echo "  /opt/resistance-radio/ (manual deployment - available)"
    else
        echo "  /opt/resistance-radio/ (manual deployment - NOT FOUND)"
    fi
}

# Function to rollback to original manual deployment
rollback_to_manual() {
    echo "Rolling back to original manual deployment..."
    
    # Stop current backend
    if pm2 list | grep -q "resistance-radio-backend"; then
        echo "Stopping pipeline-deployed backend..."
        pm2 stop resistance-radio-backend
        pm2 delete resistance-radio-backend
    fi
    
    # Start original deployment
    if [ -d "/opt/resistance-radio/dist" ]; then
        cd /opt/resistance-radio
        echo "Starting original manual deployment..."
        pm2 start dist/index.js --name resistance-radio-api
        pm2 save
        echo "Rollback to manual deployment complete!"
    else
        echo "ERROR: Original manual deployment not found at /opt/resistance-radio/dist"
        exit 1
    fi
}

# Function to rollback to a specific backup
rollback_to_backup() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        echo "ERROR: Backup name required"
        echo "Usage: $0 backup <backup_name>"
        exit 1
    fi
    
    local backup_path="/opt/resistance-radio/backups/$backup_name"
    
    if [ ! -d "$backup_path" ]; then
        echo "ERROR: Backup not found at $backup_path"
        exit 1
    fi
    
    echo "Rolling back to backup: $backup_name"
    
    # Stop current backend
    if pm2 list | grep -q "resistance-radio-backend"; then
        echo "Stopping current backend..."
        pm2 stop resistance-radio-backend
    fi
    
    # Restore from backup
    echo "Restoring from backup..."
    sudo rm -rf /opt/resistance-radio/backend
    sudo cp -r "$backup_path" /opt/resistance-radio/backend
    sudo chown -R ec2-user:ec2-user /opt/resistance-radio/backend
    
    # Restart backend
    cd /opt/resistance-radio/backend
    echo "Starting restored backend..."
    pm2 restart resistance-radio-backend || pm2 start dist/index.js --name resistance-radio-backend
    pm2 save
    
    echo "Rollback to backup complete!"
}

# Main script logic
case "${1:-list}" in
    list)
        list_backups
        ;;
    manual)
        rollback_to_manual
        ;;
    backup)
        rollback_to_backup "$2"
        ;;
    *)
        echo "Usage: $0 {list|manual|backup <backup_name>}"
        echo ""
        echo "Commands:"
        echo "  list              - List available backups and deployments"
        echo "  manual            - Rollback to original manual deployment"
        echo "  backup <name>     - Rollback to specific backup"
        exit 1
        ;;
esac
