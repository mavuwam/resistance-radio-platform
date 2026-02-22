# Requirements Document: Admin Portal UI/UX Improvements

## Introduction

This document defines requirements for improving the admin portal's user interface, user experience, and fixing non-functional pages that currently display blank white screens. The admin portal is a separate application used by content managers to manage shows, episodes, articles, events, resources, and user submissions for the Resistance Radio platform.

The current admin portal has successfully implemented authentication, but suffers from poor visual design, missing error handling, and pages that fail silently. This feature will transform the admin portal into a modern, reliable, and user-friendly content management system.

## Glossary

- **Admin_Portal**: The separate frontend application running on port 5174 for content management
- **Content_Manager**: An authenticated user with admin role who manages platform content
- **Error_Boundary**: A React component that catches JavaScript errors in child components
- **Loading_State**: Visual feedback displayed while data is being fetched from the API
- **CRUD_Operation**: Create, Read, Update, Delete operations on content entities
- **Shared_Library**: The npm workspace package containing reusable components and API client
- **API_Client**: The axios-based HTTP client from the shared library
- **Blank_Page_Error**: When a page renders nothing due to uncaught errors or failed imports
- **Toast_Notification**: A temporary message displayed to provide user feedback
- **Confirmation_Dialog**: A modal that requires user confirmation before destructive actions
- **Form_Validation**: Client-side validation of user input before submission
- **Responsive_Design**: UI that adapts to different screen sizes and devices

## Requirements

### Requirement 1: Error Boundary Implementation

**User Story:** As a Content_Manager, I want pages to display helpful error messages instead of blank screens, so that I can understand what went wrong and take corrective action.

#### Acceptance Criteria

1. WHEN a JavaScript error occurs in any admin page, THE Error_Boundary SHALL catch the error and display a user-friendly error message
2. THE Error_Boundary SHALL log the error details to the console for debugging
3. THE Error_Boundary SHALL provide a "Reload Page" button to recover from the error
4. THE Error_Boundary SHALL display the error stack trace only in development mode
5. WHEN the error boundary catches an error, THE Error_Boundary SHALL send error details to Sentry for monitoring
6. THE Error_Boundary SHALL wrap each major route component in the admin application

### Requirement 2: API Error Handling

**User Story:** As a Content_Manager, I want to see clear error messages when API calls fail, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN an API request fails with a 4xx status code, THE Admin_Portal SHALL display the error message from the API response
2. WHEN an API request fails with a 5xx status code, THE Admin_Portal SHALL display a generic "Server error" message
3. WHEN an API request times out, THE Admin_Portal SHALL display a "Request timed out" message
4. WHEN the network is unavailable, THE Admin_Portal SHALL display a "Network error" message
5. THE Admin_Portal SHALL display error messages using Toast_Notification components
6. THE Admin_Portal SHALL automatically dismiss error notifications after 5 seconds
7. WHEN an API error occurs during form submission, THE Admin_Portal SHALL keep the form data intact for retry

### Requirement 3: Loading State Management

**User Story:** As a Content_Manager, I want to see loading indicators when data is being fetched, so that I know the application is working and not frozen.

#### Acceptance Criteria

1. WHEN data is being fetched from the API, THE Admin_Portal SHALL display a Loading_State indicator
2. THE Loading_State SHALL include a spinner animation and descriptive text
3. WHEN a page is loading initial data, THE Loading_State SHALL cover the entire content area
4. WHEN a form is being submitted, THE Loading_State SHALL disable the submit button and show "Saving..." text
5. WHEN a table is being refreshed, THE Loading_State SHALL display a subtle loading indicator without hiding existing data
6. THE Loading_State SHALL have a minimum display time of 300ms to prevent flickering
7. WHEN loading takes longer than 10 seconds, THE Admin_Portal SHALL display a "This is taking longer than usual" message

### Requirement 4: Modern Visual Design System

