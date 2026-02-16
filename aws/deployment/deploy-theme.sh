#!/bin/bash

# Deploy Theme Script
# Deploys a single theme build to its test environment (S3 + CloudFront)
# Usage: ./deploy-theme.sh <theme-name>

set -euo pipefail

# Source utility functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/utils.sh"

#######################################
# Validate that build directory exists and contains required files
# Arguments:
#   $1 - Build directory path
# Returns:
#   0 if valid, 1 if invalid
#######################################
validate_build_directory() {
  local build_dir="$1"
  
  # Check if directory exists
  if [[ ! -d "$build_dir" ]]; then
    echo -e "${RED}ERROR: Deployment - Build directory not found${NC}"
    echo "Details: Directory '$build_dir' does not exist"
    echo "Action: Run the appropriate build command to create the build"
    return 1
  fi
  
  # Check if index.html exists
  if [[ ! -f "${build_dir}/index.html" ]]; then
    echo -e "${RED}ERROR: Deployment - Missing index.html${NC}"
    echo "Details: File 'index.html' not found in '$build_dir'"
    echo "Action: Ensure the build completed successfully and includes index.html"
    return 1
  fi
  
  print_success "Build directory validated: $build_dir"
  return 0
}

#######################################
# Get CloudFront distribution ID for a given S3 bucket
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Bucket name
# Returns:
#   0 on success, 1 if not found
# Outputs:
#   Distribution ID to stdout
#######################################
get_distribution_id() {
  local bucket_name="$1"
  
  print_info "Looking up CloudFront distribution for bucket: $bucket_name"
  
  local distribution_id
  distribution_id=$(aws cloudfront list-distributions \
    --profile "$AWS_PROFILE" \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='${bucket_name}.s3.amazonaws.com']].Id | [0]" \
    --output text 2>/dev/null || echo "")
  
  if [[ -z "$distribution_id" || "$distribution_id" == "None" ]]; then
    echo -e "${RED}ERROR: Deployment - CloudFront distribution not found${NC}" >&2
    echo "Details: No CloudFront distribution found for bucket '$bucket_name'" >&2
    echo "Action: Run './aws/deployment/setup-test-environments.sh' to create infrastructure" >&2
    return 1
  fi
  
  echo "$distribution_id"
  return 0
}

#######################################
# Upload files from source directory to S3 bucket
# Sets appropriate content-type headers based on file extensions
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Source directory path
#   $2 - Bucket name
# Returns:
#   0 on success, 1 on failure
#######################################
upload_files() {
  local source_dir="$1"
  local bucket_name="$2"
  
  print_info "Uploading files from $source_dir to s3://$bucket_name"
  
  # Use aws s3 sync with --delete to remove old files
  # The sync command automatically handles content-type for common file types
  if ! aws s3 sync "$source_dir" "s3://${bucket_name}" \
    --profile "$AWS_PROFILE" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json" 2>&1; then
    print_error "Failed to upload files to S3"
    return 1
  fi
  
  # Upload HTML files with no-cache to ensure fresh content
  if ! aws s3 sync "$source_dir" "s3://${bucket_name}" \
    --profile "$AWS_PROFILE" \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "no-cache, no-store, must-revalidate" 2>&1; then
    print_error "Failed to upload HTML files to S3"
    return 1
  fi
  
  # Upload JSON files with no-cache
  if ! aws s3 sync "$source_dir" "s3://${bucket_name}" \
    --profile "$AWS_PROFILE" \
    --exclude "*" \
    --include "*.json" \
    --content-type "application/json; charset=utf-8" \
    --cache-control "no-cache, no-store, must-revalidate" 2>&1; then
    print_error "Failed to upload JSON files to S3"
    return 1
  fi
  
  print_success "Files uploaded successfully"
  return 0
}

#######################################
# Create CloudFront cache invalidation for all paths
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Distribution ID
# Returns:
#   0 on success, 1 on failure
# Outputs:
#   Invalidation ID to stdout
#######################################
invalidate_cache() {
  local distribution_id="$1"
  
  print_info "Creating CloudFront cache invalidation for distribution: $distribution_id"
  
  # Create invalidation for all paths
  local invalidation_id
  invalidation_id=$(aws cloudfront create-invalidation \
    --distribution-id "$distribution_id" \
    --paths "/*" \
    --profile "$AWS_PROFILE" \
    --query 'Invalidation.Id' \
    --output text 2>/dev/null)
  
  if [[ -z "$invalidation_id" ]]; then
    print_error "Failed to create CloudFront invalidation"
    return 1
  fi
  
  print_success "Cache invalidation created: $invalidation_id"
  echo "$invalidation_id"
  return 0
}

