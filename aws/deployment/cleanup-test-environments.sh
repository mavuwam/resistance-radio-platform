#!/bin/bash

# Cleanup script for test environment infrastructure
# This script removes all test S3 buckets and CloudFront distributions
# while ensuring production resources are never touched.
#
# Usage: ./cleanup-test-environments.sh [--dry-run]
#
# Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8

set -euo pipefail

# Source utility functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/utils.sh"

# Dry-run mode flag
DRY_RUN=false

# Arrays to track cleanup results
BUCKETS_DELETED=()
BUCKETS_FAILED=()
DISTRIBUTIONS_DELETED=()
DISTRIBUTIONS_FAILED=()

#######################################
# Parse command-line arguments
#######################################
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --help)
        echo "Usage: $0 [--dry-run]"
        echo ""
        echo "Cleanup all test environment infrastructure (S3 buckets and CloudFront distributions)"
        echo ""
        echo "Options:"
        echo "  --dry-run    Show what would be deleted without actually deleting"
        echo "  --help       Show this help message"
        exit 0
        ;;
      *)
        echo "Unknown option: $1"
        echo "Run '$0 --help' for usage information"
        exit 1
        ;;
    esac
  done
}

#######################################
# List all test S3 buckets by naming pattern
# Globals:
#   AWS_PROFILE, AWS_REGION, NAMING_PREFIX
# Returns:
#   0 on success
# Outputs:
#   Space-separated list of bucket names to stdout
#######################################
list_test_buckets() {
  print_info "Searching for test S3 buckets with pattern: ${NAMING_PREFIX}-*"
  
  local buckets
  buckets=$(aws s3api list-buckets \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query "Buckets[?starts_with(Name, '${NAMING_PREFIX}-')].Name" \
    --output text 2>/dev/null || echo "")
  
  if [[ -z "$buckets" ]]; then
    print_info "No test buckets found"
    return 0
  fi
  
  echo "$buckets"
}

#######################################
# Empty all objects from an S3 bucket
# Arguments:
#   $1 - Bucket name
# Returns:
#   0 on success, 1 on failure
#######################################
empty_bucket() {
  local bucket_name="$1"
  
  print_info "Emptying bucket: $bucket_name"
  
  # Check if bucket exists
  if ! aws s3api head-bucket \
    --bucket "$bucket_name" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" 2>/dev/null; then
    print_warning "Bucket $bucket_name does not exist or is not accessible"
    return 1
  fi
  
  # Delete all objects (including versions if versioning is enabled)
  if ! aws s3 rm "s3://${bucket_name}" \
    --recursive \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" 2>/dev/null; then
    print_error "Failed to empty bucket: $bucket_name"
    return 1
  fi
  
  # Delete all object versions if versioning is enabled
  local versions
  versions=$(aws s3api list-object-versions \
    --bucket "$bucket_name" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'Versions[].{Key:Key,VersionId:VersionId}' \
    --output json 2>/dev/null || echo "[]")
  
  if [[ "$versions" != "[]" ]] && [[ "$versions" != "" ]]; then
    print_info "Deleting object versions from $bucket_name"
    echo "$versions" | jq -c '.[]' | while read -r version; do
      local key=$(echo "$version" | jq -r '.Key')
      local version_id=$(echo "$version" | jq -r '.VersionId')
      aws s3api delete-object \
        --bucket "$bucket_name" \
        --key "$key" \
        --version-id "$version_id" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" 2>/dev/null || true
    done
  fi
  
  # Delete all delete markers if versioning is enabled
  local delete_markers
  delete_markers=$(aws s3api list-object-versions \
    --bucket "$bucket_name" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'DeleteMarkers[].{Key:Key,VersionId:VersionId}' \
    --output json 2>/dev/null || echo "[]")
  
  if [[ "$delete_markers" != "[]" ]] && [[ "$delete_markers" != "" ]]; then
    print_info "Deleting delete markers from $bucket_name"
    echo "$delete_markers" | jq -c '.[]' | while read -r marker; do
      local key=$(echo "$marker" | jq -r '.Key')
      local version_id=$(echo "$marker" | jq -r '.VersionId')
      aws s3api delete-object \
        --bucket "$bucket_name" \
        --key "$key" \
        --version-id "$version_id" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" 2>/dev/null || true
    done
  fi
  
  print_success "Bucket emptied: $bucket_name"
  return 0
}

