# Design Document: Multi-Environment AWS Deployment System

## Overview

The multi-environment deployment system provides automated infrastructure management and deployment capabilities for testing multiple frontend theme variations of the Zimbabwe Voice platform. The system creates isolated AWS environments (S3 + CloudFront) for each theme, enabling side-by-side comparison without affecting production.

The design follows a script-based approach using AWS CLI and bash scripting, providing simple, maintainable automation that can be executed from the command line. All infrastructure is defined as code, making it reproducible and version-controlled.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS Account (us-east-1)                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Production Environment                     │ │
│  │  ┌──────────────────┐    ┌──────────────────────────┐ │ │
│  │  │ S3: resistance-  │───▶│ CloudFront:              │ │ │
│  │  │ radio-website-   │    │ EYKP4STY3RIHX            │ │ │
│  │  │ dev-734110488556 │    │ (UNTOUCHED)              │ │ │
│  │  └──────────────────┘    └──────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Test Environments (5x)                     │ │
│  │                                                          │ │
│  │  Theme 1: engagement-centric                            │ │
│  │  ┌──────────────────┐    ┌──────────────────────────┐ │ │
│  │  │ S3: zv-test-     │───▶│ CloudFront Distribution  │ │ │
│  │  │ engagement-      │    │ (Auto-generated)         │ │ │
│  │  │ centric          │    └──────────────────────────┘ │ │
│  │  └──────────────────┘                                  │ │
│  │                                                          │ │
│  │  Theme 2: informational-hub                             │ │
│  │  ┌──────────────────┐    ┌──────────────────────────┐ │ │
│  │  │ S3: zv-test-     │───▶│ CloudFront Distribution  │ │ │
│  │  │ informational-   │    │ (Auto-generated)         │ │ │
│  │  │ hub              │    └──────────────────────────┘ │ │
│  │  └──────────────────┘                                  │ │
│  │                                                          │ │
│  │  [Similar structure for 3 more themes...]              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Local Development                         │
│                                                               │
│  frontend/                                                   │
│  ├── dist-engagement-centric/                               │
│  ├── dist-informational-hub/                                │
│  ├── dist-multimedia-experience/                            │
│  ├── dist-community-driven/                                 │
│  └── dist-accessible-responsive/                            │
│                                                               │
│  aws/deployment/                                             │
│  ├── config.json                                            │
│  ├── setup-test-environments.sh                             │
│  ├── deploy-theme.sh                                        │
│  ├── deploy-all-themes.sh                                   │
│  └── cleanup-test-environments.sh                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Setup Phase**: Administrator runs setup script → Creates S3 buckets → Creates CloudFront distributions → Outputs URLs
2. **Deployment Phase**: Administrator runs deploy script → Uploads files to S3 → Invalidates CloudFront cache → Confirms deployment
3. **Testing Phase**: Administrator visits CloudFront URLs → Compares themes side-by-side
4. **Cleanup Phase**: Administrator runs cleanup script → Empties S3 buckets → Deletes buckets → Disables and deletes CloudFront distributions

## Components and Interfaces

### 1. Configuration File (config.json)

**Purpose**: Centralized configuration for all deployment scripts

**Structure**:
```json
{
  "aws": {
    "profile": "Personal_Account_734110488556",
    "region": "us-east-1"
  },
  "naming": {
    "prefix": "zv-test",
    "production_bucket": "resistance-radio-website-dev-734110488556",
    "production_cloudfront": "EYKP4STY3RIHX"
  },
  "themes": [
    {
      "name": "engagement-centric",
      "buildDir": "frontend/dist-engagement-centric"
    },
    {
      "name": "informational-hub",
      "buildDir": "frontend/dist-informational-hub"
    },
    {
      "name": "multimedia-experience",
      "buildDir": "frontend/dist-multimedia-experience"
    },
    {
      "name": "community-driven",
      "buildDir": "frontend/dist-community-driven"
    },
    {
      "name": "accessible-responsive",
      "buildDir": "frontend/dist-accessible-responsive"
    }
  ],
  "cloudfront": {
    "priceClass": "PriceClass_100",
    "defaultRootObject": "index.html",
    "errorPages": [
      {
        "errorCode": 404,
        "responseCode": 200,
        "responsePage": "/index.html"
      },
      {
        "errorCode": 403,
        "responseCode": 200,
        "responsePage": "/index.html"
      }
    ]
  }
}
```

