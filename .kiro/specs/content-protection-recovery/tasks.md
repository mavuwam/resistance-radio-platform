# Implementation Plan: Content Protection and Recovery System

## Overview

This implementation plan converts the Content Protection and Recovery System design into actionable coding tasks. The system adds soft deletion with trash/recovery capabilities and protected content flags to prevent accidental deletion of critical content in the Zimbabwe Voice admin portal.

The implementation follows this sequence:
1. Database schema migration (foundation for all features)
2. Backend API modifications (soft delete logic and protection checks)
3. New backend endpoints (trash view, restore, protect/unprotect)
4. Scheduled cleanup job (automated trash management)
5. Frontend trash view (admin interface for recovery)
6. Frontend protection UI (toggle and visual indicators)
7. Frontend content table updates (lock icons and disabled buttons)
8. Integration and testing

## Tasks

- [x] 1. Database schema migration
  - [x] 1.1 Create migration file for soft delete and protection columns
    - Create `backend/src/db/migrations/add_soft_delete_and_protection.sql`
    - Add `deleted_at TIMESTAMP DEFAULT NULL` to all content tables (articles, shows, episodes, events, resources)
    - Add `deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL` to all content tables
    - Add `protected BOOLEAN DEFAULT false NOT NULL` to all content tables
    - Create partial indexes on `deleted_at` columns (WHERE deleted_at IS NOT NULL)
    - Create partial indexes on `protected` columns (WHERE protected = true)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 1.2 Write property test for migration data preservation
    - **Property 28: Migration Preserves Existing Data**
    - **Validates: Requirements 12.1**
  
  - [ ]* 1.3 Write property test for migration default values
    - **Property 29: Migration Sets Default Values**
    - **Validates: Requirements 12.2, 12.3**
  
  - [x] 1.4 Run migration and verify schema changes
    - Execute migration using `npm run migrate --workspace=backend`
    - Verify all columns added correctly
    - Verify indexes created
    - Verify existing data preserved
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 2. Backend API query modifications
  - [x] 2.1 Update all GET endpoints to exclude soft-deleted items
    - Modify queries in `backend/src/routes/articles.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/shows.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/episodes.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/events.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/resources.ts` to add `WHERE deleted_at IS NULL`
    - _Requirements: 1.4_
  
  - [x] 2.2 Update admin GET endpoints to exclude soft-deleted items
    - Modify queries in `backend/src/routes/admin/articles.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/admin/shows.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/admin/episodes.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/admin/events.ts` to add `WHERE deleted_at IS NULL`
    - Modify queries in `backend/src/routes/admin/resources.ts` to add `WHERE deleted_at IS NULL`
    - _Requirements: 1.5_
  
  - [ ]* 2.3 Write property test for soft-deleted items exclusion from public queries
    - **Property 2: Soft-Deleted Items Excluded from Public Queries**
    - **Validates: Requirements 1.4**
  
  - [ ]* 2.4 Write property test for soft-deleted items exclusion from admin queries
    - **Property 3: Soft-Deleted Items Excluded from Admin List Queries**
    - **Validates: Requirements 1.5**

- [-] 3. Backend DELETE endpoint modifications
  - [x] 3.1 Convert DELETE endpoints to soft delete for articles
    - Modify `backend/src/routes/admin/articles.ts` DELETE endpoint
    - Check if item exists and is not already deleted
    - Check if item is protected and user is not super admin (return 403 if blocked)
    - Update query to `SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW()`
    - Add audit logging with Winston
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4, 11.1_
  
  - [x] 3.2 Convert DELETE endpoints to soft delete for shows
    - Modify `backend/src/routes/admin/shows.ts` DELETE endpoint
    - Apply same logic as articles (protection check, soft delete, audit log)
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4, 11.1_
  
  - [x] 3.3 Convert DELETE endpoints to soft delete for episodes
    - Modify `backend/src/routes/admin/episodes.ts` DELETE endpoint
    - Apply same logic as articles (protection check, soft delete, audit log)
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4, 11.1_
  
  - [x] 3.4 Convert DELETE endpoints to soft delete for events
    - Modify `backend/src/routes/admin/events.ts` DELETE endpoint
    - Apply same logic as articles (protection check, soft delete, audit log)
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4, 11.1_
  
  - [x] 3.5 Convert DELETE endpoints to soft delete for resources
    - Modify `backend/src/routes/admin/resources.ts` DELETE endpoint
    - Apply same logic as articles (protection check, soft delete, audit log)
    - _Requirements: 1.1, 1.2, 1.3, 6.3, 6.4, 11.1_
  
  - [ ]* 3.6 Write property test for soft delete preserves data
    - **Property 1: Soft Delete Preserves Data**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.6**
  
  - [ ]* 3.7 Write property test for regular admins cannot delete protected content
    - **Property 19: Regular Admins Cannot Delete Protected Content**
    - **Validates: Requirements 6.3**
  
  - [ ]* 3.8 Write property test for super admins can delete protected content
    - **Property 20: Super Admins Can Delete Protected Content**
    - **Validates: Requirements 6.5**
  
  - [ ]* 3.9 Write unit tests for DELETE endpoint error cases
    - Test 404 when item not found
    - Test 403 when regular admin attempts to delete protected content
    - Test successful soft delete for unprotected content
    - Test successful soft delete for protected content by super admin
    - _Requirements: 6.3, 6.4, 10.7_

