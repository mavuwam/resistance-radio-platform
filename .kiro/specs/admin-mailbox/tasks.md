# Implementation Plan: Admin Mailbox

## Overview

This implementation plan breaks down the Admin Mailbox feature into discrete coding tasks. The feature integrates email management directly into the CMS admin portal, allowing administrators to receive, view, manage, and organize emails without leaving the admin interface.

The implementation follows this sequence:
1. Database schema and migrations
2. Backend API endpoints (webhook, CRUD operations, filtering)
3. Frontend components (inbox view, detail view, notifications)
4. Email service provider integration
5. HTML sanitization and security
6. Real-time polling and cleanup jobs
7. Testing (property-based and unit tests)

Each task builds incrementally on previous work, with checkpoints to validate functionality before proceeding.

## Tasks

- [x] 1. Set up database schema and migrations
  - [x] 1.1 Create database migration file for admin_emails and admin_email_addresses tables
    - Create migration file `backend/src/db/migrations/XXX_create_admin_mailbox_tables.sql`
    - Define admin_emails table with all columns (id, admin_user_id, from_address, from_name, to_address, cc_addresses, subject, body_text, body_html, status, is_starred, message_id, in_reply_to, references, received_at, read_at, deleted_at, created_at, updated_at)
    - Define admin_email_addresses table with all columns (id, admin_user_id, email_address, is_primary, is_active, created_at)
    - Add all indexes for performance (user_id, status, received_at, from_address, subject full-text, body_text full-text, composite index)
    - Add foreign key constraints with CASCADE delete
    - Add unique constraint on email_address in admin_email_addresses
    - Insert default admin email addresses from existing users table
    - _Requirements: 10.1, 10.5_

  - [x] 1.2 Create TypeScript models for admin emails
    - Create `backend/src/models/AdminEmail.ts` with AdminEmail and AdminEmailAddress interfaces
    - Define all fields matching database schema with proper TypeScript types
    - Export interfaces for use in routes and services
    - _Requirements: 10.1_

  - [ ]* 1.3 Write property test for database schema integrity
    - **Property 29: Access Audit Logging** (partial - schema validation)
    - **Validates: Requirements 10.1**

- [x] 2. Implement email webhook endpoint
  - [x] 2.1 Create webhook route handler
    - Create `backend/src/routes/mailbox.ts` with POST /api/mailbox/webhook endpoint
    - Parse incoming email webhook payload (from, to, cc, subject, text, html, messageId, etc.)
    - Implement provider detection logic (SendGrid, Mailgun, AWS SES) based on headers/format
    - Create adapter functions for each provider format (parseSendGridWebhook, parseMailgunWebhook, parseSESWebhook)
    - _Requirements: 6.1, 6.4_

  - [x] 2.2 Implement email assignment logic
    - Query admin_email_addresses table to find matching admin user by recipient email
    - Assign email to matched admin user's admin_user_id
    - Implement fallback to default admin mailbox if no match found
    - Support multiple email addresses per admin user
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.3 Create email record in database
    - Insert new record into admin_emails table with all parsed fields
    - Set status to 'unread' by default
    - Set received_at timestamp
    - Sanitize HTML content before storing (backend sanitization)
    - Return success response with email ID
    - _Requirements: 6.4, 2.5_

  - [x] 2.4 Implement unread count increment
    - After creating email record, increment unread count for assigned admin user
    - Use database trigger or application logic to maintain count
    - _Requirements: 6.5_

  - [ ]* 2.5 Write property test for email assignment by recipient
    - **Property 20: Email Assignment by Recipient**
    - **Validates: Requirements 6.1**

  - [ ]* 2.6 Write property test for multiple email address support
    - **Property 21: Multiple Email Address Support**
    - **Validates: Requirements 6.2**

  - [ ]* 2.7 Write property test for default mailbox fallback
    - **Property 22: Default Mailbox Fallback**
    - **Validates: Requirements 6.3**

  - [ ]* 2.8 Write unit tests for webhook endpoint
    - Test valid email payload creates database record
    - Test missing fields handled gracefully
    - Test each provider format (SendGrid, Mailgun, SES)
    - Test error handling for database failures
    - _Requirements: 6.1, 6.4_

