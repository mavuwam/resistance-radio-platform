# Requirements Document

## Introduction

This document defines the requirements for integrating the admin portal frontend with the backend API. The admin portal UI is complete with modern design, error handling, and all pages implemented. The backend has existing admin API routes for shows, episodes, articles, events, resources, and submissions. This integration ensures comprehensive testing of all CRUD operations, file uploads, authentication flows, and error handling to verify the admin portal works seamlessly with the backend.

## Glossary

- **Admin_Portal**: The React-based frontend application for content management running on port 5174
- **Backend_API**: The Express.js REST API server running on port 5000
- **API_Client**: The shared API service module that handles HTTP requests to the backend
- **Content_Manager**: A user with role 'content_manager' or 'administrator' who can manage content
- **CRUD_Operations**: Create, Read, Update, Delete operations on content entities
- **File_Upload**: The process of uploading files (audio, images, PDFs) to S3 via the backend
- **Authentication_Token**: JWT token stored in localStorage for authenticating API requests
- **Session**: The authenticated user session with automatic expiry and refresh capabilities
- **Dashboard**: The admin portal home page displaying real-time statistics
- **Content_Entity**: Any of shows, episodes, articles, events, resources, or submissions

## Requirements

### Requirement 1: API Client Configuration

**User Story:** As a developer, I want the API client properly configured, so that all admin requests are authenticated and routed correctly

#### Acceptance Criteria

1. THE API_Client SHALL use the base URL from VITE_API_URL environment variable
2. WHEN an Authentication_Token exists in localStorage, THE API_Client SHALL include it in the Authorization header
3. WHEN a CSRF token exists in sessionStorage, THE API_Client SHALL include it in the X-CSRF-Token header
4. THE API_Client SHALL set withCredentials to true for cookie-based authentication
5. THE API_Client SHALL set a timeout of 30000ms for all requests

### Requirement 2: Authentication Flow Integration

**User Story:** As a Content_Manager, I want to log in to the admin portal, so that I can access protected content management features

#### Acceptance Criteria

1. WHEN valid credentials are submitted, THE Admin_Portal SHALL receive an Authentication_Token from the Backend_API
2. WHEN login succeeds, THE Admin_Portal SHALL store the Authentication_Token in localStorage
3. WHEN login succeeds, THE Admin_Portal SHALL store user data in localStorage
4. WHEN login fails with invalid credentials, THE Admin_Portal SHALL display an error message
5. WHEN the Backend_API returns 401 Unauthorized, THE API_Client SHALL clear authentication data and redirect to login
6. WHEN a user logs out, THE Admin_Portal SHALL clear localStorage and sessionStorage authentication data

### Requirement 3: Session Management

**User Story:** As a Content_Manager, I want my session to be managed automatically, so that I don't lose work due to unexpected session expiry

#### Acceptance Criteria

1. WHEN a Session is active, THE Admin_Portal SHALL track the last activity timestamp
2. WHEN 25 minutes of inactivity occur, THE Admin_Portal SHALL display a session expiry warning
3. WHEN the user interacts with the warning, THE Admin_Portal SHALL extend the Session
4. WHEN 30 minutes of inactivity occur, THE Admin_Portal SHALL log out the user automatically
5. WHEN any API request occurs, THE Admin_Portal SHALL update the last activity timestamp

### Requirement 4: Shows CRUD Operations

**User Story:** As a Content_Manager, I want to manage radio shows, so that I can organize episode content

#### Acceptance Criteria

1. WHEN the shows page loads, THE Admin_Portal SHALL fetch all shows from GET /api/admin/shows
2. WHEN creating a show, THE Admin_Portal SHALL send POST /api/admin/shows with title, slug, description, host, category, and broadcast_schedule
3. WHEN updating a show, THE Admin_Portal SHALL send PUT /api/admin/shows/:id with modified fields
4. WHEN deleting a show, THE Admin_Portal SHALL send DELETE /api/admin/shows/:id
5. IF a show has episodes, THEN THE Backend_API SHALL return error code HAS_EPISODES and prevent deletion
6. WHEN a slug already exists, THE Backend_API SHALL return error code DUPLICATE_SLUG with 409 status
7. WHEN validation fails, THE Backend_API SHALL return a 400 status with error details

### Requirement 5: Episodes CRUD Operations

**User Story:** As a Content_Manager, I want to manage podcast episodes, so that I can publish audio content

#### Acceptance Criteria

