#!/bin/bash

# Create RDS PostgreSQL database for Resistance Radio Station

source "$(dirname "$0")/resistance-radio-config.sh"

echo "Setting up RDS PostgreSQL database..."

# Generate a secure random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Check if DB instance already exists
if aws rds describe-db-instances \
    --db-instance-identifier ${RDS_INSTANCE_ID} \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} 2>&1 | grep -q "DBInstanceNotFound"; then
    
    echo "Creating new RDS instance: ${RDS_INSTANCE_ID}"
    
    # Create DB subnet group
    SUBNET_GROUP_NAME="${PROJECT_NAME}-db-subnet-${ENVIRONMENT}"
    
    # Get default VPC subnets
    SUBNET_IDS=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text --profile ${AWS_PROFILE} --region ${AWS_REGION})" \
        --query 'Subnets[*].SubnetId' \
        --output text \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION})
    
    # Create subnet group if it doesn't exist
    if ! aws rds describe-db-subnet-groups \
        --db-subnet-group-name ${SUBNET_GROUP_NAME} \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION} 2>&1 | grep -q "DBSubnetGroupNotFoundFault"; then
        echo "Subnet group already exists"
    else
        aws rds create-db-subnet-group \
            --db-subnet-group-name ${SUBNET_GROUP_NAME} \
            --db-subnet-group-description "Subnet group for ${PROJECT_NAME} ${ENVIRONMENT}" \
            --subnet-ids ${SUBNET_IDS} \
            --tags "Key=Project,Value=ResistanceRadio" "Key=Environment,Value=${ENVIRONMENT}" \
            --profile ${AWS_PROFILE} \
            --region ${AWS_REGION}
    fi
    
    # Create security group for RDS
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=isDefault,Values=true" \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION})
    
    SG_NAME="${PROJECT_NAME}-db-sg-${ENVIRONMENT}"
    
    # Check if security group exists
    SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${SG_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION} 2>/dev/null)
    
    if [ "${SG_ID}" == "None" ] || [ -z "${SG_ID}" ]; then
        echo "Creating security group: ${SG_NAME}"
        SG_ID=$(aws ec2 create-security-group \
            --group-name ${SG_NAME} \
            --description "Security group for ${PROJECT_NAME} RDS ${ENVIRONMENT}" \
            --vpc-id ${VPC_ID} \
            --profile ${AWS_PROFILE} \
            --region ${AWS_REGION} \
            --output text \
            --query 'GroupId')
        
        # Allow PostgreSQL access from anywhere (you should restrict this in production)
        aws ec2 authorize-security-group-ingress \
            --group-id ${SG_ID} \
            --protocol tcp \
            --port 5432 \
            --cidr 0.0.0.0/0 \
            --profile ${AWS_PROFILE} \
            --region ${AWS_REGION}
    fi
    
    # Determine instance class based on environment
    if [ "${ENVIRONMENT}" == "prod" ]; then
        INSTANCE_CLASS="db.t3.small"
        ALLOCATED_STORAGE=50
        BACKUP_RETENTION=7
    else
        INSTANCE_CLASS="db.t3.micro"
        ALLOCATED_STORAGE=20
        BACKUP_RETENTION=3
    fi
    
    # Create RDS instance
    aws rds create-db-instance \
        --db-instance-identifier ${RDS_INSTANCE_ID} \
        --db-instance-class ${INSTANCE_CLASS} \
        --engine postgres \
        --engine-version 14.20 \
        --master-username ${DB_USERNAME} \
        --master-user-password "${DB_PASSWORD}" \
        --allocated-storage ${ALLOCATED_STORAGE} \
        --db-name ${DB_NAME} \
        --vpc-security-group-ids ${SG_ID} \
        --db-subnet-group-name ${SUBNET_GROUP_NAME} \
        --backup-retention-period ${BACKUP_RETENTION} \
        --preferred-backup-window "03:00-04:00" \
        --preferred-maintenance-window "mon:04:00-mon:05:00" \
        --storage-encrypted \
        --publicly-accessible \
        --tags "Key=Project,Value=ResistanceRadio" "Key=Environment,Value=${ENVIRONMENT}" \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION}
    
    echo "RDS instance creation initiated. This will take several minutes..."
    echo "Waiting for instance to become available..."
    
    aws rds wait db-instance-available \
        --db-instance-identifier ${RDS_INSTANCE_ID} \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION}
    
    echo "✓ RDS instance created successfully"
else
    echo "✓ RDS instance ${RDS_INSTANCE_ID} already exists"
fi

# Get RDS endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier ${RDS_INSTANCE_ID} \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION})

DB_PORT=$(aws rds describe-db-instances \
    --db-instance-identifier ${RDS_INSTANCE_ID} \
    --query 'DBInstances[0].Endpoint.Port' \
    --output text \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION})

# Save credentials to AWS Secrets Manager
SECRET_NAME="${PROJECT_NAME}-db-credentials-${ENVIRONMENT}"

echo "Storing database credentials in Secrets Manager..."

aws secretsmanager create-secret \
    --name ${SECRET_NAME} \
    --description "Database credentials for ${PROJECT_NAME} ${ENVIRONMENT}" \
    --secret-string "{
        \"username\": \"${DB_USERNAME}\",
        \"password\": \"${DB_PASSWORD}\",
        \"engine\": \"postgres\",
        \"host\": \"${DB_ENDPOINT}\",
        \"port\": ${DB_PORT},
        \"dbname\": \"${DB_NAME}\",
        \"dbInstanceIdentifier\": \"${RDS_INSTANCE_ID}\"
    }" \
    --tags "Key=Project,Value=ResistanceRadio" "Key=Environment,Value=${ENVIRONMENT}" \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} 2>/dev/null || \
aws secretsmanager update-secret \
    --secret-id ${SECRET_NAME} \
    --secret-string "{
        \"username\": \"${DB_USERNAME}\",
        \"password\": \"${DB_PASSWORD}\",
        \"engine\": \"postgres\",
        \"host\": \"${DB_ENDPOINT}\",
        \"port\": ${DB_PORT},
        \"dbname\": \"${DB_NAME}\",
        \"dbInstanceIdentifier\": \"${RDS_INSTANCE_ID}\"
    }" \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION}

# Create .env file for local development
ENV_FILE="backend/.env.${ENVIRONMENT}"
cat > ${ENV_FILE} << EOF
# Database Configuration - ${ENVIRONMENT}
DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:${DB_PORT}/${DB_NAME}
DB_HOST=${DB_ENDPOINT}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

# AWS Configuration
AWS_REGION=${AWS_REGION}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
S3_MEDIA_BUCKET=${S3_MEDIA_BUCKET}
S3_BACKUP_BUCKET=${S3_BACKUP_BUCKET}

# Application Configuration
NODE_ENV=${ENVIRONMENT}
PORT=${BACKEND_PORT}
EOF

echo ""
echo "=========================================="
echo "RDS Database Setup Complete"
echo "=========================================="
echo "Instance ID: ${RDS_INSTANCE_ID}"
echo "Endpoint: ${DB_ENDPOINT}:${DB_PORT}"
echo "Database: ${DB_NAME}"
echo "Username: ${DB_USERNAME}"
echo "Password: (stored in AWS Secrets Manager)"
echo "Secret Name: ${SECRET_NAME}"
echo ""
echo "Environment file created: ${ENV_FILE}"
echo "=========================================="
echo ""
echo "Connection string:"
echo "postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:${DB_PORT}/${DB_NAME}"
echo "=========================================="