- [x] 3. Implement email list API endpoint
  - [x] 3.1 Create GET /api/admin/mailbox endpoint with authentication
    - Create route in `backend/src/routes/admin/mailbox.ts`
    - Apply auth middleware to verify JWT token
    - Extract admin user ID from authenticated request
    - _Requirements: 1.1, 9.1_

  - [x] 3.2 Implement pagination logic
    - Parse page and limit query parameters (default: page=1, limit=50)
    - Calculate offset from page number
    - Query database with LIMIT and OFFSET
    - Return pagination metadata (currentPage, totalPages, totalCount, limit)
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 3.3 Implement status filtering
    - Parse status query parameter (all, unread, read, archived)
    - Add WHERE clause to filter by status if provided
    - Exclude archived and deleted emails from default view (when status not specified)
    - _Requirements: 3.5, 4.4, 5.2, 5.3_

  - [x] 3.4 Implement search functionality
    - Parse search query parameter
    - Add full-text search on from_address, subject, and body_text using PostgreSQL tsvector
    - Use case-insensitive matching
    - _Requirements: 5.1_

  - [x] 3.5 Implement email authorization and ordering
    - Filter emails by admin_user_id matching authenticated user
    - Order results by received_at DESC (newest first)
    - Return only necessary fields for inbox view (id, fromAddress, fromName, subject, bodyPreview, status, isStarred, receivedAt, readAt)
    - Generate bodyPreview as first 200 characters of body_text
    - _Requirements: 1.2, 1.4, 1.5_

  - [x] 3.6 Add unread count to response
    - Query count of emails with status='unread' for authenticated user
    - Include unreadCount in response
    - _Requirements: 7.3_

  - [ ]* 3.7 Write property test for email authorization
    - **Property 1: Email Authorization**
    - **Validates: Requirements 1.2, 9.2**

  - [ ]* 3.8 Write property test for chronological ordering
    - **Property 2: Email Chronological Ordering**
    - **Validates: Requirements 1.4**

  - [ ]* 3.9 Write property test for pagination subset correctness
    - **Property 25: Pagination Subset Correctness**
    - **Validates: Requirements 8.2**

  - [ ]* 3.10 Write property test for pagination metadata accuracy
    - **Property 26: Pagination Metadata Accuracy**
    - **Validates: Requirements 8.3**

  - [ ]* 3.11 Write property test for status filter application
    - **Property 18: Status Filter Application**
    - **Validates: Requirements 5.3**

  - [ ]* 3.12 Write property test for search result matching
    - **Property 17: Search Result Matching**
    - **Validates: Requirements 5.1**

  - [ ]* 3.13 Write unit tests for email list endpoint
    - Test authentication requirement (401 without token)
    - Test pagination with various page numbers
    - Test status filtering (all, unread, read, archived)
    - Test search query matching
    - Test combined filters (status + search)
    - Test empty results
    - _Requirements: 1.1, 5.1, 5.3, 8.1, 9.1_

- [x] 4. Implement email detail API endpoint
  - [x] 4.1 Create GET /api/admin/mailbox/:id endpoint
    - Create route in `backend/src/routes/admin/mailbox.ts`
    - Apply auth middleware
    - Parse email ID from URL parameter
    - _Requirements: 2.1_

  - [x] 4.2 Implement email retrieval with authorization
    - Query admin_emails table by ID
    - Verify email belongs to authenticated user (admin_user_id match)
    - Return 404 if email not found
    - Return 403 if email belongs to different user
    - Return all email fields including full body_text and body_html
    - _Requirements: 2.2, 9.2, 9.3_

  - [x] 4.3 Implement automatic read status update
    - Check if email status is 'unread'
    - If unread, update status to 'read' and set read_at timestamp
    - Return updated email data
    - _Requirements: 2.3_

  - [x] 4.4 Add audit logging for email access
    - Log email access attempt with admin user ID, email ID, timestamp, and action type
    - Use existing logger utility
    - _Requirements: 9.4_

  - [ ]* 4.5 Write property test for automatic read status on open
    - **Property 5: Automatic Read Status on Open**
    - **Validates: Requirements 2.3**

  - [ ]* 4.6 Write property test for detail view completeness
    - **Property 4: Detail View Completeness**
    - **Validates: Requirements 2.2**

  - [ ]* 4.7 Write property test for cross-user access prevention
    - **Property 28: Cross-User Access Prevention**
    - **Validates: Requirements 9.3**

  - [ ]* 4.8 Write unit tests for email detail endpoint
    - Test successful email retrieval
    - Test 404 for non-existent email
    - Test 403 for unauthorized access
    - Test automatic status update from unread to read
    - Test audit log creation
    - _Requirements: 2.1, 2.3, 9.3, 9.4_