1. WHEN the episodes page loads, THE Admin_Portal SHALL fetch all episodes from GET /api/admin/episodes
2. WHEN creating an episode, THE Admin_Portal SHALL send POST /api/admin/episodes with show_id, title, description, audio_url, and optional fields
3. WHEN updating an episode, THE Admin_Portal SHALL send PUT /api/admin/episodes/:id with modified fields
4. WHEN deleting an episode, THE Admin_Portal SHALL send DELETE /api/admin/episodes/:id
5. IF the show_id does not exist, THEN THE Backend_API SHALL return error code SHOW_NOT_FOUND with 404 status
6. WHEN validation fails, THE Backend_API SHALL return a 400 status with error details

### Requirement 6: Articles CRUD Operations

**User Story:** As a Content_Manager, I want to manage news articles, so that I can publish written content

#### Acceptance Criteria

1. WHEN the articles page loads, THE Admin_Portal SHALL fetch all articles from GET /api/admin/articles
2. WHEN creating an article, THE Admin_Portal SHALL send POST /api/admin/articles with title, slug, content, author, and status
3. WHEN updating an article, THE Admin_Portal SHALL send PUT /api/admin/articles/:id with modified fields
4. WHEN deleting an article, THE Admin_Portal SHALL send DELETE /api/admin/articles/:id
5. WHEN publishing an article, THE Admin_Portal SHALL send POST /api/admin/articles/:id/publish
6. WHEN unpublishing an article, THE Admin_Portal SHALL send POST /api/admin/articles/:id/unpublish
7. WHEN a slug already exists, THE Backend_API SHALL return error code DUPLICATE_SLUG with 409 status

### Requirement 7: Events CRUD Operations

**User Story:** As a Content_Manager, I want to manage community events, so that I can promote activities

#### Acceptance Criteria

1. WHEN the events page loads, THE Admin_Portal SHALL fetch all events from GET /api/admin/events
2. WHEN creating an event, THE Admin_Portal SHALL send POST /api/admin/events with required event fields
3. WHEN updating an event, THE Admin_Portal SHALL send PUT /api/admin/events/:id with modified fields
4. WHEN deleting an event, THE Admin_Portal SHALL send DELETE /api/admin/events/:id
5. WHEN validation fails, THE Backend_API SHALL return a 400 status with error details

### Requirement 8: Resources CRUD Operations

**User Story:** As a Content_Manager, I want to manage downloadable resources, so that I can share documents with users

#### Acceptance Criteria

1. WHEN the resources page loads, THE Admin_Portal SHALL fetch all resources from GET /api/admin/resources
2. WHEN creating a resource, THE Admin_Portal SHALL send POST /api/admin/resources with required resource fields
3. WHEN updating a resource, THE Admin_Portal SHALL send PUT /api/admin/resources/:id with modified fields
4. WHEN deleting a resource, THE Admin_Portal SHALL send DELETE /api/admin/resources/:id
5. WHEN validation fails, THE Backend_API SHALL return a 400 status with error details

### Requirement 9: Submissions Management

**User Story:** As a Content_Manager, I want to review user submissions, so that I can approve or reject community content

#### Acceptance Criteria

1. WHEN the submissions page loads, THE Admin_Portal SHALL fetch all submissions from GET /api/admin/submissions
2. WHEN approving a submission, THE Admin_Portal SHALL send PUT /api/admin/submissions/:id/approve with optional feedback
3. WHEN rejecting a submission, THE Admin_Portal SHALL send PUT /api/admin/submissions/:id/reject with optional feedback
4. WHEN deleting a submission, THE Admin_Portal SHALL send DELETE /api/admin/submissions/:id
5. WHEN a submission status changes, THE Backend_API SHALL send an email notification to the submitter

### Requirement 10: File Upload Integration

**User Story:** As a Content_Manager, I want to upload files for content, so that I can add media to episodes, articles, and resources

#### Acceptance Criteria

1. WHEN uploading a file, THE Admin_Portal SHALL send POST /api/upload with multipart/form-data
2. WHEN uploading an audio file, THE Admin_Portal SHALL set type parameter to 'audio'
3. WHEN uploading an image file, THE Admin_Portal SHALL set type parameter to 'image'
4. WHEN uploading a document file, THE Admin_Portal SHALL set type parameter to 'document'
5. WHEN upload succeeds, THE Backend_API SHALL return the S3 file URL
6. WHEN upload fails, THE Backend_API SHALL return an error message with appropriate status code
7. WHILE a file is uploading, THE Admin_Portal SHALL display upload progress

