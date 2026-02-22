# Implementation Plan: Admin Portal UI/UX Improvements

## Overview

This implementation plan transforms the admin portal from its current broken state (blank white screens, missing error handling) into a modern, reliable content management system. All changes are isolated to `admin-frontend/` and `shared/` directories only.

## Tasks

- [x] 1. Create CSS design system foundation
  - Create `admin-frontend/src/styles/variables.css` with color palette, typography, spacing, shadows, and transitions
  - Create `admin-frontend/src/styles/global.css` with base styles and resets
  - Create `admin-frontend/src/styles/components.css` with shared component styles
  - Import design system styles in `admin-frontend/src/main.tsx`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ] 2. Implement error boundary component
  - [x] 2.1 Create ErrorBoundary component with fallback UI
    - Implement `admin-frontend/src/components/ErrorBoundary.tsx` with error catching logic
    - Display user-friendly error message with "Reload Page" button
    - Show stack trace only in development mode
    - Log errors to console and Sentry
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 2.2 Write unit tests for ErrorBoundary
    - Test error catching and fallback UI display
    - Test reload button functionality
    - Test development vs production mode behavior
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 2.3 Write property test for ErrorBoundary error catching
    - **Property 1: Error Boundary Catches All Component Errors**
    - **Validates: Requirements 1.1**

- [ ] 3. Implement toast notification system
  - [x] 3.1 Create Toast components and context
    - Implement `admin-frontend/src/components/Toast.tsx` with toast UI
    - Implement `admin-frontend/src/contexts/ToastContext.tsx` with toast state management
    - Implement `admin-frontend/src/utils/toast.ts` with useToast hook
    - Support success, error, warning, and info toast types
    - Auto-dismiss after 5 seconds (configurable)
    - Stack multiple toasts vertically (max 5)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 3.2 Write unit tests for toast system
    - Test toast display and auto-dismiss
    - Test multiple toast stacking
    - Test manual dismiss
    - _Requirements: 2.6_
  
  - [ ]* 3.3 Write property test for toast auto-dismiss timing
    - **Property 7: Toast Auto-Dismiss Timing**
    - **Validates: Requirements 2.6**

- [ ] 4. Implement loading components
  - [x] 4.1 Create loading components
    - Implement `admin-frontend/src/components/Loading.tsx` with Spinner, SkeletonLoader, and LoadingOverlay
    - Add minimum display time of 300ms to prevent flickering
    - Include accessible aria-live announcements
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 4.2 Write unit tests for loading components
    - Test spinner rendering
    - Test skeleton loader variations
    - Test loading overlay
    - _Requirements: 3.1, 3.6_
  
  - [ ]* 4.3 Write property test for minimum loading display time
    - **Property 12: Minimum Loading Display Time**
    - **Validates: Requirements 3.6**

- [ ] 5. Create validation utilities
  - [x] 5.1 Implement validation functions
    - Create `admin-frontend/src/utils/validation.ts` with validation functions
    - Implement validateEmail, validateUrl, validateFile, validateRequired, validateLength
    - Return validation result with error messages
    - _Requirements: 6.1, 6.2, 6.7, 6.8, 6.9_
  
  - [ ]* 5.2 Write unit tests for validation utilities
    - Test email validation with valid and invalid inputs
    - Test URL validation
    - Test file validation
    - Test required field validation
    - Test length validation
    - _Requirements: 6.7, 6.8, 6.9_
  
  - [ ]* 5.3 Write property test for email validation
    - **Property 28: Email Validation Pattern**
    - **Validates: Requirements 6.7**
  
  - [ ]* 5.4 Write property test for URL validation
    - **Property 29: URL Validation Pattern**
    - **Validates: Requirements 6.8**

- [ ] 6. Fix shared library API exports
  - [x] 6.1 Fix API exports in shared library
    - Update `shared/src/index.ts` to ensure proper named exports
    - Update `shared/src/services/api.ts` to export all API functions as named exports
    - Verify no wildcard imports are needed
    - _Requirements: N/A (infrastructure fix)_
  
  - [x] 6.2 Update all page imports to use named imports
    - Update all `admin-frontend/src/pages/*.tsx` files to use named imports from shared library
    - Replace `import * as api` with named imports like `import { getAdminShows, createShow }`
    - _Requirements: N/A (infrastructure fix)_

