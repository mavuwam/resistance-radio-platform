# Design Document: Admin Portal UI/UX Improvements

## Overview

This design document outlines the comprehensive UI/UX improvements for the admin portal of the Zimbabwe Voice platform. The admin portal is a separate React application running on port 5174, isolated from the main public website. This design focuses on enhancing error handling, user feedback, loading states, visual design, and overall user experience for content managers.

### Goals

- Implement robust error handling with user-friendly error boundaries
- Provide clear user feedback through toast notifications
- Add comprehensive loading states and skeleton loaders
- Establish a modern, consistent design system
- Improve form validation and user input handling
- Enhance accessibility and keyboard navigation
- Optimize performance and responsiveness

### Constraints

- ALL changes must be isolated to `admin-frontend/` and `shared/` directories only
- The main app (`frontend/`) must NOT be modified
- The backend API (`backend/`) requires no changes
- Must maintain compatibility with existing authentication system
- Must work with current Vite dev server configuration

### Technology Stack

- React 18 with TypeScript (strict mode)
- Vite build tool
- React Router v6 for navigation
- Axios for API calls (from shared library)
- CSS Modules or plain CSS (no external UI libraries)
- fast-check for property-based testing

## Architecture

### Application Structure

```
admin-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.tsx       (NEW)
│   │   ├── Toast.tsx               (NEW)
│   │   ├── Loading.tsx             (NEW)
│   │   ├── ConfirmDialog.tsx       (NEW)
│   │   ├── ContentTable.tsx        (ENHANCE)
│   │   ├── ContentModal.tsx        (ENHANCE)
│   │   ├── AdminLayout.tsx         (ENHANCE)
│   │   └── ProtectedRoute.tsx      (existing)
│   ├── pages/               # Page components
│   │   └── *.tsx                   (FIX imports, add error handling)
│   ├── styles/              # Global styles
│   │   ├── variables.css           (NEW)
│   │   ├── global.css              (NEW)
│   │   └── components.css          (NEW)
│   ├── utils/               # Utility functions
│   │   ├── validation.ts           (NEW)
│   │   └── toast.ts                (NEW)
│   └── App.tsx              # Main app (ENHANCE)
```


### Component Hierarchy

```
App (with ErrorBoundary)
├── Router
│   ├── AuthProvider (from shared)
│   │   ├── ToastContainer (NEW)
│   │   └── Routes
│   │       ├── AdminLoginPage
│   │       └── ProtectedRoute
│   │           └── AdminLayout
│   │               └── Page Components
│   │                   ├── ErrorBoundary (per page)
│   │                   ├── Loading States
│   │                   ├── ContentTable (enhanced)
│   │                   ├── ContentModal (enhanced)
│   │                   └── ConfirmDialog (NEW)
```

### State Management

The application uses React Context for global state:

1. **AuthContext** (from shared library)
   - User authentication state
   - Login/logout functions
   - Token management

2. **ToastContext** (NEW)
   - Toast notification queue
   - Add/remove toast functions
   - Auto-dismiss timers

3. **Local Component State**
   - Form data
   - Loading states
   - Error states
   - Modal visibility
   - Selected rows

### Data Flow

```
User Action → Component Handler → API Call → Response Handler → State Update → UI Update
                                      ↓
                                  Error Handler → Toast Notification
                                      ↓
                                  Loading State → Loading UI
```

## Components and Interfaces

### 1. ErrorBoundary Component

**Purpose**: Catch JavaScript errors in child components and display user-friendly error messages.

**Location**: `admin-frontend/src/components/ErrorBoundary.tsx`

**Interface**:
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

**Behavior**:
- Catches errors in child component tree
- Displays fallback UI with error message
- Provides "Reload Page" button
- Logs errors to console and Sentry
- Shows stack trace in development mode only
- Resets error state when user navigates away


### 2. Toast Notification System

**Purpose**: Provide temporary feedback messages for user actions.

**Location**: 
- `admin-frontend/src/components/Toast.tsx`
- `admin-frontend/src/utils/toast.ts`

**Interface**:
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}
```

**Behavior**:
- Displays notifications in top-right corner
- Auto-dismisses after 5 seconds (configurable)
- Supports multiple simultaneous toasts (max 5)
- Stacks vertically with smooth animations
- Click to dismiss manually
- Different colors for each type:
  - Success: Green (#10b981)
  - Error: Red (#ef4444)
  - Warning: Yellow (#f59e0b)
  - Info: Blue (#3b82f6)

**Usage Pattern**:
```typescript
import { useToast } from '../utils/toast';

