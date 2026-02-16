# Implementation Plan: Admin Content Management System

## Overview

This implementation plan breaks down the admin content management system into incremental, testable steps. The approach follows a layered pattern: database schema → backend services → API routes → frontend components. Each major component includes property-based tests to validate correctness properties from the design document.

The implementation prioritizes core CRUD operations first, then adds file upload capabilities, followed by advanced features like search, filtering, and bulk operations.

## Tasks

- [x] 1. Database schema and migrations
  - Create migration files for new tables (articles, events, resources)
  - Add missing columns to existing episodes table
  - Create indexes for performance optimization
  - Run migrations and verify schema
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 2. File upload service implementation
  - [x] 2.1 Create upload service with S3 integration
    - Implement file validation (type, size)
    - Implement S3 upload with error handling and retry logic
    - Implement file deletion from S3
    - _Requirements: 6.1, 6.5, 10.3_

  - [ ]* 2.2 Write property tests for file upload service
    - **Property 9: File Type Validation**
    - **Property 10: File Upload Persistence**
    - **Validates: Requirements 3.2, 5.2, 6.1, 6.5, 10.3**

  - [x] 2.3 Implement thumbnail generation
    - Add image processing library (sharp)
    - Implement thumbnail generation with aspect ratio preservation
    - Implement fallback for generation failures
    - _Requirements: 6.4, 11.2, 11.3, 11.5_

  - [ ]* 2.4 Write property tests for thumbnail generation
    - **Property 11: Thumbnail Generation and Storage**
    - **Property 13: Thumbnail Generation Fallback**
    - **Validates: Requirements 4.2, 6.4, 11.2, 11.3, 11.4, 11.5**

- [x] 3. Backend API routes for articles
  - [x] 3.1 Implement article CRUD routes
    - POST /api/admin/articles (create)
    - GET /api/admin/articles (list with pagination)
    - GET /api/admin/articles/:id (get single)
    - PUT /api/admin/articles/:id (update)
    - DELETE /api/admin/articles/:id (delete)
    - Add authentication and authorization middleware
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 10.1, 10.2, 10.5_

  - [ ]* 3.2 Write property tests for article CRUD
    - **Property 1: Content Creation Persistence**
    - **Property 2: Content Update Preserves Creation Metadata**
    - **Property 3: Content Deletion with File Cleanup**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 3.3 Implement article search and filtering
    - Add search by keyword endpoint
    - Add filter by publication status
    - Add sorting capabilities
    - _Requirements: 1.7, 1.8, 8.2, 8.3, 8.4_

  - [ ]* 3.4 Write property tests for article search and filtering
    - **Property 5: Keyword Search Completeness**
    - **Property 6: Status Filter Correctness**
    - **Property 8: Sorting Consistency**
    - **Validates: Requirements 1.7, 1.8, 8.2, 8.3, 8.4**

  - [x] 3.5 Implement article publication status management
    - Add publish/unpublish endpoints
    - Add bulk publish/unpublish
    - _Requirements: 1.4, 1.5, 8.5, 8.6_

  - [ ]* 3.6 Write property tests for publication status
    - **Property 4: Publication Status Transitions**
    - **Property 22: Bulk Action Atomicity**
    - **Validates: Requirements 1.4, 1.5, 8.5, 8.6**

- [x] 4. Backend API routes for events
  - [x] 4.1 Implement event CRUD routes
    - POST /api/admin/events (create)
    - GET /api/admin/events (list with pagination)
    - GET /api/admin/events/:id (get single)
    - PUT /api/admin/events/:id (update)
    - DELETE /api/admin/events/:id (delete)
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 4.2 Write property tests for event CRUD
    - **Property 1: Content Creation Persistence**
    - **Property 2: Content Update Preserves Creation Metadata**
    - **Property 8: Sorting Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.5**

  - [x] 4.3 Implement event date filtering
    - Add filter by date range endpoint
    - Add past/upcoming event classification
    - _Requirements: 2.6, 2.7_

  - [ ]* 4.4 Write property tests for event filtering
    - **Property 7: Date Range Filter Correctness**
    - **Validates: Requirements 2.6**

