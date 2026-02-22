# Implementation Plan: Admin Backend Integration

## Overview

This implementation plan focuses on integrating the admin portal frontend with the backend API through comprehensive testing and targeted enhancements. The admin portal UI is complete, and backend API routes exist. The integration ensures all CRUD operations, file uploads, authentication flows, and error handling work seamlessly end-to-end.

The implementation follows a test-driven approach: write integration tests first to identify issues, then fix any problems discovered. This ensures robust integration with comprehensive coverage of all 36 correctness properties.

## Tasks

- [-] 1. Enhance API client with integration features
  - [x] 1.1 Add request tracking and debugging support
    - Implement request ID generation using crypto.getRandomValues
    - Add request/response logging for debugging
    - Store request metadata for error tracking
    - _Requirements: 18.1, 18.2, 18.4_

  - [-] 1.2 Enhance error response parsing
    - Parse error responses consistently across all status codes
    - Extract error code, message, field, and details from responses
    - Handle network errors with user-friendly messages
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [-] 1.3 Add retry logic for network errors
    - Implement exponential backoff for retries
    - Limit retries to 3 attempts
    - Display retry button in UI for manual retries
    - _Requirements: 25.1, 25.2, 25.4_

  - [-] 1.4 Add upload progress callback support
    - Implement onUploadProgress callback in axios config
    - Pass progress percentage to FileUploader component
    - Handle upload cancellation
    - _Requirements: 10.7_


- [-] 2. Implement dashboard statistics integration
  - [x] 2.1 Create backend endpoint for dashboard statistics
    - Implement GET /api/admin/dashboard/stats endpoint
    - Query database for counts of all content types
    - Calculate pending submissions count
    - Fetch recently published content (last 7 days)
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ] 2.2 Create dashboard statistics display components
    - Create StatCard component for displaying counts
    - Create RecentActivity component for recent content
    - Add loading states for statistics fetch
    - Add error handling for failed statistics fetch
    - _Requirements: 15.2, 15.3, 15.4_

  - [ ] 2.3 Integrate statistics into AdminDashboardPage
    - Fetch statistics on page load
    - Display statistics in grid layout
    - Add auto-refresh functionality (every 5 minutes)
    - Handle empty states gracefully
    - _Requirements: 15.1, 15.5_

- [ ] 3. Enhance session management
  - [ ] 3.1 Add CSRF token cleanup on session expiry
    - Clear CSRF token from sessionStorage on logout
    - Clear CSRF token on automatic session expiry
    - Clear CSRF token on 401 error
    - _Requirements: 19.4_

  - [ ] 3.2 Add activity tracking for all API requests
    - Update activity timestamp in request interceptor
    - Ensure all API calls reset inactivity timer
    - Test activity tracking with various operations
    - _Requirements: 3.1, 3.5_

  - [ ] 3.3 Add visual feedback for session extension
    - Display success message when session extended
    - Update session expiry warning UI
    - Show remaining time in warning dialog
    - _Requirements: 3.3_

- [ ] 4. Write integration tests for authentication flow
  - [ ] 4.1 Test login with valid credentials
    - Submit valid email and password
    - Verify token stored in localStorage
    - Verify user data stored in localStorage
    - Verify redirect to dashboard
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 4.2 Test login with invalid credentials
    - Submit invalid email and password
    - Verify error message displayed
    - Verify no token stored
    - Verify no redirect occurs
    - _Requirements: 2.4_

  - [ ] 4.3 Test 401 unauthorized handling
    - Make authenticated request with expired token
    - Verify auth data cleared from localStorage
    - Verify auth data cleared from sessionStorage
    - Verify redirect to login page
    - _Requirements: 2.5_

  - [ ] 4.4 Test logout flow
    - Perform logout action
    - Verify localStorage cleared
    - Verify sessionStorage cleared
    - Verify redirect to login page
    - _Requirements: 2.6_

  - [ ]* 4.5 Write property test for authentication token injection
    - **Property 1: Authentication Token Injection**
    - **Validates: Requirements 1.2**

  - [ ]* 4.6 Write property test for CSRF token handling
    - **Property 2: CSRF Token Injection**
    - **Property 27: CSRF Token Storage and Retrieval**
    - **Validates: Requirements 1.3, 19.1, 19.2, 19.3**