const { addToast } = useToast();

// Success
addToast('success', 'Show created successfully');

// Error
addToast('error', 'Failed to delete episode');

// Warning
addToast('warning', 'Session expires in 5 minutes');

// Info
addToast('info', 'Draft saved automatically');
```

### 3. Loading Components

**Purpose**: Provide visual feedback during data fetching and processing.

**Location**: `admin-frontend/src/components/Loading.tsx`

**Components**:

1. **Spinner**
```typescript
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}
```

2. **SkeletonLoader**
```typescript
interface SkeletonLoaderProps {
  type: 'table' | 'card' | 'text' | 'circle';
  rows?: number;
  columns?: number;
}
```

3. **LoadingOverlay**
```typescript
interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}
```

**Behavior**:
- Spinner: Rotating circle animation
- Skeleton: Pulsing gray rectangles matching content shape
- Overlay: Semi-transparent backdrop with centered spinner
- Minimum display time: 300ms (prevents flickering)
- Accessible with aria-live announcements


### 4. Confirmation Dialog Component

**Purpose**: Require explicit user confirmation before destructive actions.

**Location**: `admin-frontend/src/components/ConfirmDialog.tsx`

**Interface**:
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}
```

**Behavior**:
- Modal overlay with focus trap
- Distinct visual styling for destructive actions (red for danger)
- Disabled confirm button during loading
- Escape key closes dialog
- Click outside closes dialog
- Accessible with proper ARIA attributes

### 5. Form Validation Utilities

**Purpose**: Provide reusable validation functions for form inputs.

**Location**: `admin-frontend/src/utils/validation.ts`

**Functions**:
```typescript
// Email validation
export function validateEmail(email: string): { valid: boolean; error?: string };

// URL validation
export function validateUrl(url: string): { valid: boolean; error?: string };

// File validation
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number
): { valid: boolean; error?: string };

// Required field validation
export function validateRequired(value: any, fieldName: string): { valid: boolean; error?: string };

// Length validation
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; error?: string };
```

**Validation Rules**:
- Email: Standard RFC 5322 pattern
- URL: Must start with http:// or https://
- File type: Check MIME type and extension
- File size: Check in bytes, convert to MB for display
- Required: Check for null, undefined, empty string, whitespace-only
- Length: Check string length within bounds


### 6. Enhanced ContentTable Component

**Purpose**: Display tabular data with sorting, selection, and empty states.

**Location**: `admin-frontend/src/components/ContentTable.tsx` (ENHANCE)

**Enhancements**:
1. Better empty state with icon and call-to-action
2. Improved loading skeleton that matches table structure
3. Error state display with retry button
4. Sticky header for long tables
5. Responsive column hiding on mobile
6. Hover effects and visual feedback
7. Accessible keyboard navigation

**New Props**:
```typescript
interface ContentTableProps {
  // ... existing props
  error?: string;
  onRetry?: () => void;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  stickyHeader?: boolean;
  responsiveColumns?: string[]; // columns to hide on mobile
}
```

### 7. Enhanced ContentModal Component

**Purpose**: Display modal dialogs for forms and content details.

**Location**: `admin-frontend/src/components/ContentModal.tsx` (ENHANCE)

**Enhancements**:
1. Better styling with modern shadows and borders
2. Smooth enter/exit animations
3. Improved accessibility with focus management
4. Loading state within modal
5. Scrollable body with fixed header/footer
6. Mobile-responsive sizing

**New Props**:
```typescript
interface ContentModalProps {
  // ... existing props
  loading?: boolean;
  maxHeight?: string;
  preventClose?: boolean; // prevent closing during save
}
```

### 8. Enhanced AdminLayout Component

**Purpose**: Provide consistent layout with navigation for all admin pages.

**Location**: `admin-frontend/src/components/AdminLayout.tsx` (ENHANCE)

**Enhancements**:
1. Collapsible sidebar on mobile
2. Active route highlighting
3. Pending submissions badge
4. User menu with logout
5. "View Site" link to public website
6. Breadcrumb navigation
7. Responsive hamburger menu

## Data Models

### Toast Data Model

```typescript
interface Toast {
  id: string;              // UUID
  type: ToastType;         // 'success' | 'error' | 'warning' | 'info'
  message: string;         // Display message
  duration: number;        // Auto-dismiss duration in ms (default: 5000)
  createdAt: number;       // Timestamp for ordering
}
```

### Error State Model

```typescript
interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}
```

### Loading State Model

```typescript
interface LoadingState {
  isLoading: boolean;
  message?: string;
  startTime: number;       // For minimum display time
}
```