**User Story:** As a Content_Manager, I want the admin portal to have an appealing and professional design, so that it's pleasant to use and reflects well on the platform.

#### Acceptance Criteria

1. THE Admin_Portal SHALL use a consistent color palette with primary, secondary, and accent colors
2. THE Admin_Portal SHALL use a modern sans-serif font family for all text
3. THE Admin_Portal SHALL apply consistent spacing using a 4px or 8px grid system
4. THE Admin_Portal SHALL use subtle shadows and rounded corners for cards and modals
5. THE Admin_Portal SHALL implement smooth transitions for interactive elements (200-300ms duration)
6. THE Admin_Portal SHALL use semantic colors for status indicators (green for success, red for error, yellow for warning, blue for info)
7. THE Admin_Portal SHALL maintain a minimum contrast ratio of 4.5:1 for text readability
8. THE Admin_Portal SHALL use icons consistently throughout the interface
9. THE Admin_Portal SHALL implement hover and focus states for all interactive elements
10. THE Admin_Portal SHALL use a sidebar navigation with clear visual hierarchy

### Requirement 5: Responsive Layout Design

**User Story:** As a Content_Manager, I want the admin portal to work well on different screen sizes, so that I can manage content from various devices.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE Admin_Portal SHALL collapse the sidebar into a hamburger menu
2. WHEN the viewport width is less than 1024px, THE Admin_Portal SHALL stack form fields vertically
3. WHEN the viewport width is less than 640px, THE Admin_Portal SHALL hide non-essential table columns
4. THE Admin_Portal SHALL use responsive font sizes that scale with viewport width
5. THE Admin_Portal SHALL ensure all interactive elements have a minimum touch target size of 44x44 pixels
6. THE Admin_Portal SHALL test layouts at breakpoints: 320px, 768px, 1024px, and 1440px
7. THE Admin_Portal SHALL prevent horizontal scrolling on all screen sizes

### Requirement 6: Form Validation and User Feedback

**User Story:** As a Content_Manager, I want immediate feedback when I fill out forms incorrectly, so that I can fix errors before submitting.

#### Acceptance Criteria

1. WHEN a required field is empty, THE Form_Validation SHALL display an error message below the field
2. WHEN a field value is invalid, THE Form_Validation SHALL display a specific error message explaining the issue
3. THE Form_Validation SHALL validate fields on blur (when user leaves the field)
4. THE Form_Validation SHALL prevent form submission when validation errors exist
5. WHEN form submission succeeds, THE Admin_Portal SHALL display a success Toast_Notification
6. WHEN form submission fails, THE Admin_Portal SHALL display field-specific errors if provided by the API
7. THE Form_Validation SHALL validate email addresses using a standard email regex pattern
8. THE Form_Validation SHALL validate URLs to ensure they start with http:// or https://
9. THE Form_Validation SHALL validate file uploads for correct file type and size limits
10. THE Form_Validation SHALL display character counts for text fields with maximum length limits

### Requirement 7: Confirmation Dialogs for Destructive Actions

**User Story:** As a Content_Manager, I want to confirm before deleting content, so that I don't accidentally lose important data.

#### Acceptance Criteria

1. WHEN a Content_Manager clicks a delete button, THE Admin_Portal SHALL display a Confirmation_Dialog
2. THE Confirmation_Dialog SHALL clearly state what will be deleted
3. THE Confirmation_Dialog SHALL require explicit confirmation (not just clicking outside the dialog)
4. THE Confirmation_Dialog SHALL have distinct "Cancel" and "Delete" buttons with different colors
5. WHEN deletion succeeds, THE Admin_Portal SHALL display a success Toast_Notification
6. WHEN deletion fails, THE Admin_Portal SHALL display an error Toast_Notification with the reason
7. THE Confirmation_Dialog SHALL warn if deleting an item will affect related content (e.g., show with episodes)
8. WHEN bulk deleting multiple items, THE Confirmation_Dialog SHALL show the count of items to be deleted

