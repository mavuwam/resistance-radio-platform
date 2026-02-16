#!/bin/bash

# Setup Test Environments Script
# Creates AWS infrastructure (S3 buckets + CloudFront distributions) for all theme test environments
# This script is idempotent - it will skip resources that already exist

set -euo pipefail

# Source utility functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/utils.sh"

# Output file for CloudFront URLs
URLS_FILE="${SCRIPT_DIR}/test-urls.txt"

#######################################
# Create S3 bucket with static website hosting enabled
# Globals:
#   AWS_PROFILE, AWS_REGION, NAMING_PREFIX
# Arguments:
#   $1 - Theme name
# Returns:
#   0 on success, 1 on failure
# Outputs:
#   Bucket name to stdout
#######################################
create_s3_bucket() {
  local theme_name="$1"
  local bucket_name
  bucket_name=$(get_bucket_name "$theme_name")
  
  # Safety check: ensure this is not a production resource
  protect_production_resource "$bucket_name" "create"
  
  # Check if bucket already exists
  if aws s3api head-bucket --bucket "$bucket_name" --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    print_warning "S3 bucket '$bucket_name' already exists, skipping creation"
    echo "$bucket_name"
    return 0
  fi
  
  print_info "Creating S3 bucket: $bucket_name"
  
  # Create bucket in us-east-1 (no LocationConstraint needed for us-east-1)
  # Note: S3 Standard storage class is used by default (cost-effective for short-term test environments)
  if ! aws s3api create-bucket \
    --bucket "$bucket_name" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" >/dev/null 2>&1; then
    print_error "Failed to create S3 bucket '$bucket_name'"
    return 1
  fi
  
  # Enable static website hosting
  if ! aws s3 website "s3://${bucket_name}" \
    --index-document index.html \
    --error-document index.html \
    --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    print_error "Failed to enable static website hosting for '$bucket_name'"
    return 1
  fi
  
  # Add tags for cost tracking and identification
  aws s3api put-bucket-tagging \
    --bucket "$bucket_name" \
    --tagging "TagSet=[{Key=Environment,Value=test},{Key=Theme,Value=${theme_name}},{Key=ManagedBy,Value=deployment-scripts}]" \
    --profile "$AWS_PROFILE" >/dev/null 2>&1 || true
  
  print_success "Created S3 bucket: $bucket_name"
  echo "$bucket_name"
  return 0
}

