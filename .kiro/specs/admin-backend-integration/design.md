# Design Document: Admin Backend Integration

## Overview

This design document outlines the technical approach for integrating the admin portal frontend with the backend API. The admin portal UI is complete with modern design patterns, comprehensive error handling, and all content management pages implemented. The backend has existing admin API routes for managing shows, episodes, articles, events, resources, and submissions.

The integration focuses on ensuring seamless communication between frontend and backend through:
- Enhanced API client with request tracking, CSRF protection, and robust error handling
- Comprehensive integration testing covering all CRUD operations
- File upload testing for audio, image, and document files
- Authentication flow validation including session management
- Dashboard statistics integration
- Error recovery patterns and user feedback mechanisms

### Goals

1. Ensure all admin portal features work end-to-end with the backend API
2. Implement robust error handling and recovery mechanisms
3. Validate authentication flows and session management
4. Test file upload functionality across all content types
5. Verify dashboard statistics display correctly
6. Establish integration testing patterns for future development

### Non-Goals

1. Redesigning the admin portal UI (already complete)
2. Modifying backend API routes (already implemented)
3. Implementing new features beyond integration testing
4. Performance optimization (separate concern)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Portal (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Pages    │  │ Components │  │  Contexts & Hooks    │  │
│  │            │  │            │  │                      │  │
│  │ - Shows    │  │ - Modals   │  │ - AuthContext       │  │
│  │ - Episodes │  │ - Tables   │  │ - ToastContext      │  │
│  │ - Articles │  │ - Forms    │  │ - useSessionManager │  │
│  │ - Events   │  │ - Toast    │  │                      │  │
│  │ - Resources│  │ - Loading  │  │                      │  │
│  │ - Submit.  │  │ - Confirm  │  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Shared API Client (axios)                   │  │
│  │  - Request Interceptors (auth, CSRF, tracking)       │  │
│  │  - Response Interceptors (CSRF, error handling)      │  │
│  │  - Admin API Methods (CRUD operations)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ Middleware │  │   Routes   │  │     Services         │  │
│  │            │  │            │  │                      │  │
│  │ - Auth     │  │ - Shows    │  │ - S3 Upload         │  │
│  │ - CSRF     │  │ - Episodes │  │ - Email             │  │
│  │ - Security │  │ - Articles │  │ - Sentry            │  │
│  │ - Rate Lim.│  │ - Events   │  │                      │  │
│  │            │  │ - Resources│  │                      │  │
│  │            │  │ - Submit.  │  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Integration Layers

1. **API Client Layer**: Shared axios instance with interceptors for authentication, CSRF protection, request tracking, and error handling

2. **Authentication Layer**: JWT-based authentication with token storage in localStorage, automatic token injection, and 401 handling

3. **Session Management Layer**: Activity tracking, expiry warnings, and automatic logout after inactivity

4. **Data Layer**: CRUD operations for all content types with optimistic updates and error recovery

5. **File Upload Layer**: Multipart form data uploads to S3 via backend with progress tracking

### Request Flow

```
User Action → Component → API Client → Request Interceptor → Backend
                                          ↓
                                    Add Auth Token
                                    Add CSRF Token
                                    Add Request ID
                                          ↓
Backend Response → Response Interceptor → Component → UI Update
                        ↓
                  Store CSRF Token
                  Handle 401 Errors
                  Handle Rate Limits
```

## Components and Interfaces

### API Client Configuration

The shared API client (`shared/src/services/api.ts`) is configured with:

```typescript
interface APIClientConfig {
  baseURL: string;              // From VITE_API_URL env variable
  timeout: number;              // 30000ms (30 seconds)
  withCredentials: boolean;     // true for cookie-based auth
  headers: {
    'Content-Type': string;     // 'application/json'
    'Authorization'?: string;   // 'Bearer {token}' if authenticated
    'X-CSRF-Token'?: string;    // CSRF token from sessionStorage
    'X-Request-ID': string;     // Unique request identifier
  };
}
```

### Request Interceptor

```typescript
interface RequestInterceptor {
  // Adds authentication token from localStorage
  addAuthToken: (config: AxiosRequestConfig) => AxiosRequestConfig;
  
  // Adds CSRF token from sessionStorage
  addCSRFToken: (config: AxiosRequestConfig) => AxiosRequestConfig;
  
  // Generates and adds unique request ID
  addRequestID: (config: AxiosRequestConfig) => AxiosRequestConfig;
}
```

### Response Interceptor

```typescript
interface ResponseInterceptor {
  // Stores CSRF token from response header
  storeCSRFToken: (response: AxiosResponse) => void;
  
  // Handles 401 Unauthorized errors
  handle401: (error: AxiosError) => void;
  
  // Handles 429 Rate Limit errors
  handle429: (error: AxiosError) => void;
}
```

### Admin API Methods

All admin API methods follow consistent patterns:

```typescript
// List operations with pagination, search, and filtering
interface ListParams {
  search?: string;
  status?: string;
  category?: string;
  show_id?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

interface ListResponse<T> {
  items: T[];
  count: number;
  total: number;
  limit: number;
  offset: number;
}

// CRUD operations
interface CRUDOperations<T> {
  getAll: (params?: ListParams) => Promise<ListResponse<T>>;
  getById: (id: number) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
}
```

### Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getTokenExpiry: () => number | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'content_manager' | 'administrator';
}
```

### Session Manager Hook

```typescript
interface SessionManager {
  // Track user activity
  updateActivity: () => void;
  
