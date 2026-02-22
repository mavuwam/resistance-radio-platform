# Implementation Plan: Admin Password Management

## Overview

This implementation plan covers the development of secure password change and reset capabilities for admin users. The feature includes two primary workflows: authenticated password change and email-based password reset. Implementation follows a bottom-up approach, starting with database schema and core services, then building API routes, and finally creating frontend components. Each task includes property-based tests to validate correctness properties defined in the design document.

## Tasks

- [x] 1. Set up database schema and migrations
  - [x] 1.1 Create password_reset_tokens table migration
    - Create migration file with table schema including user_id, token_hash, expires_at, used_at, and timestamps
    - Add unique constraint to ensure one active token per user
    - Add indexes for user_id, token_hash, and expires_at columns
    - _Requirements: 3.3, 6.4_
  
  - [x] 1.2 Create password_reset_rate_limits table migration
    - Create migration file with table schema including email, attempt_count, window_start, and timestamps
    - Add unique constraint on email column
    - Add indexes for email and window_start columns
    - _Requirements: 4.1, 4.4_
  
  - [x] 1.3 Run migrations and verify schema
    - Execute migrations against development database
    - Verify tables created with correct structure and constraints
    - _Requirements: 3.3, 4.1_

- [x] 2. Implement core password service
  - [x] 2.1 Create PasswordService with validation logic
    - Implement validatePassword method with all security requirements (length, uppercase, lowercase, digit, special char)
    - Implement hashPassword method using bcrypt with salt factor 10+
    - Implement verifyPassword method for password comparison
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 1.4_
  
  - [ ]* 2.2 Write property test for password validation completeness
    - **Property 2: Password Validation Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.7**
  
  - [ ]* 2.3 Write property test for password validation error messages
    - **Property 3: Password Validation Error Messages**
    - **Validates: Requirements 2.6**
  
  - [ ]* 2.4 Write property test for bcrypt hash format
    - **Property 4: Bcrypt Hash Format**
    - **Validates: Requirements 1.4, 5.5**
  
  - [x] 2.5 Implement token generation and verification
    - Implement generateResetToken method using crypto.randomBytes (32+ bytes)
    - Hash tokens before storage using bcrypt
    - Implement verifyResetToken method to validate token existence, expiration, and usage
    - _Requirements: 3.2, 6.1, 6.2, 6.6, 5.1, 5.2, 5.3_
  
  - [ ]* 2.6 Write property test for reset token generation security
    - **Property 7: Reset Token Generation Security**
    - **Validates: Requirements 3.2, 6.1, 6.2, 6.6**
  
  - [ ]* 2.7 Write property test for reset token expiration
    - **Property 8: Reset Token Expiration**
    - **Validates: Requirements 3.4**

- [x] 3. Implement database models
  - [x] 3.1 Create PasswordResetTokenModel
    - Implement create method to store new reset tokens
    - Implement findByTokenHash method for token lookup
    - Implement markAsUsed method to invalidate tokens after use
    - Implement invalidateUserTokens method to clear all user tokens
    - Implement cleanupExpired method for maintenance
    - _Requirements: 3.3, 6.3, 6.4, 6.5_
  
  - [x] 3.2 Create RateLimitRecordModel
    - Implement getOrCreate method for rate limit records
    - Implement incrementAttempts method to track requests
    - Implement reset method to clear rate limits
    - Implement cleanupExpired method for maintenance
    - _Requirements: 4.1, 4.4_
  
  - [x] 3.3 Extend UserModel with password methods
    - Add updatePassword method to update user password hash
    - Add findAdminByEmail method for admin user lookup
    - _Requirements: 1.5, 3.1_

- [x] 4. Implement rate limiting service
  - [x] 4.1 Create RateLimitService
    - Implement checkRateLimit method (3 attempts per 15-minute window)
    - Implement recordAttempt method to track requests
    - Implement cleanupExpiredRecords method
    - Calculate retryAfter time when limit exceeded
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 4.2 Write property test for rate limit enforcement
    - **Property 12: Rate Limit Enforcement**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [ ]* 4.3 Write property test for rate limit independence
    - **Property 13: Rate Limit Independence**
    - **Validates: Requirements 4.4**