- [ ] 5. Write integration tests for shows CRUD operations
  - [ ] 5.1 Test shows list page load
    - Load AdminShowsPage component
    - Verify GET /api/admin/shows called
    - Verify shows displayed in table
    - Verify pagination controls rendered
    - _Requirements: 4.1_

  - [ ] 5.2 Test show creation
    - Open create modal
    - Fill form with valid data
    - Submit form
    - Verify POST /api/admin/shows called with correct data
    - Verify success toast displayed
    - Verify new show appears in list
    - _Requirements: 4.2_

  - [ ] 5.3 Test show update
    - Open edit modal for existing show
    - Modify fields
    - Submit form
    - Verify PUT /api/admin/shows/:id called with modified data
    - Verify success toast displayed
    - Verify changes reflected in list
    - _Requirements: 4.3_

  - [ ] 5.4 Test show deletion
    - Click delete button
    - Confirm deletion in dialog
    - Verify DELETE /api/admin/shows/:id called
    - Verify success toast displayed
    - Verify show removed from list
    - _Requirements: 4.4_

  - [ ] 5.5 Test show with episodes deletion error
    - Attempt to delete show with episodes
    - Verify error code HAS_EPISODES returned
    - Verify error message displayed
    - Verify show not removed from list
    - _Requirements: 4.5_

  - [ ] 5.6 Test duplicate slug error
    - Create show with existing slug
    - Verify error code DUPLICATE_SLUG returned
    - Verify 409 status code
    - Verify error message displayed
    - _Requirements: 4.6_

  - [ ]* 5.7 Write property test for CRUD operations
    - **Property 9: Content CRUD Operations**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [ ] 6. Write integration tests for episodes CRUD operations
  - [ ] 6.1 Test episodes list page load
    - Load AdminEpisodesPage component
    - Verify GET /api/admin/episodes called
    - Verify episodes displayed in table
    - Verify show filter dropdown populated
    - _Requirements: 5.1_

  - [ ] 6.2 Test episode creation with audio upload
    - Open create modal
    - Upload audio file
    - Verify upload progress displayed
    - Fill form with episode data
    - Submit form
    - Verify POST /api/admin/episodes called with audio_url
    - Verify success toast displayed
    - _Requirements: 5.2, 10.1, 10.2, 10.5_

  - [ ] 6.3 Test episode update
    - Open edit modal for existing episode
    - Modify fields
    - Submit form
    - Verify PUT /api/admin/episodes/:id called
    - Verify changes reflected in list
    - _Requirements: 5.3_

  - [ ] 6.4 Test episode deletion
    - Click delete button
    - Confirm deletion
    - Verify DELETE /api/admin/episodes/:id called
    - Verify episode removed from list
    - _Requirements: 5.4_

  - [ ] 6.5 Test invalid show_id error
    - Create episode with non-existent show_id
    - Verify error code SHOW_NOT_FOUND returned
    - Verify 404 status code
    - Verify error message displayed
    - _Requirements: 5.5_

  - [ ]* 6.6 Write property test for file upload type parameter
    - **Property 12: File Upload Type Parameter**
    - **Validates: Requirements 10.2, 10.3, 10.4**


- [ ] 7. Write integration tests for articles CRUD operations
  - [ ] 7.1 Test articles list page load
    - Load AdminArticlesPage component
    - Verify GET /api/admin/articles called
    - Verify articles displayed in table
    - Verify status filter dropdown populated
    - _Requirements: 6.1_

  - [ ] 7.2 Test article creation with image upload
    - Open create modal
    - Upload image file
    - Verify upload progress displayed
    - Fill form with article data
    - Submit form
    - Verify POST /api/admin/articles called with image_url
    - Verify success toast displayed
    - _Requirements: 6.2, 10.1, 10.3, 10.5_

  - [ ] 7.3 Test article update
    - Open edit modal for existing article
    - Modify content and metadata
    - Submit form
    - Verify PUT /api/admin/articles/:id called
    - Verify changes reflected in list
    - _Requirements: 6.3_

  - [ ] 7.4 Test article deletion
    - Click delete button
    - Confirm deletion
    - Verify DELETE /api/admin/articles/:id called
    - Verify article removed from list
    - _Requirements: 6.4_

  - [ ] 7.5 Test article publishing
    - Click publish button on draft article
    - Verify POST /api/admin/articles/:id/publish called
    - Verify status changes to 'published'
    - Verify success toast displayed
    - _Requirements: 6.5_

  - [ ] 7.6 Test article unpublishing
    - Click unpublish button on published article
    - Verify POST /api/admin/articles/:id/unpublish called
    - Verify status changes to 'draft'
    - Verify success toast displayed
    - _Requirements: 6.6_

  - [ ] 7.7 Test bulk publish operation
    - Select multiple draft articles
    - Click bulk publish button
    - Verify POST /api/admin/articles/bulk/publish called with IDs array
    - Verify all selected articles status updated
    - Verify success toast with count
    - _Requirements: 16.1, 16.4_

  - [ ] 7.8 Test bulk unpublish operation
    - Select multiple published articles
    - Click bulk unpublish button
    - Verify POST /api/admin/articles/bulk/unpublish called with IDs array
    - Verify all selected articles status updated
    - _Requirements: 16.2, 16.4_

  - [ ]* 7.9 Write property test for article publishing operations
    - **Property 10: Article Publishing Operations**
    - **Validates: Requirements 6.5, 6.6**

  - [ ]* 7.10 Write property test for bulk operations
    - **Property 23: Bulk Operation Request Format**
    - **Property 24: Bulk Operation Response**
    - **Validates: Requirements 16.1, 16.2, 16.4**

- [ ] 8. Write integration tests for events CRUD operations
  - [ ] 8.1 Test events list page load
    - Load AdminEventsPage component
    - Verify GET /api/admin/events called
    - Verify events displayed in table
    - Verify status filter dropdown populated
    - _Requirements: 7.1_

  - [ ] 8.2 Test event creation with image upload
    - Open create modal
    - Upload event image
    - Fill form with event data including dates
    - Submit form
    - Verify POST /api/admin/events called
    - Verify success toast displayed
    - _Requirements: 7.2, 10.1, 10.3_

  - [ ] 8.3 Test event update
    - Open edit modal for existing event
    - Modify event details
    - Submit form
    - Verify PUT /api/admin/events/:id called
    - Verify changes reflected in list
    - _Requirements: 7.3_

  - [ ] 8.4 Test event deletion
    - Click delete button
    - Confirm deletion
    - Verify DELETE /api/admin/events/:id called
    - Verify event removed from list
    - _Requirements: 7.4_