### Requirement 11: Search and Filtering

**User Story:** As a Content_Manager, I want to search and filter content, so that I can quickly find specific items

#### Acceptance Criteria

1. WHEN searching content, THE Admin_Portal SHALL send the search query parameter to the Backend_API
2. WHEN filtering by status, THE Admin_Portal SHALL send the status query parameter to the Backend_API
3. WHEN filtering by category, THE Admin_Portal SHALL send the category query parameter to the Backend_API
4. WHEN filtering by show, THE Admin_Portal SHALL send the show_id query parameter to the Backend_API
5. THE Backend_API SHALL perform case-insensitive ILIKE searches on title and description fields

### Requirement 12: Pagination

**User Story:** As a Content_Manager, I want paginated content lists, so that I can navigate large datasets efficiently

#### Acceptance Criteria

1. WHEN fetching content lists, THE Admin_Portal SHALL send limit and offset query parameters
2. THE Backend_API SHALL return count, total, limit, and offset in the response
3. WHEN the user navigates to the next page, THE Admin_Portal SHALL increment the offset by the limit
4. WHEN the user navigates to the previous page, THE Admin_Portal SHALL decrement the offset by the limit
5. THE Admin_Portal SHALL display the current page number and total pages

### Requirement 13: Sorting

**User Story:** As a Content_Manager, I want to sort content lists, so that I can view items in my preferred order

#### Acceptance Criteria

1. WHEN sorting content, THE Admin_Portal SHALL send sort and order query parameters to the Backend_API
2. THE Backend_API SHALL validate sort fields against a whitelist of allowed fields
3. THE Backend_API SHALL validate order values as either ASC or DESC
4. IF an invalid sort field is provided, THEN THE Backend_API SHALL use the default sort field
5. IF an invalid order is provided, THEN THE Backend_API SHALL use DESC as default

### Requirement 14: Error Handling

**User Story:** As a Content_Manager, I want clear error messages, so that I can understand and resolve issues

#### Acceptance Criteria

1. WHEN a network error occurs, THE Admin_Portal SHALL display a user-friendly error message
2. WHEN a 400 validation error occurs, THE Admin_Portal SHALL display field-specific error messages
3. WHEN a 404 not found error occurs, THE Admin_Portal SHALL display "Resource not found"
4. WHEN a 409 conflict error occurs, THE Admin_Portal SHALL display the conflict reason
5. WHEN a 500 server error occurs, THE Admin_Portal SHALL display "Server error, please try again"
6. WHEN a 429 rate limit error occurs, THE Admin_Portal SHALL display "Too many requests, please wait"
7. THE Backend_API SHALL return errors in consistent format with message and code fields

### Requirement 15: Dashboard Statistics

**User Story:** As a Content_Manager, I want to see dashboard statistics, so that I can monitor content metrics

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Admin_Portal SHALL fetch statistics from the Backend_API
2. THE Dashboard SHALL display total counts for shows, episodes, articles, events, resources, and submissions
3. THE Dashboard SHALL display pending submissions count
4. THE Dashboard SHALL display recently published content
5. WHEN statistics are refreshed, THE Admin_Portal SHALL fetch updated data from the Backend_API

### Requirement 16: Bulk Operations

**User Story:** As a Content_Manager, I want to perform bulk actions, so that I can manage multiple items efficiently

#### Acceptance Criteria

1. WHEN bulk publishing articles, THE Admin_Portal SHALL send POST /api/admin/articles/bulk/publish with an array of IDs
2. WHEN bulk unpublishing articles, THE Admin_Portal SHALL send POST /api/admin/articles/bulk/unpublish with an array of IDs
3. THE Backend_API SHALL validate that the IDs array is not empty
4. THE Backend_API SHALL return the count of updated items
5. IF no items are selected, THEN THE Admin_Portal SHALL display "No items selected"

### Requirement 17: Protected Routes

**User Story:** As a system, I want to protect admin routes, so that only authenticated users can access them

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses an admin route, THE Admin_Portal SHALL redirect to the login page
2. WHEN an authenticated user accesses an admin route, THE Admin_Portal SHALL render the requested page
3. WHEN the Authentication_Token is invalid or expired, THE Admin_Portal SHALL redirect to the login page
4. THE Admin_Portal SHALL check authentication status before rendering protected components