### Form Validation State

```typescript
interface ValidationState {
  [fieldName: string]: {
    value: any;
    error: string | null;
    touched: boolean;
    dirty: boolean;
  };
}
```


## API Integration Patterns

### Error Handling Pattern

All API calls should follow this pattern:

```typescript
import { useToast } from '../utils/toast';

const { addToast } = useToast();
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleApiCall = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await api.someEndpoint();
    addToast('success', 'Operation completed successfully');
    // Handle success
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'An error occurred';
    setError(errorMessage);
    addToast('error', errorMessage);
    console.error('API Error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

### Loading State Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);
const [minLoadingTime, setMinLoadingTime] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  const startTime = Date.now();
  
  try {
    const data = await api.getData();
    
    // Ensure minimum loading time of 300ms to prevent flicker
    const elapsed = Date.now() - startTime;
    if (elapsed < 300) {
      await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
    }
    
    setData(data);
  } catch (err) {
    handleError(err);
  } finally {
    setIsLoading(false);
  }
};
```

### Form Submission Pattern

```typescript
const [formData, setFormData] = useState(initialData);
const [validationErrors, setValidationErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate
  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    addToast('error', 'Please fix validation errors');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    await api.submitForm(formData);
    addToast('success', 'Form submitted successfully');
    onClose();
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Submission failed';
    addToast('error', errorMessage);
    
    // Handle field-specific errors from API
    if (err.response?.data?.errors) {
      setValidationErrors(err.response.data.errors);
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

### Delete Confirmation Pattern

```typescript
const [showConfirm, setShowConfirm] = useState(false);
const [itemToDelete, setItemToDelete] = useState<any>(null);
const [isDeleting, setIsDeleting] = useState(false);

const handleDeleteClick = (item: any) => {
  setItemToDelete(item);
  setShowConfirm(true);
};

const handleConfirmDelete = async () => {
  if (!itemToDelete) return;
  
  setIsDeleting(true);
  
  try {
    await api.deleteItem(itemToDelete.id);
    addToast('success', `${itemToDelete.name} deleted successfully`);
    setShowConfirm(false);
    refreshData();
  } catch (err: any) {
    addToast('error', err.response?.data?.message || 'Delete failed');
  } finally {
    setIsDeleting(false);
  }
};
```


## Design System

### Color Palette

```css
/* Primary Colors */
--color-primary: #2563eb;      /* Blue - primary actions */
--color-primary-hover: #1d4ed8;
--color-primary-light: #dbeafe;

/* Secondary Colors */
--color-secondary: #64748b;    /* Slate - secondary actions */
--color-secondary-hover: #475569;

/* Semantic Colors */
--color-success: #10b981;      /* Green - success states */
--color-success-light: #d1fae5;
--color-error: #ef4444;        /* Red - errors, destructive */
--color-error-light: #fee2e2;
--color-warning: #f59e0b;      /* Amber - warnings */
--color-warning-light: #fef3c7;
--color-info: #3b82f6;         /* Blue - informational */
--color-info-light: #dbeafe;

/* Neutral Colors */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;

/* Background Colors */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9fafb;
--color-bg-tertiary: #f3f4f6;

/* Text Colors */
--color-text-primary: #111827;
--color-text-secondary: #6b7280;
--color-text-tertiary: #9ca3af;
```

### Typography

```css
/* Font Family */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing

```css
/* Spacing Scale (4px base) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-full: 9999px;  /* Fully rounded */
```

### Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1440px;  /* Desktops */
```


## Error Handling Strategy

### Error Boundary Strategy

1. **Global Error Boundary**: Wraps entire app to catch catastrophic errors
2. **Route Error Boundaries**: Wrap each major route for isolated error handling
3. **Component Error Boundaries**: Wrap complex components that may fail independently

### Error Types and Handling

```typescript
// API Errors
interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>; // Field-specific errors
}

// Network Errors
interface NetworkError {
  type: 'timeout' | 'offline' | 'unknown';
  message: string;
}