- [x] 5. Implement email status management endpoints
  - [x] 5.1 Create PATCH /api/admin/mailbox/:id/status endpoint
    - Create route in `backend/src/routes/admin/mailbox.ts`
    - Apply auth middleware
    - Parse email ID and status from request
    - Validate status value (unread, read, archived, deleted)
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

  - [x] 5.2 Implement status update logic
    - Verify email belongs to authenticated user
    - Update status field in database
    - Set read_at timestamp when status changes to 'read'
    - Clear read_at timestamp when status changes to 'unread'
    - Set deleted_at timestamp when status changes to 'deleted'
    - Return updated email data
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

  - [x] 5.3 Create PATCH /api/admin/mailbox/:id/star endpoint
    - Create route for toggling star status
    - Apply auth middleware
    - Parse email ID and isStarred boolean from request
    - Verify email belongs to authenticated user
    - Update is_starred field in database
    - Return updated email data
    - _Requirements: 3.1 (implicit)_

  - [ ]* 5.4 Write property test for manual read status update
    - **Property 8: Manual Read Status Update**
    - **Validates: Requirements 3.1**

  - [ ]* 5.5 Write property test for unread status update
    - **Property 9: Unread Status Update**
    - **Validates: Requirements 3.2**

  - [ ]* 5.6 Write property test for archive status update
    - **Property 11: Archive Status Update**
    - **Validates: Requirements 3.4**

  - [ ]* 5.7 Write property test for delete status update
    - **Property 13: Delete Status Update**
    - **Validates: Requirements 4.2**

  - [ ]* 5.8 Write unit tests for status management endpoints
    - Test status update with valid values
    - Test status update with invalid values (400 error)
    - Test unauthorized access (403 error)
    - Test star toggle
    - Test timestamp updates (read_at, deleted_at)
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

- [x] 6. Implement bulk operations and utility endpoints
  - [x] 6.1 Create POST /api/admin/mailbox/bulk endpoint
    - Create route in `backend/src/routes/admin/mailbox.ts`
    - Apply auth middleware
    - Parse emailIds array and action from request body
    - Validate action value (mark_read, mark_unread, archive, delete, star, unstar)
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

  - [x] 6.2 Implement bulk update logic
    - Verify all emails belong to authenticated user
    - Apply action to all specified emails in single transaction
    - Update status or is_starred based on action
    - Set appropriate timestamps (read_at, deleted_at)
    - Return count of updated emails
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

  - [x] 6.3 Create GET /api/admin/mailbox/unread-count endpoint
    - Create route for fetching unread count
    - Apply auth middleware
    - Query count of emails with status='unread' for authenticated user
    - Return unreadCount in response
    - _Requirements: 7.3_

  - [ ]* 6.4 Write property test for unread count increment
    - **Property 23: Unread Count Increment**
    - **Validates: Requirements 6.5**

  - [ ]* 6.5 Write unit tests for bulk operations
    - Test bulk mark as read
    - Test bulk mark as unread
    - Test bulk archive
    - Test bulk delete
    - Test bulk star/unstar
    - Test unauthorized access (403 for emails not owned by user)
    - Test transaction rollback on partial failure
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

  - [ ]* 6.6 Write unit tests for unread count endpoint
    - Test correct count returned
    - Test count updates after status changes
    - Test authentication requirement
    - _Requirements: 7.3_

- [x] 7. Implement email address management endpoints
  - [x] 7.1 Create GET /api/admin/mailbox/addresses endpoint
    - Create route in `backend/src/routes/admin/mailbox.ts`
    - Apply auth middleware
    - Query admin_email_addresses table for authenticated user
    - Return list of email addresses with id, emailAddress, isPrimary, isActive
    - _Requirements: 6.2_

  - [x] 7.2 Create POST /api/admin/mailbox/addresses endpoint
    - Create route for adding new email address
    - Apply auth middleware
    - Parse emailAddress and isPrimary from request body
    - Validate email address format
    - Insert new record into admin_email_addresses table
    - Return created email address
    - _Requirements: 6.2_

  - [x] 7.3 Create DELETE /api/admin/mailbox/addresses/:id endpoint
    - Create route for removing email address
    - Apply auth middleware
    - Verify email address belongs to authenticated user
    - Delete record from admin_email_addresses table
    - Return success response
    - _Requirements: 6.2_

  - [ ]* 7.4 Write unit tests for email address management
    - Test listing email addresses
    - Test adding new email address
    - Test removing email address
    - Test validation errors
    - Test unauthorized access
    - _Requirements: 6.2_