### Requirement 18: Request Tracking

**User Story:** As a developer, I want request tracking, so that I can debug API issues

#### Acceptance Criteria

1. WHEN making an API request, THE API_Client SHALL generate a unique X-Request-ID header
2. THE API_Client SHALL use crypto.getRandomValues for secure token generation
3. THE Backend_API SHALL log the X-Request-ID for request tracing
4. WHEN an error occurs, THE error response SHALL include the X-Request-ID for debugging

### Requirement 19: CSRF Protection

**User Story:** As a system, I want CSRF protection, so that cross-site request forgery attacks are prevented

#### Acceptance Criteria

1. WHEN the Backend_API responds, THE API_Client SHALL check for an X-CSRF-Token header
2. WHEN an X-CSRF-Token is received, THE API_Client SHALL store it in sessionStorage
3. WHEN making subsequent requests, THE API_Client SHALL include the stored CSRF token in the X-CSRF-Token header
4. WHEN the Session expires, THE Admin_Portal SHALL clear the CSRF token from sessionStorage

### Requirement 20: Loading States

**User Story:** As a Content_Manager, I want loading indicators, so that I know when operations are in progress

#### Acceptance Criteria

1. WHEN fetching data, THE Admin_Portal SHALL display a loading spinner
2. WHEN submitting a form, THE Admin_Portal SHALL disable the submit button and show loading state
3. WHEN an operation completes, THE Admin_Portal SHALL hide the loading indicator
4. WHEN an operation fails, THE Admin_Portal SHALL hide the loading indicator and show an error

### Requirement 21: Success Feedback

**User Story:** As a Content_Manager, I want success notifications, so that I know when operations complete successfully

#### Acceptance Criteria

1. WHEN a create operation succeeds, THE Admin_Portal SHALL display a success toast message
2. WHEN an update operation succeeds, THE Admin_Portal SHALL display a success toast message
3. WHEN a delete operation succeeds, THE Admin_Portal SHALL display a success toast message
4. THE success toast SHALL automatically dismiss after 3 seconds
5. THE Admin_Portal SHALL refresh the content list after successful operations

### Requirement 22: Form Validation

**User Story:** As a Content_Manager, I want client-side form validation, so that I catch errors before submitting

#### Acceptance Criteria

1. WHEN a required field is empty, THE Admin_Portal SHALL display a validation error
2. WHEN an email field contains invalid format, THE Admin_Portal SHALL display a validation error
3. WHEN a URL field contains invalid format, THE Admin_Portal SHALL display a validation error
4. WHEN a date field contains invalid format, THE Admin_Portal SHALL display a validation error
5. THE Admin_Portal SHALL prevent form submission when validation errors exist

### Requirement 23: Optimistic Updates

**User Story:** As a Content_Manager, I want responsive UI updates, so that the interface feels fast

#### Acceptance Criteria

1. WHEN deleting an item, THE Admin_Portal SHALL remove it from the list immediately
2. IF the delete operation fails, THEN THE Admin_Portal SHALL restore the item to the list
3. WHEN updating an item, THE Admin_Portal SHALL update the list immediately
4. IF the update operation fails, THEN THE Admin_Portal SHALL revert the changes

### Requirement 24: Confirmation Dialogs

**User Story:** As a Content_Manager, I want confirmation dialogs for destructive actions, so that I don't accidentally delete content

#### Acceptance Criteria

1. WHEN deleting a Content_Entity, THE Admin_Portal SHALL display a confirmation dialog
2. THE confirmation dialog SHALL display the item name or title
3. WHEN the user confirms, THE Admin_Portal SHALL proceed with the delete operation
4. WHEN the user cancels, THE Admin_Portal SHALL close the dialog without deleting
5. THE confirmation dialog SHALL have clear "Confirm" and "Cancel" buttons

### Requirement 25: Responsive Error Recovery

**User Story:** As a Content_Manager, I want to retry failed operations, so that I can recover from temporary network issues

#### Acceptance Criteria

1. WHEN a network error occurs, THE Admin_Portal SHALL display a "Retry" button
2. WHEN the user clicks "Retry", THE Admin_Portal SHALL attempt the operation again
3. WHEN a 500 server error occurs, THE Admin_Portal SHALL suggest retrying after a moment
4. THE Admin_Portal SHALL limit automatic retries to prevent infinite loops
5. WHEN retries are exhausted, THE Admin_Portal SHALL display a final error message