#######################################
# Delete an S3 bucket
# Arguments:
#   $1 - Bucket name
# Returns:
#   0 on success, 1 on failure
#######################################
delete_bucket() {
  local bucket_name="$1"
  
  # Safety check: ensure this is not a production resource
  protect_production_resource "$bucket_name" "delete"
  
  print_info "Deleting bucket: $bucket_name"
  
  if ! aws s3api delete-bucket \
    --bucket "$bucket_name" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" 2>/dev/null; then
    print_error "Failed to delete bucket: $bucket_name"
    return 1
  fi
  
  print_success "Bucket deleted: $bucket_name"
  return 0
}

#######################################
# List all test CloudFront distributions by tags/pattern
# Globals:
#   AWS_PROFILE, NAMING_PREFIX
# Returns:
#   0 on success
# Outputs:
#   Space-separated list of distribution IDs to stdout
#######################################
list_test_distributions() {
  print_info "Searching for test CloudFront distributions"
  
  # Get all distributions
  local distributions
  distributions=$(aws cloudfront list-distributions \
    --profile "$AWS_PROFILE" \
    --query 'DistributionList.Items[].{Id:Id,Comment:Comment}' \
    --output json 2>/dev/null || echo "[]")
  
  if [[ "$distributions" == "[]" ]] || [[ -z "$distributions" ]]; then
    print_info "No CloudFront distributions found"
    return 0
  fi
  
  # Filter distributions by comment pattern (contains test theme names)
  local test_dist_ids=""
  while read -r dist; do
    local dist_id=$(echo "$dist" | jq -r '.Id')
    local comment=$(echo "$dist" | jq -r '.Comment // ""')
    
    # Check if comment contains "Test environment" or matches our naming pattern
    if [[ "$comment" =~ "Test environment" ]] || [[ "$comment" =~ "${NAMING_PREFIX}" ]]; then
      test_dist_ids="${test_dist_ids} ${dist_id}"
    fi
  done < <(echo "$distributions" | jq -c '.[]')
  
  if [[ -z "$test_dist_ids" ]]; then
    print_info "No test distributions found"
    return 0
  fi
  
  echo "$test_dist_ids" | xargs
}

#######################################
# Disable a CloudFront distribution
# Arguments:
#   $1 - Distribution ID
# Returns:
#   0 on success, 1 on failure
#######################################
disable_distribution() {
  local distribution_id="$1"
  
  # Safety check: ensure this is not a production resource
  protect_production_resource "$distribution_id" "disable"
  
  print_info "Disabling distribution: $distribution_id"
  
  # Get current distribution config
  local config_file="/tmp/dist-config-${distribution_id}.json"
  if ! aws cloudfront get-distribution-config \
    --id "$distribution_id" \
    --profile "$AWS_PROFILE" \
    --output json > "$config_file" 2>/dev/null; then
    print_error "Failed to get distribution config: $distribution_id"
    rm -f "$config_file"
    return 1
  fi
  
  # Extract ETag and config
  local etag
  etag=$(jq -r '.ETag' "$config_file")
  local config
  config=$(jq '.DistributionConfig' "$config_file")
  
  # Check if already disabled
  local is_enabled
  is_enabled=$(echo "$config" | jq -r '.Enabled')
  if [[ "$is_enabled" == "false" ]]; then
    print_info "Distribution already disabled: $distribution_id"
    rm -f "$config_file"
    return 0
  fi
  
  # Disable the distribution
  local updated_config
  updated_config=$(echo "$config" | jq '.Enabled = false')
  echo "$updated_config" > "$config_file"
  
  if ! aws cloudfront update-distribution \
    --id "$distribution_id" \
    --distribution-config "file://${config_file}" \
    --if-match "$etag" \
    --profile "$AWS_PROFILE" \
    --output json > /dev/null 2>&1; then
    print_error "Failed to disable distribution: $distribution_id"
    rm -f "$config_file"
    return 1
  fi
  
  rm -f "$config_file"
  print_success "Distribution disabled: $distribution_id"
  return 0
}