- [x] 7. Checkpoint - Verify foundation components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement ConfirmDialog component
  - [x] 8.1 Create ConfirmDialog component
    - Implement `admin-frontend/src/components/ConfirmDialog.tsx` with modal dialog
    - Support danger, warning, and info variants
    - Implement focus trap and keyboard navigation
    - Prevent closing during loading state
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 8.2 Write unit tests for ConfirmDialog
    - Test dialog open/close behavior
    - Test confirm and cancel actions
    - Test focus trap
    - Test escape key handling
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 8.3 Write property test for confirmation dialog display
    - **Property 32: Delete Confirmation Dialog Display**
    - **Validates: Requirements 7.1**

- [ ] 9. Enhance ContentTable component
  - [x] 9.1 Add error handling and empty states to ContentTable
    - Update `admin-frontend/src/components/ContentTable.tsx` with error prop and retry handler
    - Add empty state with icon and call-to-action
    - Improve loading skeleton to match table structure
    - Add sticky header for long tables
    - Implement responsive column hiding
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11_
  
  - [ ]* 9.2 Write unit tests for enhanced ContentTable
    - Test empty state display
    - Test error state and retry
    - Test loading skeleton
    - Test responsive column hiding
    - _Requirements: 9.10_
  
  - [ ]* 9.3 Write property test for table column sorting
    - **Property 42: Table Column Sorting**
    - **Validates: Requirements 9.2**

- [ ] 10. Enhance ContentModal component
  - [x] 10.1 Improve ContentModal styling and behavior
    - Update `admin-frontend/src/components/ContentModal.tsx` with better styling
    - Add smooth enter/exit animations
    - Improve focus management
    - Add loading state within modal
    - Make body scrollable with fixed header/footer
    - Add mobile-responsive sizing
    - _Requirements: N/A (UX improvement)_
  
  - [ ]* 10.2 Write unit tests for enhanced ContentModal
    - Test modal open/close
    - Test focus management
    - Test loading state
    - Test scroll behavior
    - _Requirements: N/A_

- [ ] 11. Enhance AdminLayout component
  - [~] 11.1 Add responsive navigation and breadcrumbs
    - Update `admin-frontend/src/components/AdminLayout.tsx` with collapsible sidebar
    - Add active route highlighting
    - Add pending submissions badge
    - Add user menu with logout
    - Add "View Site" link
    - Add breadcrumb navigation
    - Implement hamburger menu for mobile
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_
  
  - [ ]* 11.2 Write unit tests for enhanced AdminLayout
    - Test sidebar collapse/expand
    - Test active route highlighting
    - Test breadcrumb navigation
    - Test responsive behavior
    - _Requirements: 12.2, 12.8_
  
  - [ ]* 11.3 Write property test for responsive sidebar collapse
    - **Property 16: Responsive Sidebar Collapse**
    - **Validates: Requirements 5.1, 12.8**

- [ ] 12. Update App.tsx with error boundary and providers
  - [x] 12.1 Wrap app with ErrorBoundary and ToastProvider
    - Update `admin-frontend/src/App.tsx` to wrap routes with ErrorBoundary
    - Add ToastProvider at app root
    - Implement lazy loading for route components
    - _Requirements: 1.6, 19.1, 19.6_
  
  - [ ]* 12.2 Write integration tests for app structure
    - Test error boundary wrapping
    - Test toast provider availability
    - Test lazy loading
    - _Requirements: 1.6, 19.1_

- [~] 13. Checkpoint - Verify enhanced components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Update AdminDashboardPage with error handling
  - [x] 14.1 Add error handling and loading states to dashboard
    - Update `admin-frontend/src/pages/AdminDashboardPage.tsx` with proper error handling
    - Add loading skeleton for stat cards
    - Display error message with retry button on failure
    - Implement dashboard refresh on focus
    - Add quick action cards
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ]* 14.2 Write property test for dashboard skeleton loaders
    - **Property 39: Dashboard Skeleton Loaders**
    - **Validates: Requirements 8.4**