#######################################
# Wait for CloudFront invalidation to complete
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Distribution ID
#   $2 - Invalidation ID
# Returns:
#   0 on success, 1 on timeout
#######################################
wait_for_invalidation() {
  local distribution_id="$1"
  local invalidation_id="$2"
  local max_wait=300  # 5 minutes
  local elapsed=0
  local interval=10
  
  print_info "Waiting for invalidation to complete..."
  
  while [[ $elapsed -lt $max_wait ]]; do
    local status
    status=$(aws cloudfront get-invalidation \
      --distribution-id "$distribution_id" \
      --id "$invalidation_id" \
      --profile "$AWS_PROFILE" \
      --query 'Invalidation.Status' \
      --output text 2>/dev/null)
    
    if [[ "$status" == "Completed" ]]; then
      print_success "Cache invalidation completed"
      return 0
    fi
    
    echo -n "."
    sleep $interval
    elapsed=$((elapsed + interval))
  done
  
  echo ""
  print_warning "Invalidation is still in progress (timeout reached)"
  print_info "The invalidation will complete in the background"
  return 0  # Don't fail, just warn
}

#######################################
# Validate deployment by checking files exist in S3 and CloudFront
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Bucket name
#   $2 - Distribution ID
# Returns:
#   0 on success, 1 on validation failure
#######################################
validate_deployment() {
  local bucket_name="$1"
  local distribution_id="$2"
  
  print_info "Validating deployment..."
  
  # Check if index.html exists in S3
  if ! aws s3api head-object \
    --bucket "$bucket_name" \
    --key "index.html" \
    --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    echo -e "${RED}ERROR: Validation - index.html not found in S3${NC}"
    echo "Details: File 'index.html' was not uploaded to bucket '$bucket_name'"
    echo "Action: Check upload logs for errors and retry deployment"
    return 1
  fi
  
  # Verify distribution is enabled
  local dist_status
  dist_status=$(aws cloudfront get-distribution \
    --id "$distribution_id" \
    --profile "$AWS_PROFILE" \
    --query 'Distribution.DistributionConfig.Enabled' \
    --output text 2>/dev/null)
  
  if [[ "$dist_status" != "True" ]]; then
    echo -e "${RED}ERROR: Validation - CloudFront distribution is disabled${NC}"
    echo "Details: Distribution '$distribution_id' is not enabled"
    echo "Action: Enable the distribution in AWS Console or contact administrator"
    return 1
  fi
  
  print_success "Deployment validation passed"
  return 0
}

#######################################
# Main execution
#######################################
main() {
  # Check if theme name was provided
  if [[ $# -eq 0 ]]; then
    echo -e "${RED}ERROR: Usage - No theme name provided${NC}"
    echo "Usage: $0 <theme-name>"
    echo ""
    echo "Available themes:"
    load_config >/dev/null 2>&1 || true
    if [[ -f "$CONFIG_FILE" ]]; then
      jq -r '.themes[].name' "$CONFIG_FILE" | sed 's/^/  - /'
    fi
    exit 1
  fi
  
  local theme_name="$1"
  
  echo "========================================="
  echo "  Deploy Theme: $theme_name"
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
  
  # Get build directory for theme
  print_info "Looking up theme configuration..."
  local build_dir
  if ! build_dir=$(get_theme_build_dir "$theme_name"); then
    exit 1
  fi
  
  print_success "Theme found: $theme_name -> $build_dir"
  echo ""
  
  # Validate build directory
  if ! validate_build_directory "$build_dir"; then
    exit 1
  fi
  echo ""
  
  # Get bucket name
  local bucket_name
  bucket_name=$(get_bucket_name "$theme_name")
  
  # Safety check: ensure this is not a production resource
  protect_production_resource "$bucket_name" "deploy to"
  
  # Check if bucket exists
  if ! aws s3api head-bucket --bucket "$bucket_name" --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    echo -e "${RED}ERROR: Deployment - S3 bucket not found${NC}"
    echo "Details: Bucket '$bucket_name' does not exist"
    echo "Action: Run './aws/deployment/setup-test-environments.sh' to create infrastructure"
    exit 1
  fi
  
  print_success "Target bucket found: $bucket_name"
  echo ""
  
  # Get CloudFront distribution ID
  local distribution_id
  if ! distribution_id=$(get_distribution_id "$bucket_name"); then
    exit 1
  fi
  
  print_success "CloudFront distribution found: $distribution_id"
  echo ""
  
  # Upload files to S3
  if ! upload_files "$build_dir" "$bucket_name"; then
    exit 1
  fi
  echo ""
  
  # Validate deployment
  if ! validate_deployment "$bucket_name" "$distribution_id"; then
    exit 1
  fi
  echo ""
  
  # Invalidate CloudFront cache
  local invalidation_id
  if ! invalidation_id=$(invalidate_cache "$distribution_id"); then
    exit 1
  fi
  echo ""
  
  # Wait for invalidation to complete
  wait_for_invalidation "$distribution_id" "$invalidation_id"
  echo ""
  
  # Get CloudFront URL
  local cloudfront_url
  cloudfront_url=$(aws cloudfront get-distribution \
    --id "$distribution_id" \
    --profile "$AWS_PROFILE" \
    --query 'Distribution.DomainName' \
    --output text 2>/dev/null)
  
  # Print success message with URL
  echo "========================================="
  echo "  Deployment Complete!"
  echo "========================================="
  echo ""
  print_success "Theme '$theme_name' deployed successfully"
  echo ""
  echo "CloudFront URL: https://${cloudfront_url}"
  echo ""
  print_info "The site should be accessible within a few minutes"
  print_info "Cache invalidation may take up to 15 minutes to fully propagate"
}

# Run main function
main "$@"