#######################################
# Wait for a CloudFront distribution to be fully disabled
# Arguments:
#   $1 - Distribution ID
# Returns:
#   0 on success, 1 on timeout
#######################################
wait_for_distribution_disabled() {
  local distribution_id="$1"
  local max_attempts=60  # 10 minutes (60 * 10 seconds)
  local attempt=0
  
  print_info "Waiting for distribution to be disabled: $distribution_id"
  
  while [[ $attempt -lt $max_attempts ]]; do
    local status
    status=$(aws cloudfront get-distribution \
      --id "$distribution_id" \
      --profile "$AWS_PROFILE" \
      --query 'Distribution.Status' \
      --output text 2>/dev/null || echo "Unknown")
    
    if [[ "$status" == "Deployed" ]]; then
      # Check if it's actually disabled
      local is_enabled
      is_enabled=$(aws cloudfront get-distribution \
        --id "$distribution_id" \
        --profile "$AWS_PROFILE" \
        --query 'Distribution.DistributionConfig.Enabled' \
        --output text 2>/dev/null || echo "true")
      
      if [[ "$is_enabled" == "False" ]] || [[ "$is_enabled" == "false" ]]; then
        print_success "Distribution is disabled and deployed: $distribution_id"
        return 0
      fi
    fi
    
    attempt=$((attempt + 1))
    echo -n "." >&2
    sleep 10
  done
  
  echo "" >&2
  print_error "Timeout waiting for distribution to be disabled: $distribution_id"
  return 1
}

#######################################
# Delete a CloudFront distribution
# Arguments:
#   $1 - Distribution ID
# Returns:
#   0 on success, 1 on failure
#######################################
delete_distribution() {
  local distribution_id="$1"
  
  # Safety check: ensure this is not a production resource
  protect_production_resource "$distribution_id" "delete"
  
  print_info "Deleting distribution: $distribution_id"
  
  # Get current ETag
  local etag
  etag=$(aws cloudfront get-distribution \
    --id "$distribution_id" \
    --profile "$AWS_PROFILE" \
    --query 'ETag' \
    --output text 2>/dev/null || echo "")
  
  if [[ -z "$etag" ]]; then
    print_error "Failed to get ETag for distribution: $distribution_id"
    return 1
  fi
  
  if ! aws cloudfront delete-distribution \
    --id "$distribution_id" \
    --if-match "$etag" \
    --profile "$AWS_PROFILE" 2>/dev/null; then
    print_error "Failed to delete distribution: $distribution_id"
    return 1
  fi
  
  print_success "Distribution deleted: $distribution_id"
  return 0
}

