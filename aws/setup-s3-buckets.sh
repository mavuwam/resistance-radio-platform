#!/bin/bash

# Create S3 buckets for Resistance Radio Station

source "$(dirname "$0")/resistance-radio-config.sh"

echo "Creating S3 buckets..."

# Function to create bucket with error handling
create_bucket() {
    local bucket_name=$1
    local purpose=$2
    
    echo "Creating bucket: ${bucket_name} (${purpose})"
    
    if aws s3 ls "s3://${bucket_name}" 2>&1 | grep -q 'NoSuchBucket'; then
        aws s3 mb "s3://${bucket_name}" \
            --region ${AWS_REGION} \
            --profile ${AWS_PROFILE}
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket ${bucket_name} \
            --versioning-configuration Status=Enabled \
            --profile ${AWS_PROFILE}
        
        # Enable encryption
        aws s3api put-bucket-encryption \
            --bucket ${bucket_name} \
            --server-side-encryption-configuration '{
                "Rules": [{
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }]
            }' \
            --profile ${AWS_PROFILE}
        
        # Block public access (except for website bucket)
        if [[ "${bucket_name}" != *"website"* ]]; then
            aws s3api put-public-access-block \
                --bucket ${bucket_name} \
                --public-access-block-configuration \
                    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
                --profile ${AWS_PROFILE}
        fi
        
        # Add tags
        aws s3api put-bucket-tagging \
            --bucket ${bucket_name} \
            --tagging "TagSet=[
                {Key=Project,Value=ResistanceRadio},
                {Key=Environment,Value=${ENVIRONMENT}},
                {Key=ManagedBy,Value=Script}
            ]" \
            --profile ${AWS_PROFILE}
        
        echo "✓ Bucket ${bucket_name} created successfully"
    else
        echo "✓ Bucket ${bucket_name} already exists"
    fi
}

# Create media bucket (for audio files, images)
create_bucket "${S3_MEDIA_BUCKET}" "Media Storage"

# Configure CORS for media bucket
aws s3api put-bucket-cors \
    --bucket ${S3_MEDIA_BUCKET} \
    --cors-configuration '{
        "CORSRules": [{
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedHeaders": ["*"],
            "MaxAgeSeconds": 3000
        }]
    }' \
    --profile ${AWS_PROFILE}

# Create lifecycle policy for media bucket
aws s3api put-bucket-lifecycle-configuration \
    --bucket ${S3_MEDIA_BUCKET} \
    --lifecycle-configuration '{
        "Rules": [{
            "ID": "DeleteOldVersions",
            "Status": "Enabled",
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 90
            },
            "Filter": {
                "Prefix": ""
            }
        }]
    }' \
    --profile ${AWS_PROFILE}

# Create website bucket (for static frontend)
create_bucket "${S3_WEBSITE_BUCKET}" "Website Hosting"

# Configure website hosting
aws s3 website "s3://${S3_WEBSITE_BUCKET}" \
    --index-document index.html \
    --error-document index.html \
    --profile ${AWS_PROFILE}

# Create backup bucket
create_bucket "${S3_BACKUP_BUCKET}" "Database Backups"

# Configure lifecycle policy for backups (retain for 30 days)
aws s3api put-bucket-lifecycle-configuration \
    --bucket ${S3_BACKUP_BUCKET} \
    --lifecycle-configuration '{
        "Rules": [{
            "ID": "DeleteOldBackups",
            "Status": "Enabled",
            "Expiration": {
                "Days": 30
            },
            "Filter": {
                "Prefix": ""
            }
        }]
    }' \
    --profile ${AWS_PROFILE}

echo ""
echo "=========================================="
echo "S3 Buckets Created Successfully"
echo "=========================================="
echo "Media Bucket: ${S3_MEDIA_BUCKET}"
echo "Website Bucket: ${S3_WEBSITE_BUCKET}"
echo "Backup Bucket: ${S3_BACKUP_BUCKET}"
echo "=========================================="