### Requirement 8: Dashboard Statistics and Overview

**User Story:** As a Content_Manager, I want to see key statistics on the dashboard, so that I can quickly understand the current state of the platform.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display total counts for shows, episodes, articles, events, and resources on the dashboard
2. THE Admin_Portal SHALL display the count of pending submissions requiring review
3. THE Admin_Portal SHALL highlight pending submissions with a distinct visual indicator
4. WHEN dashboard statistics are loading, THE Admin_Portal SHALL display skeleton loaders for each stat card
5. WHEN fetching statistics fails, THE Admin_Portal SHALL display an error message and a retry button
6. THE Admin_Portal SHALL refresh dashboard statistics when the page is focused after being in the background
7. THE Admin_Portal SHALL display quick action cards linking to common management tasks
8. THE Admin_Portal SHALL display the last login time for the current Content_Manager

### Requirement 9: Content Table Improvements

**User Story:** As a Content_Manager, I want content tables to be easy to read and navigate, so that I can quickly find and manage content.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display content in tables with alternating row colors for readability
2. THE Admin_Portal SHALL implement sortable columns with visual indicators for sort direction
3. THE Admin_Portal SHALL implement pagination with page size options (10, 20, 50, 100)
4. THE Admin_Portal SHALL display the total count of items and current page range
5. THE Admin_Portal SHALL implement search functionality with debounced input (300ms delay)
6. THE Admin_Portal SHALL implement filter dropdowns for common attributes (status, category, type)
7. THE Admin_Portal SHALL display action buttons (Edit, Delete) consistently in the last column
8. WHEN a table row is clicked, THE Admin_Portal SHALL open the edit modal for that item
9. THE Admin_Portal SHALL implement row selection with checkboxes for bulk operations
10. WHEN no data is available, THE Admin_Portal SHALL display an empty state with a "Create" button
11. THE Admin_Portal SHALL display relative timestamps (e.g., "2 hours ago") with full date on hover

### Requirement 10: File Upload Experience

**User Story:** As a Content_Manager, I want a smooth file upload experience with progress feedback, so that I know my files are uploading successfully.

#### Acceptance Criteria

1. WHEN a Content_Manager selects a file, THE Admin_Portal SHALL validate the file type and size before uploading
2. WHEN a file is uploading, THE Admin_Portal SHALL display a progress bar showing upload percentage
3. WHEN file upload succeeds, THE Admin_Portal SHALL display a preview of the uploaded file
4. WHEN file upload fails, THE Admin_Portal SHALL display an error message with the reason
5. THE Admin_Portal SHALL support drag-and-drop file upload in addition to file selection
6. THE Admin_Portal SHALL display file size limits clearly near the upload area
7. THE Admin_Portal SHALL display accepted file types clearly near the upload area
8. WHEN uploading images, THE Admin_Portal SHALL display a thumbnail preview
9. WHEN uploading audio files, THE Admin_Portal SHALL display an audio player for preview
10. THE Admin_Portal SHALL allow removing uploaded files before form submission

### Requirement 11: Rich Text Editor for Content

**User Story:** As a Content_Manager, I want a rich text editor for article and episode descriptions, so that I can format content with headings, lists, and links.

#### Acceptance Criteria

1. THE Admin_Portal SHALL provide a Rich_Text_Editor for article content and episode descriptions
2. THE Rich_Text_Editor SHALL support basic formatting: bold, italic, underline, strikethrough
3. THE Rich_Text_Editor SHALL support headings (H1, H2, H3)
4. THE Rich_Text_Editor SHALL support ordered and unordered lists
5. THE Rich_Text_Editor SHALL support hyperlinks with URL validation
6. THE Rich_Text_Editor SHALL support blockquotes
7. THE Rich_Text_Editor SHALL provide a toolbar with clearly labeled formatting buttons
8. THE Rich_Text_Editor SHALL display a character count if a maximum length is specified
9. THE Rich_Text_Editor SHALL save content as HTML
10. THE Rich_Text_Editor SHALL sanitize HTML to prevent XSS attacks

