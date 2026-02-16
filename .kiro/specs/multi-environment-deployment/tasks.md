# Implementation Plan: Multi-Environment AWS Deployment System

## Overview

This implementation plan breaks down the multi-environment deployment system into discrete coding tasks. The system will provide automated infrastructure management for deploying and testing multiple frontend theme variations on AWS, with complete isolation from production resources.

The implementation follows a logical progression: configuration → setup infrastructure → deployment automation → cleanup automation → testing and validation.

## Tasks

- [x] 1. Create deployment directory structure and configuration
  - Create `aws/deployment/` directory for all deployment scripts
  - Create `aws/deployment/config.json` with AWS settings, theme mappings, and CloudFront configuration
  - Create `aws/deployment/.gitignore` to exclude generated files (URLs list, logs)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.1 Write property test for configuration schema validation
  - **Property 27: Configuration Schema Validation**
  - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**

- [ ] 2. Implement shared utility functions
  - [x] 2.1 Create `aws/deployment/lib/utils.sh` with common functions
    - Implement `load_config()` to parse config.json using jq
    - Implement `validate_config()` to check required fields
    - Implement `validate_aws_credentials()` to verify AWS CLI access
    - Implement `get_theme_build_dir(theme_name)` to map theme to directory
    - Implement `get_bucket_name(theme_name)` to construct S3 bucket name
    - Implement `is_production_resource(resource_name)` to check if resource is production
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 2.4, 2.5_

  - [ ]* 2.2 Write property test for theme to build directory mapping
    - **Property 7: Theme to Build Directory Mapping**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

  - [ ]* 2.3 Write property test for resource naming convention
    - **Property 3: Resource Naming Convention**
    - **Validates: Requirements 1.5, 2.5**

  - [ ]* 2.4 Write property test for production resource validation
    - **Property 6: Production Resource Validation**
    - **Validates: Requirements 2.4**

- [ ] 3. Implement setup infrastructure script
  - [x] 3.1 Create `aws/deployment/setup-test-environments.sh`
    - Load and validate configuration
    - Validate AWS credentials
    - Implement `create_s3_bucket(theme_name)` function
    - Implement `configure_bucket_policy(bucket_name)` function
    - Implement `create_cloudfront_distribution(bucket_name, theme_name)` function
    - Implement `wait_for_distribution(distribution_id)` function
    - Loop through all themes and create infrastructure
    - Save CloudFront URLs to `aws/deployment/test-urls.txt`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 3.2 Write property test for static website hosting configuration
    - **Property 1: Static Website Hosting Configuration**
    - **Validates: Requirements 1.2**

  - [ ]* 3.3 Write property test for CloudFront origin mapping
    - **Property 2: CloudFront Origin Mapping**
    - **Validates: Requirements 1.4**

  - [ ]* 3.4 Write property test for regional consistency
    - **Property 4: Regional Consistency**
    - **Validates: Requirements 1.6, 6.2**

  - [ ]* 3.5 Write property test for bucket policy configuration
    - **Property 22: Bucket Policy for CloudFront Access**
    - **Validates: Requirements 8.2**

  - [ ]* 3.6 Write property test for CloudFront cache behavior
    - **Property 23: CloudFront Cache Behavior Configuration**
    - **Validates: Requirements 8.4**

  - [ ]* 3.7 Write property test for setup script idempotency
    - **Property 24: Setup Script Idempotency**
    - **Validates: Requirements 8.7**

- [x] 4. Checkpoint - Test infrastructure setup
  - Ensure setup script runs successfully and creates all resources, ask the user if questions arise.

- [ ] 5. Implement single theme deployment script
  - [x] 5.1 Create `aws/deployment/deploy-theme.sh`
    - Accept theme name as command-line argument
    - Load and validate configuration
    - Validate theme name exists in config
    - Implement `validate_build_directory(dir)` function
    - Implement `get_distribution_id(bucket_name)` function
    - Implement `upload_files(source_dir, bucket_name)` function with content-type detection
    - Implement `invalidate_cache(distribution_id)` function
    - Implement `wait_for_invalidation(distribution_id, invalidation_id)` function
    - Implement `validate_deployment(bucket_name, distribution_id)` function
    - Output CloudFront URL with confirmation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 5.2 Write property test for build directory validation
    - **Property 8: Build Directory Validation**
    - **Validates: Requirements 7.6**

  - [ ]* 5.3 Write property test for complete file upload
    - **Property 9: Complete File Upload**
    - **Validates: Requirements 3.3, 9.1**

  - [ ]* 5.4 Write property test for directory structure preservation
    - **Property 10: Directory Structure Preservation**
    - **Validates: Requirements 3.4**

  - [ ]* 5.5 Write property test for content-type header assignment
    - **Property 11: Content-Type Header Assignment**
    - **Validates: Requirements 3.5**

  - [ ]* 5.6 Write property test for CloudFront cache invalidation
    - **Property 12: CloudFront Cache Invalidation**
    - **Validates: Requirements 3.6**

  - [ ]* 5.7 Write property test for deployment error handling
    - **Property 13: Deployment Error Handling**
    - **Validates: Requirements 3.8**

  - [ ]* 5.8 Write property test for deployment validation
    - **Property 25: Deployment Validation**
    - **Validates: Requirements 9.2, 9.3**

  - [ ]* 5.9 Write property test for validation error reporting
    - **Property 26: Validation Error Reporting**
    - **Validates: Requirements 9.5**