- [ ] 9. Write integration tests for resources CRUD operations
  - [ ] 9.1 Test resources list page load
    - Load AdminResourcesPage component
    - Verify GET /api/admin/resources called
    - Verify resources displayed in table
    - Verify category filter dropdown populated
    - _Requirements: 8.1_

  - [ ] 9.2 Test resource creation with document upload
    - Open create modal
    - Upload PDF or document file
    - Verify upload progress displayed
    - Fill form with resource data
    - Submit form
    - Verify POST /api/admin/resources called with file_url
    - Verify success toast displayed
    - _Requirements: 8.2, 10.1, 10.4, 10.5_

  - [ ] 9.3 Test resource update
    - Open edit modal for existing resource
    - Modify resource details
    - Submit form
    - Verify PUT /api/admin/resources/:id called
    - Verify changes reflected in list
    - _Requirements: 8.3_

  - [ ] 9.4 Test resource deletion
    - Click delete button
    - Confirm deletion
    - Verify DELETE /api/admin/resources/:id called
    - Verify resource removed from list
    - _Requirements: 8.4_

- [ ] 10. Write integration tests for submissions management
  - [ ] 10.1 Test submissions list page load
    - Load AdminSubmissionsPage component
    - Verify GET /api/admin/submissions called
    - Verify submissions displayed in table
    - Verify status filter dropdown populated
    - _Requirements: 9.1_

  - [ ] 10.2 Test submission approval
    - Click approve button on pending submission
    - Enter optional feedback
    - Verify PUT /api/admin/submissions/:id/approve called
    - Verify status changes to 'approved'
    - Verify success toast displayed
    - _Requirements: 9.2_

  - [ ] 10.3 Test submission rejection
    - Click reject button on pending submission
    - Enter optional feedback
    - Verify PUT /api/admin/submissions/:id/reject called
    - Verify status changes to 'rejected'
    - Verify success toast displayed
    - _Requirements: 9.3_

  - [ ] 10.4 Test submission deletion
    - Click delete button
    - Confirm deletion
    - Verify DELETE /api/admin/submissions/:id called
    - Verify submission removed from list
    - _Requirements: 9.4_

- [ ] 11. Write integration tests for search and filtering
  - [ ] 11.1 Test search functionality
    - Enter search query in search input
    - Verify query parameter sent to backend
    - Verify filtered results displayed
    - Verify case-insensitive search works
    - _Requirements: 11.1, 11.5_

  - [ ] 11.2 Test status filtering
    - Select status from filter dropdown
    - Verify status parameter sent to backend
    - Verify filtered results displayed
    - _Requirements: 11.2_

  - [ ] 11.3 Test category filtering
    - Select category from filter dropdown
    - Verify category parameter sent to backend
    - Verify filtered results displayed
    - _Requirements: 11.3_

  - [ ] 11.4 Test show filtering (episodes page)
    - Select show from filter dropdown
    - Verify show_id parameter sent to backend
    - Verify filtered episodes displayed
    - _Requirements: 11.4_

  - [ ]* 11.5 Write property test for query parameter transmission
    - **Property 15: Query Parameter Transmission**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 13.1**


- [ ] 12. Write integration tests for pagination
  - [ ] 12.1 Test pagination controls display
    - Load content list page
    - Verify pagination controls rendered
    - Verify current page number displayed
    - Verify total pages calculated correctly
    - _Requirements: 12.5_

  - [ ] 12.2 Test next page navigation
    - Click next page button
    - Verify offset incremented by limit
    - Verify new page of results loaded
    - Verify page number updated
    - _Requirements: 12.3_

  - [ ] 12.3 Test previous page navigation
    - Navigate to page 2
    - Click previous page button
    - Verify offset decremented by limit
    - Verify previous page of results loaded
    - Verify page number updated
    - _Requirements: 12.4_

  - [ ] 12.4 Test pagination response structure
    - Make paginated request
    - Verify response contains count, total, limit, offset
    - Verify values are correct
    - _Requirements: 12.2_

  - [ ]* 12.5 Write property test for pagination offset calculation
    - **Property 18: Pagination Offset Calculation**
    - **Validates: Requirements 12.3, 12.4**

  - [ ]* 12.6 Write property test for pagination response structure
    - **Property 17: Pagination Response Structure**
    - **Validates: Requirements 12.2**

- [ ] 13. Write integration tests for sorting
  - [ ] 13.1 Test sort by title ascending
    - Click title column header
    - Verify sort=title and order=ASC sent to backend
    - Verify results sorted correctly
    - _Requirements: 13.1_

  - [ ] 13.2 Test sort by title descending
    - Click title column header twice
    - Verify sort=title and order=DESC sent to backend
    - Verify results sorted correctly
    - _Requirements: 13.1_

  - [ ] 13.3 Test sort by date
    - Click date column header
    - Verify sort=created_at sent to backend
    - Verify results sorted by date
    - _Requirements: 13.1_

  - [ ] 13.4 Test invalid sort field handling
    - Send request with invalid sort field
    - Verify backend uses default sort field
    - Verify no error thrown
    - _Requirements: 13.4_

  - [ ]* 13.5 Write property test for sort parameter validation
    - **Property 20: Sort Parameter Validation**
    - **Validates: Requirements 13.2, 13.3**

