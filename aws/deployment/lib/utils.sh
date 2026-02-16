#!/bin/bash

# Common utility functions for multi-environment deployment scripts
# This file provides shared functionality for configuration loading, validation,
# and resource name management across all deployment scripts.

set -euo pipefail

# Color codes for output formatting
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Script directory for relative path resolution
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.json"

# Project root directory (two levels up from aws/deployment)
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Global variables populated by load_config()
AWS_PROFILE=""
AWS_REGION=""
NAMING_PREFIX=""
PRODUCTION_BUCKET=""
PRODUCTION_CLOUDFRONT=""

#######################################
# Load configuration from config.json using jq
# Globals:
#   AWS_PROFILE, AWS_REGION, NAMING_PREFIX, PRODUCTION_BUCKET, PRODUCTION_CLOUDFRONT
# Arguments:
#   None
# Returns:
#   0 on success, 1 on failure
#######################################
load_config() {
  if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${RED}ERROR: Configuration - Config file not found${NC}"
    echo "Details: File '$CONFIG_FILE' does not exist"
    echo "Action: Ensure config.json exists in aws/deployment/ directory"
    return 1
  fi

  # Validate JSON syntax
  if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
    echo -e "${RED}ERROR: Configuration - Invalid JSON syntax${NC}"
    echo "Details: File '$CONFIG_FILE' contains invalid JSON"
    echo "Action: Check config.json for syntax errors (missing commas, brackets, etc.)"
    return 1
  fi

  # Load AWS configuration
  AWS_PROFILE=$(jq -r '.aws.profile // empty' "$CONFIG_FILE")
  AWS_REGION=$(jq -r '.aws.region // empty' "$CONFIG_FILE")
  
  # Load naming configuration
  NAMING_PREFIX=$(jq -r '.naming.prefix // empty' "$CONFIG_FILE")
  PRODUCTION_BUCKET=$(jq -r '.naming.production_bucket // empty' "$CONFIG_FILE")
  PRODUCTION_CLOUDFRONT=$(jq -r '.naming.production_cloudfront // empty' "$CONFIG_FILE")

  return 0
}

#######################################
# Validate that all required configuration fields are present
# Globals:
#   AWS_PROFILE, AWS_REGION, NAMING_PREFIX, PRODUCTION_BUCKET, PRODUCTION_CLOUDFRONT
# Arguments:
#   None
# Returns:
#   0 if valid, 1 if invalid
#######################################
validate_config() {
  local errors=0

  if [[ -z "$AWS_PROFILE" ]]; then
    echo -e "${RED}ERROR: Configuration - Missing aws.profile${NC}"
    echo "Details: Required field 'aws.profile' is not set in config.json"
    echo "Action: Add 'aws.profile' field to config.json"
    errors=1
  fi

  if [[ -z "$AWS_REGION" ]]; then
    echo -e "${RED}ERROR: Configuration - Missing aws.region${NC}"
    echo "Details: Required field 'aws.region' is not set in config.json"
    echo "Action: Add 'aws.region' field to config.json"
    errors=1
  fi

  if [[ -z "$NAMING_PREFIX" ]]; then
    echo -e "${RED}ERROR: Configuration - Missing naming.prefix${NC}"
    echo "Details: Required field 'naming.prefix' is not set in config.json"
    echo "Action: Add 'naming.prefix' field to config.json"
    errors=1
  fi

  if [[ -z "$PRODUCTION_BUCKET" ]]; then
    echo -e "${RED}ERROR: Configuration - Missing naming.production_bucket${NC}"
    echo "Details: Required field 'naming.production_bucket' is not set in config.json"
    echo "Action: Add 'naming.production_bucket' field to config.json"
    errors=1
  fi

  if [[ -z "$PRODUCTION_CLOUDFRONT" ]]; then
    echo -e "${RED}ERROR: Configuration - Missing naming.production_cloudfront${NC}"
    echo "Details: Required field 'naming.production_cloudfront' is not set in config.json"
    echo "Action: Add 'naming.production_cloudfront' field to config.json"
    errors=1
  fi

  # Validate themes array exists and is not empty
  local theme_count
  theme_count=$(jq '.themes | length' "$CONFIG_FILE")
  if [[ "$theme_count" -eq 0 ]]; then
    echo -e "${RED}ERROR: Configuration - Empty themes array${NC}"
    echo "Details: The 'themes' array in config.json is empty"
    echo "Action: Add at least one theme to the 'themes' array"
    errors=1
  fi

  return $errors
}