### Requirement 12: Navigation and Breadcrumbs

**User Story:** As a Content_Manager, I want clear navigation and breadcrumbs, so that I always know where I am in the admin portal.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display a sidebar navigation with all main sections
2. THE Admin_Portal SHALL highlight the current page in the sidebar navigation
3. THE Admin_Portal SHALL display breadcrumbs at the top of each page showing the navigation path
4. THE Admin_Portal SHALL make breadcrumb segments clickable to navigate back
5. THE Admin_Portal SHALL display the current Content_Manager's name and role in the sidebar
6. THE Admin_Portal SHALL provide a logout button in the sidebar
7. THE Admin_Portal SHALL provide a "View Site" link to open the public website in a new tab
8. WHEN the viewport is narrow, THE Admin_Portal SHALL collapse the sidebar and show a hamburger menu icon

### Requirement 13: Keyboard Accessibility

**User Story:** As a Content_Manager, I want to navigate the admin portal using keyboard shortcuts, so that I can work more efficiently.

#### Acceptance Criteria

1. THE Admin_Portal SHALL support Tab key navigation through all interactive elements
2. THE Admin_Portal SHALL display visible focus indicators on all focusable elements
3. THE Admin_Portal SHALL support Enter key to submit forms
4. THE Admin_Portal SHALL support Escape key to close modals and dialogs
5. THE Admin_Portal SHALL support arrow keys to navigate through table rows
6. THE Admin_Portal SHALL trap focus within modals when they are open
7. THE Admin_Portal SHALL return focus to the trigger element when a modal is closed
8. THE Admin_Portal SHALL provide skip links to jump to main content

### Requirement 14: Session Management and Auto-Save

**User Story:** As a Content_Manager, I want my work to be saved automatically, so that I don't lose data if my session expires or the browser crashes.

#### Acceptance Criteria

1. WHEN a Content_Manager types in a form, THE Admin_Portal SHALL save draft data to localStorage every 30 seconds
2. WHEN a Content_Manager returns to a form with draft data, THE Admin_Portal SHALL offer to restore the draft
3. WHEN a Content_Manager's session expires, THE Admin_Portal SHALL redirect to login and preserve the current page URL
4. WHEN a Content_Manager logs back in, THE Admin_Portal SHALL redirect to the page they were on before session expiry
5. THE Admin_Portal SHALL display a warning 5 minutes before session expiry
6. THE Admin_Portal SHALL provide a "Stay Logged In" button to extend the session
7. WHEN form data is restored from draft, THE Admin_Portal SHALL display a notification indicating draft restoration

### Requirement 15: Bulk Operations

**User Story:** As a Content_Manager, I want to perform actions on multiple items at once, so that I can manage content more efficiently.

#### Acceptance Criteria

1. THE Admin_Portal SHALL provide checkboxes for selecting multiple table rows
2. THE Admin_Portal SHALL provide a "Select All" checkbox in the table header
3. WHEN items are selected, THE Admin_Portal SHALL display a bulk actions toolbar
4. THE Admin_Portal SHALL support bulk delete operation with confirmation
5. THE Admin_Portal SHALL support bulk publish/unpublish for articles
6. THE Admin_Portal SHALL display the count of selected items in the bulk actions toolbar
7. WHEN a bulk operation completes, THE Admin_Portal SHALL display a summary of results (success count, failure count)
8. WHEN a bulk operation partially fails, THE Admin_Portal SHALL display which items failed and why
9. THE Admin_Portal SHALL clear selection after bulk operation completes

### Requirement 16: Search and Filter Persistence

**User Story:** As a Content_Manager, I want my search and filter settings to persist when I navigate away and return, so that I don't have to re-enter them.

#### Acceptance Criteria

