# Admin Mailbox Design Document

## Overview

The Admin Mailbox feature integrates email management directly into the CMS admin portal, allowing administrators to receive, view, manage, and organize emails without leaving the admin interface. The system consists of three main components:

1. **Database Layer**: PostgreSQL tables for storing email messages and related metadata
2. **Backend API**: Express.js REST endpoints for email CRUD operations, filtering, and status management
3. **Frontend UI**: React-based mailbox interface with inbox view, detail view, and real-time notifications

The design leverages existing authentication infrastructure (JWT-based admin auth) and follows established patterns from the admin CMS (similar to submissions, articles, etc.). Email receiving will be handled through a webhook endpoint that accepts incoming emails from an email service provider (e.g., SendGrid Inbound Parse, Mailgun Routes, or AWS SES).

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Email Service Provider"
        ESP[SendGrid/Mailgun/SES]
    end
    
    subgraph "Backend API (Port 5000)"
        Webhook[/api/mailbox/webhook]
        MailboxAPI[/api/admin/mailbox/*]
        Auth[Auth Middleware]
        DB[(PostgreSQL)]
    end
    
    subgraph "Admin Frontend (Port 5174)"
        MailboxPage[Mailbox Page]
        InboxView[Inbox View]
        DetailView[Detail View]
        Notifications[Notification Badge]
    end
    
    ESP -->|POST email data| Webhook
    Webhook -->|Store| DB
    MailboxPage -->|GET /api/admin/mailbox| Auth
    Auth -->|Authorized| MailboxAPI
    MailboxAPI <-->|Query| DB
    MailboxAPI -->|Response| MailboxPage
    InboxView -->|Poll every 30s| MailboxAPI
    Notifications -->|Update count| MailboxAPI
```

### Data Flow

1. **Email Reception**: External email service provider forwards incoming emails to webhook endpoint
2. **Email Storage**: Webhook parses email data and creates database record, assigns to admin user based on recipient
3. **Email Retrieval**: Admin user navigates to mailbox, frontend fetches emails via authenticated API
4. **Real-time Updates**: Frontend polls API every 30 seconds for new emails and updates notification badge
5. **Email Management**: Admin performs actions (read, archive, delete), frontend sends API requests, backend updates database

### Technology Stack

- **Database**: PostgreSQL 14+ (existing)
- **Backend**: Express.js with TypeScript (existing)
- **Frontend**: React 18 with TypeScript (existing)
- **Authentication**: JWT tokens (existing)
- **Email Parsing**: Nodemailer mailparser library
- **HTML Sanitization**: DOMPurify (frontend) and sanitize-html (backend)

## Components and Interfaces

### Database Schema

#### admin_emails Table

```sql
CREATE TABLE IF NOT EXISTS admin_emails (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email metadata
  from_address VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_address VARCHAR(255) NOT NULL,
  cc_addresses TEXT[], -- Array of CC recipients
  subject VARCHAR(500) NOT NULL,
  
  -- Email content
  body_text TEXT, -- Plain text version
  body_html TEXT, -- HTML version
  
  -- Status and flags
  status VARCHAR(50) NOT NULL DEFAULT 'unread', -- unread, read, archived, deleted
  is_starred BOOLEAN DEFAULT false,
  
  -- Metadata
  message_id VARCHAR(255), -- Original email message ID
  in_reply_to VARCHAR(255), -- For threading
  references TEXT[], -- Email thread references
  
  -- Timestamps
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_admin_emails_user_id ON admin_emails(admin_user_id);
CREATE INDEX idx_admin_emails_status ON admin_emails(status);
CREATE INDEX idx_admin_emails_received_at ON admin_emails(received_at DESC);
CREATE INDEX idx_admin_emails_from_address ON admin_emails(from_address);
CREATE INDEX idx_admin_emails_subject ON admin_emails USING gin(to_tsvector('english', subject));
CREATE INDEX idx_admin_emails_body_text ON admin_emails USING gin(to_tsvector('english', body_text));

-- Composite index for common queries
CREATE INDEX idx_admin_emails_user_status_received ON admin_emails(admin_user_id, status, received_at DESC);
```

#### admin_email_addresses Table

Maps admin users to their assigned email addresses for routing:

```sql
CREATE TABLE IF NOT EXISTS admin_email_addresses (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_address VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(email_address)
);

CREATE INDEX idx_admin_email_addresses_user_id ON admin_email_addresses(admin_user_id);
CREATE INDEX idx_admin_email_addresses_email ON admin_email_addresses(email_address);
```

### Backend API Endpoints

#### Email Webhook (Public)

```typescript
POST /api/mailbox/webhook
Content-Type: application/json

// Request body (from email service provider)
{
  "from": "sender@example.com",
  "to": "admin@resistanceradio.org",
  "cc": ["other@example.com"],
  "subject": "Important message",
  "text": "Plain text body",
  "html": "<p>HTML body</p>",
  "messageId": "<unique-message-id@example.com>",
  "inReplyTo": "<previous-message-id@example.com>",
  "references": ["<ref1@example.com>", "<ref2@example.com>"],
  "receivedAt": "2024-01-15T10:30:00Z"
}

// Response
{
  "success": true,
  "emailId": 123
}
```

#### List Emails (Admin)

```typescript
GET /api/admin/mailbox?page=1&limit=50&status=unread&search=query
Authorization: Bearer <jwt-token>

// Response
{
  "emails": [
    {
      "id": 123,
      "fromAddress": "sender@example.com",
      "fromName": "John Doe",
      "subject": "Important message",
      "bodyPreview": "First 200 characters...",
      "status": "unread",
      "isStarred": false,
      "receivedAt": "2024-01-15T10:30:00Z",
      "readAt": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 234,
    "limit": 50
  },
  "unreadCount": 42
}
```

#### Get Email Detail (Admin)

```typescript
GET /api/admin/mailbox/:id
Authorization: Bearer <jwt-token>

// Response
{
  "id": 123,
  "fromAddress": "sender@example.com",
  "fromName": "John Doe",
  "toAddress": "admin@resistanceradio.org",
  "ccAddresses": ["other@example.com"],
  "subject": "Important message",
  "bodyText": "Plain text content...",
  "bodyHtml": "<p>HTML content...</p>",
  "status": "read",
  "isStarred": false,
  "messageId": "<unique-id@example.com>",
  "receivedAt": "2024-01-15T10:30:00Z",
  "readAt": "2024-01-15T11:00:00Z"
}
```

#### Update Email Status (Admin)

```typescript
PATCH /api/admin/mailbox/:id/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

// Request body
{
  "status": "read" | "unread" | "archived" | "deleted"
}

// Response
{
  "success": true,
  "email": {
    "id": 123,
    "status": "read",
    "readAt": "2024-01-15T11:00:00Z"
  }
}
```

#### Toggle Star (Admin)

```typescript
PATCH /api/admin/mailbox/:id/star
Authorization: Bearer <jwt-token>
Content-Type: application/json

// Request body
{
  "isStarred": true
}

// Response
{
  "success": true,
  "email": {
    "id": 123,
    "isStarred": true
  }
}
```

#### Bulk Operations (Admin)

```typescript
POST /api/admin/mailbox/bulk
Authorization: Bearer <jwt-token>
Content-Type: application/json

// Request body
{
  "emailIds": [123, 124, 125],
  "action": "mark_read" | "mark_unread" | "archive" | "delete" | "star" | "unstar"
}

// Response
{
  "success": true,
  "updatedCount": 3
}
```

#### Get Unread Count (Admin)

```typescript
GET /api/admin/mailbox/unread-count
Authorization: Bearer <jwt-token>

// Response
{
  "unreadCount": 42
}
```

#### Manage Email Addresses (Admin)

```typescript
// List admin's email addresses
GET /api/admin/mailbox/addresses
Authorization: Bearer <jwt-token>

// Response
{
  "addresses": [
    {
      "id": 1,
      "emailAddress": "admin@resistanceradio.org",
      "isPrimary": true,
      "isActive": true
    }
  ]
}

// Add email address
POST /api/admin/mailbox/addresses
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "emailAddress": "support@resistanceradio.org",
  "isPrimary": false
}

// Remove email address
DELETE /api/admin/mailbox/addresses/:id
Authorization: Bearer <jwt-token>
```

### Frontend Components

#### MailboxPage Component

Main container component for the mailbox feature.

```typescript
interface MailboxPageProps {}

interface MailboxPageState {
  emails: Email[];
  selectedEmail: Email | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  unreadCount: number;
  statusFilter: 'all' | 'unread' | 'read' | 'archived';
  searchQuery: string;
}
```

**Responsibilities**:
- Fetch emails from API with pagination
- Manage filter and search state
- Poll for new emails every 30 seconds
- Handle email selection for detail view
- Coordinate between inbox and detail views

#### InboxView Component

Displays list of emails in table format.

```typescript
interface InboxViewProps {
  emails: Email[];
  selectedEmailId: number | null;
  onEmailSelect: (email: Email) => void;
  onStatusChange: (emailId: number, status: EmailStatus) => void;
  onStarToggle: (emailId: number, isStarred: boolean) => void;
  onBulkAction: (emailIds: number[], action: BulkAction) => void;
  loading: boolean;
}
```

**Features**:
- Email list with sender, subject, preview, timestamp
- Visual distinction between read/unread (bold text for unread)
- Checkbox selection for bulk operations
- Star/unstar toggle
- Status badges
- Hover actions (mark read/unread, archive, delete)

#### EmailDetailView Component

Displays full email content.

```typescript
interface EmailDetailViewProps {
  email: Email;
  onClose: () => void;
  onStatusChange: (status: EmailStatus) => void;
  onStarToggle: (isStarred: boolean) => void;
  onDelete: () => void;
}
```

**Features**:
- Full email headers (from, to, cc, subject, date)
- Sanitized HTML body rendering or plain text
- Action buttons (reply, archive, delete, star)
- Mark as read automatically on open
- Back button to return to inbox

#### MailboxNotificationBadge Component

Displays unread count in admin navigation.

```typescript
interface MailboxNotificationBadgeProps {
  unreadCount: number;
}
```

**Features**:
- Red badge with unread count
- Hide when count is zero
- Update in real-time via polling

#### EmailFilters Component

Filter and search controls.

```typescript
interface EmailFiltersProps {
  statusFilter: EmailStatus | 'all';
  searchQuery: string;
  onStatusFilterChange: (status: EmailStatus | 'all') => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}
```

**Features**:
- Status dropdown (All, Unread, Read, Archived)
- Search input with debouncing
- Clear filters button

#### Pagination Component

Reusable pagination controls (can reuse existing if available).

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### API Service Layer

```typescript
// admin-frontend/src/services/mailbox.ts

export interface Email {
  id: number;
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  ccAddresses?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  bodyPreview?: string;
  status: 'unread' | 'read' | 'archived' | 'deleted';
  isStarred: boolean;
  receivedAt: string;
  readAt?: string;
}

export interface EmailListResponse {
  emails: Email[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  unreadCount: number;
}

export const mailboxService = {
  // List emails with filters
  async listEmails(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<EmailListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status && params.status !== 'all') queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    
    const response = await api.get(`/admin/mailbox?${queryParams}`);
    return response.data;
  },

  // Get email detail
  async getEmail(id: number): Promise<Email> {
    const response = await api.get(`/admin/mailbox/${id}`);
    return response.data;
  },

  // Update email status
  async updateStatus(id: number, status: string): Promise<void> {
    await api.patch(`/admin/mailbox/${id}/status`, { status });
  },

  // Toggle star
  async toggleStar(id: number, isStarred: boolean): Promise<void> {
    await api.patch(`/admin/mailbox/${id}/star`, { isStarred });
  },

  // Bulk operations
  async bulkAction(emailIds: number[], action: string): Promise<void> {
    await api.post('/admin/mailbox/bulk', { emailIds, action });
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/admin/mailbox/unread-count');
    return response.data.unreadCount;
  }
};
```

## Data Models

### Email Message Model

```typescript
// backend/src/models/AdminEmail.ts

export interface AdminEmail {
  id: number;
  adminUserId: number;
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  ccAddresses?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  status: 'unread' | 'read' | 'archived' | 'deleted';
  isStarred: boolean;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  receivedAt: Date;
  readAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminEmailAddress {
  id: number;
  adminUserId: number;
  emailAddress: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
}
```

### Email Webhook Payload

```typescript
// backend/src/types/webhook.ts

export interface EmailWebhookPayload {
  from: string; // "Name <email@example.com>" or "email@example.com"
  to: string;
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  receivedAt?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- **Property 9.2 and 1.2**: Both test that users only see their assigned emails - these can be combined into a single authorization property
- **Property 10.3 and 4.3**: Both test the 30-day deletion retention policy - these are identical
- **Properties 3.1 and 2.3**: Both test marking emails as read, but 2.3 is automatic on open while 3.1 is explicit user action - these are actually different triggers for the same state change, so we'll keep both as they test different code paths

The following properties were marked as not testable and will be excluded:
- Performance requirements (5.4, 6.4, 8.4) - these are integration/load test concerns
- Infrastructure requirements (9.5, 10.4) - deployment and operations concerns
- Polling intervals (7.2, 7.5) - timing-based integration test concerns
- Retention policies without enforcement logic (10.2) - policy statements
- Database schema requirements (10.5) - migration test concerns

### Property 1: Email Authorization

*For any* admin user and any email in the system, when the user requests emails via the API, the response should contain only emails where the admin_user_id matches the authenticated user's ID.

**Validates: Requirements 1.2, 9.2**

### Property 2: Email Chronological Ordering

*For any* set of emails returned by the inbox API, the emails should be ordered by received_at timestamp in descending order (newest first).

**Validates: Requirements 1.4**

### Property 3: Inbox Display Completeness

*For any* email in the inbox view, the rendered output should contain the sender address, subject, timestamp, and status.

**Validates: Requirements 1.5**

### Property 4: Detail View Completeness

*For any* email in the detail view, the rendered output should contain the sender, recipient, subject, timestamp, and full body content.

**Validates: Requirements 2.2**

### Property 5: Automatic Read Status on Open

*For any* email with status "unread", when the email detail is fetched via the API, the email's status should be updated to "read" and read_at timestamp should be set.

**Validates: Requirements 2.3**

### Property 6: Line Break Preservation

*For any* email body text containing line breaks, storing and retrieving the email should preserve all line break characters.

**Validates: Requirements 2.4**

### Property 7: HTML Sanitization

*For any* email containing HTML with potentially malicious content (script tags, event handlers, iframes), the sanitized HTML output should not contain any executable JavaScript or dangerous elements.

**Validates: Requirements 2.5**

### Property 8: Manual Read Status Update

*For any* email, when the status is explicitly updated to "read" via the API, the email's status field should be "read" and read_at timestamp should be set.

**Validates: Requirements 3.1**

### Property 9: Unread Status Update

*For any* email, when the status is updated to "unread" via the API, the email's status field should be "unread" and read_at timestamp should be null.

**Validates: Requirements 3.2**

### Property 10: Read/Unread Visual Distinction

*For any* pair of emails where one is read and one is unread, the rendered inbox view should apply different CSS classes or styling attributes to distinguish them visually.

**Validates: Requirements 3.3**

### Property 11: Archive Status Update

*For any* email, when the status is updated to "archived" via the API, the email's status field should be "archived".

**Validates: Requirements 3.4**

### Property 12: Archived Email Exclusion

*For any* API request to list emails without an explicit status filter (or with status filter set to "all" or "unread" or "read"), the response should not contain any emails with status "archived".

**Validates: Requirements 3.5**

### Property 13: Delete Status Update

*For any* email, when the status is updated to "deleted" via the API, the email's status field should be "deleted" and deleted_at timestamp should be set.

**Validates: Requirements 4.2**

### Property 14: Deleted Email Retention

*For any* email with status "deleted" and deleted_at timestamp more than 30 days in the past, the cleanup job should permanently remove the email from the database.

**Validates: Requirements 4.3, 10.3**

### Property 15: Deleted Email Exclusion from Inbox

*For any* API request to list emails for the inbox view (without trash filter), the response should not contain any emails with status "deleted".

**Validates: Requirements 4.4**

### Property 16: Trash View Filtering

*For any* API request to list emails with trash/deleted filter, the response should contain only emails with status "deleted".

**Validates: Requirements 4.5**

### Property 17: Search Result Matching

*For any* search query and any email in the search results, the email's from_address, subject, or body_text should contain the search query as a substring (case-insensitive).

**Validates: Requirements 5.1**

### Property 18: Status Filter Application

*For any* status filter value (unread, read, archived) applied to the email list API, all returned emails should have a status matching the filter value.

**Validates: Requirements 5.3**

### Property 19: Search Term Highlighting

*For any* search query and any email in the search results, the rendered output should contain HTML markup (e.g., <mark> or <span class="highlight">) wrapping occurrences of the search term.

**Validates: Requirements 5.5**

### Property 20: Email Assignment by Recipient

*For any* incoming email webhook payload, the created email record should be assigned to the admin user whose email address (in admin_email_addresses table) matches the "to" field of the payload.

**Validates: Requirements 6.1**

### Property 21: Multiple Email Address Support

*For any* admin user with multiple email addresses in the admin_email_addresses table, incoming emails to any of those addresses should all be assigned to the same admin_user_id.

**Validates: Requirements 6.2**

### Property 22: Default Mailbox Fallback

*For any* incoming email webhook payload where the "to" field does not match any email address in the admin_email_addresses table, the created email record should be assigned to a designated default admin user.

**Validates: Requirements 6.3**

### Property 23: Unread Count Increment

*For any* admin user, when a new email is assigned to that user with status "unread", the unread count for that user should increase by 1.

**Validates: Requirements 6.5**

### Property 24: Notification Badge Display

*For any* admin user with unread emails, the notification badge should display the count of emails with status "unread" assigned to that user.

**Validates: Requirements 7.1, 7.3**

### Property 25: Pagination Subset Correctness

*For any* page number N and page size S, the emails returned should be the correct subset from the full ordered list (emails from index N*S to (N+1)*S - 1).

**Validates: Requirements 8.2**

### Property 26: Pagination Metadata Accuracy

*For any* paginated email list response, the pagination metadata (currentPage, totalPages, totalCount) should accurately reflect the current page, total number of pages, and total count of emails matching the filters.

**Validates: Requirements 8.3**

### Property 27: Authentication Requirement

*For any* request to the admin mailbox API endpoints without a valid JWT token in the Authorization header, the API should return a 401 Unauthorized error.

**Validates: Requirements 9.1**

### Property 28: Cross-User Access Prevention

*For any* admin user attempting to access an email (by ID) that is assigned to a different admin user, the API should return a 403 Forbidden error.

**Validates: Requirements 9.3**

### Property 29: Access Audit Logging

*For any* request to view an email detail, the system should create an audit log entry containing the admin user ID, email ID, timestamp, and action type.

**Validates: Requirements 9.4**

## Error Handling

### API Error Responses

All API endpoints follow a consistent error response format:

```typescript
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional context
  }
}
```

### Error Scenarios

#### Authentication Errors (401)

- **NO_TOKEN**: No Authorization header provided
- **INVALID_TOKEN**: JWT token is malformed or invalid
- **TOKEN_EXPIRED**: JWT token has expired (>24 hours old)
- **SESSION_EXPIRED**: Session duration exceeded

**Handling**: Frontend redirects to login page and clears stored credentials.

#### Authorization Errors (403)

- **FORBIDDEN**: User attempting to access email not assigned to them
- **INSUFFICIENT_PERMISSIONS**: User role lacks required permissions

**Handling**: Frontend displays error message and prevents action.

#### Not Found Errors (404)

- **EMAIL_NOT_FOUND**: Requested email ID does not exist
- **USER_NOT_FOUND**: Referenced admin user does not exist

**Handling**: Frontend displays "Email not found" message and returns to inbox.

#### Validation Errors (400)

- **INVALID_STATUS**: Status value not in allowed set (unread, read, archived, deleted)
- **INVALID_PAGE**: Page number less than 1 or greater than total pages
- **INVALID_EMAIL_ADDRESS**: Email address format invalid
- **MISSING_REQUIRED_FIELD**: Required field missing from request body

**Handling**: Frontend displays validation error message and highlights problematic field.

#### Server Errors (500)

- **DATABASE_ERROR**: Database query failed
- **WEBHOOK_PROCESSING_ERROR**: Failed to process incoming email webhook
- **SANITIZATION_ERROR**: HTML sanitization failed

**Handling**: Frontend displays generic error message and logs error to Sentry. Backend logs full error details.

### Frontend Error Boundaries

The MailboxPage component should be wrapped in an ErrorBoundary that catches React errors and displays a fallback UI:

```typescript
<ErrorBoundary fallback={<MailboxErrorFallback />}>
  <MailboxPage />
</ErrorBoundary>
```

### Webhook Error Handling

The webhook endpoint should handle various email service provider formats and edge cases:

- **Missing required fields**: Return 400 with specific field name
- **Invalid email format**: Log warning but accept email
- **Database insertion failure**: Return 500 and log error for retry
- **No matching admin user**: Assign to default mailbox (not an error)

Webhook should return 200 OK even for non-critical errors to prevent email service provider from retrying indefinitely.

## Testing Strategy

### Dual Testing Approach

The admin mailbox feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, UI interactions, and error conditions
- **Property-based tests**: Verify universal properties across all inputs using randomized test data

### Property-Based Testing Configuration

- **Library**: fast-check (already in use for backend testing)
- **Iterations**: Minimum 100 runs per property test
- **Tagging**: Each property test must reference its design document property

Tag format:
```typescript
// Feature: admin-mailbox, Property 1: Email Authorization
```

### Unit Testing Focus Areas

#### Backend Unit Tests

1. **Webhook Processing**
   - Valid email payload creates database record
   - Missing fields handled gracefully
   - Email assignment to correct admin user
   - Default mailbox fallback

2. **Email CRUD Operations**
   - Create, read, update email records
   - Status transitions (unread → read → archived → deleted)
   - Star/unstar toggle
   - Bulk operations

3. **Authentication & Authorization**
   - JWT token validation
   - User-specific email filtering
   - Cross-user access prevention
   - Role-based access control

4. **Search and Filtering**
   - Search query parsing
   - Full-text search in subject and body
   - Status filter application
   - Combined filters (status + search)

5. **Pagination**
   - Page calculation
   - Offset and limit application
   - Metadata accuracy

6. **HTML Sanitization**
   - Script tag removal
   - Event handler removal
   - Iframe removal
   - Safe HTML preservation

#### Frontend Unit Tests

1. **Component Rendering**
   - MailboxPage renders inbox view
   - InboxView displays email list
   - EmailDetailView displays full email
   - Notification badge shows correct count

2. **User Interactions**
   - Email selection opens detail view
   - Status change buttons work
   - Star toggle works
   - Bulk selection and actions
   - Search input and submission
   - Filter dropdown changes

3. **State Management**
   - Email list state updates
   - Selected email state
   - Filter and search state
   - Loading and error states

4. **API Integration**
   - Service methods called with correct parameters
   - Response data processed correctly
   - Error responses handled
   - Loading states during API calls

### Property-Based Testing Focus Areas

Each correctness property from the design document should have a corresponding property-based test:

#### Backend Property Tests

1. **Property 1: Email Authorization** (100+ iterations)
   - Generate random admin users and emails
   - Verify each user only receives their assigned emails

2. **Property 2: Email Chronological Ordering** (100+ iterations)
   - Generate random email sets with various timestamps
   - Verify descending order by received_at

3. **Property 7: HTML Sanitization** (100+ iterations)
   - Generate random HTML with malicious content
   - Verify all dangerous elements removed

4. **Property 14: Deleted Email Retention** (100+ iterations)
   - Generate emails with various deleted_at timestamps
   - Verify only emails >30 days old are removed

5. **Property 17: Search Result Matching** (100+ iterations)
   - Generate random search queries and email sets
   - Verify all results contain query substring

6. **Property 20: Email Assignment by Recipient** (100+ iterations)
   - Generate random webhook payloads and admin email addresses
   - Verify correct admin user assignment

7. **Property 25: Pagination Subset Correctness** (100+ iterations)
   - Generate random email sets and page numbers
   - Verify correct subset returned

#### Frontend Property Tests

1. **Property 3: Inbox Display Completeness** (100+ iterations)
   - Generate random emails
   - Verify all required fields present in rendered output

2. **Property 10: Read/Unread Visual Distinction** (100+ iterations)
   - Generate pairs of read/unread emails
   - Verify different CSS classes applied

3. **Property 19: Search Term Highlighting** (100+ iterations)
   - Generate random search queries and matching emails
   - Verify highlight markup present

### Integration Testing

Integration tests should verify end-to-end workflows:

1. **Email Reception Flow**
   - Webhook receives email → Database record created → Admin sees email in inbox

2. **Email Management Flow**
   - Admin opens email → Status changes to read → Unread count decreases

3. **Search and Filter Flow**
   - Admin enters search → API called with query → Results filtered correctly

4. **Bulk Operations Flow**
   - Admin selects multiple emails → Bulk action applied → All emails updated

### Test Data Generation

Use fast-check arbitraries for generating test data:

```typescript
// Example arbitrary for email generation
const emailArbitrary = fc.record({
  id: fc.integer({ min: 1 }),
  adminUserId: fc.integer({ min: 1, max: 100 }),
  fromAddress: fc.emailAddress(),
  fromName: fc.string({ minLength: 1, maxLength: 100 }),
  subject: fc.string({ minLength: 1, maxLength: 500 }),
  bodyText: fc.string({ minLength: 0, maxLength: 10000 }),
  status: fc.constantFrom('unread', 'read', 'archived', 'deleted'),
  receivedAt: fc.date()
});
```

### Performance Testing

While not part of unit/property tests, the following performance requirements should be validated in staging:

- Search operations complete within 500ms for 10,000 emails (Requirement 5.4)
- Email webhook processing within 5 seconds (Requirement 6.4)
- Page load within 1 second (Requirement 8.4)

Use tools like Apache JMeter or k6 for load testing.

### Security Testing

Security-focused tests should verify:

1. **XSS Prevention**: HTML sanitization removes all script execution vectors
2. **SQL Injection Prevention**: Parameterized queries prevent injection
3. **Authorization Enforcement**: Users cannot access other users' emails
4. **Authentication Requirement**: All endpoints require valid JWT
5. **CSRF Protection**: State-changing operations require CSRF token (if implemented)

### Test Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 75% code coverage
- **Property Tests**: All 29 correctness properties implemented
- **Integration Tests**: All critical user flows covered

## Implementation Notes

### Email Service Provider Integration

The webhook endpoint is designed to be flexible and work with multiple email service providers. Each provider has a slightly different webhook format:

#### SendGrid Inbound Parse

SendGrid sends multipart/form-data with email content:

```typescript
// Adapter for SendGrid format
function parseSendGridWebhook(req: Request): EmailWebhookPayload {
  return {
    from: req.body.from,
    to: req.body.to,
    cc: req.body.cc ? req.body.cc.split(',') : [],
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
    messageId: req.body.headers['Message-ID'],
    // ... other fields
  };
}
```

#### Mailgun Routes

Mailgun sends JSON with email data:

```typescript
// Adapter for Mailgun format
function parseMailgunWebhook(req: Request): EmailWebhookPayload {
  const body = req.body;
  return {
    from: body.sender,
    to: body.recipient,
    subject: body.subject,
    text: body['body-plain'],
    html: body['body-html'],
    messageId: body['Message-Id'],
    // ... other fields
  };
}
```

#### AWS SES

AWS SES can trigger Lambda or send to HTTP endpoint via SNS:

```typescript
// Adapter for AWS SES format (via SNS)
function parseSESWebhook(req: Request): EmailWebhookPayload {
  const message = JSON.parse(req.body.Message);
  const mail = message.mail;
  const content = message.content;
  
  return {
    from: mail.commonHeaders.from[0],
    to: mail.commonHeaders.to[0],
    subject: mail.commonHeaders.subject,
    text: content.text,
    html: content.html,
    messageId: mail.messageId,
    // ... other fields
  };
}
```

The webhook endpoint should detect the provider based on headers or request format and use the appropriate adapter.

### Database Migration

The database migration should be created as a new file in `backend/src/db/migrations/`:

```sql
-- Migration: 001_create_admin_mailbox_tables.sql

-- Create admin_emails table
CREATE TABLE IF NOT EXISTS admin_emails (
  -- ... (full schema from Data Models section)
);

-- Create indexes
CREATE INDEX idx_admin_emails_user_id ON admin_emails(admin_user_id);
-- ... (all indexes from Data Models section)

-- Create admin_email_addresses table
CREATE TABLE IF NOT EXISTS admin_email_addresses (
  -- ... (full schema from Data Models section)
);

-- Create indexes
CREATE INDEX idx_admin_email_addresses_user_id ON admin_email_addresses(admin_user_id);
-- ... (all indexes from Data Models section)

-- Insert default admin email address (example)
INSERT INTO admin_email_addresses (admin_user_id, email_address, is_primary, is_active)
SELECT id, email, true, true
FROM users
WHERE role = 'administrator'
ON CONFLICT (email_address) DO NOTHING;
```

### Cleanup Job

A scheduled job should run daily to permanently delete emails that have been in "deleted" status for more than 30 days:

```typescript
// backend/src/jobs/cleanup-deleted-emails.ts

import pool from '../db/connection';
import logger from '../utils/logger';

export async function cleanupDeletedEmails() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await pool.query(
      `DELETE FROM admin_emails 
       WHERE status = 'deleted' 
       AND deleted_at < $1
       RETURNING id`,
      [thirtyDaysAgo]
    );

    logger.info(`Cleaned up ${result.rowCount} deleted emails older than 30 days`);
  } catch (error) {
    logger.error('Failed to cleanup deleted emails:', error);
  }
}

// Schedule to run daily at 2 AM
export function scheduleEmailCleanup() {
  const schedule = require('node-schedule');
  schedule.scheduleJob('0 2 * * *', cleanupDeletedEmails);
}
```

### Real-time Updates

The frontend polls for new emails every 30 seconds using a React hook:

```typescript
// admin-frontend/src/hooks/useEmailPolling.ts

import { useEffect, useCallback } from 'react';
import { mailboxService } from '../services/mailbox';

export function useEmailPolling(
  onNewEmails: (count: number) => void,
  interval: number = 30000
) {
  const checkForNewEmails = useCallback(async () => {
    try {
      const count = await mailboxService.getUnreadCount();
      onNewEmails(count);
    } catch (error) {
      console.error('Failed to check for new emails:', error);
    }
  }, [onNewEmails]);

  useEffect(() => {
    // Check immediately on mount
    checkForNewEmails();

    // Set up polling interval
    const intervalId = setInterval(checkForNewEmails, interval);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [checkForNewEmails, interval]);
}
```

### HTML Sanitization

Use DOMPurify on the frontend and sanitize-html on the backend:

```typescript
// Frontend sanitization
import DOMPurify from 'dompurify';

function sanitizeEmailHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  });
}

// Backend sanitization
import sanitizeHtml from 'sanitize-html';

function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
    allowedAttributes: {
      'a': ['href', 'target']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  });
}
```

### Frontend Routing

Add mailbox route to admin frontend router:

```typescript
// admin-frontend/src/App.tsx

<Route path="/mailbox" element={
  <ProtectedRoute>
    <AdminLayout>
      <MailboxPage />
    </AdminLayout>
  </ProtectedRoute>
} />
```

Add navigation link to admin layout:

```typescript
// admin-frontend/src/components/AdminLayout.tsx

<nav>
  {/* ... existing nav items ... */}
  <NavLink to="/mailbox">
    Mailbox
    {unreadCount > 0 && (
      <MailboxNotificationBadge unreadCount={unreadCount} />
    )}
  </NavLink>