- [x] 5. Implement password change workflow
  - [x] 5.1 Add changePassword method to PasswordService
    - Verify current password against stored hash
    - Validate new password against security requirements
    - Hash new password with bcrypt
    - Update user record with new password hash
    - Trigger email notification
    - Add audit logging
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1_
  
  - [ ]* 5.2 Write property test for current password verification
    - **Property 1: Current Password Verification**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 5.3 Write property test for password change persistence
    - **Property 5: Password Change Persistence**
    - **Validates: Requirements 1.5**
  
  - [ ]* 5.4 Write property test for password change audit logging
    - **Property 19: Password Change Audit Logging**
    - **Validates: Requirements 8.1, 8.5**

- [x] 6. Implement password reset initiation workflow
  - [x] 6.1 Add initiatePasswordReset method to PasswordService
    - Check rate limit before processing
    - Verify email exists in admin users table
    - Generate secure reset token
    - Store token hash with 1-hour expiration
    - Invalidate any existing tokens for user
    - Send reset email with token link
    - Return generic success message (prevent email enumeration)
    - Add audit logging
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.4, 6.5, 8.2_
  
  - [ ]* 6.2 Write property test for reset token persistence
    - **Property 9: Reset Token Persistence**
    - **Validates: Requirements 3.3**
  
  - [ ]* 6.3 Write property test for email enumeration prevention
    - **Property 10: Email Enumeration Prevention**
    - **Validates: Requirements 3.6**
  
  - [ ]* 6.4 Write property test for single active token per user
    - **Property 17: Single Active Token Per User**
    - **Validates: Requirements 6.4, 6.5**
  
  - [ ]* 6.5 Write property test for reset initiation audit logging
    - **Property 20: Password Reset Initiation Audit Logging**
    - **Validates: Requirements 8.2, 8.5**

- [x] 7. Implement password reset completion workflow
  - [x] 7.1 Add completePasswordReset method to PasswordService
    - Verify token exists, not expired, and not used
    - Validate new password against security requirements
    - Hash new password with bcrypt
    - Update user record with new password hash
    - Mark token as used
    - Send confirmation email
    - Add audit logging
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.3_
  
  - [ ]* 7.2 Write property test for reset token validation
    - **Property 14: Reset Token Validation**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ]* 7.3 Write property test for password reset persistence and token invalidation
    - **Property 15: Password Reset Persistence and Token Invalidation**
    - **Validates: Requirements 5.6, 6.3**
  
  - [ ]* 7.4 Write property test for reset completion audit logging
    - **Property 21: Password Reset Completion Audit Logging**
    - **Validates: Requirements 8.3, 8.5**

