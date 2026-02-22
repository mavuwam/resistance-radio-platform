# Requirements Document

## Introduction

The Content Protection and Recovery System adds two critical capabilities to the Zimbabwe Voice admin portal: a trash/recycle bin system for soft deletion with recovery, and a protected content system to prevent accidental deletion of critical content. This feature ensures content safety while maintaining administrative flexibility, allowing recovery of accidentally deleted items and protecting seed/original content from unauthorized deletion.

## Glossary

- **Content_Item**: Any of the following content types: articles, shows, episodes, events, or resources
- **Soft_Delete**: Marking a Content_Item as deleted without permanently removing it from the database
- **Hard_Delete**: Permanently removing a Content_Item from the database
- **Trash_System**: The subsystem managing soft-deleted Content_Items and their recovery
- **Protected_Content**: Content_Items marked with a protected flag to prevent deletion by regular admins
- **Regular_Admin**: An authenticated user with admin role but not super admin privileges
- **Super_Admin**: An authenticated user with super admin role and elevated privileges
- **Retention_Period**: The duration a deleted Content_Item remains in trash before auto-cleanup
- **Trash_View**: The admin interface displaying soft-deleted Content_Items
- **Admin_Portal**: The React-based administrative interface for content management
- **Backend_API**: The Express.js API server handling content operations
- **Database**: The PostgreSQL database storing all content and metadata

## Requirements

### Requirement 1: Soft Delete Implementation

**User Story:** As an admin, I want deleted content to be recoverable, so that I can restore items deleted by mistake.

#### Acceptance Criteria

1. WHEN a Regular_Admin or Super_Admin deletes a Content_Item, THE Backend_API SHALL mark the Content_Item as soft-deleted instead of performing a Hard_Delete
2. WHEN a Content_Item is soft-deleted, THE Backend_API SHALL record the deletion timestamp
3. WHEN a Content_Item is soft-deleted, THE Backend_API SHALL record the user ID of the admin who deleted it
4. THE Backend_API SHALL exclude soft-deleted Content_Items from all public API responses
5. THE Backend_API SHALL exclude soft-deleted Content_Items from standard admin list views
6. FOR ALL Content_Items (articles, shows, episodes, events, resources), THE Backend_API SHALL support soft delete operations

### Requirement 2: Trash View and Management

**User Story:** As an admin, I want to view deleted content in a trash section, so that I can see what has been deleted and decide whether to restore items.

#### Acceptance Criteria

1. THE Admin_Portal SHALL provide a Trash_View accessible from the admin navigation
2. WHEN an admin accesses the Trash_View, THE Admin_Portal SHALL display the last 5 deleted Content_Items per content type
3. WHEN displaying trash items, THE Admin_Portal SHALL show the content title, type, deletion date, and the admin who deleted it
4. WHEN displaying trash items, THE Admin_Portal SHALL sort items by deletion date with most recent first
5. THE Admin_Portal SHALL provide filtering by content type in the Trash_View
6. WHEN the trash contains more than 5 items of a content type, THE Backend_API SHALL return only the 5 most recently deleted items

### Requirement 3: Content Recovery

**User Story:** As an admin, I want to restore deleted content from trash, so that I can recover items that were deleted by mistake.

#### Acceptance Criteria

1. WHEN an admin views a soft-deleted Content_Item in the Trash_View, THE Admin_Portal SHALL display a Restore button
2. WHEN an admin clicks the Restore button, THE Admin_Portal SHALL request confirmation before proceeding
3. WHEN an admin confirms restoration, THE Backend_API SHALL remove the soft-delete flag from the Content_Item
4. WHEN a Content_Item is restored, THE Backend_API SHALL clear the deletion timestamp and deleting user ID
5. WHEN a Content_Item is restored, THE Backend_API SHALL make the Content_Item visible in standard admin list views
6. WHEN a Content_Item is restored, THE Admin_Portal SHALL display a success notification
7. WHEN restoration fails, THE Admin_Portal SHALL display an error message with the failure reason

### Requirement 4: Automatic Trash Cleanup

**User Story:** As a system administrator, I want old deleted content to be automatically removed, so that the database does not accumulate unnecessary deleted items indefinitely.

#### Acceptance Criteria

1. THE Backend_API SHALL permanently delete non-protected Content_Items that have been soft-deleted for 30 days or more
2. THE Backend_API SHALL permanently delete protected Content_Items that have been soft-deleted for 60 days or more
3. THE Backend_API SHALL run the cleanup process daily
4. WHEN a Content_Item is permanently deleted during cleanup, THE Backend_API SHALL log the deletion with content type, ID, and deletion date
5. THE Backend_API SHALL delete associated files from S3 storage when permanently deleting Content_Items with media attachments

### Requirement 5: Protected Content Flag

**User Story:** As a super admin, I want to mark critical content as protected, so that it cannot be accidentally deleted by regular admins.

#### Acceptance Criteria

1. THE Database SHALL store a protected boolean flag for each Content_Item
2. THE Backend_API SHALL default the protected flag to false for new Content_Items
3. WHEN a Super_Admin marks a Content_Item as protected, THE Backend_API SHALL set the protected flag to true
4. WHEN a Super_Admin unmarks a Content_Item as protected, THE Backend_API SHALL set the protected flag to false
5. THE Backend_API SHALL allow only Super_Admins to modify the protected flag
6. WHEN a Regular_Admin attempts to modify the protected flag, THE Backend_API SHALL return a 403 Forbidden error