**Interface**:
- Read by all deployment scripts
- Validated on script startup
- Provides theme name → build directory mapping
- Provides AWS configuration
- Provides naming conventions

### 2. Setup Script (setup-test-environments.sh)

**Purpose**: Creates all AWS infrastructure for test environments

**Inputs**:
- config.json (configuration file)

**Outputs**:
- 5 S3 buckets (one per theme)
- 5 CloudFront distributions (one per theme)
- Text file with all CloudFront URLs

**Functions**:
- `load_config()`: Parses config.json and validates required fields
- `validate_aws_credentials()`: Verifies AWS profile is configured and accessible
- `create_s3_bucket(theme_name)`: Creates S3 bucket with static website hosting
- `configure_bucket_policy(bucket_name)`: Sets bucket policy for CloudFront access
- `create_cloudfront_distribution(bucket_name, theme_name)`: Creates CloudFront distribution
- `wait_for_distribution(distribution_id)`: Polls until distribution is deployed
- `save_urls(urls_array)`: Writes CloudFront URLs to file

**Error Handling**:
- Validates config.json exists and is valid JSON
- Checks AWS credentials before creating resources
- Skips resource creation if resource already exists
- Reports all errors with actionable messages
- Exits with non-zero status on failure

### 3. Deploy Theme Script (deploy-theme.sh)

**Purpose**: Deploys a single theme build to its test environment

**Inputs**:
- Theme name (command-line argument)
- config.json (configuration file)
- Theme build directory (from config)

**Outputs**:
- Files uploaded to S3
- CloudFront cache invalidated
- Deployment confirmation message

