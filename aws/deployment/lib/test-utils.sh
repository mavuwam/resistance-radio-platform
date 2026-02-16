#!/bin/bash

# Simple test script to verify utils.sh functions work correctly

set -euo pipefail

# Source the utils library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils.sh"

echo "Testing utils.sh functions..."
echo ""

# Test 1: load_config()
echo "Test 1: load_config()"
if load_config; then
  echo "✓ Config loaded successfully"
  echo "  AWS_PROFILE: $AWS_PROFILE"
  echo "  AWS_REGION: $AWS_REGION"
  echo "  NAMING_PREFIX: $NAMING_PREFIX"
  echo "  PRODUCTION_BUCKET: $PRODUCTION_BUCKET"
  echo "  PRODUCTION_CLOUDFRONT: $PRODUCTION_CLOUDFRONT"
else
  echo "✗ Failed to load config"
  exit 1
fi
echo ""

# Test 2: validate_config()
echo "Test 2: validate_config()"
if validate_config; then
  echo "✓ Config validation passed"
else
  echo "✗ Config validation failed"
  exit 1
fi
echo ""

# Test 3: get_theme_build_dir()
echo "Test 3: get_theme_build_dir()"
for theme in "engagement-centric" "informational-hub" "multimedia-experience" "community-driven" "accessible-responsive"; do
  build_dir=$(get_theme_build_dir "$theme")
  if [[ -n "$build_dir" ]]; then
    echo "✓ Theme '$theme' -> '$build_dir'"
  else
    echo "✗ Failed to get build dir for theme '$theme'"
    exit 1
  fi
done
echo ""

# Test 4: get_bucket_name()
echo "Test 4: get_bucket_name()"
for theme in "engagement-centric" "informational-hub"; do
  bucket_name=$(get_bucket_name "$theme")
  expected="${NAMING_PREFIX}-${theme}"
  if [[ "$bucket_name" == "$expected" ]]; then
    echo "✓ Theme '$theme' -> '$bucket_name'"
  else
    echo "✗ Expected '$expected', got '$bucket_name'"
    exit 1
  fi
done
echo ""

# Test 5: is_production_resource()
echo "Test 5: is_production_resource()"
if is_production_resource "$PRODUCTION_BUCKET"; then
  echo "✓ Correctly identified production bucket"
else
  echo "✗ Failed to identify production bucket"
  exit 1
fi

if is_production_resource "$PRODUCTION_CLOUDFRONT"; then
  echo "✓ Correctly identified production CloudFront"
else
  echo "✗ Failed to identify production CloudFront"
  exit 1
fi

if ! is_production_resource "zv-test-engagement-centric"; then
  echo "✓ Correctly identified test resource as non-production"
else
  echo "✗ Incorrectly identified test resource as production"
  exit 1
fi
echo ""

# Test 6: get_all_themes()
echo "Test 6: get_all_themes()"
themes=$(get_all_themes)
if [[ -n "$themes" ]]; then
  echo "✓ Retrieved themes: $themes"
else
  echo "✗ Failed to retrieve themes"
  exit 1
fi
echo ""

# Test 7: validate_aws_credentials() - skip if not configured
echo "Test 7: validate_aws_credentials()"
if validate_aws_credentials; then
  echo "✓ AWS credentials are valid"
else
  echo "⚠ AWS credentials validation failed (this is expected if AWS is not configured)"
fi
echo ""

echo "All tests completed successfully!"