- [x] 4. Checkpoint - Ensure soft delete works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Backend trash and restore endpoints
  - [x] 5.1 Create GET /api/admin/trash endpoint
    - Create or modify `backend/src/routes/admin/trash.ts`
    - Implement endpoint with authentication and role-based access control
    - Query all content types for items WHERE deleted_at IS NOT NULL
    - Join with users table to get deleted_by_email
    - Order by deleted_at DESC and LIMIT 5 per content type
    - Return grouped response by content type
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 10.1, 10.5_
  
  - [x] 5.2 Create POST /api/admin/:contentType/:id/restore endpoint
    - Add restore endpoint to `backend/src/routes/admin/trash.ts`
    - Validate content type parameter
    - Check if item exists and is deleted (return 404 if not)
    - Update query to `SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()`
    - Add audit logging with Winston
    - Return restored item
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 10.2, 10.5, 10.7, 11.2_
  
  - [ ]* 5.3 Write property test for trash view limits results
    - **Property 4: Trash View Limits Results**
    - **Validates: Requirements 2.2, 2.6**
  
  - [ ]* 5.4 Write property test for trash items include required metadata
    - **Property 5: Trash Items Include Required Metadata**
    - **Validates: Requirements 2.3**
  
  - [ ]* 5.5 Write property test for trash items sorted by deletion date
    - **Property 6: Trash Items Sorted by Deletion Date**
    - **Validates: Requirements 2.4**
  
  - [ ]* 5.6 Write property test for trash endpoint groups by content type
    - **Property 7: Trash Endpoint Groups by Content Type**
    - **Validates: Requirements 2.5**
  
  - [ ]* 5.7 Write property test for restore clears deletion metadata
    - **Property 8: Restore Clears Deletion Metadata**
    - **Validates: Requirements 3.3, 3.4**
  
  - [ ]* 5.8 Write property test for restored items visible in queries
    - **Property 9: Restored Items Visible in Queries**
    - **Validates: Requirements 3.5**
  
  - [ ]* 5.9 Write unit tests for trash and restore endpoints
    - Test trash endpoint returns correct structure
    - Test trash endpoint requires authentication
    - Test restore endpoint returns 404 for non-existent item
    - Test restore endpoint success case
    - _Requirements: 10.5, 10.7_