// Validation Errors
interface ValidationError {
  field: string;
  message: string;
}
```

### Error Recovery Strategies

1. **Retry**: For transient network errors
2. **Reload**: For component errors caught by error boundary
3. **Redirect**: For authentication errors
4. **Preserve State**: For form submission errors
5. **Fallback UI**: For non-critical component failures

## Testing Strategy

### Unit Testing

Unit tests will focus on:
- Individual component rendering and behavior
- Validation function logic
- Utility function correctness
- Error handling edge cases
- Form submission flows

**Testing Library**: Jest + React Testing Library

**Example Unit Tests**:
- Toast notification display and auto-dismiss
- Form validation with various inputs
- Error boundary error catching
- Loading state transitions
- Modal open/close behavior

### Property-Based Testing

Property tests will verify universal behaviors across all inputs using fast-check.

**Testing Library**: fast-check with Jest

**Configuration**: Minimum 100 iterations per property test

**Property Test Areas**:
- Form validation with random inputs
- Error handling with random error types
- Loading state timing with random delays
- Toast notification queue management
- Responsive behavior at random viewport sizes

Each property test will be tagged with:
```typescript
// Feature: admin-portal-ui-improvements, Property X: [property description]
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Error Boundary Catches All Component Errors

*For any* JavaScript error thrown in a child component, the Error Boundary should catch the error and display the fallback UI instead of crashing the application.

**Validates: Requirements 1.1**

### Property 2: Error Boundary Logs to Console

*For any* error caught by the Error Boundary, the error details should be logged to the console for debugging purposes.

**Validates: Requirements 1.2**

### Property 3: Error Stack Trace Visibility

*For any* error caught by the Error Boundary, the stack trace should be visible in development mode and hidden in production mode.

**Validates: Requirements 1.4**

### Property 4: Error Boundary Sentry Integration

*For any* error caught by the Error Boundary, the error details should be sent to Sentry for monitoring.

**Validates: Requirements 1.5**

### Property 5: API 4xx Error Message Display

*For any* API request that fails with a 4xx status code, the error message from the API response should be displayed to the user via toast notification.

**Validates: Requirements 2.1**

### Property 6: API 5xx Generic Error Message

*For any* API request that fails with a 5xx status code, a generic "Server error" message should be displayed to the user.

**Validates: Requirements 2.2**

### Property 7: Toast Auto-Dismiss Timing

*For any* toast notification displayed, it should automatically dismiss after 5 seconds (or the specified duration).

**Validates: Requirements 2.6**

### Property 8: Form Data Preservation on Error

*For any* form submission that fails due to an API error, the form data should remain intact to allow the user to retry.

**Validates: Requirements 2.7**

### Property 9: Loading State Display During API Calls

*For any* API call in progress, a loading state indicator should be displayed to provide user feedback.

**Validates: Requirements 3.1**

### Property 10: Form Submit Button Disabled During Submission

*For any* form being submitted, the submit button should be disabled and display "Saving..." text until the submission completes.

**Validates: Requirements 3.4**

### Property 11: Table Refresh Preserves Data Visibility

*For any* table being refreshed, the existing data should remain visible while the loading indicator is shown.

**Validates: Requirements 3.5**

### Property 12: Minimum Loading Display Time

*For any* loading state that completes in less than 300ms, the loading indicator should still be displayed for at least 300ms to prevent flickering.

**Validates: Requirements 3.6**

### Property 13: Long Operation Warning Message

*For any* loading operation that exceeds 10 seconds, a "This is taking longer than usual" message should be displayed.

**Validates: Requirements 3.7**

### Property 14: Text Contrast Ratio Compliance

*For any* text element in the admin portal, the contrast ratio between text and background should be at least 4.5:1 for accessibility compliance.

**Validates: Requirements 4.7**

### Property 15: Interactive Element Focus States

*For any* interactive element (button, link, input), a visible focus state should be displayed when the element receives keyboard focus.

**Validates: Requirements 4.9**

### Property 16: Responsive Sidebar Collapse

*For any* viewport width less than 768px, the sidebar navigation should collapse into a hamburger menu.

**Validates: Requirements 5.1**

### Property 17: Responsive Form Field Stacking

*For any* viewport width less than 1024px, form fields should stack vertically instead of horizontally.

**Validates: Requirements 5.2**

### Property 18: Responsive Table Column Hiding

*For any* viewport width less than 640px, non-essential table columns should be hidden to improve mobile usability.

**Validates: Requirements 5.3**

### Property 19: Responsive Font Scaling

*For any* viewport width, font sizes should scale appropriately to maintain readability across devices.

**Validates: Requirements 5.4**

### Property 20: Touch Target Size Compliance

*For any* interactive element, the touch target size should be at least 44x44 pixels for mobile accessibility.

**Validates: Requirements 5.5**

### Property 21: No Horizontal Scrolling

*For any* viewport width, the admin portal should not require horizontal scrolling to view content.

**Validates: Requirements 5.7**

### Property 22: Required Field Validation Error Display

*For any* required form field that is empty, an error message should be displayed below the field when validation runs.