- [x] 8. Checkpoint - Backend API complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create frontend mailbox service layer
  - [x] 9.1 Create mailbox API service
    - Create `admin-frontend/src/services/mailbox.ts`
    - Define Email and EmailListResponse TypeScript interfaces
    - Implement listEmails function with pagination, status filter, and search parameters
    - Implement getEmail function for fetching email detail
    - Implement updateStatus function for changing email status
    - Implement toggleStar function for starring/unstarring emails
    - Implement bulkAction function for bulk operations
    - Implement getUnreadCount function for notification badge
    - Use existing api client from shared/src/services/api.ts
    - _Requirements: 1.1, 2.1, 3.1, 7.1_

  - [ ]* 9.2 Write unit tests for mailbox service
    - Test all service methods call correct API endpoints
    - Test query parameter construction
    - Test error handling
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 10. Implement MailboxPage component
  - [x] 10.1 Create MailboxPage component structure
    - Create `admin-frontend/src/pages/MailboxPage.tsx` and `MailboxPage.css`
    - Define component state (emails, selectedEmail, loading, error, currentPage, totalPages, unreadCount, statusFilter, searchQuery)
    - Set up component layout with filters, inbox view, and detail view sections
    - _Requirements: 1.1_

  - [x] 10.2 Implement email fetching logic
    - Create useEffect hook to fetch emails on mount and when filters change
    - Call mailboxService.listEmails with current page, status filter, and search query
    - Update component state with fetched emails and pagination data
    - Handle loading and error states
    - _Requirements: 1.1, 1.4_

  - [x] 10.3 Implement email polling for real-time updates
    - Create custom hook useEmailPolling in `admin-frontend/src/hooks/useEmailPolling.ts`
    - Poll mailboxService.getUnreadCount every 30 seconds
    - Update unreadCount state when new emails arrive
    - Clean up interval on component unmount
    - _Requirements: 7.2, 7.5_

  - [x] 10.4 Implement filter and search handlers
    - Create onStatusFilterChange handler to update statusFilter state
    - Create onSearchChange handler with debouncing (500ms delay)
    - Create onSearchSubmit handler to trigger email fetch
    - Reset to page 1 when filters change
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.5 Implement pagination handlers
    - Create onPageChange handler to update currentPage state
    - Scroll to top of inbox view when page changes
    - Fetch new page of emails
    - _Requirements: 8.1, 8.2, 8.5_

  - [ ]* 10.6 Write unit tests for MailboxPage component
    - Test component renders correctly
    - Test email fetching on mount
    - Test filter changes trigger refetch
    - Test pagination navigation
    - Test polling setup and cleanup
    - _Requirements: 1.1, 5.3, 8.1_

- [x] 11. Implement InboxView component
  - [x] 11.1 Create InboxView component structure
    - Create `admin-frontend/src/components/InboxView.tsx` and `InboxView.css`
    - Define props interface (emails, selectedEmailId, onEmailSelect, onStatusChange, onStarToggle, onBulkAction, loading)
    - Create table layout with columns for checkbox, star, sender, subject, date, status
    - _Requirements: 1.4, 1.5_

  - [x] 11.2 Implement email list rendering
    - Map over emails array to render table rows
    - Display sender (fromName or fromAddress), subject, timestamp, status badge
    - Apply different styling for read vs unread emails (bold text for unread)
    - Show loading spinner when loading prop is true
    - _Requirements: 1.5, 3.3_

  - [x] 11.3 Implement email selection
    - Add onClick handler to each row to call onEmailSelect
    - Highlight selected email row
    - Add checkbox for bulk selection
    - Track selected email IDs in component state
    - _Requirements: 2.1_

  - [x] 11.4 Implement inline actions
    - Add star/unstar button with onClick handler calling onStarToggle
    - Add status change buttons (mark read/unread, archive, delete) on hover
    - Call onStatusChange with email ID and new status
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

  - [x] 11.5 Implement bulk actions toolbar
    - Show toolbar when emails are selected
    - Add buttons for bulk actions (mark read, mark unread, archive, delete, star, unstar)
    - Call onBulkAction with selected email IDs and action
    - Clear selection after bulk action completes
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

  - [ ]* 11.6 Write property test for inbox display completeness
    - **Property 3: Inbox Display Completeness**
    - **Validates: Requirements 1.5**

  - [ ]* 11.7 Write property test for read/unread visual distinction
    - **Property 10: Read/Unread Visual Distinction**
    - **Validates: Requirements 3.3**

  - [ ]* 11.8 Write unit tests for InboxView component
    - Test email list renders correctly
    - Test email selection
    - Test bulk selection
    - Test inline actions (star, status change)
    - Test bulk actions toolbar
    - Test loading state
    - _Requirements: 1.5, 3.1, 3.3_