  // Check if session is about to expire
  isNearExpiry: () => boolean;
  
  // Extend session
  extendSession: () => void;
  
  // Force logout on expiry
  handleExpiry: () => void;
  
  // Configuration
  warningThreshold: number;  // 25 minutes
  expiryThreshold: number;   // 30 minutes
}
```

### File Upload Interface

```typescript
interface FileUploadRequest {
  file: File;
  type: 'image' | 'audio' | 'document';
}

interface FileUploadResponse {
  url: string;
  key: string;
  bucket: string;
}

interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
```

### Error Response Format

```typescript
interface APIError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
  requestId?: string;
}

// Standard error codes
enum ErrorCode {
  DUPLICATE_SLUG = 'DUPLICATE_SLUG',
  HAS_EPISODES = 'HAS_EPISODES',
  SHOW_NOT_FOUND = 'SHOW_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR'
}
```

## Data Models

### Content Entity Models

All content entities share common fields:

```typescript
interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

interface Show extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  host: string;
  category: string;
  image_url?: string;
  broadcast_schedule?: string;
  is_active: boolean;
}

interface Episode extends BaseEntity {
  show_id: number;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  duration?: number;
  published_at?: string;
  season_number?: number;
  episode_number?: number;
  transcript?: string;
}

interface Article extends BaseEntity {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  category: string;
  image_url?: string;
  status: 'draft' | 'published';
  published_at?: string;
  tags?: string[];
}

interface Event extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  virtual_link?: string;
  image_url?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  max_attendees?: number;
  registration_required: boolean;
}

interface Resource extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  category: string;
  download_count: number;
}

interface Submission extends BaseEntity {
  name: string;
  email: string;
  content_type: string;
  title: string;
  description: string;
  content?: string;
  file_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
  reviewed_at?: string;
  reviewed_by?: number;
}
```

### Dashboard Statistics Model

```typescript
interface DashboardStats {
  shows: {
    total: number;
    active: number;
  };
  episodes: {
    total: number;
    recent: number;  // Last 30 days
  };
  articles: {
    total: number;
    published: number;
    drafts: number;
  };
  events: {
    total: number;
    upcoming: number;
  };
  resources: {
    total: number;
    downloads: number;
  };
  submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  recentActivity: RecentActivity[];
}

interface RecentActivity {
  type: 'article' | 'episode' | 'event';
  title: string;
  published_at: string;
  url: string;
}
```

## Data Flow Patterns

### Optimistic Update Pattern

For delete operations, the UI updates immediately and reverts on error:

```typescript
// 1. Store original state
const originalItems = [...items];

// 2. Update UI optimistically
setItems(items.filter(item => item.id !== id));