### Requirement 6: Protected Content Deletion Restrictions

**User Story:** As a content manager, I want protected content to be safe from accidental deletion, so that critical seed content remains available.

#### Acceptance Criteria

1. WHEN a Regular_Admin views a protected Content_Item in the admin interface, THE Admin_Portal SHALL disable the delete button
2. WHEN a Regular_Admin views a protected Content_Item, THE Admin_Portal SHALL display a lock icon indicating protected status
3. WHEN a Regular_Admin attempts to delete a protected Content_Item via API, THE Backend_API SHALL return a 403 Forbidden error
4. WHEN a Super_Admin views a protected Content_Item, THE Admin_Portal SHALL enable the delete button
5. WHEN a Super_Admin deletes a protected Content_Item, THE Backend_API SHALL perform a soft delete with 60-day Retention_Period
6. THE Backend_API SHALL allow all admins to edit protected Content_Items
7. THE Backend_API SHALL allow all admins to publish or unpublish protected Content_Items

### Requirement 7: Protected Content Visual Indicators

**User Story:** As an admin, I want to easily identify protected content, so that I understand which items have special deletion restrictions.

#### Acceptance Criteria

1. WHEN the Admin_Portal displays a Content_Item list, THE Admin_Portal SHALL show a lock icon next to protected Content_Items
2. WHEN an admin hovers over the lock icon, THE Admin_Portal SHALL display a tooltip explaining the protected status
3. WHEN an admin views a protected Content_Item detail page, THE Admin_Portal SHALL display a prominent protected status indicator
4. THE Admin_Portal SHALL use consistent lock icon styling across all content type views

### Requirement 8: Protected Content Management Interface

**User Story:** As a super admin, I want a simple way to mark or unmark content as protected, so that I can manage which items have deletion restrictions.

#### Acceptance Criteria

1. WHEN a Super_Admin views a Content_Item in the admin interface, THE Admin_Portal SHALL display a "Mark as Protected" toggle or button
2. WHEN a Super_Admin clicks the protection toggle, THE Admin_Portal SHALL immediately update the protected status
3. WHEN the protected status changes, THE Admin_Portal SHALL display a success notification
4. WHEN a Regular_Admin views a Content_Item, THE Admin_Portal SHALL hide the protection toggle
5. WHEN protection status update fails, THE Admin_Portal SHALL display an error message and revert the UI state

### Requirement 9: Database Schema Updates

**User Story:** As a developer, I want the database schema to support soft deletion and protection, so that the system can track deletion state and protection status.

#### Acceptance Criteria

1. THE Database SHALL add a deleted_at timestamp column to all content tables (articles, shows, episodes, events, resources)
2. THE Database SHALL add a deleted_by integer column to all content tables referencing the users table
3. THE Database SHALL add a protected boolean column to all content tables with default value false
4. THE Database SHALL create indexes on deleted_at columns for efficient trash queries
5. THE Database SHALL create indexes on protected columns for efficient filtering

### Requirement 10: API Endpoint Updates

**User Story:** As a frontend developer, I want clear API endpoints for trash and protection operations, so that I can implement the admin interface features.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a GET /api/admin/trash endpoint returning soft-deleted Content_Items
2. THE Backend_API SHALL provide a POST /api/admin/:contentType/:id/restore endpoint for content recovery
3. THE Backend_API SHALL provide a PATCH /api/admin/:contentType/:id/protect endpoint for marking content as protected
4. THE Backend_API SHALL provide a PATCH /api/admin/:contentType/:id/unprotect endpoint for removing protection
5. THE Backend_API SHALL require authentication for all trash and protection endpoints
6. THE Backend_API SHALL enforce role-based access control on protection endpoints (super admin only)
7. THE Backend_API SHALL return appropriate HTTP status codes (200, 403, 404, 500) for all operations

### Requirement 11: Audit Logging

**User Story:** As a system administrator, I want deletion and restoration actions logged, so that I can track content lifecycle and admin actions.

#### Acceptance Criteria

1. WHEN a Content_Item is soft-deleted, THE Backend_API SHALL log the action with admin ID, content type, content ID, and timestamp
2. WHEN a Content_Item is restored, THE Backend_API SHALL log the action with admin ID, content type, content ID, and timestamp
3. WHEN a Content_Item is marked as protected, THE Backend_API SHALL log the action with admin ID, content type, content ID, and timestamp
4. WHEN a Content_Item is permanently deleted during cleanup, THE Backend_API SHALL log the action with content type, content ID, and original deletion timestamp
5. THE Backend_API SHALL use the existing Winston logger for all audit logs

### Requirement 12: Backward Compatibility

**User Story:** As a developer, I want the new system to work with existing content, so that no data is lost during the migration.

#### Acceptance Criteria

1. WHEN the database schema is updated, THE Database SHALL preserve all existing Content_Items
2. WHEN the schema migration runs, THE Database SHALL set deleted_at to NULL for all existing Content_Items
3. WHEN the schema migration runs, THE Database SHALL set protected to false for all existing Content_Items
4. THE Backend_API SHALL continue to support existing delete operations during the transition period
5. THE Backend_API SHALL maintain API response format compatibility for non-trash endpoints