- [x] 12. Implement EmailDetailView component
  - [x] 12.1 Create EmailDetailView component structure
    - Create `admin-frontend/src/components/EmailDetailView.tsx` and `EmailDetailView.css`
    - Define props interface (email, onClose, onStatusChange, onStarToggle, onDelete)
    - Create layout with header (from, to, cc, subject, date), body, and action buttons
    - _Requirements: 2.1, 2.2_

  - [x] 12.2 Implement email header display
    - Display from address and name
    - Display to address
    - Display cc addresses if present
    - Display subject
    - Display formatted timestamp
    - Display status badge
    - _Requirements: 2.2_

  - [x] 12.3 Implement email body rendering with HTML sanitization
    - Install DOMPurify library for frontend HTML sanitization
    - Create sanitizeEmailHtml utility function using DOMPurify
    - Configure allowed tags (p, br, strong, em, u, a, ul, ol, li, blockquote) and attributes (href, target)
    - Render sanitized HTML body if bodyHtml exists, otherwise render plain text body
    - Preserve line breaks in plain text using CSS white-space: pre-wrap
    - _Requirements: 2.4, 2.5_

  - [x] 12.4 Implement action buttons
    - Add back button to call onClose and return to inbox
    - Add star/unstar button calling onStarToggle
    - Add status change buttons (mark unread, archive) calling onStatusChange
    - Add delete button with confirmation dialog calling onDelete
    - _Requirements: 3.1, 3.2, 3.4, 4.1, 4.2_

  - [ ]* 12.5 Write property test for HTML sanitization
    - **Property 7: HTML Sanitization**
    - **Validates: Requirements 2.5**

  - [ ]* 12.6 Write property test for line break preservation
    - **Property 6: Line Break Preservation**
    - **Validates: Requirements 2.4**

  - [ ]* 12.7 Write unit tests for EmailDetailView component
    - Test email header displays all fields
    - Test HTML body rendering with sanitization
    - Test plain text body rendering
    - Test action buttons call correct handlers
    - Test delete confirmation dialog
    - _Requirements: 2.2, 2.4, 2.5_

- [x] 13. Implement EmailFilters component
  - [x] 13.1 Create EmailFilters component
    - Create `admin-frontend/src/components/EmailFilters.tsx` and `EmailFilters.css`
    - Define props interface (statusFilter, searchQuery, onStatusFilterChange, onSearchChange, onSearchSubmit)
    - Create layout with status dropdown and search input
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 13.2 Implement status filter dropdown
    - Create dropdown with options: All, Unread, Read, Archived
    - Call onStatusFilterChange when selection changes
    - Highlight current filter
    - _Requirements: 5.2, 5.3_

  - [x] 13.3 Implement search input with debouncing
    - Create search input field
    - Implement debouncing (500ms delay) before calling onSearchChange
    - Add search button to call onSearchSubmit
    - Add clear button to reset search query
    - _Requirements: 5.1_

  - [ ]* 13.4 Write unit tests for EmailFilters component
    - Test status filter dropdown changes
    - Test search input with debouncing
    - Test search submit
    - Test clear filters
    - _Requirements: 5.1, 5.3_

- [x] 14. Implement MailboxNotificationBadge component
  - [x] 14.1 Create MailboxNotificationBadge component
    - Create `admin-frontend/src/components/MailboxNotificationBadge.tsx` and `MailboxNotificationBadge.css`
    - Define props interface (unreadCount)
    - Render red badge with unread count
    - Hide badge when unreadCount is 0
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 14.2 Integrate badge into AdminLayout navigation
    - Import MailboxNotificationBadge in `admin-frontend/src/components/AdminLayout.tsx`
    - Add mailbox navigation link with badge
    - Fetch unread count on AdminLayout mount
    - Update badge when unread count changes
    - _Requirements: 7.1, 7.3_

  - [ ]* 14.3 Write property test for notification badge display
    - **Property 24: Notification Badge Display**
    - **Validates: Requirements 7.1, 7.3**

  - [ ]* 14.4 Write unit tests for MailboxNotificationBadge component
    - Test badge displays correct count
    - Test badge hidden when count is 0
    - Test badge styling
    - _Requirements: 7.1, 7.4_

- [x] 15. Implement Pagination component
  - [x] 15.1 Create or reuse Pagination component
    - Check if existing Pagination component exists in admin-frontend
    - If not, create `admin-frontend/src/components/Pagination.tsx` and `Pagination.css`
    - Define props interface (currentPage, totalPages, onPageChange)
    - Render page numbers, previous/next buttons, and page info
    - _Requirements: 8.1, 8.3_

  - [x] 15.2 Integrate Pagination into MailboxPage
    - Add Pagination component to MailboxPage below InboxView
    - Pass currentPage, totalPages, and onPageChange props
    - Display "Showing X-Y of Z emails" text
    - _Requirements: 8.1, 8.3_

  - [ ]* 15.3 Write unit tests for Pagination component
    - Test page navigation
    - Test previous/next buttons
    - Test disabled state for first/last page
    - Test page info display
    - _Requirements: 8.1, 8.3_