**Validates: Requirements 6.1**

### Property 23: Invalid Field Specific Error Messages

*For any* form field with an invalid value, a specific error message explaining the issue should be displayed.

**Validates: Requirements 6.2**

### Property 24: Validation on Blur

*For any* form field, validation should run when the user leaves the field (blur event).

**Validates: Requirements 6.3**

### Property 25: Form Submission Prevention with Errors

*For any* form with validation errors, the form submission should be prevented until all errors are resolved.

**Validates: Requirements 6.4**

### Property 26: Success Toast on Form Submission

*For any* successful form submission, a success toast notification should be displayed to the user.

**Validates: Requirements 6.5**

### Property 27: Field-Specific API Errors

*For any* form submission that fails with field-specific errors from the API, those errors should be displayed on the corresponding fields.

**Validates: Requirements 6.6**

### Property 28: Email Validation Pattern

*For any* email input field, the validation should accept valid email formats and reject invalid formats according to standard email regex patterns.

**Validates: Requirements 6.7**

### Property 29: URL Validation Pattern

*For any* URL input field, the validation should accept URLs starting with http:// or https:// and reject other formats.

**Validates: Requirements 6.8**

### Property 30: File Upload Validation

*For any* file upload, the file type and size should be validated before upload, rejecting files that don't meet the criteria.

**Validates: Requirements 6.9**

### Property 31: Character Count Display

*For any* text field with a maximum length limit, a character count should be displayed and updated as the user types.

**Validates: Requirements 6.10**

### Property 32: Delete Confirmation Dialog Display

*For any* delete button click, a confirmation dialog should be displayed before proceeding with the deletion.

**Validates: Requirements 7.1**

### Property 33: Confirmation Dialog Item Name Display

*For any* confirmation dialog, the name of the item to be deleted should be clearly displayed in the dialog message.

**Validates: Requirements 7.2**

### Property 34: Confirmation Dialog Explicit Confirmation

*For any* confirmation dialog, clicking outside the dialog should not close it; only the Cancel or Confirm buttons should close it.

**Validates: Requirements 7.3**

### Property 35: Success Toast on Deletion

*For any* successful deletion, a success toast notification should be displayed confirming the deletion.

**Validates: Requirements 7.5**

### Property 36: Error Toast on Deletion Failure

*For any* failed deletion, an error toast notification should be displayed with the reason for failure.

**Validates: Requirements 7.6**

### Property 37: Related Content Warning

*For any* item with related content (e.g., show with episodes), the confirmation dialog should warn about the impact of deletion.

**Validates: Requirements 7.7**

### Property 38: Bulk Delete Count Display

*For any* bulk delete operation, the confirmation dialog should display the count of items to be deleted.

**Validates: Requirements 7.8**

### Property 39: Dashboard Skeleton Loaders

*For any* dashboard statistics loading state, skeleton loaders should be displayed for each stat card.

**Validates: Requirements 8.4**

### Property 40: Dashboard Error Handling

*For any* failed dashboard statistics fetch, an error message and retry button should be displayed.

**Validates: Requirements 8.5**

### Property 41: Dashboard Refresh on Focus

*For any* dashboard page that regains focus after being in the background, the statistics should be refreshed.

**Validates: Requirements 8.6**

### Property 42: Table Column Sorting

*For any* sortable table column, clicking the column header should toggle the sort order between ascending and descending.

**Validates: Requirements 9.2**

### Property 43: Pagination Page Size Options

*For any* paginated table, changing the page size option should update the displayed data accordingly.

**Validates: Requirements 9.3**

### Property 44: Pagination Info Display

*For any* paginated table, the total count of items and current page range should be displayed.

**Validates: Requirements 9.4**

### Property 45: Search Input Debouncing

*For any* search input, the search should be debounced with a 300ms delay to avoid excessive API calls.

**Validates: Requirements 9.5**

### Property 46: Filter Application

*For any* filter dropdown selection, the table data should be filtered according to the selected criteria.

**Validates: Requirements 9.6**

### Property 47: Table Row Click Opens Edit Modal

*For any* clickable table row, clicking the row should open the edit modal for that item.

**Validates: Requirements 9.8**

### Property 48: Row Selection State Management

*For any* selectable table row, clicking the checkbox should toggle the selection state of that row.

**Validates: Requirements 9.9**

### Property 49: Empty Table State Display

*For any* table with no data, an empty state with a "Create" button should be displayed.

**Validates: Requirements 9.10**

### Property 50: Relative Timestamp Display