**Functions**:
- `load_config()`: Parses config.json
- `validate_theme_name(theme)`: Checks theme exists in config
- `get_build_directory(theme)`: Returns build directory path for theme
- `validate_build_directory(dir)`: Checks directory exists and contains index.html
- `get_bucket_name(theme)`: Constructs S3 bucket name from theme
- `get_distribution_id(bucket_name)`: Retrieves CloudFront distribution ID for bucket
- `upload_files(source_dir, bucket_name)`: Syncs files to S3 with correct content-types
- `invalidate_cache(distribution_id)`: Creates CloudFront invalidation for /*
- `wait_for_invalidation(distribution_id, invalidation_id)`: Polls until invalidation completes
- `get_cloudfront_url(distribution_id)`: Returns CloudFront domain name

**Error Handling**:
- Validates theme name is recognized
- Checks build directory exists
- Verifies S3 bucket exists before upload
- Confirms CloudFront distribution exists
- Reports upload failures with file details
- Exits with non-zero status on failure

### 4. Deploy All Themes Script (deploy-all-themes.sh)

**Purpose**: Deploys all theme builds to their test environments

**Inputs**:
- config.json (configuration file)

**Outputs**:
- All themes deployed to S3
- All CloudFront caches invalidated
- Summary of all deployments with URLs

**Functions**:
- `load_config()`: Parses config.json
- `get_all_themes()`: Extracts theme names from config
- `deploy_theme(theme_name)`: Calls deploy-theme.sh for single theme
- `collect_results()`: Aggregates success/failure status for all themes
- `print_summary()`: Displays deployment results and all URLs

**Error Handling**:
- Continues deploying remaining themes if one fails
- Collects all errors and reports at end
- Exits with non-zero status if any deployment failed
- Provides list of failed themes for retry

### 5. Cleanup Script (cleanup-test-environments.sh)

**Purpose**: Removes all test infrastructure

**Inputs**:
- config.json (configuration file)

**Outputs**:
- All test S3 buckets deleted
- All test CloudFront distributions deleted
- Confirmation message

**Functions**:
- `load_config()`: Parses config.json
- `list_test_buckets()`: Finds all S3 buckets matching naming pattern
- `empty_bucket(bucket_name)`: Deletes all objects in bucket
- `delete_bucket(bucket_name)`: Removes empty bucket
- `list_test_distributions()`: Finds all CloudFront distributions matching naming pattern
- `disable_distribution(distribution_id)`: Disables CloudFront distribution
- `wait_for_distribution_disabled(distribution_id)`: Polls until distribution is disabled
- `delete_distribution(distribution_id)`: Removes disabled distribution
- `validate_production_resources()`: Confirms production resources are NOT in deletion list

**Error Handling**:
- Double-checks production resources are not targeted
- Reports resources that failed to delete
- Provides manual cleanup instructions for stuck resources
- Exits with non-zero status if cleanup incomplete

## Data Models

### Configuration Schema

```typescript
interface Config {
  aws: {
    profile: string;      // AWS CLI profile name
    region: string;       // AWS region (us-east-1)
  };
  naming: {
    prefix: string;       // Prefix for test resource names (zv-test)
    production_bucket: string;     // Production S3 bucket (DO NOT TOUCH)
    production_cloudfront: string; // Production CloudFront ID (DO NOT TOUCH)
  };
  themes: Array<{
    name: string;         // Theme identifier (kebab-case)
    buildDir: string;     // Path to theme build directory
  }>;
  cloudfront: {
    priceClass: string;   // CloudFront price class (PriceClass_100 for testing)
    defaultRootObject: string;  // Default file (index.html)
    errorPages: Array<{
      errorCode: number;
      responseCode: number;
      responsePage: string;
    }>;
  };
}
```

### Resource Naming Convention

```
S3 Buckets:
  Pattern: {prefix}-{theme-name}
  Examples:
    - zv-test-engagement-centric
    - zv-test-informational-hub
    - zv-test-multimedia-experience
    - zv-test-community-driven
    - zv-test-accessible-responsive

CloudFront Distributions:
  Origin: Corresponding S3 bucket
  Comment: "Test environment for {theme-name} theme"
  Tags:
    - Environment: test
    - Theme: {theme-name}
    - ManagedBy: deployment-scripts
```

### Deployment State

```typescript
interface DeploymentResult {
  theme: string;
  success: boolean;
  bucketName: string;
  distributionId: string;
  cloudfrontUrl: string;
  error?: string;
  timestamp: string;
}

interface CleanupResult {
  bucketsDeleted: string[];
  distributionsDeleted: string[];
  failures: Array<{
    resource: string;
    error: string;
  }>;
}
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Static Website Hosting Configuration

*For any* S3 bucket created by the setup script, the bucket SHALL have static website hosting enabled with index.html as the index document.

**Validates: Requirements 1.2**

### Property 2: CloudFront Origin Mapping

*For any* CloudFront distribution created by the setup script, the distribution's origin SHALL point to the S3 bucket with the matching theme name.

**Validates: Requirements 1.4**

### Property 3: Resource Naming Convention

*For any* test resource (S3 bucket or CloudFront distribution) created by the system, the resource name SHALL follow the pattern {prefix}-{theme-name} where prefix is from config and theme-name is a valid theme identifier.

**Validates: Requirements 1.5, 2.5**

### Property 4: Regional Consistency

*For any* AWS resource created by the system, the resource SHALL be located in the us-east-1 region.

**Validates: Requirements 1.6, 6.2**

### Property 5: Production Resource Isolation

*For any* script operation (setup, deploy, cleanup), the production S3 bucket (resistance-radio-website-dev-734110488556) and production CloudFront distribution (EYKP4STY3RIHX) SHALL remain unmodified in both content and configuration.

**Validates: Requirements 2.1, 2.2, 5.6**

### Property 6: Production Resource Validation

*For any* resource name being targeted for modification or deletion, if the name matches a production resource identifier, the system SHALL reject the operation and exit with an error.

**Validates: Requirements 2.4**

### Property 7: Theme to Build Directory Mapping

*For any* valid theme name in the configuration, the system SHALL correctly map the theme name to its corresponding build directory path (frontend/dist-{theme-name}/).

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 8: Build Directory Validation

*For any* build directory that does not exist or does not contain an index.html file, the deployment script SHALL report an error and exit with non-zero status.

**Validates: Requirements 7.6**

### Property 9: Complete File Upload

*For any* file in the source build directory, after deployment completes, that file SHALL exist in the target S3 bucket with the same relative path.

**Validates: Requirements 3.3, 9.1**

### Property 10: Directory Structure Preservation

*For any* file uploaded to S3, the S3 object key SHALL preserve the directory structure from the source build directory.

**Validates: Requirements 3.4**

### Property 11: Content-Type Header Assignment

*For any* file uploaded to S3, the file SHALL have a content-type header that matches its file extension (text/html for .html, text/css for .css, application/javascript for .js, image/* for images).

**Validates: Requirements 3.5**

### Property 12: CloudFront Cache Invalidation

*For any* successful deployment, a CloudFront cache invalidation SHALL be created for the path /* on the corresponding distribution.

**Validates: Requirements 3.6**

### Property 13: Deployment Error Handling

*For any* deployment failure (missing directory, upload error, invalidation failure), the deployment script SHALL exit with a non-zero status code and output a descriptive error message.

**Validates: Requirements 3.8**

### Property 14: Batch Deployment Resilience

*For any* theme deployment failure during batch deployment, the batch script SHALL continue deploying remaining themes and report all failures at completion.

**Validates: Requirements 4.4**

### Property 15: Test Bucket Identification

*For any* S3 bucket in the AWS account, the cleanup script SHALL correctly classify it as a test bucket (matching naming pattern) or non-test bucket (not matching pattern), and SHALL only target test buckets for deletion.

**Validates: Requirements 5.1**

### Property 16: Bucket Emptying Before Deletion

*For any* S3 bucket targeted for deletion, the cleanup script SHALL delete all objects in the bucket before attempting to delete the bucket itself.

**Validates: Requirements 5.2**

### Property 17: Test Distribution Identification

*For any* CloudFront distribution in the AWS account, the cleanup script SHALL correctly classify it as a test distribution (matching naming pattern or tags) or non-test distribution, and SHALL only target test distributions for deletion.

**Validates: Requirements 5.4**

### Property 18: Cleanup Error Reporting

*For any* resource that fails to delete during cleanup, the cleanup script SHALL report the resource identifier and error message, and SHALL provide manual cleanup instructions.

**Validates: Requirements 5.8**

### Property 19: Account Consistency

*For any* AWS resource created by the system, the resource SHALL be created in the same AWS account (using the configured profile).

**Validates: Requirements 6.1**

### Property 20: CloudFront Price Class Configuration

*For any* test CloudFront distribution created by the system, the distribution SHALL use PriceClass_100 (minimum price class).

**Validates: Requirements 6.3**

### Property 21: S3 Storage Class Configuration

*For any* test S3 bucket created by the system, the bucket SHALL use the Standard storage class.

**Validates: Requirements 6.4**

### Property 22: Bucket Policy for CloudFront Access

*For any* test S3 bucket created by the system, the bucket SHALL have a bucket policy that allows CloudFront to read objects.

**Validates: Requirements 8.2**

### Property 23: CloudFront Cache Behavior Configuration

*For any* test CloudFront distribution created by the system, the distribution SHALL have cache behaviors configured for default root object (index.html) and error page redirects (404→200, 403→200).

**Validates: Requirements 8.4**

### Property 24: Setup Script Idempotency

*For any* resource that already exists, running the setup script again SHALL skip creation of that resource and report it as existing, without causing errors.

**Validates: Requirements 8.7**

### Property 25: Deployment Validation

*For any* completed deployment, the deployment script SHALL verify that index.html exists in the S3 bucket and that the CloudFront invalidation completed successfully.

**Validates: Requirements 9.2, 9.3**

### Property 26: Validation Error Reporting

*For any* validation failure (missing files, failed invalidation), the deployment script SHALL report specific validation errors with actionable information.

**Validates: Requirements 9.5**

### Property 27: Configuration Schema Validation

*For any* configuration file, the system SHALL validate that required fields (aws.profile, aws.region, naming.prefix, themes array) are present and correctly formatted before executing operations.

**Validates: Requirements 10.2, 10.3, 10.4, 10.5**

### Property 28: Configuration Error Handling

*For any* invalid or missing configuration, the system SHALL report specific configuration errors and exit with non-zero status before attempting any AWS operations.

**Validates: Requirements 10.7**

## Error Handling

### Error Categories

1. **Configuration Errors**
   - Missing config.json file
   - Invalid JSON syntax in config
   - Missing required configuration fields
   - Invalid AWS profile or region
   - **Handling**: Validate configuration before any AWS operations, exit immediately with descriptive error

2. **AWS Credential Errors**
   - AWS profile not configured
   - Invalid or expired credentials
   - Insufficient permissions
   - **Handling**: Validate credentials at script startup, provide instructions for AWS CLI configuration

3. **Resource Creation Errors**
   - S3 bucket name already taken globally
   - CloudFront distribution creation failure
   - Resource quota limits exceeded
   - **Handling**: Report specific resource and error, provide manual creation instructions if needed

4. **Deployment Errors**
   - Build directory not found
   - Missing index.html in build
   - S3 upload failures
   - CloudFront invalidation failures
   - **Handling**: Report specific failure point, preserve partial state, allow retry

5. **Cleanup Errors**
   - S3 bucket not empty (deletion fails)
   - CloudFront distribution still enabled
   - Resource dependencies preventing deletion
   - **Handling**: Report stuck resources, provide manual cleanup commands

### Error Handling Principles

1. **Fail Fast**: Validate inputs and configuration before making AWS API calls
2. **Descriptive Messages**: Every error includes what failed, why it failed, and how to fix it
3. **Non-Zero Exit Codes**: All failures exit with status code 1 for script chaining
4. **Partial State Recovery**: Scripts should be re-runnable after failures
5. **Production Safety**: Double-check production resources are never targeted, even in error paths

### Error Message Format

```
ERROR: [Component] - [What Failed]
Details: [Specific error information]
Action: [What the user should do to fix it]
```

Example:
```
ERROR: Deployment - Build directory not found
Details: Directory 'frontend/dist-engagement-centric' does not exist
Action: Run 'npm run build:engagement-centric' to create the build
```

## Testing Strategy

### Dual Testing Approach

The system requires both unit tests and property-based tests for comprehensive validation:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs using fast-check library
- Both approaches are complementary and necessary for complete coverage

### Unit Testing Focus

Unit tests should focus on:
- Specific configuration examples (valid and invalid)
- Specific theme deployment scenarios
- Edge cases (empty directories, missing files, network failures)
- Error message formatting and content
- Script exit codes for various failure modes
- Integration between scripts and AWS CLI commands

Avoid writing too many unit tests for scenarios that property tests can cover with randomization.

### Property-Based Testing Configuration

- **Library**: fast-check (TypeScript/JavaScript property-based testing)
- **Minimum iterations**: 100 per property test
- **Tag format**: `// Feature: multi-environment-deployment, Property {N}: {property text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

### Property Testing Focus

Property tests should focus on:
- Resource naming conventions across all themes
- Configuration validation across all possible invalid configs
- File upload completeness across all file types
- Content-type header assignment across all file extensions
- Production resource isolation across all operations
- Cleanup identification logic across all resource names

### Test Organization

```
aws/deployment/
├── tests/
│   ├── unit/
│   │   ├── config-validation.test.ts
│   │   ├── resource-naming.test.ts
│   │   ├── deployment-validation.test.ts
│   │   └── error-handling.test.ts
│   └── property/
│       ├── naming-convention.property.test.ts
│       ├── file-upload.property.test.ts
│       ├── production-safety.property.test.ts
│       └── cleanup-identification.property.test.ts
```

### Testing AWS Operations

Since these scripts interact with AWS, testing strategies include:

1. **Mocking AWS CLI**: Use mock AWS CLI responses for unit tests
2. **LocalStack**: Use LocalStack for integration testing with real AWS API calls
3. **Dry-Run Mode**: Implement --dry-run flag in scripts for testing without creating resources
4. **Test Account**: Use separate AWS account for integration testing if available

### Example Property Test

```typescript
// Feature: multi-environment-deployment, Property 3: Resource Naming Convention
import * as fc from 'fast-check';

describe('Resource Naming Convention', () => {
  it('should generate valid resource names for all themes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('engagement-centric', 'informational-hub', 
                       'multimedia-experience', 'community-driven', 
                       'accessible-responsive'),
        (themeName) => {
          const resourceName = generateResourceName('zv-test', themeName);
          
          // Property: name follows pattern {prefix}-{theme-name}
          expect(resourceName).toMatch(/^zv-test-[a-z-]+$/);
          expect(resourceName).toContain(themeName);
          
          // Property: name does not match production resources
          expect(resourceName).not.toBe('resistance-radio-website-dev-734110488556');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Cost Estimation for Testing

Running test environments incurs AWS costs:

- **S3 Storage**: ~$0.023 per GB per month (Standard class)
- **S3 Requests**: ~$0.005 per 1,000 PUT requests, ~$0.0004 per 1,000 GET requests
- **CloudFront**: ~$0.085 per GB for first 10 TB (PriceClass_100)
- **CloudFront Requests**: ~$0.0075 per 10,000 HTTP requests

**Estimated costs for 5 test environments running for 1 week**:
- Storage (5 builds × 50MB × 1 week): ~$0.01
- Deployment uploads (5 × 1,000 files): ~$0.03
- CloudFront data transfer (minimal testing): ~$0.10
- CloudFront requests (1,000 page views): ~$0.01
- **Total**: ~$0.15 per week

**Cost optimization tips**:
- Delete test environments immediately after comparison
- Use PriceClass_100 (cheapest) for testing
- Minimize file sizes in test builds
- Run cleanup script promptly