- [x] 16. Implement HTML sanitization utilities
  - [x] 16.1 Create backend HTML sanitization utility
    - Install sanitize-html package if not already installed
    - Create `backend/src/utils/sanitize.ts`
    - Implement sanitizeEmailHtml function using sanitize-html
    - Configure allowed tags (p, br, strong, em, u, a, ul, ol, li, blockquote) and attributes
    - Configure allowed schemes (http, https, mailto)
    - Export function for use in webhook route
    - _Requirements: 2.5_

  - [x] 16.2 Apply backend sanitization in webhook
    - Import sanitizeEmailHtml in webhook route
    - Sanitize bodyHtml before storing in database
    - Ensure sanitization happens for all email service providers
    - _Requirements: 2.5_

  - [x] 16.3 Create frontend HTML sanitization utility
    - Install dompurify package and @types/dompurify
    - Create `admin-frontend/src/utils/sanitize.ts`
    - Implement sanitizeEmailHtml function using DOMPurify
    - Configure allowed tags and attributes (same as backend)
    - Export function for use in EmailDetailView
    - _Requirements: 2.5_

  - [ ]* 16.4 Write property test for backend HTML sanitization
    - **Property 7: HTML Sanitization** (backend)
    - **Validates: Requirements 2.5**

  - [ ]* 16.5 Write property test for frontend HTML sanitization
    - **Property 7: HTML Sanitization** (frontend)
    - **Validates: Requirements 2.5**

  - [ ]* 16.6 Write unit tests for sanitization utilities
    - Test script tag removal
    - Test event handler removal (onclick, onerror, etc.)
    - Test iframe removal
    - Test safe HTML preservation (p, strong, em, a, etc.)
    - Test link sanitization (only http/https/mailto)
    - _Requirements: 2.5_

- [x] 17. Implement cleanup job for deleted emails
  - [x] 17.1 Create cleanup job script
    - Create `backend/src/jobs/cleanup-deleted-emails.ts`
    - Implement cleanupDeletedEmails function to delete emails with status='deleted' and deleted_at > 30 days ago
    - Use database connection pool to execute DELETE query
    - Log number of emails deleted using Winston logger
    - Handle errors gracefully and log failures
    - _Requirements: 4.3, 10.3_

  - [x] 17.2 Schedule cleanup job
    - Install node-schedule package if not already installed
    - Implement scheduleEmailCleanup function to run daily at 2 AM
    - Use cron expression '0 2 * * *'
    - Call scheduleEmailCleanup in backend/src/index.ts on server startup
    - _Requirements: 4.3, 10.3_

  - [ ]* 17.3 Write property test for deleted email retention
    - **Property 14: Deleted Email Retention**
    - **Validates: Requirements 4.3, 10.3**

  - [ ]* 17.4 Write unit tests for cleanup job
    - Test emails older than 30 days are deleted
    - Test emails newer than 30 days are retained
    - Test only deleted status emails are affected
    - Test error handling
    - _Requirements: 4.3, 10.3_

- [x] 18. Checkpoint - Core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Add frontend routing and navigation
  - [x] 19.1 Add mailbox route to admin frontend
    - Open `admin-frontend/src/App.tsx`
    - Add route for /mailbox path with MailboxPage component
    - Wrap in ProtectedRoute and AdminLayout
    - Ensure route is accessible only to authenticated admin users
    - _Requirements: 1.1, 1.3_

  - [x] 19.2 Add mailbox navigation link to AdminLayout
    - Open `admin-frontend/src/components/AdminLayout.tsx`
    - Add navigation link to /mailbox with "Mailbox" label
    - Position link in appropriate location in navigation menu
    - Add MailboxNotificationBadge next to link
    - _Requirements: 1.1, 7.1_

  - [ ]* 19.3 Write unit tests for routing
    - Test mailbox route renders MailboxPage
    - Test unauthenticated users redirected to login
    - Test navigation link present in AdminLayout
    - _Requirements: 1.1, 1.3_