#######################################
# Validate AWS credentials and profile access
# Globals:
#   AWS_PROFILE
# Arguments:
#   None
# Returns:
#   0 if credentials are valid, 1 if invalid
#######################################
validate_aws_credentials() {
  # Check if AWS CLI is installed
  if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS Credentials - AWS CLI not installed${NC}"
    echo "Details: The 'aws' command is not available"
    echo "Action: Install AWS CLI from https://aws.amazon.com/cli/"
    return 1
  fi

  # Check if profile exists and is configured
  if ! aws configure list --profile "$AWS_PROFILE" &> /dev/null; then
    echo -e "${RED}ERROR: AWS Credentials - Profile not configured${NC}"
    echo "Details: AWS profile '$AWS_PROFILE' is not configured"
    echo "Action: Run 'aws configure --profile $AWS_PROFILE' to set up credentials"
    return 1
  fi

  # Verify credentials work by making a simple API call
  if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    echo -e "${RED}ERROR: AWS Credentials - Invalid or expired credentials${NC}"
    echo "Details: Cannot authenticate with AWS using profile '$AWS_PROFILE'"
    echo "Action: Check your AWS credentials and ensure they are not expired"
    return 1
  fi

  return 0
}

#######################################
# Get the build directory path for a given theme name
# Globals:
#   CONFIG_FILE, PROJECT_ROOT
# Arguments:
#   $1 - Theme name
# Returns:
#   0 on success, 1 if theme not found
# Outputs:
#   Build directory path to stdout
#######################################
get_theme_build_dir() {
  local theme_name="$1"
  
  if [[ -z "$theme_name" ]]; then
    echo -e "${RED}ERROR: Theme - No theme name provided${NC}" >&2
    return 1
  fi

  local build_dir
  build_dir=$(jq -r --arg theme "$theme_name" \
    '.themes[] | select(.name == $theme) | .buildDir' \
    "$CONFIG_FILE")

  if [[ -z "$build_dir" ]]; then
    echo -e "${RED}ERROR: Theme - Theme not found in configuration${NC}" >&2
    echo "Details: Theme '$theme_name' is not defined in config.json" >&2
    echo "Action: Check theme name spelling or add theme to config.json" >&2
    return 1
  fi

  # Resolve path relative to project root
  echo "${PROJECT_ROOT}/${build_dir}"
  return 0
}

#######################################
# Construct S3 bucket name for a given theme
# Globals:
#   NAMING_PREFIX
# Arguments:
#   $1 - Theme name
# Returns:
#   0 on success
# Outputs:
#   Bucket name to stdout
#######################################
get_bucket_name() {
  local theme_name="$1"
  
  if [[ -z "$theme_name" ]]; then
    echo -e "${RED}ERROR: Bucket Name - No theme name provided${NC}" >&2
    return 1
  fi

  echo "${NAMING_PREFIX}-${theme_name}"
  return 0
}

#######################################
# Check if a resource name matches production resources
# Globals:
#   PRODUCTION_BUCKET, PRODUCTION_CLOUDFRONT
# Arguments:
#   $1 - Resource name (bucket name or CloudFront distribution ID)
# Returns:
#   0 if resource is production, 1 if not production
#######################################
is_production_resource() {
  local resource_name="$1"
  
  if [[ -z "$resource_name" ]]; then
    return 1
  fi

  # Check if resource matches production bucket
  if [[ "$resource_name" == "$PRODUCTION_BUCKET" ]]; then
    return 0
  fi

  # Check if resource matches production CloudFront distribution
  if [[ "$resource_name" == "$PRODUCTION_CLOUDFRONT" ]]; then
    return 0
  fi

  return 1
}

#######################################
# Print error message and exit if resource is production
# This is a safety check to prevent accidental production modifications
# Globals:
#   None
# Arguments:
#   $1 - Resource name to check
#   $2 - Operation being attempted (e.g., "delete", "modify")
# Returns:
#   Does not return if resource is production (exits script)
#######################################
protect_production_resource() {
  local resource_name="$1"
  local operation="${2:-modify}"
  
  if is_production_resource "$resource_name"; then
    echo -e "${RED}CRITICAL ERROR: Production Resource Protection${NC}"
    echo "Details: Attempted to $operation production resource '$resource_name'"
    echo "Action: This operation is blocked to protect production environment"
    echo ""
    echo "Production resources that are protected:"
    echo "  - Bucket: $PRODUCTION_BUCKET"
    echo "  - CloudFront: $PRODUCTION_CLOUDFRONT"
    exit 1
  fi
}

#######################################
# Get all theme names from configuration
# Globals:
#   CONFIG_FILE
# Arguments:
#   None
# Returns:
#   0 on success
# Outputs:
#   Space-separated list of theme names to stdout
#######################################
get_all_themes() {
  jq -r '.themes[].name' "$CONFIG_FILE" | tr '\n' ' '
}

#######################################
# Print success message in green
# Arguments:
#   $@ - Message to print
#######################################
print_success() {
  echo -e "${GREEN}✓ $*${NC}" >&2
}

#######################################
# Print error message in red
# Arguments:
#   $@ - Message to print
#######################################
print_error() {
  echo -e "${RED}✗ $*${NC}" >&2
}

#######################################
# Print warning message in yellow
# Arguments:
#   $@ - Message to print
#######################################
print_warning() {
  echo -e "${YELLOW}⚠ $*${NC}" >&2
}

#######################################
# Print info message
# Arguments:
#   $@ - Message to print
#######################################
print_info() {
  echo "ℹ $*" >&2
}
