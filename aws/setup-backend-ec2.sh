#!/bin/bash

# Setup EC2 instance for backend API

source "$(dirname "$0")/resistance-radio-config.sh"

echo "Setting up EC2 instance for backend..."

# Create security group for EC2
VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=isDefault,Values=true" \
    --query 'Vpcs[0].VpcId' \
    --output text \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION})

SG_NAME="${PROJECT_NAME}-api-sg-${ENVIRONMENT}"

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
        --description "Security group for ${PROJECT_NAME} API ${ENVIRONMENT}" \
        --vpc-id ${VPC_ID} \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION} \
        --output text \
        --query 'GroupId')
    
    # Allow HTTP
    aws ec2 authorize-security-group-ingress \
        --group-id ${SG_ID} \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION}
    
    # Allow HTTPS
    aws ec2 authorize-security-group-ingress \
        --group-id ${SG_ID} \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION}
    
    # Allow SSH
    aws ec2 authorize-security-group-ingress \
        --group-id ${SG_ID} \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION}
    
    # Allow backend port
    aws ec2 authorize-security-group-ingress \
        --group-id ${SG_ID} \
        --protocol tcp \
        --port ${BACKEND_PORT} \
        --cidr 0.0.0.0/0 \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION}
    
    echo "✓ Security group created: ${SG_ID}"
else
    echo "✓ Security group already exists: ${SG_ID}"
fi

# Create IAM role for EC2 instance
ROLE_NAME="${PROJECT_NAME}-ec2-role-${ENVIRONMENT}"

if ! aws iam get-role --role-name ${ROLE_NAME} --profile ${AWS_PROFILE} 2>&1 | grep -q "NoSuchEntity"; then
    echo "✓ IAM role already exists: ${ROLE_NAME}"
else
    echo "Creating IAM role: ${ROLE_NAME}"
    
    # Create trust policy
    TRUST_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {
            "Service": "ec2.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
    }]
}
EOF
)
    
    aws iam create-role \
        --role-name ${ROLE_NAME} \
        --assume-role-policy-document "${TRUST_POLICY}" \
        --profile ${AWS_PROFILE}
    
    # Attach policies
    aws iam attach-role-policy \
        --role-name ${ROLE_NAME} \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess \
        --profile ${AWS_PROFILE}
    
    aws iam attach-role-policy \
        --role-name ${ROLE_NAME} \
        --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
        --profile ${AWS_PROFILE}
    
    aws iam attach-role-policy \
        --role-name ${ROLE_NAME} \
        --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess \
        --profile ${AWS_PROFILE}
    
    # Create instance profile
    aws iam create-instance-profile \
        --instance-profile-name ${ROLE_NAME} \
        --profile ${AWS_PROFILE}
    
    aws iam add-role-to-instance-profile \
        --instance-profile-name ${ROLE_NAME} \
        --role-name ${ROLE_NAME} \
        --profile ${AWS_PROFILE}
    
    echo "✓ IAM role created: ${ROLE_NAME}"
    sleep 10  # Wait for IAM propagation
fi

# Create key pair if it doesn't exist
KEY_NAME="${PROJECT_NAME}-key-${ENVIRONMENT}"
KEY_FILE="${HOME}/.ssh/${KEY_NAME}.pem"

if [ ! -f "${KEY_FILE}" ]; then
    echo "Creating EC2 key pair: ${KEY_NAME}"
    aws ec2 create-key-pair \
        --key-name ${KEY_NAME} \
        --query 'KeyMaterial' \
        --output text \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION} > ${KEY_FILE}
    
    chmod 400 ${KEY_FILE}
    echo "✓ Key pair created: ${KEY_FILE}"
else
    echo "✓ Key pair already exists: ${KEY_FILE}"
fi

# Get latest Amazon Linux 2023 AMI
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=al2023-ami-2023.*-x86_64" "Name=state,Values=available" \
    --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
    --output text \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION})

echo "Using AMI: ${AMI_ID}"

# Determine instance type based on environment
if [ "${ENVIRONMENT}" == "prod" ]; then
    INSTANCE_TYPE="t3.small"
else
    INSTANCE_TYPE="t3.micro"
fi

# Create user data script
USER_DATA=$(cat <<'EOF'
#!/bin/bash
set -e

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PostgreSQL client
yum install -y postgresql15

# Install PM2 globally
npm install -g pm2

# Install nginx
yum install -y nginx

# Create app directory
mkdir -p /opt/resistance-radio
chown ec2-user:ec2-user /opt/resistance-radio

# Configure nginx as reverse proxy
cat > /etc/nginx/conf.d/api.conf << 'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

# Start and enable nginx
systemctl start nginx
systemctl enable nginx

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

echo "EC2 instance setup complete"
EOF
)

# Launch EC2 instance
INSTANCE_NAME="${PROJECT_NAME}-api-${ENVIRONMENT}"

# Check if instance already exists
INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=${INSTANCE_NAME}" "Name=instance-state-name,Values=running,pending,stopped" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} 2>/dev/null)

if [ "${INSTANCE_ID}" == "None" ] || [ -z "${INSTANCE_ID}" ]; then
    echo "Launching EC2 instance: ${INSTANCE_NAME}"
    
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id ${AMI_ID} \
        --instance-type ${INSTANCE_TYPE} \
        --key-name ${KEY_NAME} \
        --security-group-ids ${SG_ID} \
        --iam-instance-profile Name=${ROLE_NAME} \
        --user-data "${USER_DATA}" \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${INSTANCE_NAME}},{Key=Project,Value=ResistanceRadio},{Key=Environment,Value=${ENVIRONMENT}}]" \
        --query 'Instances[0].InstanceId' \
        --output text \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION})
    
    echo "✓ EC2 instance launched: ${INSTANCE_ID}"
    echo "Waiting for instance to be running..."
    
    aws ec2 wait instance-running \
        --instance-ids ${INSTANCE_ID} \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION}
    
    echo "✓ Instance is running"
else
    echo "✓ EC2 instance already exists: ${INSTANCE_ID}"
fi

# Get instance public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids ${INSTANCE_ID} \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION})

echo ""
echo "=========================================="
echo "EC2 Backend Setup Complete"
echo "=========================================="
echo "Instance ID: ${INSTANCE_ID}"
echo "Instance Type: ${INSTANCE_TYPE}"
echo "Public IP: ${PUBLIC_IP}"
echo "Security Group: ${SG_ID}"
echo "Key File: ${KEY_FILE}"
echo ""
echo "SSH Command:"
echo "ssh -i ${KEY_FILE} ec2-user@${PUBLIC_IP}"
echo ""
echo "API URL: http://${PUBLIC_IP}"
echo "=========================================="