- [ ] 6. Backend protection endpoints
  - [x] 6.1 Create PATCH /api/admin/:contentType/:id/protect endpoint
    - Add protect endpoint to `backend/src/routes/admin/trash.ts` or create new protection routes file
    - Require super admin role (use requireRole('administrator') middleware)
    - Validate content type parameter
    - Check if item exists and is not deleted (return 404 if not)
    - Update query to `SET protected = true, updated_at = NOW()`
    - Add audit logging with Winston
    - Return updated item
    - _Requirements: 5.3, 5.5, 8.1, 8.2, 8.3, 10.3, 10.4, 10.5, 10.6, 10.7, 11.3_
  
  - [x] 6.2 Create PATCH /api/admin/:contentType/:id/unprotect endpoint
    - Add unprotect endpoint to same file as protect endpoint
    - Require super admin role (use requireRole('administrator') middleware)
    - Validate content type parameter
    - Check if item exists and is not deleted (return 404 if not)
    - Update query to `SET protected = false, updated_at = NOW()`
    - Add audit logging with Winston
    - Return updated item
    - _Requirements: 5.4, 5.6, 8.1, 8.2, 8.3, 10.3, 10.4, 10.5, 10.6, 10.7, 11.3_
  
  - [ ]* 6.3 Write property test for protect endpoint sets flag
    - **Property 15: Protect Endpoint Sets Flag**
    - **Validates: Requirements 5.3**
  
  - [ ]* 6.4 Write property test for unprotect endpoint clears flag
    - **Property 16: Unprotect Endpoint Clears Flag**
    - **Validates: Requirements 5.4**
  
  - [ ]* 6.5 Write property test for protection round trip
    - **Property 17: Protection Round Trip**
    - **Validates: Requirements 5.3, 5.4**
  
  - [ ]* 6.6 Write property test for regular admins cannot modify protection
    - **Property 18: Regular Admins Cannot Modify Protection**
    - **Validates: Requirements 5.5, 5.6, 10.6**
  
  - [ ]* 6.7 Write unit tests for protection endpoints
    - Test protect endpoint requires super admin role
    - Test unprotect endpoint requires super admin role
    - Test protect endpoint returns 403 for regular admin
    - Test unprotect endpoint returns 403 for regular admin
    - Test protect endpoint success case
    - Test unprotect endpoint success case
    - _Requirements: 5.5, 5.6, 10.6, 10.7_

- [-] 7. Backend cleanup job implementation
  - [x] 7.1 Create scheduled cleanup job
    - Create `backend/src/jobs/cleanup-trash.ts`
    - Implement cleanupTrash function that queries all content types
    - Find items WHERE deleted_at < NOW() - INTERVAL '30 days' AND protected = false
    - Find items WHERE deleted_at < NOW() - INTERVAL '60 days' AND protected = true
    - For each expired item, extract file URL (audio_url, featured_image_url, cover_image_url, file_url)
    - Call deleteFromS3 for each file URL (wrap in try-catch to handle S3 errors)
    - Permanently delete from database using DELETE FROM query
    - Log each permanent deletion with Winston
    - Schedule job using node-cron to run daily at 2 AM ('0 2 * * *')
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 7.2 Register cleanup job in backend index.ts
    - Import cleanup job in `backend/src/index.ts`
    - Ensure job starts when server starts
    - _Requirements: 4.3_
  
  - [ ]* 7.3 Write property test for cleanup deletes expired regular items
    - **Property 10: Cleanup Deletes Expired Regular Items**
    - **Validates: Requirements 4.1**
  
  - [ ]* 7.4 Write property test for cleanup deletes expired protected items
    - **Property 11: Cleanup Deletes Expired Protected Items**
    - **Validates: Requirements 4.2**
  
  - [ ]* 7.5 Write property test for cleanup logs permanent deletions
    - **Property 12: Cleanup Logs Permanent Deletions**
    - **Validates: Requirements 4.4, 11.4**
  
  - [ ]* 7.6 Write property test for cleanup deletes associated S3 files
    - **Property 13: Cleanup Deletes Associated S3 Files**
    - **Validates: Requirements 4.5**
  
  - [ ]* 7.7 Write unit tests for cleanup job
    - Test cleanup deletes items older than 30 days (regular)
    - Test cleanup deletes items older than 60 days (protected)
    - Test cleanup preserves items within retention period
    - Test cleanup handles S3 errors gracefully
    - _Requirements: 4.1, 4.2, 4.5_

- [ ] 8. Checkpoint - Ensure backend implementation complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Frontend trash view page
  - [x] 9.1 Create AdminTrashPage component
    - Create `admin-frontend/src/pages/AdminTrashPage.tsx`
    - Implement component with tabs for each content type (Articles, Shows, Episodes, Events, Resources)
    - Fetch trash data from GET /api/admin/trash on mount
    - Display loading state while fetching
    - Display error state if fetch fails
    - Render TrashTable component for active tab
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 9.2 Create TrashTable component
    - Create `admin-frontend/src/components/TrashTable.tsx`
    - Accept props: items (TrashItem[]), contentType (string), onRestore (function)
    - Display table with columns: Title, Deleted Date, Deleted By, Protected Status, Actions
    - Format deleted_at timestamp as human-readable date
    - Display lock icon for protected items
    - Display Restore button for each item
    - Handle empty state (no deleted items)
    - _Requirements: 2.3, 2.4, 7.1, 7.2_
  
  - [x] 9.3 Implement restore functionality with confirmation
    - Add handleRestore function in AdminTrashPage
    - Show ConfirmDialog before restoring (reuse existing component)
    - Call POST /api/admin/:contentType/:id/restore on confirmation
    - Display success toast on successful restore
    - Display error toast on failure
    - Refresh trash data after successful restore
    - _Requirements: 3.1, 3.2, 3.6, 3.7_
  
  - [x] 9.4 Add trash page route to admin router
    - Update `admin-frontend/src/App.tsx` to add route for /admin/trash
    - Lazy load AdminTrashPage component
    - _Requirements: 2.1_
  
  - [x] 9.5 Add trash link to admin navigation
    - Update `admin-frontend/src/components/AdminLayout.tsx`
    - Add "Trash" link to navigation menu
    - _Requirements: 2.1_
  
  - [ ]* 9.6 Write unit tests for AdminTrashPage
    - Test component renders with tabs
    - Test fetches trash data on mount
    - Test displays trash items in table
    - Test restore button triggers confirmation dialog
    - Test successful restore removes item from trash
    - Test failed restore shows error message
    - _Requirements: 2.1, 2.2, 3.6, 3.7_