- [x] 8. Extend email service with password templates
  - [x] 8.1 Create password change confirmation email template
    - Design HTML email template with timestamp and security instructions
    - Implement sendPasswordChangeConfirmation method
    - Handle email failures gracefully (log but don't block operation)
    - _Requirements: 1.6, 7.1, 7.2, 7.3, 7.6_
  
  - [x] 8.2 Create password reset request email template
    - Design HTML email template with reset link containing token
    - Implement sendPasswordResetEmail method
    - Include expiration time (1 hour) in email
    - _Requirements: 3.5_
  
  - [x] 8.3 Create password reset completion email template
    - Design HTML email template with confirmation and security warning
    - Implement sendPasswordResetConfirmation method
    - Include warning that reset link is no longer valid
    - _Requirements: 5.7, 7.5_
  
  - [ ]* 8.4 Write property test for email failure resilience
    - **Property 18: Email Failure Resilience**
    - **Validates: Requirements 7.6**
  
  - [ ]* 8.5 Write property test for password change email notification
    - **Property 6: Password Change Email Notification**
    - **Validates: Requirements 1.6, 7.2, 7.3**
  
  - [ ]* 8.6 Write property test for reset email delivery
    - **Property 11: Reset Email Delivery**
    - **Validates: Requirements 3.5**
  
  - [ ]* 8.7 Write property test for password reset email notification
    - **Property 16: Password Reset Email Notification**
    - **Validates: Requirements 5.7, 7.5**

- [x] 9. Create backend API routes
  - [x] 9.1 Implement POST /api/admin/password/change route
    - Add route with JWT authentication middleware
    - Extract userId from JWT token
    - Validate request body (currentPassword, newPassword)
    - Call PasswordService.changePassword
    - Return success/error responses with proper status codes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 9.2 Implement POST /api/admin/password/reset/request route
    - Add unauthenticated route
    - Validate request body (email)
    - Call PasswordService.initiatePasswordReset
    - Return generic success message
    - Handle rate limit errors with 429 status
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3_
  
  - [x] 9.3 Implement POST /api/admin/password/reset/complete route
    - Add unauthenticated route
    - Validate request body (token, newPassword)
    - Call PasswordService.completePasswordReset
    - Return success/error responses with proper status codes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [ ]* 9.4 Write unit tests for password API routes
    - Test authentication middleware integration for change password
    - Test request validation for all routes
    - Test error response formats (400, 401, 429, 500)
    - Test success responses
  
  - [ ]* 9.5 Write property test for rate limit audit logging
    - **Property 22: Rate Limit Audit Logging**
    - **Validates: Requirements 8.4**

- [x] 10. Checkpoint - Backend implementation complete
  - Ensure all backend tests pass
  - Verify database migrations applied successfully
  - Test API endpoints manually with Postman or curl
  - Ask the user if questions arise

- [x] 11. Create frontend password strength indicator component
  - [x] 11.1 Implement PasswordStrengthIndicator component
    - Create component with password and email props
    - Calculate password strength (weak/medium/strong) based on requirements
    - Display color-coded strength bar (red/yellow/green)
    - Show checklist of requirements with checkmarks
    - Update in real-time as user types
    - _Requirements: 9.4_
  
  - [ ]* 11.2 Write unit tests for PasswordStrengthIndicator
    - Test strength calculation for various passwords
    - Test requirements checklist display
    - Test real-time updates
    - Test visual feedback (color coding)
  
  - [ ]* 11.3 Write property test for password strength indicator
    - **Property 25: Frontend Password Strength Indicator**
    - **Validates: Requirements 9.4**

- [x] 12. Create change password form component
  - [x] 12.1 Implement ChangePasswordForm component
    - Create form with current password, new password, and confirm password fields
    - Integrate PasswordStrengthIndicator for new password field
    - Implement client-side validation (password match, requirements)
    - Disable submit button during submission
    - Call POST /api/admin/password/change API
    - Display success toast notification
    - Display error messages from API
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [ ]* 12.2 Write unit tests for ChangePasswordForm
    - Test form rendering with all fields
    - Test current password field validation
    - Test new password field validation
    - Test confirm password matching
    - Test submit button disabled during submission
    - Test success/error toast notifications
    - Test API integration
  
  - [ ]* 12.3 Write property test for frontend password mismatch validation
    - **Property 23: Frontend Password Mismatch Validation**
    - **Validates: Requirements 9.6**
  
  - [ ]* 12.4 Write property test for frontend submit button state
    - **Property 24: Frontend Submit Button State**
    - **Validates: Requirements 9.7**
  
  - [ ]* 12.5 Write property test for frontend validation error display
    - **Property 26: Frontend Validation Error Display**
    - **Validates: Requirements 9.3**

- [x] 13. Create forgot password form component
  - [x] 13.1 Implement ForgotPasswordForm component
    - Create form with email input field
    - Implement client-side email validation
    - Disable submit button during submission
    - Call POST /api/admin/password/reset/request API
    - Display success message after submission
    - Handle rate limit errors with retry-after time
    - _Requirements: 9.2, 9.7_
  
  - [ ]* 13.2 Write unit tests for ForgotPasswordForm
    - Test form rendering
    - Test email field validation
    - Test submit button disabled during submission
    - Test success message display
    - Test rate limit error handling

- [x] 14. Create reset password form component
  - [x] 14.1 Implement ResetPasswordForm component
    - Extract token from URL query parameter
    - Validate token on component mount
    - Create form with new password and confirm password fields
    - Integrate PasswordStrengthIndicator for new password field
    - Implement client-side validation (password match, requirements)
    - Disable submit button during submission
    - Call POST /api/admin/password/reset/complete API
    - Redirect to login page on success
    - Display error messages for invalid/expired tokens
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7, 10.4_
  
  - [ ]* 14.2 Write unit tests for ResetPasswordForm
    - Test token validation on mount
    - Test new password field validation
    - Test confirm password matching
    - Test submit button disabled during submission
    - Test redirect to login on success
    - Test invalid token error handling
  
  - [ ]* 14.3 Write property test for redirect after password reset
    - **Property 28: Redirect After Password Reset**
    - **Validates: Requirements 10.4**

- [x] 15. Integrate password management into admin portal
  - [x] 15.1 Add password change link to admin user profile/settings
    - Add "Change Password" link in admin navigation or user menu
    - Create route for password change page
    - Render ChangePasswordForm component
    - Ensure route is protected with authentication
    - _Requirements: 9.1_
  
  - [x] 15.2 Add forgot password link to admin login page
    - Add "Forgot Password?" link below login form
    - Create route for forgot password page
    - Render ForgotPasswordForm component
    - _Requirements: 9.2_
  
  - [x] 15.3 Create password reset page with token handling
    - Create route for password reset page (e.g., /admin/reset-password?token=...)
    - Extract token from URL query parameters
    - Render ResetPasswordForm component with token
    - _Requirements: 5.1, 5.2, 5.3, 10.4_
  
  - [x] 15.4 Implement session persistence after password change
    - Verify JWT token remains valid after password change
    - Ensure user is not logged out after changing password
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 15.5 Write property test for session persistence after password change
    - **Property 27: Session Persistence After Password Change**
    - **Validates: Requirements 10.1, 10.2**

- [x] 16. Add CSS styling for password components
  - [x] 16.1 Style PasswordStrengthIndicator component
    - Create CSS for strength bar with color transitions
    - Style requirements checklist with checkmarks
    - Ensure responsive design for mobile devices
    - Follow existing admin portal design system
  
  - [x] 16.2 Style password forms
    - Create CSS for ChangePasswordForm, ForgotPasswordForm, and ResetPasswordForm
    - Style input fields, buttons, and error messages
    - Ensure consistent spacing and alignment
    - Add loading states for submit buttons
    - Follow existing admin portal design system

- [x] 17. Checkpoint - Frontend implementation complete
  - Ensure all frontend tests pass
  - Test all forms manually in browser
  - Verify responsive design on mobile devices
  - Test accessibility with keyboard navigation
  - Ask the user if questions arise

- [ ] 18. Integration testing and end-to-end flows
  - [ ]* 18.1 Write integration test for password change flow
    - Test complete flow: login → navigate to change password → submit form → verify email → login with new password
    - Verify audit logging
    - Verify email notifications
  
  - [ ]* 18.2 Write integration test for password reset flow
    - Test complete flow: forgot password → receive email → click link → set new password → login
    - Verify token expiration
    - Verify token single-use
    - Verify audit logging
    - Verify email notifications
  
  - [ ]* 18.3 Write integration test for rate limiting flow
    - Test rate limit enforcement: submit 3 requests → verify 4th is rejected → wait for window expiration → verify next request succeeds
    - Verify rate limit independence for different emails
    - Verify audit logging

- [ ] 19. Documentation and cleanup
  - [ ] 19.1 Update API documentation
    - Document new password management endpoints in API-DOCUMENTATION.md
    - Include request/response examples
    - Document error codes and status codes
  
  - [ ] 19.2 Update admin portal guide
    - Add password management section to ADMIN-PORTAL-GUIDE.md
    - Include screenshots of password forms
    - Document password requirements for admins
  
  - [ ] 19.3 Add database maintenance scripts
    - Create script to clean up expired reset tokens
    - Create script to clean up expired rate limit records
    - Add cron job or scheduled task recommendations

- [ ] 20. Final checkpoint - Feature complete
  - Ensure all tests pass (unit, property, integration)
  - Verify test coverage meets goals (80% line coverage, 75% branch coverage)
  - Test all workflows manually end-to-end
  - Verify email delivery in staging environment
  - Review security considerations checklist
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from design document
- All 28 correctness properties are covered by property tests
- Checkpoints ensure incremental validation and user feedback
- Backend implementation completed before frontend to enable API testing
- Integration tests validate complete user workflows
- Email templates should follow existing Nodemailer service patterns
- All password operations include comprehensive audit logging
- Rate limiting prevents abuse while maintaining good user experience
- Security is prioritized throughout: bcrypt hashing, secure tokens, timing-safe comparisons
