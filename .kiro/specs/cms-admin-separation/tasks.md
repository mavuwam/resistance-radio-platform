# Implementation Plan: CMS Admin Separation

## Overview

This implementation plan separates the CMS admin portal from the public-facing Zimbabwe Voice application into two independent React applications sharing a common backend API. The separation enables isolated deployments, improved security, and better scalability by creating distinct frontend applications with separate CI/CD pipelines while maintaining a single backend.

## Tasks

- [x] 1. Set up shared library and workspace configuration
  - Create shared/ directory with package.json for common code
  - Configure npm workspaces in root package.json to include frontend/, admin-frontend/, and shared/
  - Set up TypeScript configuration for shared library with path aliases
  - Create shared directory structure (components/, contexts/, services/, utils/, types/)
  - _Requirements: 7.1, 7.6_

- [x] 2. Create and configure admin frontend application
  - [x] 2.1 Initialize admin-frontend directory structure
    - Create admin-frontend/ directory with src/, public/, and config files
    - Create package.json with React 18, TypeScript, Vite dependencies
    - Create tsconfig.json with strict mode and shared library path aliases
    - Create vite.config.ts configured for port 5174
    - Create .env.example with VITE_API_URL and VITE_SENTRY_DSN
    - _Requirements: 1.1, 1.4, 8.1_
  
  - [ ]* 2.2 Write unit tests for admin app configuration
    - Test that admin app builds successfully
    - Test that shared imports resolve correctly
    - Test that environment variables are loaded
    - _Requirements: 1.5_

- [x] 3. Move shared code to shared library
  - [x] 3.1 Extract AuthContext to shared library
    - Move AuthContext from frontend/src/contexts/ to shared/contexts/
    - Update AuthContext to work with both apps
    - Export useAuth hook from shared library
    - _Requirements: 7.2, 5.1_
  
  - [x] 3.2 Extract API client to shared library
    - Move api.ts from frontend/src/services/ to shared/services/
    - Configure axios interceptors for JWT token handling
    - Create typed API methods for all resources (shows, episodes, articles, events, resources, submissions)
    - _Requirements: 7.4, 4.1, 4.2_
  
  - [x] 3.3 Extract FileUploader component to shared library
    - Move FileUploader from frontend/src/components/ to shared/components/
    - Ensure component works with both admin and public contexts
    - _Requirements: 7.1_
  
  - [x] 3.4 Extract shared types and utilities
    - Create shared/types/ with TypeScript interfaces for all data models
    - Move common utility functions to shared/utils/
    - _Requirements: 7.1_
  
  - [ ]* 3.5 Write property test for shared module resolution
    - **Property 6: Shared Module Resolution**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6**
    - Test that shared modules import correctly in both apps
    - Test that shared components function identically in both apps
    - _Requirements: 7.6_

- [x] 4. Migrate admin pages and components to admin-frontend
  - [x] 4.1 Move admin pages to admin-frontend
    - Copy AdminDashboardPage, AdminShowsPage, AdminEpisodesPage to admin-frontend/src/pages/
    - Copy AdminArticlesPage, AdminEventsPage, AdminResourcesPage to admin-frontend/src/pages/
    - Copy AdminSubmissionsPage, AdminLoginPage to admin-frontend/src/pages/
    - Update all imports to use shared library paths
    - _Requirements: 1.2_
  
  - [x] 4.2 Create admin-specific components
    - Create AdminLayout component with sidebar navigation
    - Create ProtectedRoute component for authentication guards
    - Update imports to use shared AuthContext
    - _Requirements: 1.2, 5.5_
  
  - [x] 4.3 Set up admin routing
    - Create admin-frontend/src/App.tsx with admin-only routes
    - Configure routes for /admin/login, /admin/dashboard, /admin/shows, etc.
    - Wrap protected routes with ProtectedRoute component
    - Create admin-frontend/src/main.tsx entry point with AuthProvider
    - _Requirements: 1.2, 10.2_
  
  - [ ]* 4.4 Write unit tests for admin routing
    - Test that all admin routes render correctly
    - Test that public routes are not accessible
    - Test that unauthenticated users are redirected to login
    - _Requirements: 1.2_
  
  - [ ]* 4.5 Write property test for protected route authorization
    - **Property 4: Protected Route Authorization**
    - **Validates: Requirements 5.5, 5.6**
    - Test that admin routes redirect to login when unauthenticated
    - Test that admin routes render when authenticated with admin role
    - _Requirements: 5.5, 5.6_