- [ ] 10. Frontend protection toggle component
  - [ ] 10.1 Create ProtectionToggle component
    - Create `admin-frontend/src/components/ProtectionToggle.tsx`
    - Accept props: contentType, contentId, protected (boolean), onToggle (function)
    - Only render if user role is 'administrator' (super admin)
    - Display lock icon with current protection state
    - Handle toggle click to call protect/unprotect endpoint
    - Show loading state during API call
    - Display success toast on successful toggle
    - Display error toast on failure with rollback
    - Implement optimistic UI updates
    - _Requirements: 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 10.2 Write property test for protection toggle round trip
    - **Property 17: Protection Round Trip (UI state)**
    - Test toggle state consistency across multiple clicks
    - Test optimistic UI updates with rollback on error
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 10.3 Write unit tests for ProtectionToggle
    - Test only renders for super admins
    - Test does not render for regular admins
    - Test displays correct icon based on protected state
    - Test clicking toggle calls API endpoint
    - Test successful toggle updates UI state
    - Test failed toggle shows error and reverts state
    - _Requirements: 8.4_

- [ ] 11. Frontend content table modifications
  - [ ] 11.1 Update AdminArticlesPage to show protection status
    - Modify `admin-frontend/src/pages/AdminArticlesPage.tsx`
    - Add lock icon column for protected articles
    - Add ProtectionToggle component to action column
    - Disable delete button for protected articles (regular admins only)
    - Add tooltip explaining protection status on hover
    - Update article list state when protection changes
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 11.2 Update AdminShowsPage to show protection status
    - Modify `admin-frontend/src/pages/AdminShowsPage.tsx`
    - Apply same changes as AdminArticlesPage
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 11.3 Update AdminEpisodesPage to show protection status
    - Modify `admin-frontend/src/pages/AdminEpisodesPage.tsx`
    - Apply same changes as AdminArticlesPage
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 11.4 Update AdminEventsPage to show protection status
    - Modify existing events admin page
    - Apply same changes as AdminArticlesPage
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 11.5 Update AdminResourcesPage to show protection status
    - Modify existing resources admin page
    - Apply same changes as AdminArticlesPage
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 11.6 Write unit tests for content table modifications
    - Test delete button disabled for protected content (regular admin)
    - Test delete button enabled for protected content (super admin)
    - Test lock icon displayed for protected items
    - Test protection toggle visible to super admins only
    - _Requirements: 6.1, 6.2, 7.4, 8.4_