</nav>
```

### Security Considerations

1. **Rate Limiting**: Apply rate limiting to webhook endpoint to prevent abuse
2. **Webhook Authentication**: Verify webhook requests using signature verification (provider-specific)
3. **Email Size Limits**: Limit email body size to prevent database bloat (e.g., 10MB max)
4. **Attachment Handling**: Initial version does not support attachments; future enhancement
5. **Email Spoofing**: Validate SPF/DKIM/DMARC at email service provider level
6. **Audit Logging**: Log all email access for compliance and security auditing

## Future Enhancements

The following features are out of scope for the initial implementation but may be added in future iterations:

1. **Email Composition**: Allow admins to compose and send emails from the mailbox
2. **Email Threading**: Group related emails into conversation threads
3. **Attachments**: Support viewing and downloading email attachments
4. **Labels/Tags**: Allow admins to organize emails with custom labels
5. **Email Templates**: Pre-defined templates for common responses
6. **Advanced Search**: Full-text search with operators (AND, OR, NOT)
7. **Email Forwarding**: Forward emails to external addresses
8. **Auto-responders**: Automatic replies based on rules
9. **Email Signatures**: Customizable email signatures per admin user
10. **Mobile App**: Native mobile app for email management
11. **Push Notifications**: Real-time push notifications for new emails (instead of polling)
12. **Email Analytics**: Dashboard showing email volume, response times, etc.