- [x] 5. Clean up public frontend application
  - [x] 5.1 Remove admin code from public app
    - Delete all Admin* pages from frontend/src/pages/
    - Delete AdminLayout and ProtectedRoute from frontend/src/components/
    - Remove admin routes from frontend/src/App.tsx
    - _Requirements: 1.3, 9.2_
  
  - [x] 5.2 Update public app imports
    - Update imports to use shared library for AuthContext, API client, FileUploader
    - Update package.json to reference shared workspace
    - _Requirements: 7.3, 7.5_
  
  - [ ]* 5.3 Write unit tests for public routing
    - Test that admin routes are not accessible
    - Test that public routes render correctly
    - _Requirements: 1.3_
  
  - [ ]* 5.4 Write property test for bundle code separation
    - **Property 7: Bundle Code Separation**
    - **Validates: Requirements 9.2, 9.3**
    - Test that admin components don't appear in public bundle
    - Test that public components don't appear in admin bundle
    - _Requirements: 9.2, 9.3_

- [x] 6. Checkpoint - Verify both apps build and run locally
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update backend CORS configuration
  - [x] 7.1 Add admin subdomain to allowed origins
    - Update backend/src/index.ts CORS configuration
    - Add ADMIN_FRONTEND_URL environment variable
    - Include admin.resistanceradiostation.org in allowed origins array
    - Include localhost:5174 for local development
    - _Requirements: 4.4, 4.5_
  
  - [x] 7.2 Update backend environment configuration
    - Add ADMIN_FRONTEND_URL to backend/.env.example
    - Document CORS configuration in backend README
    - _Requirements: 4.4_
  
  - [ ]* 7.3 Write property test for CORS origin validation
    - **Property 2: CORS Origin Validation**
    - **Validates: Requirements 4.4, 4.5, 11.6**
    - Test that requests from valid origins are accepted
    - Test that requests from invalid origins are rejected
    - _Requirements: 4.4, 4.5_
  
  - [ ]* 7.4 Write property test for JWT authentication round-trip
    - **Property 3: JWT Authentication Round-Trip**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - Test that login issues JWT token
    - Test that token is stored in localStorage
    - Test that token is included in API requests
    - Test that backend validates token successfully
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 7.5 Write property test for API compatibility preservation
    - **Property 1: API Compatibility Preservation**
    - **Validates: Requirements 4.1, 4.2, 4.3, 10.1**
    - Test that both apps can make requests to existing endpoints
    - Test that responses are identical for both apps
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 8. Set up AWS infrastructure for admin app
  - [x] 8.1 Create admin S3 bucket
    - Create zimbabwe-voice-admin S3 bucket
    - Configure bucket for static website hosting
    - Set bucket policy for CloudFront access
    - _Requirements: 3.1, 3.3_
  
  - [x] 8.2 Create admin CloudFront distribution
    - Create CloudFront distribution with admin S3 bucket as origin
    - Request ACM certificate for admin.resistanceradiostation.org
    - Configure CloudFront to use ACM certificate
    - Configure security headers (CSP, HSTS, X-Frame-Options)
    - Set cache behaviors (no-cache for index.html, long cache for assets)
    - _Requirements: 3.1, 3.3, 3.6, 11.1, 11.2_
  
  - [x] 8.3 Configure DNS for admin subdomain
    - Add CNAME record for admin.resistanceradiostation.org pointing to CloudFront
    - Verify DNS propagation
    - Test HTTPS access to admin subdomain
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [x] 9. Create CI/CD pipeline for admin app
  - [x] 9.1 Create admin deployment workflow
    - Create .github/workflows/deploy-admin.yml
    - Configure workflow to trigger on changes to admin-frontend/ or shared/
    - Add build step with environment variables
    - Add S3 sync step with cache control headers
    - Add CloudFront invalidation step
    - _Requirements: 2.1, 2.3, 2.6_
  
  - [x] 9.2 Update public deployment workflow
    - Update .github/workflows/deploy-public.yml to trigger only on frontend/ or shared/ changes
    - Ensure public pipeline doesn't deploy admin app
    - _Requirements: 2.2_
  
  - [x] 9.3 Configure GitHub secrets
    - Add ADMIN_DISTRIBUTION_ID secret
    - Add ADMIN_SENTRY_DSN secret
    - Verify all required secrets are configured
    - _Requirements: 2.1_
  
  - [ ]* 9.4 Write integration tests for deployment isolation
    - Test that admin deployment doesn't affect public app
    - Test that public deployment doesn't affect admin app
    - _Requirements: 2.4, 2.5_

