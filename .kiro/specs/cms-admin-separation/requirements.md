# Requirements Document

## Introduction

This document specifies the requirements for separating the CMS admin portal from the main public-facing Zimbabwe Voice application. The current architecture combines both public and admin functionality in a single React application, which has led to deployment conflicts where admin changes impact the public site. This separation will create two independent frontend applications sharing a common backend API, enabling isolated deployments and improved security.

## Glossary

- **Public_App**: The main public-facing React application serving Zimbabwe Voice content to end users
- **Admin_App**: The standalone CMS admin portal React application for content management
- **Backend_API**: The shared Express.js Lambda backend serving both applications
- **Public_Distribution**: The CloudFront distribution serving the Public_App
- **Admin_Distribution**: The CloudFront distribution serving the Admin_App
- **Public_Pipeline**: The CI/CD pipeline deploying the Public_App
- **Admin_Pipeline**: The CI/CD pipeline deploying the Admin_App
- **Admin_Routes**: Backend API routes under /admin/* requiring authentication
- **Public_Routes**: Backend API routes under /api/* accessible to all users
- **Deployment_Isolation**: The property that changes to one application do not affect the other

## Requirements

### Requirement 1: Separate Frontend Applications

**User Story:** As a platform administrator, I want the admin CMS to be a separate application from the public site, so that admin changes don't cause downtime for public users.

#### Acceptance Criteria

1. THE System SHALL create a new admin-frontend/ directory containing a standalone React application
2. THE Admin_App SHALL include all existing admin pages (articles, events, resources, shows, episodes, submissions, dashboard, login)
3. THE Public_App SHALL remove all admin-related pages and routes from frontend/
4. THE Admin_App SHALL use the same technology stack as the Public_App (React 18, TypeScript, Vite)
5. WHEN the Admin_App is built, THE build output SHALL be independent of the Public_App build output
6. THE Admin_App SHALL maintain all existing admin functionality without feature loss

### Requirement 2: Independent Deployment Pipelines

**User Story:** As a DevOps engineer, I want separate CI/CD pipelines for public and admin apps, so that I can deploy them independently without conflicts.

#### Acceptance Criteria

1. THE System SHALL create a separate Admin_Pipeline for deploying the Admin_App
2. THE Public_Pipeline SHALL deploy only the Public_App without triggering Admin_App deployment
3. THE Admin_Pipeline SHALL deploy only the Admin_App without triggering Public_App deployment
4. WHEN the Admin_App is deployed, THE Public_App SHALL remain unaffected and continue serving traffic
5. WHEN the Public_App is deployed, THE Admin_App SHALL remain unaffected and continue serving traffic
6. THE Admin_Pipeline SHALL use the same deployment process as the Public_Pipeline (S3 upload, CloudFront invalidation)

### Requirement 3: Separate CloudFront Distributions

**User Story:** As a platform administrator, I want separate CloudFront distributions for public and admin apps, so that they can be managed and scaled independently.

#### Acceptance Criteria

1. THE System SHALL create a new Admin_Distribution for serving the Admin_App
2. THE Public_Distribution SHALL serve only the Public_App
3. THE Admin_Distribution SHALL serve only the Admin_App
4. THE Admin_Distribution SHALL be accessible at admin.resistanceradiostation.org subdomain
5. THE Public_Distribution SHALL remain accessible at resistanceradiostation.org domain
6. THE Admin_Distribution SHALL use the same security headers and caching policies as the Public_Distribution

### Requirement 4: Shared Backend API

**User Story:** As a developer, I want both apps to use the same backend API, so that we maintain a single source of truth for data and business logic.

#### Acceptance Criteria

1. THE Backend_API SHALL serve both the Public_App and Admin_App without modification
2. THE Admin_App SHALL make API requests to the same Backend_API endpoints as before separation
3. THE Public_App SHALL make API requests to the same Backend_API endpoints as before separation
4. THE Backend_API SHALL accept requests from both the Public_Distribution and Admin_Distribution origins
5. WHEN the Backend_API receives a request, THE Backend_API SHALL validate the origin against both allowed domains
6. THE Backend_API SHALL maintain all existing authentication and authorization logic for Admin_Routes

### Requirement 5: Authentication and Authorization Preservation

**User Story:** As an admin user, I want to log in to the admin portal with my existing credentials, so that the separation doesn't disrupt my workflow.

#### Acceptance Criteria

1. THE Admin_App SHALL use the existing JWT authentication mechanism
2. WHEN an admin user logs in, THE Admin_App SHALL store the JWT token in the same manner as before
3. THE Admin_App SHALL include the JWT token in all requests to Admin_Routes
4. THE Backend_API SHALL validate JWT tokens from the Admin_App using the existing validation logic
5. WHEN an unauthenticated user attempts to access the Admin_App, THE Admin_App SHALL redirect to the login page
6. THE Admin_App SHALL maintain the existing role-based access control for admin users

### Requirement 6: Domain and Subdomain Configuration

**User Story:** As a platform administrator, I want the admin portal accessible at a separate subdomain, so that users can clearly distinguish between public and admin interfaces.

#### Acceptance Criteria

1. THE Admin_App SHALL be accessible at admin.resistanceradiostation.org
2. THE Public_App SHALL remain accessible at resistanceradiostation.org
3. THE System SHALL configure DNS records for the admin subdomain
4. THE Admin_Distribution SHALL use a valid SSL/TLS certificate for the admin subdomain
5. WHEN a user navigates to admin.resistanceradiostation.org, THE Admin_Distribution SHALL serve the Admin_App
6. THE Admin_App SHALL not be accessible through the Public_Distribution

### Requirement 7: Code Organization and Shared Dependencies

**User Story:** As a developer, I want shared components and utilities to be reusable across both apps, so that we maintain consistency and reduce duplication.

#### Acceptance Criteria

1. THE System SHALL create a shared/ directory for common components, utilities, and types
2. THE Admin_App SHALL import shared authentication utilities from the shared directory
3. THE Public_App SHALL import shared authentication utilities from the shared directory
4. THE Admin_App SHALL import shared API client configuration from the shared directory
5. THE Public_App SHALL import shared API client configuration from the shared directory
6. WHEN a shared component is updated, THE change SHALL be available to both applications

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want separate environment configurations for each app, so that I can configure them independently for different deployment environments.

#### Acceptance Criteria

1. THE Admin_App SHALL have its own .env file with VITE_API_URL configuration
2. THE Public_App SHALL maintain its existing .env file with VITE_API_URL configuration
3. THE Admin_App SHALL configure VITE_API_URL to point to the Backend_API
4. THE Public_App SHALL configure VITE_API_URL to point to the Backend_API
5. WHEN deploying to production, THE Admin_App SHALL use production environment variables
6. WHEN deploying to production, THE Public_App SHALL use production environment variables

### Requirement 9: Build and Bundle Optimization

**User Story:** As a developer, I want the admin bundle to be smaller and faster to deploy, so that admin deployments are quick and efficient.

#### Acceptance Criteria

1. WHEN the Admin_App is built, THE bundle size SHALL be smaller than the current combined application bundle
2. THE Admin_App SHALL not include public-facing page components in its bundle
3. THE Public_App SHALL not include admin page components in its bundle
4. THE Admin_App SHALL use code splitting for admin pages
5. THE Public_App SHALL maintain existing code splitting for public pages
6. WHEN the Admin_App is deployed, THE deployment time SHALL be faster than the current combined deployment

### Requirement 10: Backward Compatibility and Migration

**User Story:** As a platform administrator, I want the migration to be seamless, so that existing admin users experience no disruption during the transition.

#### Acceptance Criteria

1. WHEN the separation is complete, THE Backend_API SHALL continue to function without changes
2. THE Admin_App SHALL maintain all existing admin URLs and routes (e.g., /admin/articles, /admin/events)
3. WHEN an admin user bookmarks an admin page, THE bookmark SHALL continue to work after migration
4. THE Admin_App SHALL maintain the same UI and UX as the existing admin pages
5. WHEN the migration is deployed, THE Public_App SHALL continue serving public users without interruption
6. THE System SHALL provide a redirect from old admin URLs on the public domain to the new admin subdomain

### Requirement 11: Security Isolation

**User Story:** As a security engineer, I want the admin portal isolated from the public site, so that security vulnerabilities in one don't affect the other.

#### Acceptance Criteria

1. THE Admin_Distribution SHALL enforce stricter security headers than the Public_Distribution
2. THE Admin_App SHALL implement Content Security Policy (CSP) appropriate for admin functionality
3. THE Public_App SHALL implement Content Security Policy (CSP) appropriate for public functionality
4. THE Admin_Distribution SHALL restrict access to admin IP ranges WHERE IP-based restrictions are configured
5. WHEN a security vulnerability is found in the Admin_App, THE Public_App SHALL remain unaffected
6. THE Backend_API SHALL validate the origin header to prevent unauthorized cross-origin requests

### Requirement 12: Monitoring and Logging

**User Story:** As a DevOps engineer, I want separate monitoring for public and admin apps, so that I can track their health and performance independently.

#### Acceptance Criteria

1. THE Admin_App SHALL send error logs to Sentry with an admin-specific environment tag
2. THE Public_App SHALL send error logs to Sentry with a public-specific environment tag
3. THE Admin_Distribution SHALL have separate CloudWatch metrics from the Public_Distribution
4. THE Public_Distribution SHALL have separate CloudWatch metrics from the Admin_Distribution
5. WHEN an error occurs in the Admin_App, THE error SHALL be tagged with the admin application identifier
6. THE System SHALL provide separate dashboards for monitoring Admin_App and Public_App health