*For any* timestamp in a table, it should be displayed in relative format (e.g., "2 hours ago") with the full date shown on hover.

**Validates: Requirements 9.11**

### Property 51: File Upload Validation Before Upload

*For any* file selection, the file type and size should be validated before the upload begins.

**Validates: Requirements 10.1**

### Property 52: Upload Progress Bar Display

*For any* file upload in progress, a progress bar showing the upload percentage should be displayed.

**Validates: Requirements 10.2**

### Property 53: Upload Success Preview

*For any* successful file upload, a preview of the uploaded file should be displayed.

**Validates: Requirements 10.3**

### Property 54: Upload Error Message Display

*For any* failed file upload, an error message with the reason for failure should be displayed.

**Validates: Requirements 10.4**

### Property 55: Drag-and-Drop File Upload

*For any* file upload area, dragging and dropping a file should trigger the upload process.

**Validates: Requirements 10.5**

### Property 56: Image Thumbnail Preview

*For any* uploaded image file, a thumbnail preview should be displayed.

**Validates: Requirements 10.8**

### Property 57: Audio Player Preview

*For any* uploaded audio file, an audio player should be displayed for preview.

**Validates: Requirements 10.9**

### Property 58: File Removal Before Submission

*For any* uploaded file, there should be a way to remove it before form submission, and removal should update the form state.

**Validates: Requirements 10.10**

### Property 59: Active Navigation Highlighting

*For any* page in the admin portal, the corresponding navigation item in the sidebar should be highlighted.

**Validates: Requirements 12.2**

### Property 60: Breadcrumb Navigation Path

*For any* page in the admin portal, breadcrumbs should display the correct navigation path.

**Validates: Requirements 12.3**

### Property 61: Breadcrumb Click Navigation

*For any* breadcrumb segment, clicking it should navigate to the corresponding page.

**Validates: Requirements 12.4**

### Property 62: Responsive Navigation Hamburger

*For any* narrow viewport, the sidebar should collapse and a hamburger menu icon should be displayed.

**Validates: Requirements 12.8**

### Property 63: Tab Key Navigation

*For any* page in the admin portal, pressing Tab should move focus through all interactive elements in logical order.

**Validates: Requirements 13.1**

### Property 64: Visible Focus Indicators

*For any* focusable element, a visible focus indicator should be displayed when the element has keyboard focus.

**Validates: Requirements 13.2**

### Property 65: Enter Key Form Submission

*For any* form, pressing Enter should submit the form (unless focus is on a textarea).

**Validates: Requirements 13.3**

### Property 66: Escape Key Modal Close

*For any* open modal or dialog, pressing Escape should close it.

**Validates: Requirements 13.4**

### Property 67: Arrow Key Table Navigation

*For any* table with keyboard focus, arrow keys should navigate between table rows.

**Validates: Requirements 13.5**

### Property 68: Modal Focus Trap

*For any* open modal, tabbing should cycle focus within the modal and not escape to elements behind it.

**Validates: Requirements 13.6**

### Property 69: Focus Restoration After Modal Close

*For any* modal that is closed, focus should return to the element that triggered the modal.

**Validates: Requirements 13.7**

### Property 70: Auto-Save Draft Data

*For any* form with user input, draft data should be saved to localStorage every 30 seconds.

**Validates: Requirements 14.1**

### Property 71: Draft Restoration Prompt

*For any* form with saved draft data, a prompt should be displayed offering to restore the draft.

**Validates: Requirements 14.2**

### Property 72: Session Expiry Redirect with Return URL

*For any* session expiry, the user should be redirected to login with the current page URL preserved for return navigation.

**Validates: Requirements 14.3**

### Property 73: Return URL Navigation After Login

*For any* login after session expiry, the user should be redirected to the page they were on before expiry.

**Validates: Requirements 14.4**

### Property 74: Session Expiry Warning

*For any* active session, a warning should be displayed 5 minutes before the session expires.

**Validates: Requirements 14.5**

### Property 75: Session Extension

*For any* session expiry warning, clicking "Stay Logged In" should extend the session.

**Validates: Requirements 14.6**

### Property 76: Draft Restoration Notification

*For any* form data restored from draft, a notification should be displayed indicating the restoration.

**Validates: Requirements 14.7**


## File Organization

### Directory Structure