- [ ] 14. Write integration tests for error handling
  - [ ] 14.1 Test network error handling
    - Simulate network failure
    - Verify user-friendly error message displayed
    - Verify retry button displayed
    - _Requirements: 14.1, 25.1_

  - [ ] 14.2 Test validation error handling
    - Submit form with invalid data
    - Verify 400 status returned
    - Verify field-specific error messages displayed
    - Verify form fields highlighted
    - _Requirements: 14.2, 22.1, 22.2, 22.3, 22.4_

  - [ ] 14.3 Test 404 not found error handling
    - Request non-existent resource
    - Verify "Resource not found" message displayed
    - _Requirements: 14.3_

  - [ ] 14.4 Test 409 conflict error handling
    - Create show with duplicate slug
    - Verify conflict reason displayed
    - Verify 409 status handled correctly
    - _Requirements: 14.4_

  - [ ] 14.5 Test 500 server error handling
    - Simulate server error
    - Verify "Server error" message displayed
    - Verify retry suggestion shown
    - _Requirements: 14.5, 25.3_

  - [ ] 14.6 Test 429 rate limit error handling
    - Trigger rate limit
    - Verify rate limit message displayed
    - Verify actions temporarily disabled
    - _Requirements: 14.6_

  - [ ]* 14.7 Write property test for HTTP error message display
    - **Property 21: HTTP Error Message Display**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**

  - [ ]* 14.8 Write property test for validation error response
    - **Property 11: Validation Error Response**
    - **Validates: Requirements 4.7, 5.6, 7.5, 8.5, 14.7**


- [ ] 15. Write integration tests for file uploads
  - [ ] 15.1 Test audio file upload
    - Select audio file (MP3, WAV)
    - Verify type parameter set to 'audio'
    - Verify multipart/form-data request sent
    - Verify upload progress displayed
    - Verify S3 URL returned
    - _Requirements: 10.1, 10.2, 10.5, 10.7_

  - [ ] 15.2 Test image file upload
    - Select image file (JPG, PNG)
    - Verify type parameter set to 'image'
    - Verify multipart/form-data request sent
    - Verify upload progress displayed
    - Verify S3 URL returned
    - _Requirements: 10.1, 10.3, 10.5, 10.7_

  - [ ] 15.3 Test document file upload
    - Select document file (PDF)
    - Verify type parameter set to 'document'
    - Verify multipart/form-data request sent
    - Verify upload progress displayed
    - Verify S3 URL returned
    - _Requirements: 10.1, 10.4, 10.5, 10.7_

  - [ ] 15.4 Test file upload failure
    - Simulate upload failure
    - Verify error message displayed
    - Verify upload progress reset
    - Verify retry option available
    - _Requirements: 10.6_

  - [ ]* 15.5 Write property test for file upload success response
    - **Property 13: File Upload Success Response**
    - **Validates: Requirements 10.5**

  - [ ]* 15.6 Write property test for file upload progress tracking
    - **Property 14: File Upload Progress Tracking**
    - **Validates: Requirements 10.7**

- [ ] 16. Write integration tests for session management
  - [ ] 16.1 Test activity tracking on API requests
    - Make API request
    - Verify last activity timestamp updated
    - Make another request
    - Verify timestamp updated again
    - _Requirements: 3.1, 3.5_

  - [ ] 16.2 Test session expiry warning
    - Simulate 25 minutes of inactivity
    - Verify warning dialog displayed
    - Verify remaining time shown
    - _Requirements: 3.2_

  - [ ] 16.3 Test session extension
    - Trigger expiry warning
    - Click extend session button
    - Verify session extended
    - Verify warning dismissed
    - Verify success feedback shown
    - _Requirements: 3.3_

  - [ ] 16.4 Test automatic logout on expiry
    - Simulate 30 minutes of inactivity
    - Verify automatic logout triggered
    - Verify localStorage cleared
    - Verify sessionStorage cleared
    - Verify redirect to login
    - _Requirements: 3.4_

  - [ ]* 16.5 Write property test for activity tracking
    - **Property 7: Activity Tracking**
    - **Validates: Requirements 3.1, 3.5**

  - [ ]* 16.6 Write property test for session extension
    - **Property 8: Session Extension**
    - **Validates: Requirements 3.3**

- [ ] 17. Write integration tests for protected routes
  - [ ] 17.1 Test unauthenticated access redirect
    - Clear authentication data
    - Navigate to admin route
    - Verify redirect to login page
    - _Requirements: 17.1_

  - [ ] 17.2 Test authenticated access allowed
    - Set valid authentication token
    - Navigate to admin route
    - Verify page rendered
    - Verify no redirect occurs
    - _Requirements: 17.2_

  - [ ] 17.3 Test expired token redirect
    - Set expired authentication token
    - Navigate to admin route
    - Verify redirect to login page
    - _Requirements: 17.3_

  - [ ]* 17.4 Write property test for protected route authentication check
    - **Property 25: Protected Route Authentication Check**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**