- [ ] 15. Update AdminShowsPage with error handling
  - [x] 15.1 Fix imports and add error handling
    - Update `admin-frontend/src/pages/AdminShowsPage.tsx` with named imports
    - Add error boundary wrapping
    - Implement toast notifications for success/error
    - Add loading states
    - Add confirmation dialog for delete
    - _Requirements: 1.1, 2.1, 2.5, 2.6, 3.1, 3.4, 7.1, 7.5, 7.6_
  
  - [ ]* 15.2 Write integration tests for AdminShowsPage
    - Test CRUD operations with error handling
    - Test delete confirmation
    - Test toast notifications
    - _Requirements: 2.5, 7.1_

- [ ] 16. Update AdminEpisodesPage with error handling
  - [x] 16.1 Fix imports and add error handling
    - Update `admin-frontend/src/pages/AdminEpisodesPage.tsx` with named imports
    - Add error boundary wrapping
    - Implement toast notifications
    - Add loading states
    - Add confirmation dialog for delete
    - _Requirements: 1.1, 2.1, 2.5, 2.6, 3.1, 3.4, 7.1, 7.5, 7.6_
  
  - [ ]* 16.2 Write integration tests for AdminEpisodesPage
    - Test CRUD operations with error handling
    - Test file upload with progress
    - Test delete confirmation
    - _Requirements: 2.5, 7.1, 10.1, 10.2_

- [ ] 17. Update AdminArticlesPage with error handling
  - [x] 17.1 Fix imports and add error handling
    - Update `admin-frontend/src/pages/AdminArticlesPage.tsx` with named imports
    - Add error boundary wrapping
    - Implement toast notifications
    - Add loading states
    - Add confirmation dialog for delete
    - _Requirements: 1.1, 2.1, 2.5, 2.6, 3.1, 3.4, 7.1, 7.5, 7.6_
  
  - [ ]* 17.2 Write integration tests for AdminArticlesPage
    - Test CRUD operations with error handling
    - Test rich text editor
    - Test delete confirmation
    - _Requirements: 2.5, 7.1, 11.1_

- [ ] 18. Update AdminEventsPage with error handling
  - [x] 18.1 Fix imports and add error handling
    - Update `admin-frontend/src/pages/AdminEventsPage.tsx` with named imports
    - Add error boundary wrapping
    - Implement toast notifications
    - Add loading states
    - Add confirmation dialog for delete
    - _Requirements: 1.1, 2.1, 2.5, 2.6, 3.1, 3.4, 7.1, 7.5, 7.6_
  
  - [ ]* 18.2 Write integration tests for AdminEventsPage
    - Test CRUD operations with error handling
    - Test date/time handling
    - Test delete confirmation
    - _Requirements: 2.5, 7.1_

- [ ] 19. Update AdminResourcesPage with error handling
  - [x] 19.1 Fix imports and add error handling
    - Update `admin-frontend/src/pages/AdminResourcesPage.tsx` with named imports
    - Add error boundary wrapping
    - Implement toast notifications
    - Add loading states
    - Add confirmation dialog for delete
    - _Requirements: 1.1, 2.1, 2.5, 2.6, 3.1, 3.4, 7.1, 7.5, 7.6_
  
  - [ ]* 19.2 Write integration tests for AdminResourcesPage
    - Test CRUD operations with error handling
    - Test file upload
    - Test delete confirmation
    - _Requirements: 2.5, 7.1, 10.1_

- [ ] 20. Update AdminSubmissionsPage with error handling
  - [x] 20.1 Fix imports and add error handling
    - Update `admin-frontend/src/pages/AdminSubmissionsPage.tsx` with named imports
    - Add error boundary wrapping
    - Implement toast notifications
    - Add loading states
    - Add submission review workflow
    - _Requirements: 1.1, 2.1, 2.5, 2.6, 3.1, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9_
  
  - [ ]* 20.2 Write integration tests for AdminSubmissionsPage
    - Test submission filtering
    - Test approve/reject workflow
    - Test toast notifications
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.6_

- [~] 21. Checkpoint - Verify all pages working
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Implement form validation with visual feedback
  - [~] 22.1 Add validation to all forms
    - Update all page forms to use validation utilities
    - Display error messages below fields
    - Validate on blur
    - Prevent submission with errors
    - Display character counts for limited fields
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.10_
  
  - [ ]* 22.2 Write property test for form validation on blur
    - **Property 24: Validation on Blur**
    - **Validates: Requirements 6.3**
  
  - [ ]* 22.3 Write property test for form submission prevention
    - **Property 25: Form Submission Prevention with Errors**
    - **Validates: Requirements 6.4**