```
admin-frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx          # Error boundary component
│   │   ├── ErrorBoundary.test.tsx     # Error boundary tests
│   │   ├── Toast.tsx                  # Toast notification components
│   │   ├── Toast.test.tsx             # Toast tests
│   │   ├── Toast.css                  # Toast styles
│   │   ├── Loading.tsx                # Loading components
│   │   ├── Loading.test.tsx           # Loading tests
│   │   ├── Loading.css                # Loading styles
│   │   ├── ConfirmDialog.tsx          # Confirmation dialog
│   │   ├── ConfirmDialog.test.tsx     # Dialog tests
│   │   ├── ConfirmDialog.css          # Dialog styles
│   │   ├── ContentTable.tsx           # Enhanced table (existing)
│   │   ├── ContentTable.test.tsx      # Table tests
│   │   ├── ContentTable.css           # Table styles (existing)
│   │   ├── ContentModal.tsx           # Enhanced modal (existing)
│   │   ├── ContentModal.test.tsx      # Modal tests
│   │   ├── ContentModal.css           # Modal styles (existing)
│   │   ├── AdminLayout.tsx            # Enhanced layout (existing)
│   │   ├── AdminLayout.css            # Layout styles (existing)
│   │   ├── ProtectedRoute.tsx         # Auth guard (existing)
│   │   └── RichTextEditor.tsx         # Rich text editor (existing)
│   ├── contexts/
│   │   └── ToastContext.tsx           # Toast context provider
│   ├── pages/
│   │   ├── AdminDashboardPage.tsx     # Dashboard (fix imports)
│   │   ├── AdminShowsPage.tsx         # Shows management (fix)
│   │   ├── AdminEpisodesPage.tsx      # Episodes management (fix)
│   │   ├── AdminArticlesPage.tsx      # Articles management (fix)
│   │   ├── AdminEventsPage.tsx        # Events management (fix)
│   │   ├── AdminResourcesPage.tsx     # Resources management (fix)
│   │   ├── AdminSubmissionsPage.tsx   # Submissions review (fix)
│   │   └── AdminLoginPage.tsx         # Login page (existing)
│   ├── styles/
│   │   ├── variables.css              # CSS custom properties
│   │   ├── global.css                 # Global styles
│   │   └── components.css             # Shared component styles
│   ├── utils/
│   │   ├── validation.ts              # Validation functions
│   │   ├── validation.test.ts         # Validation tests
│   │   ├── toast.ts                   # Toast utilities and hook
│   │   └── toast.test.ts              # Toast utility tests
│   ├── App.tsx                        # Main app (add ErrorBoundary)
│   ├── App.css                        # App styles (existing)
│   ├── main.tsx                       # Entry point (existing)
│   └── index.css                      # Base styles (existing)
├── public/
│   └── vite.svg                       # Favicon (existing)
├── .env                               # Environment variables
├── .env.example                       # Example env file
├── index.html                         # HTML template
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite config
└── README.md                          # Documentation
```

### Shared Library Updates

```
shared/
├── src/
│   ├── components/
│   │   └── FileUploader.tsx           # File upload component (existing)
│   ├── contexts/
│   │   └── AuthContext.tsx            # Auth context (existing)
│   ├── services/
│   │   └── api.ts                     # API client (fix exports)
│   ├── types/
│   │   └── index.ts                   # Type definitions (existing)
│   ├── utils/
│   │   └── index.ts                   # Utility functions (existing)
│   └── index.ts                       # Main export file (fix exports)
```

### Import Patterns

**Correct API Import Pattern**:
```typescript
// Named imports from shared library
import { getAdminShows, createShow, updateShow, deleteShow } from 'shared/services/api';
import { useAuth } from 'shared';
```

**Incorrect Pattern (to be fixed)**:
```typescript
// Wildcard import - causes issues
import * as api from 'shared/services/api';
```

### Component Import Pattern

```typescript
// Local components
import ErrorBoundary from '../components/ErrorBoundary';
import { useToast } from '../utils/toast';
import ConfirmDialog from '../components/ConfirmDialog';

// Shared components
import { FileUploader } from 'shared';
import { useAuth } from 'shared';
```

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)

1. Create CSS design system (variables.css, global.css)
2. Implement ErrorBoundary component
3. Implement Toast notification system
4. Implement Loading components
5. Create validation utilities
6. Fix API imports in shared library

**Deliverables**:
- Design system CSS files
- ErrorBoundary component with tests
- Toast system with context and tests
- Loading components with tests
- Validation utilities with tests
- Fixed shared library exports

### Phase 2: Enhanced Components

1. Enhance ContentTable component
2. Enhance ContentModal component
3. Implement ConfirmDialog component
4. Enhance AdminLayout component
5. Update all page components with error handling