- [x] 5. Backend API routes for resources
  - [x] 5.1 Implement resource CRUD routes
    - POST /api/admin/resources (create with file upload)
    - GET /api/admin/resources (list with pagination)
    - GET /api/admin/resources/:id (get single)
    - PUT /api/admin/resources/:id (update with optional file replacement)
    - DELETE /api/admin/resources/:id (delete with file cleanup)
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

  - [ ]* 5.2 Write property tests for resource management
    - **Property 1: Content Creation Persistence**
    - **Property 3: Content Deletion with File Cleanup**
    - **Property 20: List Completeness**
    - **Validates: Requirements 3.1, 3.4, 3.6**

- [-] 6. Backend API routes for episodes
  - [x] 6.1 Implement episode CRUD routes
    - POST /api/admin/episodes (create with audio upload)
    - GET /api/admin/episodes (list with pagination, filter by show)
    - GET /api/admin/episodes/:id (get single)
    - PUT /api/admin/episodes/:id (update with optional audio replacement)
    - DELETE /api/admin/episodes/:id (delete with audio cleanup)
    - _Requirements: 5.1, 5.5, 5.6, 5.7_

  - [ ]* 6.2 Write property tests for episode management
    - **Property 1: Content Creation Persistence**
    - **Property 3: Content Deletion with File Cleanup**
    - **Property 8: Sorting Consistency**
    - **Validates: Requirements 5.1, 5.5, 5.7**

- [x] 7. Backend API routes for shows enhancement
  - [x] 7.1 Enhance show routes with image upload
    - Update POST /api/admin/shows to handle cover image upload
    - Update PUT /api/admin/shows to handle image replacement
    - Add referential integrity check for deletion
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 7.2 Write property tests for show management
    - **Property 19: Referential Integrity Protection**
    - **Property 20: List Completeness**
    - **Validates: Requirements 4.4, 4.5**

- [x] 8. Checkpoint - Backend API complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. HTML sanitization and validation
  - [ ] 9.1 Implement HTML sanitization middleware
    - Add sanitize-html library
    - Create middleware to sanitize HTML content fields
    - Configure allowed tags and attributes
    - _Requirements: 7.4, 10.4_

  - [ ]* 9.2 Write property tests for HTML sanitization
    - **Property 14: HTML Sanitization**
    - **Property 15: HTML Content Persistence**
    - **Validates: Requirements 7.4, 7.6, 10.4**

  - [ ] 9.3 Implement content validation middleware
    - Create validation rules for each content type
    - Implement validation middleware
    - Add error formatting for validation failures
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 9.4 Write property tests for validation
    - **Property 18: Required Field Validation**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

- [ ] 10. Security and authentication tests
  - [ ]* 10.1 Write property tests for authentication
    - **Property 16: Authentication Enforcement**
    - **Property 17: Authorization Enforcement**
    - **Validates: Requirements 10.1, 10.2, 10.5, 10.6**

- [x] 11. Frontend shared components
  - [x] 11.1 Create FileUploader component
    - Implement file selection and validation
    - Implement upload progress indicator
    - Implement error handling and retry
    - Support multiple file uploads
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

  - [x] 11.2 Create RichTextEditor component
    - Integrate TinyMCE or similar WYSIWYG editor
    - Configure toolbar options
    - Implement image upload integration
    - Implement preview functionality
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 11.3 Create ContentTable component
    - Implement sortable columns
    - Implement pagination controls
    - Implement row selection for bulk actions
    - Implement search input
    - Implement filter dropdowns
    - _Requirements: 8.1, 8.4, 8.5_

  - [x] 11.4 Create ContentModal component
    - Implement reusable modal for create/edit
    - Implement form validation display
    - Implement loading states
    - Implement error display
    - _Requirements: 12.6_

- [x] 12. Frontend admin pages for articles
  - [x] 12.1 Create AdminArticlesPage
    - Implement article list view with ContentTable
    - Implement create article modal
    - Implement edit article modal
    - Implement delete confirmation
    - Integrate RichTextEditor for content
    - Integrate FileUploader for images
    - Implement publish/unpublish actions
    - Implement bulk actions
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 12.2 Write unit tests for AdminArticlesPage
    - Test article creation flow
    - Test article editing flow
    - Test delete confirmation
    - Test bulk actions
    - _Requirements: 1.1, 1.2, 1.3, 8.5, 8.6_

- [x] 13. Frontend admin pages for events
  - [x] 13.1 Create AdminEventsPage
    - Implement event list view with ContentTable
    - Implement create event modal with date/time picker
    - Implement edit event modal
    - Implement delete confirmation
    - Integrate RichTextEditor for description
    - Integrate FileUploader for images
    - Implement date range filter
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 13.2 Write unit tests for AdminEventsPage
    - Test event creation with date picker
    - Test event editing
    - Test date range filtering
    - _Requirements: 2.1, 2.2, 2.6_