- [x] 20. Implement error handling and loading states
  - [x] 20.1 Add error handling to MailboxPage
    - Wrap API calls in try-catch blocks
    - Set error state with user-friendly error messages
    - Display error messages using Toast component or error banner
    - Add retry button for failed requests
    - _Requirements: 1.1_

  - [x] 20.2 Add loading states to all components
    - Show loading spinner in InboxView while fetching emails
    - Show loading spinner in EmailDetailView while fetching email detail
    - Disable action buttons during API calls
    - Show skeleton loaders for better UX
    - _Requirements: 1.1_

  - [x] 20.3 Implement confirmation dialogs
    - Add confirmation dialog for delete action (using existing ConfirmDialog component)
    - Add confirmation dialog for bulk delete action
    - Display appropriate warning messages
    - _Requirements: 4.1_

  - [ ]* 20.4 Write unit tests for error handling
    - Test error messages displayed on API failures
    - Test retry functionality
    - Test confirmation dialogs
    - _Requirements: 1.1, 4.1_

- [ ] 21. Implement remaining property-based tests
  - [ ]* 21.1 Write property test for archived email exclusion
    - **Property 12: Archived Email Exclusion**
    - **Validates: Requirements 3.5**

  - [ ]* 21.2 Write property test for deleted email exclusion from inbox
    - **Property 15: Deleted Email Exclusion from Inbox**
    - **Validates: Requirements 4.4**

  - [ ]* 21.3 Write property test for trash view filtering
    - **Property 16: Trash View Filtering**
    - **Validates: Requirements 4.5**

  - [ ]* 21.4 Write property test for search term highlighting
    - **Property 19: Search Term Highlighting**
    - **Validates: Requirements 5.5**

  - [ ]* 21.5 Write property test for authentication requirement
    - **Property 27: Authentication Requirement**
    - **Validates: Requirements 9.1**

  - [ ]* 21.6 Write property test for access audit logging
    - **Property 29: Access Audit Logging**
    - **Validates: Requirements 9.4**

- [ ] 22. Implement integration tests
  - [ ]* 22.1 Write integration test for email reception flow
    - Test webhook receives email → database record created → admin sees email in inbox
    - Use test database and mock email service provider
    - Verify end-to-end flow
    - _Requirements: 6.1, 1.1_

  - [ ]* 22.2 Write integration test for email management flow
    - Test admin opens email → status changes to read → unread count decreases
    - Verify automatic status update
    - Verify unread count accuracy
    - _Requirements: 2.3, 7.3_

  - [ ]* 22.3 Write integration test for search and filter flow
    - Test admin enters search → API called with query → results filtered
    - Test status filter application
    - Test combined filters
    - _Requirements: 5.1, 5.3_

  - [ ]* 22.4 Write integration test for bulk operations flow
    - Test admin selects multiple emails → bulk action applied → all emails updated
    - Test transaction consistency
    - _Requirements: 3.1, 3.2, 3.4, 4.2_

- [ ] 23. Add security enhancements
  - [ ] 23.1 Implement rate limiting for webhook endpoint
    - Apply rate limiting middleware to /api/mailbox/webhook
    - Configure appropriate limits (e.g., 100 requests per minute per IP)
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 9.5_

  - [ ] 23.2 Implement webhook signature verification
    - Add signature verification for SendGrid webhooks (verify X-Twilio-Email-Event-Webhook-Signature header)
    - Add signature verification for Mailgun webhooks (verify X-Mailgun-Signature header)
    - Add signature verification for AWS SES webhooks (verify SNS signature)
    - Reject requests with invalid signatures
    - _Requirements: 9.5_

  - [ ] 23.3 Implement email size limits
    - Add validation to reject emails with body size > 10MB
    - Return appropriate error response
    - Log oversized email attempts
    - _Requirements: 9.5_

  - [ ] 23.4 Enhance audit logging
    - Log all email access attempts with user ID, email ID, timestamp, action, and IP address
    - Log failed authentication attempts
    - Log unauthorized access attempts
    - Use Winston logger with appropriate log levels
    - _Requirements: 9.4_

  - [ ]* 23.5 Write unit tests for security features
    - Test rate limiting enforcement
    - Test webhook signature verification
    - Test email size limit validation
    - Test audit log creation
    - _Requirements: 9.4, 9.5_