1. WHEN a Content_Manager applies search or filters, THE Admin_Portal SHALL save them to URL query parameters
2. WHEN a Content_Manager navigates back to a page, THE Admin_Portal SHALL restore search and filters from URL
3. WHEN a Content_Manager refreshes the page, THE Admin_Portal SHALL maintain search and filter state
4. THE Admin_Portal SHALL provide a "Clear Filters" button to reset all filters
5. WHEN filters are active, THE Admin_Portal SHALL display a visual indicator showing active filter count
6. THE Admin_Portal SHALL maintain pagination state in the URL

### Requirement 17: Content Preview

**User Story:** As a Content_Manager, I want to preview content before publishing, so that I can ensure it looks correct on the public site.

#### Acceptance Criteria

1. THE Admin_Portal SHALL provide a "Preview" button on article and episode edit forms
2. WHEN the preview button is clicked, THE Admin_Portal SHALL open a modal showing how the content will appear on the public site
3. THE Admin_Portal SHALL render the preview using the same styles as the public website
4. THE Admin_Portal SHALL display a "Close Preview" button in the preview modal
5. THE Admin_Portal SHALL allow editing and re-previewing without closing the form
6. THE Admin_Portal SHALL display a warning if previewing unpublished content

### Requirement 18: Submission Review Workflow

**User Story:** As a Content_Manager, I want an efficient workflow for reviewing user submissions, so that I can quickly approve or reject them.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display submissions in a table with status, type, and submission date
2. THE Admin_Portal SHALL provide filter options for submission status (pending, approved, rejected)
3. THE Admin_Portal SHALL provide filter options for content type (show suggestion, episode suggestion, article suggestion)
4. WHEN a Content_Manager clicks a submission, THE Admin_Portal SHALL display full submission details in a modal
5. THE Admin_Portal SHALL provide "Approve" and "Reject" buttons in the submission detail modal
6. WHEN a submission is approved, THE Admin_Portal SHALL update the status and display a success notification
7. WHEN a submission is rejected, THE Admin_Portal SHALL prompt for a rejection reason
8. THE Admin_Portal SHALL display the submitter's email address for follow-up communication
9. THE Admin_Portal SHALL highlight pending submissions with a badge in the sidebar navigation

### Requirement 19: Performance Optimization

**User Story:** As a Content_Manager, I want the admin portal to load quickly and respond smoothly, so that I can work efficiently.

#### Acceptance Criteria

1. THE Admin_Portal SHALL lazy-load route components to reduce initial bundle size
2. THE Admin_Portal SHALL implement virtual scrolling for tables with more than 100 rows
3. THE Admin_Portal SHALL debounce search input to reduce API calls (300ms delay)
4. THE Admin_Portal SHALL cache API responses for 5 minutes to reduce redundant requests
5. THE Admin_Portal SHALL optimize images to reduce file size without visible quality loss
6. THE Admin_Portal SHALL use code splitting to load only necessary JavaScript for each page
7. THE Admin_Portal SHALL achieve a Lighthouse performance score of at least 80
8. THE Admin_Portal SHALL load the initial page in under 3 seconds on a 3G connection

### Requirement 20: Import and Export Functionality

**User Story:** As a Content_Manager, I want to export content data and import bulk content, so that I can backup data and efficiently add multiple items.

#### Acceptance Criteria

1. THE Admin_Portal SHALL provide an "Export" button on each content management page
2. WHEN the export button is clicked, THE Admin_Portal SHALL download content data as a CSV file
3. THE Admin_Portal SHALL include all relevant fields in the exported CSV
4. THE Admin_Portal SHALL provide an "Import" button on each content management page
5. WHEN the import button is clicked, THE Admin_Portal SHALL open a file upload dialog for CSV files
6. THE Admin_Portal SHALL validate imported CSV data and display errors for invalid rows
7. WHEN import succeeds, THE Admin_Portal SHALL display a summary of imported items
8. WHEN import partially fails, THE Admin_Portal SHALL display which rows failed and why
9. THE Admin_Portal SHALL provide a CSV template download for each content type