try {
  // 3. Perform API call
  await deleteItem(id);
  
  // 4. Show success feedback
  showToast('Item deleted successfully', 'success');
} catch (error) {
  // 5. Revert on error
  setItems(originalItems);
  showToast('Failed to delete item', 'error');
}
```

### Form Submission Pattern

```typescript
// 1. Validate form data
const errors = validateForm(formData);
if (errors.length > 0) {
  setFormErrors(errors);
  return;
}

// 2. Set loading state
setIsSubmitting(true);

try {
  // 3. Submit to API
  const result = await createItem(formData);
  
  // 4. Update local state
  setItems([...items, result]);
  
  // 5. Show success and close modal
  showToast('Item created successfully', 'success');
  closeModal();
} catch (error) {
  // 6. Handle errors
  handleAPIError(error);
} finally {
  // 7. Clear loading state
  setIsSubmitting(false);
}
```

### File Upload Pattern

```typescript
// 1. Validate file
const validation = validateFile(file, maxSize, allowedTypes);
if (!validation.valid) {
  showToast(validation.error, 'error');
  return;
}

// 2. Set upload state
setIsUploading(true);
setUploadProgress(0);

try {
  // 3. Upload with progress tracking
  const result = await uploadFile(file, type, (progress) => {
    setUploadProgress(progress.percentage);
  });
  
  // 4. Update form with file URL
  setFormData({ ...formData, fileUrl: result.url });
  
  // 5. Show success
  showToast('File uploaded successfully', 'success');
} catch (error) {
  // 6. Handle errors
  handleAPIError(error);
} finally {
  // 7. Clear upload state
  setIsUploading(false);
  setUploadProgress(0);
}
```

### Error Handling Pattern

```typescript
const handleAPIError = (error: AxiosError) => {
  const response = error.response;
  
  if (!response) {
    // Network error
    showToast('Network error. Please check your connection.', 'error');
    return;
  }
  
  switch (response.status) {
    case 400:
      // Validation error
      const validationErrors = response.data.errors || [];
      setFormErrors(validationErrors);
      showToast('Please fix validation errors', 'error');
      break;
      
    case 401:
      // Unauthorized - handled by interceptor
      break;
      
    case 404:
      showToast('Resource not found', 'error');
      break;
      
    case 409:
      // Conflict (e.g., duplicate slug)
      const message = response.data.message || 'Conflict error';
      showToast(message, 'error');
      break;
      
    case 429:
      showToast('Too many requests. Please wait a moment.', 'error');
      break;
      
    case 500:
    default:
      showToast('Server error. Please try again later.', 'error');
      break;
  }
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

1. **CRUD Operations**: Requirements 4.2-4.4, 5.2-5.4, 6.2-6.4, 7.2-7.4, 8.2-8.4, 9.2-9.4 all test the same pattern (create, update, delete) across different content types. These can be combined into generic CRUD properties.

2. **Validation Errors**: Requirements 4.7, 5.6, 7.5, 8.5 all test that validation failures return 400 status. This can be one property.

3. **Page Load Fetches**: Requirements 4.1, 5.1, 6.1, 7.1, 8.1, 9.1 all test that pages fetch data on load. These are examples, not properties.

4. **File Upload Types**: Requirements 10.2, 10.3, 10.4 all test that the correct type parameter is set. This can be one property.

5. **Query Parameters**: Requirements 11.1-11.4 all test that query parameters are sent correctly. This can be one property.

6. **Pagination Math**: Requirements 12.3-12.4 test pagination offset calculations. This can be one property.

7. **Error Messages**: Requirements 14.1-14.6 all test error message display. This can be consolidated into fewer properties.

8. **Loading States**: Requirements 20.1-20.4 all test loading indicator behavior. This can be consolidated.

9. **Success Feedback**: Requirements 21.1-21.3 all test success toast display. This can be one property.

10. **Form Validation**: Requirements 22.1-22.4 all test validation error display. This can be one property.

11. **Optimistic Updates**: Requirements 23.1-23.4 test optimistic update and rollback. This can be two properties (delete and update).

12. **Confirmation Dialog**: Requirements 24.1-24.4 test confirmation flow. This can be consolidated.

### Property 1: Authentication Token Injection

*For any* API request when an authentication token exists in localStorage, the API client should include the token in the Authorization header as "Bearer {token}"

**Validates: Requirements 1.2**

### Property 2: CSRF Token Injection

*For any* API request when a CSRF token exists in sessionStorage, the API client should include the token in the X-CSRF-Token header

**Validates: Requirements 1.3**

### Property 3: Login Success Storage

*For any* successful login response, the admin portal should store both the authentication token and user data in localStorage

**Validates: Requirements 2.2, 2.3**

### Property 4: Login Failure Handling

*For any* login attempt with invalid credentials, the admin portal should display an error message without storing authentication data

**Validates: Requirements 2.4**

### Property 5: Unauthorized Response Handling

*For any* API response with 401 status, the API client should clear all authentication data from localStorage and sessionStorage, then redirect to the login page

**Validates: Requirements 2.5**

### Property 6: Logout Cleanup

*For any* logout action, the admin portal should clear all authentication data from both localStorage and sessionStorage

**Validates: Requirements 2.6**

### Property 7: Activity Tracking

*For any* API request or user interaction, the session manager should update the last activity timestamp

**Validates: Requirements 3.1, 3.5**

### Property 8: Session Extension

*For any* user interaction with the session expiry warning, the session manager should extend the session and reset the inactivity timer

**Validates: Requirements 3.3**

### Property 9: Content CRUD Operations

*For any* content entity (show, episode, article, event, resource, submission), creating should send POST with all required fields, updating should send PUT with modified fields, and deleting should send DELETE to the correct endpoint

**Validates: Requirements 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 6.2, 6.3, 6.4, 7.2, 7.3, 7.4, 8.2, 8.3, 8.4, 9.2, 9.3, 9.4**

### Property 10: Article Publishing Operations

*For any* article, publishing should send POST to /api/admin/articles/:id/publish and unpublishing should send POST to /api/admin/articles/:id/unpublish

**Validates: Requirements 6.5, 6.6**

### Property 11: Validation Error Response

*For any* API request with invalid data, the backend should return a 400 status with error details in a consistent format

**Validates: Requirements 4.7, 5.6, 7.5, 8.5, 14.7**

### Property 12: File Upload Type Parameter

*For any* file upload, the admin portal should set the type parameter to 'audio', 'image', or 'document' based on the file's MIME type

**Validates: Requirements 10.2, 10.3, 10.4**

### Property 13: File Upload Success Response

*For any* successful file upload, the backend should return a response containing the S3 file URL

**Validates: Requirements 10.5**

### Property 14: File Upload Progress Tracking

*For any* file upload in progress, the admin portal should display upload progress as a percentage from 0 to 100

**Validates: Requirements 10.7**

### Property 15: Query Parameter Transmission

*For any* content list request with search, filter, or sort parameters, the admin portal should include those parameters in the query string

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 13.1**

### Property 16: Case-Insensitive Search

*For any* search query, the backend should perform case-insensitive ILIKE searches on title and description fields

**Validates: Requirements 11.5**

### Property 17: Pagination Response Structure

*For any* paginated list request, the backend should return a response containing count, total, limit, and offset fields

**Validates: Requirements 12.2**

### Property 18: Pagination Offset Calculation

*For any* pagination navigation, moving to the next page should increment offset by limit, and moving to the previous page should decrement offset by limit

**Validates: Requirements 12.3, 12.4**

### Property 19: Page Number Display

*For any* paginated list, the admin portal should calculate and display the current page number as (offset / limit) + 1 and total pages as ceil(total / limit)

**Validates: Requirements 12.5**

### Property 20: Sort Parameter Validation

*For any* sort request, the backend should validate the sort field against a whitelist and the order value as either ASC or DESC

**Validates: Requirements 13.2, 13.3**

### Property 21: HTTP Error Message Display

*For any* HTTP error response, the admin portal should display an appropriate user-friendly message based on the status code: network errors show connection message, 400 shows validation errors, 404 shows "Resource not found", 409 shows conflict reason, 429 shows rate limit message, and 500 shows server error message

**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**

### Property 22: Dashboard Statistics Display

*For any* dashboard statistics response, the admin portal should display total counts for all content types and pending submissions count

**Validates: Requirements 15.2, 15.3, 15.4**

### Property 23: Bulk Operation Request Format

*For any* bulk publish or unpublish operation, the admin portal should send a POST request with an array of article IDs in the request body

**Validates: Requirements 16.1, 16.2**

### Property 24: Bulk Operation Response

*For any* bulk operation response, the backend should return the count of items that were successfully updated

**Validates: Requirements 16.4**

### Property 25: Protected Route Authentication Check

*For any* protected admin route, the admin portal should check authentication status and redirect unauthenticated users to the login page, while rendering the requested page for authenticated users

**Validates: Requirements 17.1, 17.2, 17.3, 17.4**

### Property 26: Request ID Generation

*For any* API request, the API client should generate a unique X-Request-ID header using crypto.getRandomValues

**Validates: Requirements 18.1, 18.4**

### Property 27: CSRF Token Storage and Retrieval

*For any* API response containing an X-CSRF-Token header, the API client should store it in sessionStorage, and for any subsequent request, the API client should include the stored token in the X-CSRF-Token header

**Validates: Requirements 19.1, 19.2, 19.3**

### Property 28: Session Expiry CSRF Cleanup

*For any* session expiry event, the admin portal should clear the CSRF token from sessionStorage

**Validates: Requirements 19.4**

### Property 29: Loading State Management

*For any* asynchronous operation (data fetch or form submission), the admin portal should display a loading indicator during the operation and hide it when the operation completes or fails

**Validates: Requirements 20.1, 20.2, 20.3, 20.4**

### Property 30: Success Toast Display

*For any* successful CRUD operation (create, update, or delete), the admin portal should display a success toast message that automatically dismisses after 3 seconds

**Validates: Requirements 21.1, 21.2, 21.3, 21.4**

### Property 31: Content List Refresh

*For any* successful CRUD operation, the admin portal should refresh the content list to reflect the changes

**Validates: Requirements 21.5**

### Property 32: Client-Side Form Validation

*For any* form field with validation rules (required, email format, URL format, date format), the admin portal should display a validation error when the field value is invalid and prevent form submission when any validation errors exist

**Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5**

### Property 33: Optimistic Delete with Rollback

*For any* delete operation, the admin portal should immediately remove the item from the list, and if the operation fails, restore the item to its original position

**Validates: Requirements 23.1, 23.2**

### Property 34: Optimistic Update with Rollback

*For any* update operation, the admin portal should immediately update the item in the list, and if the operation fails, revert the item to its original state

**Validates: Requirements 23.3, 23.4**

### Property 35: Delete Confirmation Flow

*For any* delete action on a content entity, the admin portal should display a confirmation dialog with the item name, proceed with deletion if confirmed, and close the dialog without deleting if cancelled

**Validates: Requirements 24.1, 24.2, 24.3, 24.4**

### Property 36: Error Retry Mechanism

*For any* network error, the admin portal should display a retry button, attempt the operation again when clicked, limit retries to prevent infinite loops, and display a final error message when retries are exhausted

**Validates: Requirements 25.1, 25.2, 25.4, 25.5**

## Error Handling

### Error Categories

1. **Network Errors**: Connection failures, timeouts, DNS resolution failures
   - Display: "Network error. Please check your connection."
   - Action: Provide retry button

2. **Authentication Errors (401)**: Invalid or expired tokens
   - Display: Automatic redirect to login page
   - Action: Clear all authentication data

3. **Authorization Errors (403)**: Insufficient permissions
   - Display: "You don't have permission to perform this action."
   - Action: Log error, suggest contacting administrator

4. **Validation Errors (400)**: Invalid input data
   - Display: Field-specific error messages
   - Action: Highlight invalid fields, prevent submission

5. **Not Found Errors (404)**: Resource doesn't exist
   - Display: "Resource not found"
   - Action: Suggest returning to list view

6. **Conflict Errors (409)**: Duplicate slugs, constraint violations
   - Display: Specific conflict reason (e.g., "Slug already exists")
   - Action: Suggest alternative values

7. **Rate Limit Errors (429)**: Too many requests
   - Display: "Too many requests. Please wait a moment."
   - Action: Disable actions temporarily, suggest waiting

8. **Server Errors (500)**: Internal server errors
   - Display: "Server error. Please try again later."
   - Action: Log error to Sentry, provide retry option

### Error Response Format

All backend errors follow this consistent format:

```typescript
{
  message: string;        // Human-readable error message
  code?: string;          // Machine-readable error code
  field?: string;         // Field name for validation errors
  details?: object;       // Additional error context
  requestId?: string;     // Request ID for debugging
}
```

### Error Handling Strategy

1. **Graceful Degradation**: UI remains functional even when errors occur
2. **User Feedback**: Clear, actionable error messages
3. **Error Recovery**: Retry mechanisms for transient failures
4. **Error Logging**: All errors logged to Sentry with context
5. **Rollback Support**: Optimistic updates can be reverted on failure

### Edge Cases

1. **Show with Episodes**: Cannot delete a show that has associated episodes
   - Backend returns: `{ code: 'HAS_EPISODES', message: 'Cannot delete show with episodes' }`
   - UI displays: "This show has episodes. Delete all episodes first."

2. **Duplicate Slug**: Cannot create/update with existing slug
   - Backend returns: `{ code: 'DUPLICATE_SLUG', message: 'Slug already exists' }`
   - UI displays: "This slug is already in use. Please choose a different one."

3. **Invalid Show Reference**: Cannot create episode with non-existent show_id
   - Backend returns: `{ code: 'SHOW_NOT_FOUND', message: 'Show not found' }`
   - UI displays: "The selected show doesn't exist. Please refresh and try again."

4. **Empty Bulk Operation**: Cannot perform bulk action with no items selected
   - Frontend validation: Check selection before API call
   - UI displays: "No items selected. Please select at least one item."

5. **Session Expiry During Operation**: Token expires while form is open
   - Interceptor catches 401, redirects to login
   - UI displays: "Your session has expired. Please log in again."

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using fast-check

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

We will use **fast-check** for property-based testing in both backend and frontend:

- **Minimum iterations**: 100 runs per property test (due to randomization)
- **Test tagging**: Each property test must reference its design document property
- **Tag format**: `// Feature: admin-backend-integration, Property {number}: {property_text}`

### Unit Testing Focus Areas

Unit tests should focus on:

1. **Specific Examples**: Concrete scenarios that demonstrate correct behavior
   - Example: Login with valid credentials returns token
   - Example: Dashboard loads and displays statistics

2. **Edge Cases**: Boundary conditions and special scenarios
   - Example: Show with episodes cannot be deleted
   - Example: Duplicate slug returns 409 error
   - Example: Session warning at 25 minutes
   - Example: Session expiry at 30 minutes
   - Example: Empty bulk operation validation
   - Example: Invalid sort field fallback
   - Example: Invalid order value fallback

3. **Integration Points**: Component interactions
   - Example: API client interceptors modify requests
   - Example: Auth context updates on login
   - Example: Toast displays on CRUD success

4. **Error Conditions**: Specific error scenarios
   - Example: Network timeout displays error
   - Example: 401 redirects to login
   - Example: Validation errors display field messages

### Property Testing Focus Areas

Property tests should focus on:

1. **Universal Behaviors**: Rules that apply to all inputs
   - Property: All authenticated requests include auth token
   - Property: All CRUD operations follow consistent patterns
   - Property: All errors display appropriate messages

2. **Invariants**: Conditions that must always hold
   - Property: Pagination offset always divisible by limit
   - Property: Request IDs are always unique
   - Property: CSRF tokens persist across requests

3. **Round-Trip Properties**: Operations that should be reversible
   - Property: Optimistic delete + rollback restores original state
   - Property: Optimistic update + rollback restores original state

4. **Metamorphic Properties**: Relationships between operations
   - Property: Next page offset = current offset + limit
   - Property: Previous page offset = current offset - limit

### Integration Testing Approach

Integration tests verify end-to-end flows:

1. **Authentication Flow**
   - Login → Store token → Make authenticated request → Logout → Clear token

2. **CRUD Flow**
   - Create show → Verify in list → Update show → Verify changes → Delete show → Verify removed

3. **File Upload Flow**
   - Select file → Upload → Receive URL → Use URL in content → Verify content

4. **Error Recovery Flow**
   - Submit invalid data → See validation errors → Fix errors → Submit successfully

5. **Session Management Flow**
   - Login → Activity → Inactivity warning → Extend session → Continue working

### Manual Testing Procedures

For each content type (shows, episodes, articles, events, resources, submissions):

1. **Create**: Fill form, upload files if needed, submit, verify success toast, verify in list
2. **Read**: Load list, verify pagination, search, filter, sort
3. **Update**: Edit item, modify fields, submit, verify success toast, verify changes
4. **Delete**: Click delete, confirm dialog, verify success toast, verify removed
5. **Error Handling**: Submit invalid data, verify error messages, fix and resubmit

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Property Tests**: All 36 correctness properties implemented
- **Integration Tests**: All major user flows covered
- **Manual Tests**: All content types tested end-to-end

### Testing Tools

- **Frontend**: Jest + React Testing Library + fast-check
- **Backend**: Jest + Supertest + fast-check
- **E2E**: Manual testing with documented procedures
- **Monitoring**: Sentry for production error tracking


## Implementation Notes

### API Client Enhancements

The shared API client (`shared/src/services/api.ts`) already implements most required functionality:

- ✅ Base URL configuration from environment variable
- ✅ Authentication token injection via request interceptor
- ✅ CSRF token storage and injection
- ✅ Request ID generation using crypto.getRandomValues
- ✅ 401 error handling with redirect
- ✅ 429 rate limit warning
- ✅ 30-second timeout
- ✅ withCredentials enabled

**Enhancements Needed:**
- Add request tracking for debugging
- Improve error response parsing
- Add retry logic for network errors
- Add upload progress callback support

### Session Management

The session manager hook (`admin-frontend/src/hooks/useSessionManager.ts`) already implements:

- ✅ Activity tracking
- ✅ Expiry warning at 25 minutes
- ✅ Automatic logout at 30 minutes
- ✅ Session extension on user interaction

**Enhancements Needed:**
- Add CSRF token cleanup on expiry
- Add activity tracking for all API requests
- Add visual feedback for session extension

### File Upload

The file uploader component (`shared/src/components/FileUploader.tsx`) already implements:

- ✅ File type validation
- ✅ File size validation
- ✅ Upload progress display
- ✅ Error handling

**Enhancements Needed:**
- Add progress callback to API client
- Add retry logic for failed uploads
- Add cancel upload functionality

### Dashboard Statistics

The dashboard page (`admin-frontend/src/pages/AdminDashboardPage.tsx`) needs:

- API endpoint for statistics: `GET /api/admin/dashboard/stats`
- Statistics display components
- Auto-refresh functionality
- Loading states

### Testing Infrastructure

**Property-Based Testing Setup:**

```typescript
// Example property test structure
import fc from 'fast-check';

describe('Admin Backend Integration Properties', () => {
  // Feature: admin-backend-integration, Property 1: Authentication Token Injection
  it('should include auth token in all authenticated requests', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20 }), // Generate random tokens
        (token) => {
          localStorage.setItem('auth_token', token);
          const config = requestInterceptor({});
          expect(config.headers.Authorization).toBe(`Bearer ${token}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: admin-backend-integration, Property 9: Content CRUD Operations
  it('should send correct HTTP methods for CRUD operations', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1 }),
          title: fc.string({ minLength: 1 }),
          description: fc.string()
        }),
        async (content) => {
          // Test create
          const createSpy = jest.spyOn(api, 'post');
          await createShow(content);
          expect(createSpy).toHaveBeenCalledWith('/api/admin/shows', content);

          // Test update
          const updateSpy = jest.spyOn(api, 'put');
          await updateShow(content.id, content);
          expect(updateSpy).toHaveBeenCalledWith(`/api/admin/shows/${content.id}`, content);

          // Test delete
          const deleteSpy = jest.spyOn(api, 'delete');
          await deleteShow(content.id);
          expect(deleteSpy).toHaveBeenCalledWith(`/api/admin/shows/${content.id}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Unit Test Structure:**

```typescript
// Example unit test structure
describe('Admin Shows Page', () => {
  it('should fetch shows on page load', async () => {
    const mockShows = [
      { id: 1, title: 'Test Show', slug: 'test-show' }
    ];
    jest.spyOn(api, 'get').mockResolvedValue({ data: { shows: mockShows } });

    render(<AdminShowsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Show')).toBeInTheDocument();
    });
  });

  it('should handle show with episodes deletion error', async () => {
    jest.spyOn(api, 'delete').mockRejectedValue({
      response: {
        status: 409,
        data: { code: 'HAS_EPISODES', message: 'Cannot delete show with episodes' }
      }
    });

    render(<AdminShowsPage />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/has episodes/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Test Checklist

For each content type, verify:

- [ ] List page loads and displays items
- [ ] Search filters items correctly
- [ ] Pagination works (next/previous)
- [ ] Sorting works (ascending/descending)
- [ ] Create modal opens and closes
- [ ] Create form validates required fields
- [ ] Create form validates field formats
- [ ] Create form submits successfully
- [ ] Create success toast displays
- [ ] Created item appears in list
- [ ] Edit modal opens with existing data
- [ ] Edit form validates changes
- [ ] Edit form submits successfully
- [ ] Edit success toast displays
- [ ] Edited item updates in list
- [ ] Delete confirmation dialog appears
- [ ] Delete confirmation proceeds
- [ ] Delete cancellation works
- [ ] Delete success toast displays
- [ ] Deleted item removes from list
- [ ] File upload works (if applicable)
- [ ] File upload progress displays
- [ ] File upload errors handled
- [ ] Network errors display retry button
- [ ] Validation errors display field messages
- [ ] Duplicate slug error displays
- [ ] Session expiry redirects to login

### Performance Considerations

1. **Lazy Loading**: All admin pages are already lazy-loaded for code splitting
2. **Pagination**: Default limit of 20 items per page to reduce payload size
3. **Debouncing**: Search input should debounce at 300ms to reduce API calls
4. **Caching**: Consider implementing React Query for request caching
5. **Optimistic Updates**: Already implemented for better perceived performance

### Security Considerations

1. **CSRF Protection**: Already implemented with token exchange
2. **XSS Prevention**: All user input sanitized before display
3. **Authentication**: JWT tokens with expiry
4. **Authorization**: Backend validates user roles
5. **Rate Limiting**: Backend implements rate limiting
6. **HTTPS**: All production traffic over HTTPS
7. **Secure Storage**: Tokens in localStorage (consider httpOnly cookies for production)

### Deployment Considerations

1. **Environment Variables**: Ensure VITE_API_URL is set correctly for each environment
2. **CORS Configuration**: Backend must allow admin portal origin
3. **S3 Bucket**: Ensure admin has write permissions to S3 bucket
4. **Database Migrations**: Run migrations before deploying backend changes
5. **Monitoring**: Sentry configured for both frontend and backend
6. **Logging**: Winston configured for backend request logging

### Future Enhancements

1. **Real-time Updates**: WebSocket support for live content updates
2. **Batch Operations**: Extend bulk operations to all content types
3. **Content Versioning**: Track changes and allow rollback
4. **Advanced Search**: Full-text search with Elasticsearch
5. **Analytics Dashboard**: Content performance metrics
6. **Scheduled Publishing**: Schedule content for future publication
7. **Content Preview**: Preview content before publishing
8. **Audit Log**: Track all admin actions for compliance

## Summary

This design document outlines the integration approach for connecting the admin portal frontend with the backend API. The integration focuses on:

1. **Robust API Client**: Enhanced with request tracking, CSRF protection, and comprehensive error handling
2. **Authentication & Session Management**: JWT-based auth with automatic token injection and session expiry handling
3. **CRUD Operations**: Consistent patterns across all content types with optimistic updates
4. **File Uploads**: Multipart uploads with progress tracking and error recovery
5. **Error Handling**: User-friendly messages with retry mechanisms
6. **Testing Strategy**: Dual approach with unit tests for specific cases and property tests for universal behaviors

The design leverages existing implementations in the shared API client, auth context, and session manager, requiring only targeted enhancements for complete integration. All 36 correctness properties derived from the 25 requirements will be validated through property-based testing using fast-check, ensuring comprehensive coverage of the integration layer.