**Deliverables**:
- Enhanced ContentTable with empty states
- Enhanced ContentModal with loading states
- ConfirmDialog component with tests
- Enhanced AdminLayout with responsive nav
- Updated pages with proper error handling

### Phase 3: User Experience Features

1. Implement form validation with visual feedback
2. Add auto-save functionality
3. Implement session management
4. Add keyboard navigation
5. Implement responsive behaviors

**Deliverables**:
- Form validation with error display
- Auto-save to localStorage
- Session expiry warnings
- Keyboard shortcuts
- Responsive layouts at all breakpoints

### Phase 4: Testing and Polish

1. Write unit tests for all components
2. Write property-based tests
3. Accessibility audit and fixes
4. Performance optimization
5. Documentation

**Deliverables**:
- Complete test coverage
- Property-based tests with fast-check
- WCAG 2.1 AA compliance
- Optimized bundle size
- Component documentation

## Deployment Considerations

### Build Configuration

The admin portal uses Vite with the following configuration:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': ['./src/components/ContentTable', './src/components/ContentModal']
        }
      }
    }
  }
});
```

### Environment Variables

```bash
# .env.example
VITE_API_URL=http://localhost:3000/api
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENV=development
```

### Deployment Steps

1. Build the admin portal: `npm run build --workspace=admin-frontend`
2. Deploy dist/ folder to S3 or CDN
3. Configure CloudFront or similar for SPA routing
4. Set environment variables in deployment platform
5. Test all functionality in staging environment

### Monitoring

- Sentry for error tracking
- Console logs in development only
- Performance metrics via Lighthouse
- User analytics (optional)

## Security Considerations

### Authentication

- JWT tokens stored in httpOnly cookies (handled by backend)
- CSRF tokens for state-changing operations
- Session timeout after 30 minutes of inactivity
- Secure logout that clears all client-side data

### Input Validation

- Client-side validation for UX
- Server-side validation for security (backend responsibility)
- XSS prevention through React's built-in escaping
- HTML sanitization for rich text content

### File Uploads

- File type validation (MIME type and extension)
- File size limits enforced
- Virus scanning on backend (backend responsibility)
- Secure file storage in S3 with signed URLs

### API Security

- All API calls require authentication
- Rate limiting on backend
- CORS configured for admin portal origin only
- HTTPS required in production

## Accessibility Compliance

### WCAG 2.1 AA Requirements

1. **Perceivable**
   - Text contrast ratio ≥ 4.5:1
   - Alt text for images
   - Captions for audio/video
   - Responsive text sizing

2. **Operable**
   - Keyboard navigation for all functions
   - No keyboard traps
   - Sufficient time for interactions
   - Skip links to main content

3. **Understandable**
   - Clear error messages
   - Consistent navigation
   - Predictable behavior
   - Input assistance

4. **Robust**
   - Valid HTML
   - ARIA attributes where needed
   - Compatible with assistive technologies
   - Progressive enhancement

### Testing Tools

- axe DevTools for automated testing
- NVDA/JAWS for screen reader testing
- Keyboard-only navigation testing
- Color contrast analyzer

## Performance Targets

### Loading Performance

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Total Blocking Time (TBT): < 300ms

### Runtime Performance

- Smooth 60fps animations
- < 100ms response to user input
- Efficient re-renders with React.memo
- Debounced search and auto-save

### Bundle Size

- Initial bundle: < 200KB gzipped
- Lazy-loaded routes: < 50KB each
- Code splitting for large dependencies
- Tree shaking for unused code

## Maintenance and Documentation

### Code Documentation

- JSDoc comments for all public functions
- TypeScript interfaces for all data structures
- README for each major component
- Inline comments for complex logic

### Component Documentation

Each component should have:
- Purpose and use cases
- Props interface with descriptions
- Usage examples
- Accessibility notes
- Known limitations

### Testing Documentation

- Test coverage reports
- Property test descriptions
- Edge cases documented
- Manual testing checklist

## Conclusion

This design provides a comprehensive plan for transforming the admin portal into a modern, user-friendly, and robust content management system. The implementation focuses on:

1. **Reliability**: Error boundaries and comprehensive error handling
2. **Usability**: Clear feedback, loading states, and intuitive interactions
3. **Accessibility**: WCAG compliance and keyboard navigation
4. **Performance**: Optimized loading and smooth interactions
5. **Maintainability**: Clean code structure and comprehensive testing

The design maintains strict isolation from the main application, ensuring that improvements to the admin portal do not affect the production public website. All changes are contained within the `admin-frontend/` and `shared/` directories, with no modifications to `frontend/` or `backend/`.