- [ ] 12. Frontend API client updates
  - [x] 12.1 Add trash and restore API methods
    - Update `shared/src/service
s/api.ts`
    - Add `getTrash(): Promise<TrashResponse>` method
    - Add `restoreContent(contentType: string, id: number): Promise<any>` method
    - Add `protectContent(contentType: string, id: number): Promise<any>` method
    - Add `unprotectContent(contentType: string, id: number): Promise<any>` method
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 12.2 Update TypeScript interfaces for content models
    - Update content interfaces in `shared/src/types` or relevant type definition files
    - Add `deleted_at: string | null` field
    - Add `deleted_by: number | null` field
    - Add `protected: boolean` field
    - Create TrashItem interface
    - Create TrashResponse interface
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 13. Styling and accessibility
  - [ ] 13.1 Create styles for trash page
    - Create `admin-frontend/src/pages/AdminTrashPage.css`
    - Style tabs, table, and action buttons
    - Ensure responsive design for mobile
    - Add hover states and focus indicators
    - _Requirements: 2.1_
  
  - [ ] 13.2 Create styles for protection toggle
    - Create `admin-frontend/src/components/ProtectionToggle.css`
    - Style lock icon and toggle button
    - Add visual feedback for protected/unprotected states
    - Ensure accessibility (focus indicators, color contrast)
    - _Requirements: 7.4, 8.1_
  
  - [ ] 13.3 Update content table styles for lock icons
    - Modify existing CSS files for admin content pages
    - Add styles for lock icon column
    - Add styles for disabled delete button state
    - Add tooltip styles for protection status
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14. Integration and end-to-end testing
  - [ ]* 14.1 Write integration test for complete soft delete workflow
    - Create content → soft delete → view in trash → restore → verify visible
    - Test across all content types
    - _Requirements: 1.1, 1.2, 1.3, 3.3, 3.4, 3.5_
  
  - [ ]* 14.2 Write integration test for protection workflow
    - Create content → protect → attempt delete as regular admin → verify blocked
    - Create content → protect → delete as super admin → verify soft deleted
    - Test across all content types
    - _Requirements: 5.3, 6.3, 6.5_
  
  - [ ]* 14.3 Write integration test for cleanup workflow
    - Create content → soft delete → simulate 30 days → run cleanup → verify permanently deleted
    - Create protected content → soft delete → simulate 60 days → run cleanup → verify permanently deleted
    - Test S3 file deletion
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [ ]* 14.4 Write property test for all admins can edit protected content
    - **Property 21: All Admins Can Edit Protected Content**
    - **Validates: Requirements 6.6**
  
  - [ ]* 14.5 Write property test for all admins can publish protected content
    - **Property 22: All Admins Can Publish Protected Content**
    - **Validates: Requirements 6.7**
  
  - [ ]* 14.6 Write property test for unauthenticated requests rejected
    - **Property 23: Unauthenticated Requests Rejected**
    - **Validates: Requirements 10.5**
  
  - [ ]* 14.7 Write property test for error responses include correct status codes
    - **Property 24: Error Responses Include Correct Status Codes**
    - **Validates: Requirements 10.7**
  
  - [ ]* 14.8 Write property test for soft delete operations logged
    - **Property 25: Soft Delete Operations Logged**
    - **Validates: Requirements 11.1**
  
  - [ ]* 14.9 Write property test for restore operations logged
    - **Property 26: Restore Operations Logged**
    - **Validates: Requirements 11.2**
  
  - [ ]* 14.10 Write property test for protection operations logged
    - **Property 27: Protection Operations Logged**
    - **Validates: Requirements 11.3**
  
  - [ ]* 14.11 Write property test for API response format compatibility
    - **Property 30: API Response Format Compatibility**
    - **Validates: Requirements 12.5**
  
  - [ ]* 14.12 Write property test for new content defaults to unprotected
    - **Property 14: New Content Defaults to Unprotected**
    - **Validates: Requirements 5.2**

- [ ] 15. Final checkpoint and documentation
  - [ ] 15.1 Verify all functionality works end-to-end
    - Manually test trash view displays deleted items correctly
    - Manually test restore functionality for all content types
    - Manually test protection toggle only visible to super admins
    - Manually test regular admins cannot delete protected content
    - Manually test super admins can delete protected content
    - Manually test lock icons display correctly
    - Manually test audit logs capture all operations
    - Ensure all tests pass, ask the user if questions arise.
  
  - [ ] 15.2 Update API documentation
    - Document new endpoints in `API-DOCUMENTATION.md`
    - Include request/response examples for trash, restore, protect, unprotect endpoints
    - Document error codes and status codes
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7_
  
  - [ ] 15.3 Create admin user guide for trash and protection features
    - Document how to view and restore deleted content
    - Document how to mark content as protected (super admin only)
    - Document retention periods (30 days regular, 60 days protected)
    - Add to `ADMIN-PORTAL-GUIDE.md` or create new guide
    - _Requirements: 2.1, 5.3, 5.4, 8.1_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout (backend Express.js and frontend React)
- All database operations use PostgreSQL with parameterized queries
- Authentication and authorization use existing JWT middleware and role-based access control
- Audit logging uses existing Winston logger
- File deletion uses existing S3 service (deleteFromS3 function)
- Frontend uses existing components (ConfirmDialog, Toast, Loading) where applicable