- [ ] 6. Implement batch deployment script
  - [x] 6.1 Create `aws/deployment/deploy-all-themes.sh`
    - Load configuration
    - Extract all theme names from config
    - Loop through themes and call deploy-theme.sh for each
    - Collect success/failure status for each theme
    - Continue on individual failures
    - Print summary with all CloudFront URLs
    - Exit with non-zero status if any deployment failed
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.2 Write property test for batch deployment resilience
    - **Property 14: Batch Deployment Resilience**
    - **Validates: Requirements 4.4**

- [x] 7. Checkpoint - Test deployment scripts
  - Ensure deployment scripts work for single and batch deployments, ask the user if questions arise.

- [ ] 8. Implement cleanup script
  - [x] 8.1 Create `aws/deployment/cleanup-test-environments.sh`
    - Load configuration
    - Implement `list_test_buckets()` function to find buckets by naming pattern
    - Implement `empty_bucket(bucket_name)` function
    - Implement `delete_bucket(bucket_name)` function
    - Implement `list_test_distributions()` function to find distributions by tags/pattern
    - Implement `disable_distribution(distribution_id)` function
    - Implement `wait_for_distribution_disabled(distribution_id)` function
    - Implement `delete_distribution(distribution_id)` function
    - Validate production resources are NOT in deletion list
    - Delete all test S3 buckets
    - Delete all test CloudFront distributions
    - Print confirmation and any failures with manual cleanup instructions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 8.2 Write property test for test bucket identification
    - **Property 15: Test Bucket Identification**
    - **Validates: Requirements 5.1**

  - [ ]* 8.3 Write property test for bucket emptying before deletion
    - **Property 16: Bucket Emptying Before Deletion**
    - **Validates: Requirements 5.2**

  - [ ]* 8.4 Write property test for test distribution identification
    - **Property 17: Test Distribution Identification**
    - **Validates: Requirements 5.4**

  - [ ]* 8.5 Write property test for production resource isolation
    - **Property 5: Production Resource Isolation**
    - **Validates: Requirements 2.1, 2.2, 5.6**

  - [ ]* 8.6 Write property test for cleanup error reporting
    - **Property 18: Cleanup Error Reporting**
    - **Validates: Requirements 5.8**

- [ ] 9. Add cost optimization configurations
  - [x] 9.1 Update setup script to use cost-effective settings
    - Configure CloudFront distributions with PriceClass_100
    - Configure S3 buckets with Standard storage class
    - Add tags to all resources for cost tracking
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 9.2 Write property test for CloudFront price class configuration
    - **Property 20: CloudFront Price Class Configuration**
    - **Validates: Requirements 6.3**

  - [ ]* 9.3 Write property test for S3 storage class configuration
    - **Property 21: S3 Storage Class Configuration**
    - **Validates: Requirements 6.4**

  - [ ]* 9.4 Write property test for account consistency
    - **Property 19: Account Consistency**
    - **Validates: Requirements 6.1**

- [x] 10. Create documentation and usage guide
  - Create `aws/deployment/README.md` with usage instructions
  - Document prerequisites (AWS CLI, jq, configured profile)
  - Document workflow: setup → deploy → test → cleanup
  - Document estimated costs and cost optimization tips
  - Add troubleshooting section for common errors
  - _Requirements: 6.5_

- [x] 11. Add error handling and validation improvements
  - Add input validation to all scripts (check arguments, validate paths)
  - Add dry-run mode flag (--dry-run) to preview operations without executing
  - Add verbose mode flag (--verbose) for detailed logging
  - Improve error messages with actionable instructions
  - Add script usage help (--help flag)
  - _Requirements: 3.8, 5.8, 7.6, 10.7_

  - [ ]* 11.1 Write property test for configuration error handling
    - **Property 28: Configuration Error Handling**
    - **Validates: Requirements 10.7**

- [x] 12. Final checkpoint - End-to-end testing
  - Run complete workflow: setup → deploy all → cleanup
  - Verify all CloudFront URLs are accessible
  - Verify production resources remain untouched
  - Verify cleanup removes all test resources
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Scripts use bash for simplicity and AWS CLI for AWS operations
- All scripts should be executable (`chmod +x`) and include shebang (`#!/bin/bash`)
- Configuration is centralized in config.json for easy modification
