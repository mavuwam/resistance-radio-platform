#!/bin/bash

# Deploy All Themes Script
# Deploys all theme builds to their test environments (S3 + CloudFront)
# Usage: ./deploy-all-themes.sh

set -euo pipefail

# Source utility functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/utils.sh"

# Arrays to track deployment results
declare -a SUCCESSFUL_DEPLOYMENTS=()
declare -a FAILED_DEPLOYMENTS=()
declare -a CLOUDFRONT_URLS=()

#######################################
# Deploy a single theme by calling deploy-theme.sh
# Arguments:
#   $1 - Theme name
# Returns:
#   0 on success, 1 on failure
#######################################
deploy_theme() {
  local theme_name="$1"
  
  print_info "Deploying theme: $theme_name"
  echo "========================================="
  
  # Call deploy-theme.sh for this theme
  if "${SCRIPT_DIR}/deploy-theme.sh" "$theme_name"; then
    return 0
  else
    return 1
  fi
}

#######################################
# Get CloudFront URL for a deployed theme
# Globals:
#   AWS_PROFILE
# Arguments:
#   $1 - Theme name
# Returns:
#   0 on success, 1 on failure
# Outputs:
#   CloudFront URL to stdout
#######################################
get_theme_cloudfront_url() {
  local theme_name="$1"
  local bucket_name
  bucket_name=$(get_bucket_name "$theme_name")
  
  # Get distribution ID for this bucket
  local distribution_id
  distribution_id=$(aws cloudfront list-distributions \
    --profile "$AWS_PROFILE" \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='${bucket_name}.s3.amazonaws.com']].Id | [0]" \
    --output text 2>/dev/null || echo "")
  
  if [[ -z "$distribution_id" || "$distribution_id" == "None" ]]; then
    echo "Not found"
    return 1
  fi
  
  # Get CloudFront domain name
  local cloudfront_url
  cloudfront_url=$(aws cloudfront get-distribution \
    --id "$distribution_id" \
    --profile "$AWS_PROFILE" \
    --query 'Distribution.DomainName' \
    --output text 2>/dev/null || echo "")
  
  if [[ -z "$cloudfront_url" ]]; then
    echo "Not found"
    return 1
  fi
  
  echo "https://${cloudfront_url}"
  return 0
}

#######################################
# Print deployment summary with all results
# Globals:
#   SUCCESSFUL_DEPLOYMENTS, FAILED_DEPLOYMENTS, CLOUDFRONT_URLS
# Arguments:
#   None
#######################################
print_summary() {
  echo ""
  echo "========================================="
  echo "  Deployment Summary"
  echo "========================================="
  echo ""
  
  # Print successful deployments
  if [[ ${#SUCCESSFUL_DEPLOYMENTS[@]} -gt 0 ]]; then
    print_success "Successfully deployed ${#SUCCESSFUL_DEPLOYMENTS[@]} theme(s):"
    echo ""
    for i in "${!SUCCESSFUL_DEPLOYMENTS[@]}"; do
      local theme="${SUCCESSFUL_DEPLOYMENTS[$i]}"
      local url="${CLOUDFRONT_URLS[$i]}"
      echo "  ✓ $theme"
      echo "    URL: $url"
      echo ""
    done
  fi
  
  # Print failed deployments
  if [[ ${#FAILED_DEPLOYMENTS[@]} -gt 0 ]]; then
    print_error "Failed to deploy ${#FAILED_DEPLOYMENTS[@]} theme(s):"
    echo ""
    for theme in "${FAILED_DEPLOYMENTS[@]}"; do
      echo "  ✗ $theme"
    done
    echo ""
    print_info "Review the error messages above for details on each failure"
    print_info "You can retry failed deployments individually using:"
    echo "  ./aws/deployment/deploy-theme.sh <theme-name>"
    echo ""
  fi
  
  # Print overall status
  local total=$((${#SUCCESSFUL_DEPLOYMENTS[@]} + ${#FAILED_DEPLOYMENTS[@]}))
  echo "========================================="
  echo "  Total: $total themes"
  echo "  Success: ${#SUCCESSFUL_DEPLOYMENTS[@]}"
  echo "  Failed: ${#FAILED_DEPLOYMENTS[@]}"
  echo "========================================="
}

#######################################
# Main execution
#######################################
main() {
  echo "========================================="
  echo "  Deploy All Themes"
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
  
  # Get all theme names from configuration
  local themes
  themes=$(get_all_themes)
  
  if [[ -z "$themes" ]]; then
    print_error "No themes found in configuration"
    exit 1
  fi
  
  # Convert space-separated string to array
  read -ra theme_array <<< "$themes"
  
  print_info "Found ${#theme_array[@]} theme(s) to deploy"
  echo ""
  
  # Deploy each theme
  for theme in "${theme_array[@]}"; do
    echo ""
    echo "========================================="
    echo "  Theme: $theme"
    echo "========================================="
    echo ""
    
    # Deploy theme and track result
    if deploy_theme "$theme"; then
      SUCCESSFUL_DEPLOYMENTS+=("$theme")
      
      # Get CloudFront URL for this theme
      local url
      if url=$(get_theme_cloudfront_url "$theme"); then
        CLOUDFRONT_URLS+=("$url")
      else
        CLOUDFRONT_URLS+=("URL not available")
      fi
      
      print_success "Theme '$theme' deployed successfully"
    else
      FAILED_DEPLOYMENTS+=("$theme")
      print_error "Theme '$theme' deployment failed"
      print_info "Continuing with remaining themes..."
    fi
    
    echo ""
  done
  
  # Print summary of all deployments
  print_summary
  
  # Exit with error if any deployment failed
  if [[ ${#FAILED_DEPLOYMENTS[@]} -gt 0 ]]; then
    exit 1
  fi
  
  exit 0
}

# Run main function
main "$@"