- [ ] 18. Write integration tests for loading states
  - [ ] 18.1 Test loading state during data fetch
    - Trigger data fetch
    - Verify loading spinner displayed
    - Wait for fetch completion
    - Verify loading spinner hidden
    - _Requirements: 20.1, 20.3_

  - [ ] 18.2 Test loading state during form submission
    - Fill and submit form
    - Verify submit button disabled
    - Verify loading state shown
    - Wait for submission completion
    - Verify button re-enabled
    - _Requirements: 20.2, 20.3_

  - [ ] 18.3 Test loading state on operation failure
    - Trigger operation that will fail
    - Verify loading indicator shown
    - Wait for failure
    - Verify loading indicator hidden
    - Verify error message shown
    - _Requirements: 20.4_

  - [ ]* 18.4 Write property test for loading state management
    - **Property 29: Loading State Management**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4**

- [ ] 19. Write integration tests for success feedback
  - [ ] 19.1 Test success toast on create
    - Create new content item
    - Verify success toast displayed
    - Verify toast contains success message
    - Wait 3 seconds
    - Verify toast auto-dismissed
    - _Requirements: 21.1, 21.4_

  - [ ] 19.2 Test success toast on update
    - Update existing content item
    - Verify success toast displayed
    - Verify toast auto-dismisses
    - _Requirements: 21.2, 21.4_

  - [ ] 19.3 Test success toast on delete
    - Delete content item
    - Verify success toast displayed
    - Verify toast auto-dismisses
    - _Requirements: 21.3, 21.4_

  - [ ] 19.4 Test content list refresh after operation
    - Perform CRUD operation
    - Verify content list refreshed
    - Verify changes reflected
    - _Requirements: 21.5_

  - [ ]* 19.5 Write property test for success toast display
    - **Property 30: Success Toast Display**
    - **Validates: Requirements 21.1, 21.2, 21.3, 21.4**

  - [ ]* 19.6 Write property test for content list refresh
    - **Property 31: Content List Refresh**
    - **Validates: Requirements 21.5**

- [ ] 20. Write integration tests for form validation
  - [ ] 20.1 Test required field validation
    - Submit form with empty required field
    - Verify validation error displayed
    - Verify form submission prevented
    - _Requirements: 22.1, 22.5_

  - [ ] 20.2 Test email format validation
    - Enter invalid email format
    - Verify validation error displayed
    - Verify form submission prevented
    - _Requirements: 22.2, 22.5_

  - [ ] 20.3 Test URL format validation
    - Enter invalid URL format
    - Verify validation error displayed
    - Verify form submission prevented
    - _Requirements: 22.3, 22.5_

  - [ ] 20.4 Test date format validation
    - Enter invalid date format
    - Verify validation error displayed
    - Verify form submission prevented
    - _Requirements: 22.4, 22.5_

  - [ ]* 20.5 Write property test for client-side form validation
    - **Property 32: Client-Side Form Validation**
    - **Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5**


- [ ] 21. Write integration tests for optimistic updates
  - [ ] 21.1 Test optimistic delete with success
    - Delete content item
    - Verify item immediately removed from list
    - Wait for API response
    - Verify item remains removed
    - _Requirements: 23.1_

  - [ ] 21.2 Test optimistic delete with rollback
    - Delete content item
    - Verify item immediately removed
    - Simulate API failure
    - Verify item restored to original position
    - _Requirements: 23.2_

  - [ ] 21.3 Test optimistic update with success
    - Update content item
    - Verify changes immediately reflected in list
    - Wait for API response
    - Verify changes persist
    - _Requirements: 23.3_

  - [ ] 21.4 Test optimistic update with rollback
    - Update content item
    - Verify changes immediately reflected
    - Simulate API failure
    - Verify item reverted to original state
    - _Requirements: 23.4_

  - [ ]* 21.5 Write property test for optimistic delete with rollback
    - **Property 33: Optimistic Delete with Rollback**
    - **Validates: Requirements 23.1, 23.2**

  - [ ]* 21.6 Write property test for optimistic update with rollback
    - **Property 34: Optimistic Update with Rollback**
    - **Validates: Requirements 23.3, 23.4**

- [ ] 22. Write integration tests for confirmation dialogs
  - [ ] 22.1 Test delete confirmation dialog display
    - Click delete button
    - Verify confirmation dialog appears
    - Verify item name displayed in dialog
    - Verify "Confirm" and "Cancel" buttons present
    - _Requirements: 24.1, 24.2, 24.5_

  - [ ] 22.2 Test delete confirmation proceed
    - Click delete button
    - Click confirm in dialog
    - Verify delete operation proceeds
    - Verify dialog closes
    - _Requirements: 24.3_

  - [ ] 22.3 Test delete confirmation cancel
    - Click delete button
    - Click cancel in dialog
    - Verify delete operation cancelled
    - Verify dialog closes
    - Verify item not deleted
    - _Requirements: 24.4_

  - [ ]* 22.4 Write property test for delete confirmation flow
    - **Property 35: Delete Confirmation Flow**
    - **Validates: Requirements 24.1, 24.2, 24.3, 24.4**