- [ ] 23. Implement keyboard accessibility
  - [~] 23.1 Add keyboard navigation support
    - Ensure Tab key navigation works through all interactive elements
    - Display visible focus indicators
    - Support Enter key for form submission
    - Support Escape key for modal close
    - Implement focus trap in modals
    - Return focus to trigger element after modal close
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6, 13.7_
  
  - [ ]* 23.2 Write property test for tab key navigation
    - **Property 63: Tab Key Navigation**
    - **Validates: Requirements 13.1**
  
  - [ ]* 23.3 Write property test for modal focus trap
    - **Property 68: Modal Focus Trap**
    - **Validates: Requirements 13.6**

- [ ] 24. Implement responsive behaviors
  - [x] 24.1 Add responsive breakpoints and behaviors
    - Implement responsive sidebar collapse at 768px
    - Stack form fields vertically at 1024px
    - Hide non-essential table columns at 640px
    - Ensure minimum touch target size of 44x44px
    - Prevent horizontal scrolling at all breakpoints
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.7_
  
  - [ ]* 24.2 Write property test for responsive form field stacking
    - **Property 17: Responsive Form Field Stacking**
    - **Validates: Requirements 5.2**
  
  - [ ]* 24.3 Write property test for no horizontal scrolling
    - **Property 21: No Horizontal Scrolling**
    - **Validates: Requirements 5.7**

- [ ] 25. Implement auto-save functionality
  - [x] 25.1 Add auto-save to forms
    - Save draft data to localStorage every 30 seconds
    - Offer to restore draft when returning to form
    - Display notification when draft is restored
    - Clear draft after successful submission
    - _Requirements: 14.1, 14.2, 14.7_
  
  - [ ]* 25.2 Write property test for auto-save timing
    - **Property 70: Auto-Save Draft Data**
    - **Validates: Requirements 14.1**

- [ ] 26. Implement session management
  - [x] 26.1 Add session expiry handling
    - Redirect to login on session expiry with return URL
    - Display warning 5 minutes before expiry
    - Provide "Stay Logged In" button to extend session
    - Redirect to original page after login
    - _Requirements: 14.3, 14.4, 14.5, 14.6_
  
  - [ ]* 26.2 Write property test for session expiry redirect
    - **Property 72: Session Expiry Redirect with Return URL**
    - **Validates: Requirements 14.3**

- [~] 27. Final checkpoint - Complete testing and polish
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 28. Accessibility audit and fixes
  - [~] 28.1 Run accessibility audit
    - Use axe DevTools to scan all pages
    - Fix any WCAG 2.1 AA violations
    - Test with keyboard-only navigation
    - Verify screen reader compatibility
    - _Requirements: 4.7, 13.1, 13.2_
  
  - [ ]* 28.2 Write property test for text contrast ratio
    - **Property 14: Text Contrast Ratio Compliance**
    - **Validates: Requirements 4.7**

- [ ] 29. Performance optimization
  - [~] 29.1 Optimize bundle size and loading
    - Implement code splitting for routes
    - Optimize images
    - Debounce search inputs (300ms)
    - Achieve Lighthouse performance score ≥ 80
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_
  
  - [ ]* 29.2 Write property test for search input debouncing
    - **Property 45: Search Input Debouncing**
    - **Validates: Requirements 9.5, 19.3**

- [ ] 30. Final integration testing
  - [~] 30.1 Test complete user workflows
    - Test login → dashboard → CRUD operations → logout
    - Test error scenarios and recovery
    - Test responsive behavior at all breakpoints
    - Test keyboard navigation throughout app
    - Verify all toast notifications work correctly
    - _Requirements: All_
  
  - [ ]* 30.2 Write end-to-end property tests
    - Test complete CRUD workflows with random data
    - Test error handling with random error scenarios
    - Test responsive behavior at random viewport sizes
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- All changes are isolated to `admin-frontend/` and `shared/` directories
- The `frontend/` and `backend/` directories must not be modified