- [ ] 24. Add styling and responsive design
  - [ ] 24.1 Style MailboxPage component
    - Create responsive layout for desktop and mobile
    - Add CSS for inbox/detail split view on desktop
    - Add CSS for stacked view on mobile
    - Ensure consistent styling with existing admin portal
    - _Requirements: 1.1_

  - [ ] 24.2 Style InboxView component
    - Style email list table with hover effects
    - Add visual distinction for read/unread emails (bold for unread)
    - Style status badges with appropriate colors
    - Add responsive table layout for mobile
    - _Requirements: 1.5, 3.3_

  - [ ] 24.3 Style EmailDetailView component
    - Style email header with clear visual hierarchy
    - Style email body with proper typography
    - Style action buttons with consistent design
    - Add responsive layout for mobile
    - _Requirements: 2.2_

  - [ ] 24.4 Style EmailFilters and Pagination components
    - Style filter controls with consistent design
    - Style pagination controls
    - Ensure accessibility (keyboard navigation, focus states)
    - _Requirements: 5.1, 8.1_

  - [ ] 24.5 Style MailboxNotificationBadge component
    - Style badge with red background and white text
    - Position badge correctly next to navigation link
    - Ensure badge is visible and readable
    - _Requirements: 7.1_

- [ ] 25. Add accessibility features
  - [ ] 25.1 Ensure keyboard navigation support
    - Add keyboard shortcuts for common actions (j/k for next/prev email, enter to open, delete key to delete)
    - Ensure all interactive elements are keyboard accessible
    - Add proper focus management when opening/closing detail view
    - Test with keyboard-only navigation
    - _Requirements: 1.1_

  - [ ] 25.2 Add ARIA labels and roles
    - Add ARIA labels to all buttons and interactive elements
    - Add ARIA live regions for notification updates
    - Add ARIA roles for semantic structure (navigation, main, complementary)
    - Ensure screen reader compatibility
    - _Requirements: 1.1_

  - [ ] 25.3 Ensure color contrast compliance
    - Verify all text meets WCAG AA contrast requirements (4.5:1 for normal text)
    - Ensure status badges have sufficient contrast
    - Test with color blindness simulators
    - _Requirements: 1.1_

- [ ] 26. Add documentation
  - [ ] 26.1 Document webhook setup for email service providers
    - Create documentation for SendGrid Inbound Parse setup
    - Create documentation for Mailgun Routes setup
    - Create documentation for AWS SES setup
    - Include webhook URL format and required configuration
    - Document signature verification setup
    - _Requirements: 6.1_

  - [ ] 26.2 Document admin email address management
    - Document how to add/remove admin email addresses
    - Document how to set primary email address
    - Document default mailbox configuration
    - _Requirements: 6.2, 6.3_

  - [ ] 26.3 Create API documentation
    - Document all mailbox API endpoints with request/response examples
    - Document authentication requirements
    - Document error codes and responses
    - Add to existing API-DOCUMENTATION.md file
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ] 26.4 Create user guide for admin mailbox
    - Document how to access mailbox
    - Document how to read, archive, and delete emails
    - Document how to use search and filters
    - Document bulk operations
    - Add screenshots or diagrams
    - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [ ] 27. Final checkpoint and integration
  - [ ] 27.1 Run all tests and verify coverage
    - Run backend tests: `npm run test:backend`
    - Run frontend tests: `npm run test:frontend`
    - Verify minimum 80% backend coverage and 75% frontend coverage
    - Fix any failing tests
    - _Requirements: All_

  - [ ] 27.2 Run database migrations
    - Test migration on clean database
    - Verify all tables and indexes created correctly
    - Test rollback if migration script supports it
    - _Requirements: 10.1, 10.5_

  - [ ] 27.3 Test end-to-end workflows manually
    - Test email reception via webhook (use test email service provider)
    - Test viewing emails in inbox
    - Test opening email detail and automatic read status
    - Test search and filtering
    - Test status changes (read, unread, archive, delete)
    - Test bulk operations
    - Test notification badge updates
    - Test pagination
    - _Requirements: All_

  - [ ] 27.4 Verify security requirements
    - Test authentication enforcement on all endpoints
    - Test authorization (users can only access their own emails)
    - Test HTML sanitization with malicious payloads
    - Test rate limiting on webhook endpoint
    - Test webhook signature verification
    - Verify HTTPS enforcement
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 2.5_

  - [ ] 27.5 Performance testing
    - Test search performance with 10,000 emails
    - Test pagination performance
    - Test webhook processing time
    - Verify all operations meet performance requirements
    - _Requirements: 5.4, 6.4, 8.4_

  - [ ] 27.6 Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints (tasks 8, 18, 27.6) ensure incremental validation
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and UI interactions
- Integration tests validate end-to-end workflows
- The implementation uses TypeScript throughout (backend and frontend)
- HTML sanitization is applied both on backend (storage) and frontend (display) for defense in depth
- Real-time updates use polling (30-second interval) rather than WebSockets for simplicity
- Deleted emails are soft-deleted and retained for 30 days before permanent removal
- The webhook endpoint supports multiple email service providers (SendGrid, Mailgun, AWS SES)