- [ ] 23. Write integration tests for error retry mechanism
  - [ ] 23.1 Test retry button on network error
    - Simulate network error
    - Verify retry button displayed
    - Click retry button
    - Verify operation attempted again
    - _Requirements: 25.1, 25.2_

  - [ ] 23.2 Test retry limit enforcement
    - Simulate repeated failures
    - Verify retries limited to 3 attempts
    - Verify final error message displayed
    - _Requirements: 25.4, 25.5_

  - [ ]* 23.3 Write property test for error retry mechanism
    - **Property 36: Error Retry Mechanism**
    - **Validates: Requirements 25.1, 25.2, 25.4, 25.5**

- [ ] 24. Write integration tests for request tracking
  - [ ] 24.1 Test request ID generation
    - Make API request
    - Verify X-Request-ID header present
    - Verify ID is unique
    - Make another request
    - Verify different ID generated
    - _Requirements: 18.1, 18.2_

  - [ ] 24.2 Test request ID in error responses
    - Trigger API error
    - Verify error response includes request ID
    - Verify request ID matches sent ID
    - _Requirements: 18.4_

  - [ ]* 24.3 Write property test for request ID generation
    - **Property 26: Request ID Generation**
    - **Validates: Requirements 18.1, 18.4**


- [ ] 25. Checkpoint - Review integration test results
  - Review all integration test results
  - Document any issues discovered
  - Prioritize fixes based on severity
  - Ensure all tests pass, ask the user if questions arise

- [ ] 26. Fix any issues discovered during integration testing
  - [ ] 26.1 Fix API client issues
    - Address any request/response handling bugs
    - Fix interceptor issues
    - Correct error parsing problems
    - _Requirements: All API client related_

  - [ ] 26.2 Fix authentication flow issues
    - Address token storage/retrieval bugs
    - Fix redirect logic
    - Correct session management issues
    - _Requirements: 2.1-2.6, 3.1-3.5_

  - [ ] 26.3 Fix CRUD operation issues
    - Address any endpoint calling bugs
    - Fix data serialization issues
    - Correct optimistic update bugs
    - _Requirements: 4.1-9.4_

  - [ ] 26.4 Fix file upload issues
    - Address upload progress tracking bugs
    - Fix type parameter issues
    - Correct error handling
    - _Requirements: 10.1-10.7_

  - [ ] 26.5 Fix UI feedback issues
    - Address loading state bugs
    - Fix toast notification issues
    - Correct validation error display
    - _Requirements: 20.1-22.5_

- [ ] 27. Write unit tests for edge cases
  - [ ] 27.1 Test show with episodes deletion prevention
    - Mock show with episodes
    - Attempt deletion
    - Verify HAS_EPISODES error handled
    - Verify user-friendly message shown
    - _Requirements: 4.5_

  - [ ] 27.2 Test duplicate slug handling
    - Mock duplicate slug error
    - Verify 409 status handled
    - Verify DUPLICATE_SLUG error message shown
    - _Requirements: 4.6, 6.7_

  - [ ] 27.3 Test invalid show_id handling
    - Mock SHOW_NOT_FOUND error
    - Verify 404 status handled
    - Verify error message shown
    - _Requirements: 5.5_

  - [ ] 27.4 Test empty bulk operation validation
    - Attempt bulk operation with no items selected
    - Verify validation message shown
    - Verify no API call made
    - _Requirements: 16.5_

  - [ ] 27.5 Test session warning at 25 minutes
    - Mock 25 minutes of inactivity
    - Verify warning dialog appears
    - Verify correct timing
    - _Requirements: 3.2_

  - [ ] 27.6 Test session expiry at 30 minutes
    - Mock 30 minutes of inactivity
    - Verify automatic logout
    - Verify cleanup performed
    - _Requirements: 3.4_

  - [ ] 27.7 Test invalid sort field fallback
    - Send invalid sort field
    - Verify default sort used
    - Verify no error thrown
    - _Requirements: 13.4_

  - [ ] 27.8 Test invalid order value fallback
    - Send invalid order value
    - Verify DESC used as default
    - Verify no error thrown
    - _Requirements: 13.5_

- [ ] 28. Write unit tests for API client components
  - [ ] 28.1 Test request interceptor
    - Mock axios config
    - Call request interceptor
    - Verify auth token added
    - Verify CSRF token added
    - Verify request ID added
    - _Requirements: 1.2, 1.3, 18.1_

  - [ ] 28.2 Test response interceptor
    - Mock axios response with CSRF token
    - Call response interceptor
    - Verify CSRF token stored
    - _Requirements: 19.1, 19.2_

  - [ ] 28.3 Test 401 error handling
    - Mock 401 response
    - Call error interceptor
    - Verify localStorage cleared
    - Verify sessionStorage cleared
    - Verify redirect called
    - _Requirements: 2.5_

  - [ ] 28.4 Test 429 rate limit handling
    - Mock 429 response
    - Call error interceptor
    - Verify rate limit message shown
    - _Requirements: 14.6_