- [x] 10. Configure monitoring and error tracking
  - [x] 10.1 Set up Sentry for admin app
    - Initialize Sentry in admin-frontend with admin-specific DSN
    - Configure environment tag as 'admin-production' or 'admin-development'
    - Add application tag to all error events
    - _Requirements: 12.1, 12.5_
  
  - [x] 10.2 Update Sentry for public app
    - Update Sentry configuration to use 'public-production' or 'public-development' environment tag
    - Add application tag to all error events
    - _Requirements: 12.2_
  
  - [x] 10.3 Create CloudWatch dashboards
    - Create separate dashboard for admin app metrics
    - Create separate dashboard for public app metrics
    - Configure alarms for error rates and performance
    - _Requirements: 12.3, 12.4, 12.6_

- [ ] 11. Checkpoint - Test end-to-end functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 12. Write property test for admin CRUD operations preservation
  - **Property 5: Admin CRUD Operations Preservation**
  - **Validates: Requirements 1.6, 10.2, 10.3**
  - Test full CRUD lifecycle for all resource types (shows, episodes, articles, events, resources, submissions)
  - Test that operations work identically to before separation
  - _Requirements: 1.6, 10.2_

- [ ] 13. Perform final integration testing and validation
  - [ ] 13.1 Test admin app in staging
    - Deploy admin app to staging environment
    - Test all admin pages and functionality
    - Test authentication and authorization
    - Test file uploads
    - Verify error tracking works
    - _Requirements: 1.6, 5.6, 10.4_
  
  - [ ] 13.2 Test public app in staging
    - Deploy public app to staging environment
    - Test all public pages and functionality
    - Verify admin routes are not accessible
    - Verify bundle size reduction
    - _Requirements: 1.3, 9.1_
  
  - [ ] 13.3 Validate deployment isolation
    - Deploy admin app and verify public app remains unaffected
    - Deploy public app and verify admin app remains unaffected
    - _Requirements: 2.4, 2.5_

- [ ] 14. Deploy to production
  - [ ] 14.1 Deploy admin app to production
    - Run admin deployment pipeline
    - Verify admin app is accessible at admin.resistanceradiostation.org
    - Test admin login and functionality
    - Monitor error rates in Sentry
    - _Requirements: 6.5, 10.5_
  
  - [ ] 14.2 Deploy public app to production
    - Run public deployment pipeline
    - Verify public app remains accessible at resistanceradiostation.org
    - Verify admin routes are not accessible
    - Monitor error rates in Sentry
    - _Requirements: 10.5_
  
  - [ ] 14.3 Update backend CORS in production
    - Deploy backend with updated CORS configuration
    - Verify both apps can make API requests
    - Monitor API error rates
    - _Requirements: 4.5, 10.1_

- [ ] 15. Final checkpoint - Verify production deployment
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The separation maintains all existing functionality while enabling independent deployments
- Both applications share the same backend API and authentication mechanism
- Bundle sizes will be reduced by approximately 30-50% for each app