#######################################
# Main cleanup function
#######################################
main() {
  parse_args "$@"
  
  echo "========================================="
  echo "Test Environment Cleanup"
  echo "========================================="
  echo ""
  
  if [[ "$DRY_RUN" == true ]]; then
    print_warning "DRY-RUN MODE: No resources will be deleted"
    echo ""
  fi
  
  # Load and validate configuration
  print_info "Loading configuration..."
  if ! load_config; then
    exit 1
  fi
  
  if ! validate_config; then
    exit 1
  fi
  
  if ! validate_aws_credentials; then
    exit 1
  fi
  
  print_success "Configuration loaded successfully"
  echo ""
  
  # Display production resources that will be protected
  echo "Production resources (PROTECTED):"
  echo "  - Bucket: $PRODUCTION_BUCKET"
  echo "  - CloudFront: $PRODUCTION_CLOUDFRONT"
  echo ""
  
  # List test buckets
  print_info "Finding test S3 buckets..."
  local test_buckets
  test_buckets=$(list_test_buckets)
  
  if [[ -z "$test_buckets" ]]; then
    print_info "No test buckets to delete"
  else
    echo "Test buckets found:"
    for bucket in $test_buckets; do
      echo "  - $bucket"
    done
    echo ""
  fi
  
  # List test distributions
  print_info "Finding test CloudFront distributions..."
  local test_distributions
  test_distributions=$(list_test_distributions)
  
  if [[ -z "$test_distributions" ]]; then
    print_info "No test distributions to delete"
  else
    echo "Test distributions found:"
    for dist_id in $test_distributions; do
      echo "  - $dist_id"
    done
    echo ""
  fi
  
  # Exit if dry-run
  if [[ "$DRY_RUN" == true ]]; then
    echo ""
    print_success "Dry-run complete. No resources were deleted."
    exit 0
  fi
  
  # Confirm deletion
  if [[ -n "$test_buckets" ]] || [[ -n "$test_distributions" ]]; then
    echo ""
    read -p "Are you sure you want to delete all test resources? (yes/no): " -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
      print_info "Cleanup cancelled by user"
      exit 0
    fi
  fi
  
  # Delete S3 buckets
  if [[ -n "$test_buckets" ]]; then
    echo ""
    echo "========================================="
    echo "Deleting S3 Buckets"
    echo "========================================="
    echo ""
    
    for bucket in $test_buckets; do
      if empty_bucket "$bucket" && delete_bucket "$bucket"; then
        BUCKETS_DELETED+=("$bucket")
      else
        BUCKETS_FAILED+=("$bucket")
      fi
    done
  fi
  
  # Delete CloudFront distributions
  if [[ -n "$test_distributions" ]]; then
    echo ""
    echo "========================================="
    echo "Deleting CloudFront Distributions"
    echo "========================================="
    echo ""
    
    for dist_id in $test_distributions; do
      if disable_distribution "$dist_id" && \
         wait_for_distribution_disabled "$dist_id" && \
         delete_distribution "$dist_id"; then
        DISTRIBUTIONS_DELETED+=("$dist_id")
      else
        DISTRIBUTIONS_FAILED+=("$dist_id")
      fi
    done
  fi
  
  # Print summary
  echo ""
  echo "========================================="
  echo "Cleanup Summary"
  echo "========================================="
  echo ""
  
  if [[ ${#BUCKETS_DELETED[@]} -gt 0 ]]; then
    print_success "S3 buckets deleted: ${#BUCKETS_DELETED[@]}"
    for bucket in "${BUCKETS_DELETED[@]}"; do
      echo "  ✓ $bucket"
    done
    echo ""
  fi
  
  if [[ ${#DISTRIBUTIONS_DELETED[@]} -gt 0 ]]; then
    print_success "CloudFront distributions deleted: ${#DISTRIBUTIONS_DELETED[@]}"
    for dist_id in "${DISTRIBUTIONS_DELETED[@]}"; do
      echo "  ✓ $dist_id"
    done
    echo ""
  fi
  
  # Report failures
  local has_failures=false
  
  if [[ ${#BUCKETS_FAILED[@]} -gt 0 ]]; then
    has_failures=true
    print_error "S3 buckets failed to delete: ${#BUCKETS_FAILED[@]}"
    for bucket in "${BUCKETS_FAILED[@]}"; do
      echo "  ✗ $bucket"
    done
    echo ""
    echo "Manual cleanup instructions for S3 buckets:"
    echo "  1. Empty the bucket: aws s3 rm s3://<bucket-name> --recursive --profile $AWS_PROFILE"
    echo "  2. Delete the bucket: aws s3api delete-bucket --bucket <bucket-name> --profile $AWS_PROFILE --region $AWS_REGION"
    echo ""
  fi
  
  if [[ ${#DISTRIBUTIONS_FAILED[@]} -gt 0 ]]; then
    has_failures=true
    print_error "CloudFront distributions failed to delete: ${#DISTRIBUTIONS_FAILED[@]}"
    for dist_id in "${DISTRIBUTIONS_FAILED[@]}"; do
      echo "  ✗ $dist_id"
    done
    echo ""
    echo "Manual cleanup instructions for CloudFront distributions:"
    echo "  1. Disable: aws cloudfront get-distribution-config --id <dist-id> --profile $AWS_PROFILE > config.json"
    echo "  2. Edit config.json and set Enabled to false"
    echo "  3. Update: aws cloudfront update-distribution --id <dist-id> --distribution-config file://config.json --if-match <etag> --profile $AWS_PROFILE"
    echo "  4. Wait for deployment (can take 15-20 minutes)"
    echo "  5. Delete: aws cloudfront delete-distribution --id <dist-id> --if-match <etag> --profile $AWS_PROFILE"
    echo ""
  fi
  
  if [[ "$has_failures" == true ]]; then
    print_error "Cleanup completed with failures"
    exit 1
  else
    print_success "All test resources cleaned up successfully!"
    exit 0
  fi
}

# Run main function
main "$@"