- [ ] 29. Write unit tests for authentication context
  - [ ] 29.1 Test login success
    - Mock successful login response
    - Call login function
    - Verify token stored in localStorage
    - Verify user data stored in localStorage
    - Verify isAuthenticated becomes true
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 29.2 Test login failure
    - Mock failed login response
    - Call login function
    - Verify error thrown
    - Verify no data stored
    - Verify isAuthenticated remains false
    - _Requirements: 2.4_

  - [ ] 29.3 Test logout
    - Set authenticated state
    - Call logout function
    - Verify localStorage cleared
    - Verify sessionStorage cleared
    - Verify isAuthenticated becomes false
    - _Requirements: 2.6_

  - [ ] 29.4 Test token expiry check
    - Set expired token
    - Call getTokenExpiry
    - Verify expiry detected
    - _Requirements: 17.3_

  - [ ]* 29.5 Write property test for login success storage
    - **Property 3: Login Success Storage**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 29.6 Write property test for login failure handling
    - **Property 4: Login Failure Handling**
    - **Validates: Requirements 2.4**

  - [ ]* 29.7 Write property test for logout cleanup
    - **Property 6: Logout Cleanup**
    - **Validates: Requirements 2.6**

- [ ] 30. Write unit tests for session manager hook
  - [ ] 30.1 Test activity tracking
    - Call updateActivity
    - Verify timestamp updated
    - Call again
    - Verify timestamp updated again
    - _Requirements: 3.1, 3.5_

  - [ ] 30.2 Test near expiry detection
    - Set timestamp to 25 minutes ago
    - Call isNearExpiry
    - Verify returns true
    - _Requirements: 3.2_

  - [ ] 30.3 Test session extension
    - Call extendSession
    - Verify timestamp reset
    - Verify warning dismissed
    - _Requirements: 3.3_

  - [ ] 30.4 Test automatic expiry
    - Set timestamp to 30 minutes ago
    - Trigger expiry check
    - Verify logout called
    - Verify cleanup performed
    - _Requirements: 3.4_

- [ ] 31. Write unit tests for dashboard statistics
  - [ ] 31.1 Test statistics fetch
    - Mock statistics API response
    - Load dashboard page
    - Verify statistics displayed
    - Verify all counts shown
    - _Requirements: 15.1, 15.2_

  - [ ] 31.2 Test pending submissions display
    - Mock statistics with pending count
    - Verify pending count highlighted
    - _Requirements: 15.3_

  - [ ] 31.3 Test recent activity display
    - Mock statistics with recent activity
    - Verify recent items displayed
    - Verify correct formatting
    - _Requirements: 15.4_

  - [ ] 31.4 Test statistics refresh
    - Load dashboard
    - Trigger refresh
    - Verify new API call made
    - Verify statistics updated
    - _Requirements: 15.5_

  - [ ]* 31.5 Write property test for dashboard statistics display
    - **Property 22: Dashboard Statistics Display**
    - **Validates: Requirements 15.2, 15.3, 15.4**


- [ ] 32. Write unit tests for content pages
  - [ ] 32.1 Test shows page data fetch
    - Mock shows API response
    - Render AdminShowsPage
    - Verify GET /api/admin/shows called
    - Verify shows displayed in table
    - _Requirements: 4.1_

  - [ ] 32.2 Test episodes page with show filter
    - Mock episodes API response
    - Render AdminEpisodesPage
    - Select show filter
    - Verify show_id parameter sent
    - _Requirements: 5.1, 11.4_

  - [ ] 32.3 Test articles page with status filter
    - Mock articles API response
    - Render AdminArticlesPage
    - Select status filter
    - Verify status parameter sent
    - _Requirements: 6.1, 11.2_

  - [ ] 32.4 Test events page with category filter
    - Mock events API response
    - Render AdminEventsPage
    - Select category filter
    - Verify category parameter sent
    - _Requirements: 7.1, 11.3_

  - [ ] 32.5 Test resources page data fetch
    - Mock resources API response
    - Render AdminResourcesPage
    - Verify resources displayed
    - _Requirements: 8.1_

  - [ ] 32.6 Test submissions page with status filter
    - Mock submissions API response
    - Render AdminSubmissionsPage
    - Verify pending submissions highlighted
    - _Requirements: 9.1_

- [ ] 33. Write unit tests for form components
  - [ ] 33.1 Test create modal open/close
    - Click create button
    - Verify modal opens
    - Click cancel
    - Verify modal closes
    - _Requirements: General UI_

  - [ ] 33.2 Test edit modal with existing data
    - Click edit button
    - Verify modal opens
    - Verify form pre-filled with existing data
    - _Requirements: General UI_

  - [ ] 33.3 Test form field validation
    - Enter invalid data
    - Blur field
    - Verify validation error shown
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

  - [ ] 33.4 Test form submission disabled on validation errors
    - Enter invalid data
    - Attempt to submit
    - Verify submission prevented
    - Verify submit button disabled
    - _Requirements: 22.5_

- [ ] 34. Write unit tests for file uploader component
  - [ ] 34.1 Test file selection
    - Select file
    - Verify file name displayed
    - Verify file size displayed
    - _Requirements: 10.1_

  - [ ] 34.2 Test file type validation
    - Select invalid file type
    - Verify error message shown
    - Verify upload prevented
    - _Requirements: 10.1_

  - [ ] 34.3 Test file size validation
    - Select oversized file
    - Verify error message shown
    - Verify upload prevented
    - _Requirements: 10.1_

  - [ ] 34.4 Test upload progress display
    - Start file upload
    - Mock progress events
    - Verify progress bar updates
    - Verify percentage displayed
    - _Requirements: 10.7_

  - [ ] 34.5 Test upload success
    - Complete file upload
    - Verify success message shown
    - Verify file URL returned
    - _Requirements: 10.5_

  - [ ] 34.6 Test upload failure
    - Simulate upload failure
    - Verify error message shown
    - Verify retry option available
    - _Requirements: 10.6_