- [x] 14. Frontend admin pages for resources
  - [x] 14.1 Create AdminResourcesPage
    - Implement resource list view with ContentTable
    - Implement create resource modal
    - Implement edit resource modal
    - Implement delete confirmation
    - Integrate FileUploader for documents
    - Display file type icons and sizes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 14.2 Write unit tests for AdminResourcesPage
    - Test resource creation with file upload
    - Test file validation errors
    - Test resource editing with file replacement
    - _Requirements: 3.1, 3.2, 3.5_

- [x] 15. Frontend admin pages for episodes
  - [x] 15.1 Create AdminEpisodesPage
    - Implement episode list view with ContentTable
    - Implement show filter dropdown
    - Implement create episode modal
    - Implement edit episode modal
    - Implement delete confirmation
    - Integrate FileUploader for audio
    - Display audio duration
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 15.2 Write unit tests for AdminEpisodesPage
    - Test episode creation with audio upload
    - Test audio file validation
    - Test episode filtering by show
    - _Requirements: 5.1, 5.2, 5.7_

- [x] 16. Frontend admin pages for shows enhancement
  - [x] 16.1 Enhance AdminShowsPage
    - Add cover image upload to create/edit modals
    - Integrate FileUploader for images
    - Add episode count display in list
    - Add delete protection message for shows with episodes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 16.2 Write unit tests for AdminShowsPage
    - Test show creation with cover image
    - Test delete protection for shows with episodes
    - _Requirements: 4.2, 4.4_

- [ ] 17. Checkpoint - Admin pages complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Frontend public pages for content display
  - [ ] 18.1 Update ArticlesPage for public display
    - Display only published articles
    - Show article images and excerpts
    - Implement article detail view with formatted content
    - Add responsive mobile layout
    - _Requirements: 9.1, 9.2_

  - [ ] 18.2 Update EventsPage for public display
    - Display only upcoming events
    - Show event images and dates
    - Add calendar view option
    - Add responsive mobile layout
    - _Requirements: 9.3_

  - [ ] 18.3 Create ResourcesPage for public display
    - Display all resources with download buttons
    - Show file type icons and sizes
    - Implement download functionality
    - Add responsive mobile layout
    - _Requirements: 9.4, 9.5_

  - [ ] 18.4 Update ShowDetailPage for episode display
    - Display all episodes for the show
    - Integrate audio player for each episode
    - Show episode metadata (duration, date)
    - Add responsive mobile layout
    - _Requirements: 9.6, 9.7_

  - [ ]* 18.5 Write property tests for public content display
    - **Property 23: Published Content Visibility**
    - **Property 24: Resource Download Accessibility**
    - **Property 25: Episode Audio Accessibility**
    - **Validates: Requirements 9.1, 9.3, 9.4, 9.5, 9.6, 9.7**

- [-] 19. Integration and routing
  - [x] 19.1 Add admin routes to App.tsx
    - Add routes for all new admin pages
    - Wrap routes in ProtectedRoute and AdminLayout
    - Update admin navigation menu
    - _Requirements: 10.1, 10.2_

  - [ ] 19.2 Add public routes to App.tsx
    - Add route for ResourcesPage
    - Update existing routes for enhanced pages
    - _Requirements: 9.1, 9.3, 9.4, 9.6_

  - [x] 19.3 Update API client service
    - Add API methods for all new endpoints
    - Implement error handling
    - Add request/response type definitions
    - _Requirements: All_

- [ ] 20. Final checkpoint and testing
  - [ ] 20.1 Run full test suite
    - Run all unit tests
    - Run all property-based tests
    - Verify test coverage > 80%
    - _Requirements: All_

  - [ ] 20.2 Manual testing checklist
    - Test article creation, editing, deletion
    - Test event creation with date picker
    - Test resource upload and download
    - Test episode audio upload and playback
    - Test show cover image upload
    - Test search and filtering
    - Test bulk actions
    - Test authentication and authorization
    - Test mobile responsive layouts
    - _Requirements: All_

  - [ ] 20.3 Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: database → services → API → UI
- File upload functionality is implemented early to support all content types
- Shared components are built before page-specific implementations to maximize reuse
