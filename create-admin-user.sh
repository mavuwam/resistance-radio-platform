#!/bin/bash

# Script to create admin user in the Lambda database
# Run this script to manually create the admin user

echo "Creating admin user in Lambda database..."
echo ""
echo "Database: resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com"
echo "Admin Email: admin@resistanceradiostation.org"
echo "Admin Password: admin123"
echo ""

# Set environment variables
export DB_HOST=resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=resistance_radio_dev
export DB_USER=radio_admin
export DB_PASSWORD=ZiPXyCrvsnZwKZV4q80QyWkiA

# Run the create-admin script
cd backend
npm run create-admin

echo ""
echo "✓ Admin user created successfully!"
echo ""
echo "You can now log in at: https://resistanceradiostation.org/admin/login"
echo "  Email: admin@resistanceradiostation.org"
echo "  Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change this password after first login!"