#######################################
# Configure bucket policy to allow CloudFront access
# This sets the bucket to public read for simplicity in test environments
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Bucket name
# Returns:
#   0 on success, 1 on failure
#######################################
configure_bucket_policy() {
  local bucket_name="$1"
  
  print_info "Configuring bucket policy for: $bucket_name"
  
  # Disable block public access settings FIRST (required before applying public policy)
  if ! aws s3api put-public-access-block \
    --bucket "$bucket_name" \
    --public-access-block-configuration \
      "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    print_error "Failed to configure public access settings for '$bucket_name'"
    return 1
  fi
  
  # Create bucket policy JSON for public read access
  local policy
  policy=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${bucket_name}/*"
    }
  ]
}
EOF
)
  
  # Apply bucket policy
  if ! aws s3api put-bucket-policy \
    --bucket "$bucket_name" \
    --policy "$policy" \
    --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    print_error "Failed to configure bucket policy for '$bucket_name'"
    return 1
  fi
  
  print_success "Configured bucket policy for: $bucket_name"
  return 0
}

#######################################
# Create CloudFront distribution for S3 bucket
# Globals:
#   AWS_PROFILE, AWS_REGION, CONFIG_FILE
# Arguments:
#   $1 - Bucket name
#   $2 - Theme name
# Returns:
#   0 on success, 1 on failure
# Outputs:
#   Distribution ID to stdout
#######################################
create_cloudfront_distribution() {
  local bucket_name="$1"
  local theme_name="$2"
  
  print_info "Creating CloudFront distribution for: $bucket_name"
  
  # Check if distribution already exists for this bucket
  local existing_dist
  existing_dist=$(aws cloudfront list-distributions \
    --profile "$AWS_PROFILE" \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='${bucket_name}.s3.amazonaws.com']].Id | [0]" \
    --output text 2>/dev/null || echo "")
  
  if [[ -n "$existing_dist" && "$existing_dist" != "None" ]]; then
    print_warning "CloudFront distribution already exists for '$bucket_name': $existing_dist"
    echo "$existing_dist"
    return 0
  fi
  
  # Get CloudFront configuration from config.json
  # Note: PriceClass_100 is used for cost optimization (cheapest price class, US/Europe only)
  local price_class
  local default_root_object
  price_class=$(jq -r '.cloudfront.priceClass' "$CONFIG_FILE")
  default_root_object=$(jq -r '.cloudfront.defaultRootObject' "$CONFIG_FILE")
  
  # Generate unique caller reference
  local caller_reference
  caller_reference="test-env-${theme_name}-$(date +%s)"
  
  # Create distribution configuration JSON
  local dist_config
  dist_config=$(cat <<EOF
{
  "CallerReference": "${caller_reference}",
  "Comment": "Test environment for ${theme_name} theme",
  "Enabled": true,
  "DefaultRootObject": "${default_root_object}",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "${bucket_name}-origin",
        "DomainName": "${bucket_name}.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "${bucket_name}-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "PriceClass": "${price_class}",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true
  }
}
EOF
)
  
  # Create CloudFront distribution
  local distribution_id
  distribution_id=$(aws cloudfront create-distribution \
    --distribution-config "$dist_config" \
    --profile "$AWS_PROFILE" \
    --query 'Distribution.Id' \
    --output text 2>/dev/null)
  
  if [[ -z "$distribution_id" ]]; then
    print_error "Failed to create CloudFront distribution for '$bucket_name'"
    return 1
  fi
  
  # Tag the distribution
  local distribution_arn
  distribution_arn=$(aws cloudfront list-distributions \
    --profile "$AWS_PROFILE" \
    --query "DistributionList.Items[?Id=='${distribution_id}'].ARN | [0]" \
    --output text 2>/dev/null)
  
  if [[ -n "$distribution_arn" && "$distribution_arn" != "None" ]]; then
    aws cloudfront tag-resource \
      --resource "$distribution_arn" \
      --tags "Items=[{Key=Environment,Value=test},{Key=Theme,Value=${theme_name}},{Key=ManagedBy,Value=deployment-scripts}]" \
      --profile "$AWS_PROFILE" 2>/dev/null || true
  fi
  
  print_success "Created CloudFront distribution: $distribution_id"
  echo "$distribution_id"
  return 0
}

#######################################
# Wait for CloudFront distribution to be fully deployed
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Distribution ID
# Returns:
#   0 on success, 1 on timeout
#######################################
wait_for_distribution() {
  local distribution_id="$1"
  local max_wait=1200  # 20 minutes
  local elapsed=0
  local interval=30
  
  print_info "Waiting for distribution $distribution_id to be deployed..."
  
  while [[ $elapsed -lt $max_wait ]]; do
    local status
    status=$(aws cloudfront get-distribution \
      --id "$distribution_id" \
      --profile "$AWS_PROFILE" \
      --query 'Distribution.Status' \
      --output text 2>/dev/null)
    
    if [[ "$status" == "Deployed" ]]; then
      print_success "Distribution $distribution_id is deployed"
      return 0
    fi
    
    echo -n "."
    sleep $interval
    elapsed=$((elapsed + interval))
  done
  
  echo ""
  print_warning "Distribution $distribution_id is still deploying (timeout reached)"
  print_info "You can check status with: aws cloudfront get-distribution --id $distribution_id --profile $AWS_PROFILE"
  return 0  # Don't fail, just warn
}

#######################################
# Main execution
#######################################
main() {
  echo "========================================="
  echo "  Setup Test Environments"
  echo "========================================="
  echo ""
  
  # Load and validate configuration
  print_info "Loading configuration..."
  if ! load_config; then
    exit 1
  fi
  
  if ! validate_config; then
    exit 1
  fi
  
  print_success "Configuration loaded successfully"
  echo ""
  
  # Validate AWS credentials
  print_info "Validating AWS credentials..."
  if ! validate_aws_credentials; then
    exit 1
  fi
  
  print_success "AWS credentials validated"
  echo ""
  
  # Get all themes from configuration
  local themes
  themes=$(get_all_themes)
  
  # Arrays to store results
  declare -a created_distributions
  declare -a cloudfront_urls
  
  # Loop through all themes and create infrastructure
  for theme in $themes; do
    echo "========================================="
    echo "  Setting up: $theme"
    echo "========================================="
    
    # Create S3 bucket
    local bucket_name
    if ! bucket_name=$(create_s3_bucket "$theme"); then
      print_error "Failed to create infrastructure for theme: $theme"
      continue
    fi
    
    # Configure bucket policy
    if ! configure_bucket_policy "$bucket_name"; then
      print_error "Failed to configure bucket policy for theme: $theme"
      continue
    fi
    
    # Create CloudFront distribution
    local distribution_id
    if ! distribution_id=$(create_cloudfront_distribution "$bucket_name" "$theme"); then
      print_error "Failed to create CloudFront distribution for theme: $theme"
      continue
    fi
    
    # Store distribution ID for waiting
    created_distributions+=("$distribution_id")
    
    # Get CloudFront URL
    local cloudfront_url
    cloudfront_url=$(aws cloudfront get-distribution \
      --id "$distribution_id" \
      --profile "$AWS_PROFILE" \
      --query 'Distribution.DomainName' \
      --output text 2>/dev/null)
    
    cloudfront_urls+=("${theme}|https://${cloudfront_url}")
    
    echo ""
  done
  
  # Wait for all distributions to be deployed
  if [[ ${#created_distributions[@]} -gt 0 ]]; then
    echo "========================================="
    echo "  Waiting for Distributions"
    echo "========================================="
    echo ""
    
    for dist_id in "${created_distributions[@]}"; do
      wait_for_distribution "$dist_id"
    done
  fi
  
  # Save CloudFront URLs to file
  echo "========================================="
  echo "  Test Environment URLs"
  echo "========================================="
  echo ""
  
  > "$URLS_FILE"  # Clear file
  
  for url_entry in "${cloudfront_urls[@]}"; do
    local theme_name="${url_entry%%|*}"
    local url="${url_entry##*|}"
    echo "$theme_name: $url" | tee -a "$URLS_FILE"
  done
  
  echo ""
  print_success "Setup complete! URLs saved to: $URLS_FILE"
  echo ""
  print_info "Next steps:"
  echo "  1. Build your themes: npm run build:all-themes"
  echo "  2. Deploy themes: ./aws/deployment/deploy-all-themes.sh"
  echo "  3. Visit the URLs above to test each theme"
  echo "  4. Clean up when done: ./aws/deployment/cleanup-test-environments.sh"
}

# Run main function
main "$@"