- [ ] 35. Write unit tests for UI feedback components
  - [ ] 35.1 Test toast notification display
    - Trigger success action
    - Verify toast appears
    - Verify correct message shown
    - Verify correct type (success/error/warning)
    - _Requirements: 21.1, 21.2, 21.3_

  - [ ] 35.2 Test toast auto-dismiss
    - Show toast
    - Wait 3 seconds
    - Verify toast dismissed
    - _Requirements: 21.4_

  - [ ] 35.3 Test loading spinner display
    - Trigger async operation
    - Verify spinner shown
    - Wait for completion
    - Verify spinner hidden
    - _Requirements: 20.1, 20.3_

  - [ ] 35.4 Test confirmation dialog
    - Trigger delete action
    - Verify dialog appears
    - Verify item name shown
    - Verify buttons present
    - _Requirements: 24.1, 24.2, 24.5_

- [ ] 36. Checkpoint - Review all test results
  - Run all unit tests and verify passing
  - Run all integration tests and verify passing
  - Run all property tests and verify passing
  - Review test coverage report
  - Ensure all tests pass, ask the user if questions arise

- [ ] 37. Perform manual end-to-end testing
  - [ ] 37.1 Test complete shows workflow
    - Login to admin portal
    - Create new show with image
    - Edit show details
    - Create episode for show
    - Delete episode
    - Attempt to delete show (should fail)
    - Delete all episodes
    - Delete show (should succeed)
    - _Requirements: 4.1-4.7, 5.1-5.6_

  - [ ] 37.2 Test complete articles workflow
    - Create draft article with image
    - Edit article content
    - Publish article
    - Verify article appears on frontend
    - Unpublish article
    - Delete article
    - _Requirements: 6.1-6.7_

  - [ ] 37.3 Test complete events workflow
    - Create upcoming event with image
    - Edit event details
    - Update event status
    - Delete event
    - _Requirements: 7.1-7.5_

  - [ ] 37.4 Test complete resources workflow
    - Create resource with PDF upload
    - Edit resource details
    - Delete resource
    - _Requirements: 8.1-8.5_

  - [ ] 37.5 Test complete submissions workflow
    - View pending submissions
    - Approve submission with feedback
    - Reject submission with feedback
    - Delete submission
    - _Requirements: 9.1-9.5_

  - [ ] 37.6 Test search and filtering across all pages
    - Test search on shows page
    - Test status filter on articles page
    - Test category filter on events page
    - Test show filter on episodes page
    - _Requirements: 11.1-11.5_

  - [ ] 37.7 Test pagination across all pages
    - Navigate through multiple pages
    - Verify page numbers correct
    - Test first/last page navigation
    - _Requirements: 12.1-12.5_

  - [ ] 37.8 Test sorting across all pages
    - Sort by title ascending/descending
    - Sort by date ascending/descending
    - Verify sort order correct
    - _Requirements: 13.1-13.5_

  - [ ] 37.9 Test session management
    - Login and work for 20 minutes
    - Verify no warning
    - Wait until 25 minutes
    - Verify warning appears
    - Extend session
    - Continue working
    - _Requirements: 3.1-3.5_

  - [ ] 37.10 Test error scenarios
    - Disconnect network and attempt operation
    - Submit invalid form data
    - Attempt duplicate slug creation
    - Trigger rate limit
    - _Requirements: 14.1-14.7, 25.1-25.5_


- [ ] 38. Document integration testing results
  - [ ] 38.1 Create integration test report
    - Document all tests executed
    - List all issues discovered and fixed
    - Include test coverage metrics
    - Document any known limitations
    - _Requirements: All_

  - [ ] 38.2 Update API documentation
    - Document any API changes discovered
    - Update error response formats
    - Document request/response examples
    - _Requirements: All_

  - [ ] 38.3 Create troubleshooting guide
    - Document common integration issues
    - Provide solutions for known problems
    - Include debugging tips
    - _Requirements: All_

- [ ] 39. Final checkpoint - Verify complete integration
  - Verify all 25 requirements validated
  - Verify all 36 correctness properties tested
  - Verify all CRUD operations working
  - Verify all file uploads working
  - Verify authentication and session management working
  - Verify error handling working correctly
  - Verify UI feedback working correctly
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- Manual testing validates real-world usage scenarios

## Testing Configuration

All property-based tests should use fast-check with minimum 100 runs:

```typescript
import fc from 'fast-check';

describe('Admin Backend Integration Properties', () => {
  it('should validate property', () => {
    fc.assert(
      fc.property(
        // arbitraries here
        (input) => {
          // test logic here
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Implementation Approach

1. **Test-First**: Write integration tests before fixing issues
2. **Incremental**: Complete one content type at a time
3. **Validate Early**: Run tests after each fix
4. **Document Issues**: Track all problems discovered
5. **User Feedback**: Checkpoint with user at key milestones

## Success Criteria

- All 25 requirements validated through tests
- All 36 correctness properties verified
- All CRUD operations working end-to-end
- All file uploads working with progress tracking
- Authentication and session management robust
- Error handling comprehensive and user-friendly
- UI feedback clear and responsive
- Test coverage >80% for integration layer
- Zero critical bugs in manual testing
