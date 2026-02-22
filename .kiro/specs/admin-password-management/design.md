# Design Document: Admin Password Management

## Overview

The Admin Password Management feature provides secure password change and reset capabilities for admin users. The system implements two primary workflows:

1. **Authenticated Password Change**: Allows logged-in admin users to change their password by verifying their current password
2. **Password Reset via Email**: Enables users who forgot their password to reset it through a secure, time-limited token sent via email

The design emphasizes security through bcrypt password hashing, cryptographically secure tokens, rate limiting, audit logging, and email notifications for all password operations. The implementation integrates with the existing JWT-based authentication system and Nodemailer email service.

### Key Design Principles

- **Security First**: All passwords are hashed with bcrypt (salt factor 10+), tokens are cryptographically secure and single-use
- **Defense in Depth**: Multiple security layers including rate limiting, token expiration, and audit logging
- **User Experience**: Clear error messages, password strength indicators, and email notifications
- **Integration**: Seamless integration with existing auth middleware and email service
- **Auditability**: Comprehensive logging of all password operations for security monitoring

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Frontend                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ Change Password  │  │  Forgot Password │  │ Reset Password│ │
│  │      Form        │  │      Form        │  │     Form      │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Backend API                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Password Management Routes                   │  │
│  │  POST /api/admin/password/change                         │  │
│  │  POST /api/admin/password/reset/request                  │  │
│  │  POST /api/admin/password/reset/complete                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Password Management Service                     │  │
│  │  - Password validation                                    │  │
│  │  - Token generation & verification                        │  │
│  │  - Rate limiting                                          │  │
│  │  - Audit logging                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│   PostgreSQL Database    │   │    Email Service         │
│  - users table           │   │  (Nodemailer)            │
│  - password_reset_tokens │   │  - Reset emails          │
│  - Rate limit tracking   │   │  - Confirmation emails   │
└──────────────────────────┘   └──────────────────────────┘
```

### Component Responsibilities

**Frontend Components**:
- `ChangePasswordForm`: Authenticated password change interface with current password verification
- `ForgotPasswordForm`: Email submission form for password reset initiation
- `ResetPasswordForm`: New password submission form with token validation
- `PasswordStrengthIndicator`: Real-time password validation feedback

**Backend Services**:
- `PasswordService`: Core password management logic (validation, hashing, token management)
- `RateLimitService`: Request rate limiting to prevent abuse
- `AuditLogger`: Security event logging for password operations

**Database Tables**:
- `users`: Existing table with password_hash column
- `password_reset_tokens`: New table for secure token storage
- `password_reset_rate_limits`: New table for rate limit tracking

**External Services**:
- `EmailService`: Existing Nodemailer service extended with password-related templates

## Components and Interfaces

### Database Schema Changes

#### New Table: password_reset_tokens

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one active token per user
  CONSTRAINT unique_active_token_per_user 
    EXCLUDE (user_id WITH =) 
    WHERE (used_at IS NULL AND expires_at > CURRENT_TIMESTAMP)
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

#### New Table: password_reset_rate_limits

```sql
CREATE TABLE IF NOT EXISTS password_reset_rate_limits (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(email)
);

CREATE INDEX idx_password_reset_rate_limits_email ON password_reset_rate_limits(email);
CREATE INDEX idx_password_reset_rate_limits_window_start ON password_reset_rate_limits(window_start);
```

### Backend API Endpoints

#### POST /api/admin/password/change

Change password for authenticated admin user.

**Authentication**: Required (JWT token)

**Request Body**:
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Response (200 OK)**:
```typescript
{
  message: "Password changed successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
  ```typescript
  {
    error: {
      message: "Password validation failed",
      code: "VALIDATION_ERROR",
      details: string[]
    }
  }
  ```
- `401 Unauthorized`: Current password incorrect
  ```typescript
  {
    error: {
      message: "Current password is incorrect",
      code: "INVALID_CURRENT_PASSWORD"
    }
  }
  ```
- `500 Internal Server Error`: Server error

#### POST /api/admin/password/reset/request

Initiate password reset process.

**Authentication**: Not required

**Request Body**:
```typescript
{
  email: string;
}
```

**Response (200 OK)**:
```typescript
{
  message: "If an account exists with this email, a password reset link has been sent"
}
```

**Error Responses**:
- `429 Too Many Requests`: Rate limit exceeded
  ```typescript
  {
    error: {
      message: "Too many password reset requests",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: number // seconds
    }
  }
  ```
- `500 Internal Server Error`: Server error

#### POST /api/admin/password/reset/complete

Complete password reset with token.

**Authentication**: Not required

**Request Body**:
```typescript
{
  token: string;
  newPassword: string;
}
```

**Response (200 OK)**:
```typescript
{
  message: "Password reset successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors or invalid/expired token
  ```typescript
  {
    error: {
      message: "Invalid or expired reset token",
      code: "INVALID_TOKEN"
    }
  }
  ```
- `500 Internal Server Error`: Server error

### Backend Services

#### PasswordService

```typescript
interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

interface TokenGenerationResult {
  token: string; // Plain token to send in email
  tokenHash: string; // Hashed token to store in DB
  expiresAt: Date;
}

class PasswordService {
  /**
   * Validate password against security requirements
   */
  validatePassword(password: string, email?: string): PasswordValidationResult;
  
  /**
   * Hash password using bcrypt
   */
  hashPassword(password: string): Promise<string>;
  
  /**
   * Verify password against hash
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;
  
  /**
   * Generate secure reset token
   */
  generateResetToken(): Promise<TokenGenerationResult>;
  
  /**
   * Verify reset token and return user ID if valid
   */
  verifyResetToken(token: string): Promise<number | null>;
  
  /**
   * Change password for authenticated user
   */
  changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
  
  /**
   * Initiate password reset
   */
  initiatePasswordReset(email: string): Promise<void>;
  
  /**
   * Complete password reset
   */
  completePasswordReset(token: string, newPassword: string): Promise<void>;
  
  /**
   * Invalidate all reset tokens for user
   */
  invalidateUserTokens(userId: number): Promise<void>;
}
```

#### RateLimitService

```typescript
interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds until next attempt allowed
}

class RateLimitService {
  /**
   * Check if request is within rate limit
   */
  checkRateLimit(email: string): Promise<RateLimitResult>;
  
  /**
   * Record a rate limit attempt
   */
  recordAttempt(email: string): Promise<void>;
  
  /**
   * Clean up expired rate limit records
   */
  cleanupExpiredRecords(): Promise<void>;
}
```

### Frontend Components

#### ChangePasswordForm Component

```typescript
interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface ChangePasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isSubmitting: boolean;
  errors: Record<string, string>;
  passwordStrength: PasswordStrength;
}

enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong'
}
```

**Features**:
- Current password input field
- New password input with strength indicator
- Confirm password field with match validation
- Real-time validation feedback
- Submit button disabled during submission
- Success/error toast notifications

#### ForgotPasswordForm Component

```typescript
interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

interface ForgotPasswordFormState {
  email: string;
  isSubmitting: boolean;
  submitted: boolean;
  error: string | null;
}
```

**Features**:
- Email input field
- Submit button disabled during submission
- Success message after submission
- Rate limit error handling

#### ResetPasswordForm Component

```typescript
interface ResetPasswordFormProps {
  token: string; // From URL query parameter
  onSuccess?: () => void;
}

interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
  isSubmitting: boolean;
  errors: Record<string, string>;
  passwordStrength: PasswordStrength;
  tokenValid: boolean;
}
```

**Features**:
- Token validation on mount
- New password input with strength indicator
- Confirm password field with match validation
- Real-time validation feedback
- Redirect to login on success

#### PasswordStrengthIndicator Component

```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
  email?: string;
}

interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
  meetsRequirements: boolean;
}
```

**Visual Design**:
- Color-coded strength bar (red/yellow/green)
- List of requirements with checkmarks
- Real-time feedback as user types

## Data Models

### User Model Extension

Extend existing User model with password management methods:

```typescript
interface User {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

class UserModel {
  // Existing methods...
  
  /**
   * Update user password
   */
  static async updatePassword(userId: number, newPasswordHash: string): Promise<void>;
  
  /**
   * Find admin user by email
   */
  static async findAdminByEmail(email: string): Promise<User | null>;
}
```

### PasswordResetToken Model

```typescript
interface PasswordResetToken {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

class PasswordResetTokenModel {
  /**
   * Create new reset token
   */
  static async create(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken>;
  
  /**
   * Find token by hash
   */
  static async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  
  /**
   * Mark token as used
   */
  static async markAsUsed(tokenId: number): Promise<void>;
  
  /**
   * Invalidate all tokens for user
   */
  static async invalidateUserTokens(userId: number): Promise<void>;
  
  /**
   * Clean up expired tokens
   */
  static async cleanupExpired(): Promise<void>;
}
```

### RateLimitRecord Model

```typescript
interface RateLimitRecord {
  id: number;
  email: string;
  attemptCount: number;
  windowStart: Date;
  createdAt: Date;
}

class RateLimitRecordModel {
  /**
   * Get or create rate limit record
   */
  static async getOrCreate(email: string): Promise<RateLimitRecord>;
  
  /**
   * Increment attempt count
   */
  static async incrementAttempts(email: string): Promise<RateLimitRecord>;
  
  /**
   * Reset rate limit for email
   */
  static async reset(email: string): Promise<void>;
  
  /**
   * Clean up expired records
   */
  static async cleanupExpired(): Promise<void>;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Password validation properties (2.1-2.5)** can be combined into a single comprehensive property that validates all requirements together
2. **Bcrypt hashing properties (1.4, 5.5)** are identical and can be combined into one property
3. **Email notification properties (1.6, 5.7)** follow the same pattern and can be generalized
4. **Session management properties (10.1, 10.2)** are redundant - they express the same requirement
5. **Token validation properties** can be consolidated to avoid testing the same validation logic multiple times

The following properties represent the unique, non-redundant correctness requirements:

### Property 1: Current Password Verification

*For any* authenticated admin user with a known password, when attempting to change their password, the system should verify the current password correctly - accepting the correct password and rejecting any incorrect password.

**Validates: Requirements 1.1, 1.2**

### Property 2: Password Validation Completeness

*For any* password string, the password validator should enforce all security requirements: minimum 8 characters, at least one uppercase letter, at least one lowercase letter, at least one digit, at least one special character from the allowed set, and rejection if the password matches the user's email address.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.7**

### Property 3: Password Validation Error Messages

*For any* password that fails validation, the error message should specifically indicate which requirements are not met, allowing users to understand what needs to be corrected.

**Validates: Requirements 2.6**

### Property 4: Bcrypt Hash Format

*For any* valid password that is hashed, the resulting bcrypt hash should use a salt factor of 10 or higher, which can be verified by examining the hash format (bcrypt hashes encode the cost factor).

**Validates: Requirements 1.4, 5.5**

### Property 5: Password Change Persistence

*For any* successful password change operation, the new password should be persisted such that subsequent authentication attempts with the new password succeed and attempts with the old password fail.

**Validates: Requirements 1.5**

### Property 6: Password Change Email Notification

*For any* successful password change, the email service should be invoked to send a confirmation email to the user's registered email address containing the timestamp and instructions for reporting unauthorized changes.

**Validates: Requirements 1.6, 7.2, 7.3**

### Property 7: Reset Token Generation Security

*For any* valid password reset request, the generated reset token should be cryptographically secure (at least 32 bytes of random data, resulting in at least 32 characters when encoded), and only the hashed version should be stored in the database.

**Validates: Requirements 3.2, 6.1, 6.2, 6.6**

### Property 8: Reset Token Expiration

*For any* generated reset token, the expiration timestamp should be set to exactly 1 hour from the generation time.

**Validates: Requirements 3.4**

### Property 9: Reset Token Persistence

*For any* valid password reset request for an existing admin email, a reset token record should be created in the database with the token hash and expiration timestamp.

**Validates: Requirements 3.3**

### Property 10: Email Enumeration Prevention

*For any* password reset request, regardless of whether the email exists in the admin users table, the API should return the same generic success message and response format to prevent email enumeration attacks.

**Validates: Requirements 3.6**

### Property 11: Reset Email Delivery

*For any* valid password reset request for an existing admin email, the email service should be invoked to send a reset email containing a link with the plain reset token.

**Validates: Requirements 3.5**

### Property 12: Rate Limit Enforcement

*For any* email address, after 3 password reset requests within a 15-minute window, subsequent requests should be rejected with a rate limit error that includes the time remaining until the next request is allowed.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 13: Rate Limit Independence

*For any* two different email addresses, the rate limit counters should be independent - reaching the rate limit for one email should not affect requests for another email.

**Validates: Requirements 4.4**

### Property 14: Reset Token Validation

*For any* password reset completion attempt, the system should verify that the token exists, has not expired, and has not been used, rejecting the request with an appropriate error message if any of these conditions fail.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 15: Password Reset Persistence and Token Invalidation

*For any* successful password reset operation, the new password should be persisted (allowing authentication with the new password), and the reset token should be marked as used (preventing reuse of the same token).

**Validates: Requirements 5.6, 6.3**

### Property 16: Password Reset Email Notification

*For any* successful password reset, the email service should be invoked to send a confirmation email containing a warning that the reset link has been used and is no longer valid.

**Validates: Requirements 5.7, 7.5**

### Property 17: Single Active Token Per User

*For any* admin user, when a new reset token is generated, any existing unused tokens for that user should be invalidated, ensuring only one active token exists at any time.

**Validates: Requirements 6.4, 6.5**

### Property 18: Email Failure Resilience

*For any* password operation (change or reset), if email delivery fails, the system should log the failure but still complete the password operation successfully, ensuring email issues don't prevent password updates.

**Validates: Requirements 7.6**

### Property 19: Password Change Audit Logging

*For any* password change attempt (successful or failed), the system should create an audit log entry containing the user ID, timestamp, and success/failure status, without logging the password itself.

**Validates: Requirements 8.1, 8.5**

### Property 20: Password Reset Initiation Audit Logging

*For any* password reset initiation request, the system should create an audit log entry containing the email address, timestamp, and whether the email exists in the system, without logging any tokens.

**Validates: Requirements 8.2, 8.5**

### Property 21: Password Reset Completion Audit Logging

*For any* password reset completion attempt (successful or failed), the system should create an audit log entry containing the user ID, timestamp, and success/failure status, without logging the password or token.

**Validates: Requirements 8.3, 8.5**

### Property 22: Rate Limit Audit Logging

*For any* password reset request that is blocked by rate limiting, the system should create an audit log entry containing the email address and timestamp.

**Validates: Requirements 8.4**

### Property 23: Frontend Password Mismatch Validation

*For any* password change or reset form submission where the new password and confirmation password fields do not match, the frontend should display an error message and prevent submission to the backend.

**Validates: Requirements 9.6**

### Property 24: Frontend Submit Button State

*For any* password form (change or reset), while a submission is in progress, the submit button should be disabled to prevent duplicate submissions.

**Validates: Requirements 9.7**

### Property 25: Frontend Password Strength Indicator

*For any* password input in the change or reset forms, as the user types, the password strength indicator should update in real-time to reflect the current password's strength and validation status.

**Validates: Requirements 9.4**

### Property 26: Frontend Validation Error Display

*For any* password that fails validation, the frontend should display all failed requirements in a user-friendly format, helping users understand what needs to be corrected.

**Validates: Requirements 9.3**

### Property 27: Session Persistence After Password Change

*For any* authenticated admin user who changes their password, the current JWT token should remain valid after the password change, allowing the user to continue their session without re-authentication.

**Validates: Requirements 10.1, 10.2**

### Property 28: Redirect After Password Reset

*For any* successful password reset completion, the frontend should redirect the user to the login page where they can authenticate with their new password.

**Validates: Requirements 10.4**


## Error Handling

### Error Categories

#### Validation Errors (400 Bad Request)

**Password Validation Failures**:
```typescript
{
  error: {
    message: "Password validation failed",
    code: "VALIDATION_ERROR",
    details: [
      "Password must be at least 8 characters long",
      "Password must contain at least one uppercase letter",
      "Password must contain at least one special character"
    ]
  }
}
```

**Password Mismatch**:
```typescript
{
  error: {
    message: "Passwords do not match",
    code: "PASSWORD_MISMATCH"
  }
}
```

**Invalid Token**:
```typescript
{
  error: {
    message: "Invalid or expired reset token",
    code: "INVALID_TOKEN"
  }
}
```

#### Authentication Errors (401 Unauthorized)

**Invalid Current Password**:
```typescript
{
  error: {
    message: "Current password is incorrect",
    code: "INVALID_CURRENT_PASSWORD"
  }
}
```

**Missing Authentication**:
```typescript
{
  error: {
    message: "Authentication required",
    code: "AUTH_REQUIRED"
  }
}
```

#### Rate Limiting Errors (429 Too Many Requests)

**Rate Limit Exceeded**:
```typescript
{
  error: {
    message: "Too many password reset requests. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: 847 // seconds remaining
  }
}
```

#### Server Errors (500 Internal Server Error)

**Database Errors**:
- Log full error details with stack trace
- Return generic error message to client
- Alert monitoring system (Sentry)

**Email Service Errors**:
- Log email delivery failure
- Continue with password operation
- Return success to client (don't expose email issues)

### Error Handling Strategy

#### Backend Error Handling

1. **Input Validation**: Validate all inputs before processing
2. **Database Transactions**: Use transactions for multi-step operations (password update + token invalidation)
3. **Graceful Degradation**: Email failures should not prevent password operations
4. **Comprehensive Logging**: Log all errors with context for debugging
5. **Security**: Never expose sensitive information in error messages

#### Frontend Error Handling

1. **Client-Side Validation**: Validate before submission to provide immediate feedback
2. **User-Friendly Messages**: Convert technical errors to understandable messages
3. **Error Recovery**: Provide clear next steps for users to resolve errors
4. **Loading States**: Show loading indicators during async operations
5. **Toast Notifications**: Use toast notifications for success/error feedback

### Security Considerations

#### Password Security

- **Bcrypt Hashing**: Use bcrypt with salt factor 10+ for all password hashing
- **No Plain Text Storage**: Never store passwords in plain text
- **Secure Comparison**: Use timing-safe comparison for password verification
- **Password Requirements**: Enforce strong password requirements

#### Token Security

- **Cryptographic Randomness**: Use crypto.randomBytes() for token generation
- **Token Hashing**: Store only hashed tokens in database
- **Single Use**: Invalidate tokens immediately after use
- **Expiration**: Tokens expire after 1 hour
- **One Active Token**: Only one active token per user at a time

#### Rate Limiting

- **Request Throttling**: Limit reset requests to 3 per 15 minutes per email
- **Email Enumeration Prevention**: Return same response for existing/non-existing emails
- **Distributed Rate Limiting**: Use database for rate limit tracking (works across multiple servers)

#### Audit Logging

- **Comprehensive Logging**: Log all password operations
- **No Sensitive Data**: Never log passwords, hashes, or tokens
- **Tamper Resistance**: Use append-only logging
- **Monitoring**: Alert on suspicious patterns (many failed attempts)

#### Session Management

- **JWT Tokens**: Continue using existing JWT-based authentication
- **Session Persistence**: Password change doesn't invalidate current session
- **Reset Invalidation**: Password reset via email invalidates all sessions (requires token blacklist or short-lived tokens)

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and integration points
- **Property Tests**: Verify universal properties across all inputs using fast-check

### Property-Based Testing

**Library**: fast-check (already in use for backend testing)

**Configuration**: Each property test should run minimum 100 iterations to ensure comprehensive input coverage.

**Test Organization**: Property tests should be in separate files (e.g., `password.property.test.ts`) and tagged with comments referencing the design document properties.

**Tag Format**:
```typescript
/**
 * Feature: admin-password-management
 * Property 2: Password Validation Completeness
 * 
 * For any password string, the password validator should enforce all security
 * requirements: minimum 8 characters, at least one uppercase letter, at least
 * one lowercase letter, at least one digit, at least one special character
 * from the allowed set, and rejection if the password matches the user's email.
 */
test('password validation enforces all requirements', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.emailAddress(),
      (password, email) => {
        // Test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

### Backend Testing

#### Unit Tests

**PasswordService Tests** (`backend/src/services/password.test.ts`):
- Password validation with specific examples (empty, too short, missing requirements)
- Bcrypt hashing verification
- Token generation format verification
- Password change with correct/incorrect current password
- Reset token validation (valid, expired, used, non-existent)

**RateLimitService Tests** (`backend/src/services/rate-limit.test.ts`):
- Rate limit enforcement at boundary (3 requests)
- Rate limit reset after window expiration
- Independent rate limits for different emails

**API Route Tests** (`backend/src/routes/admin/password.test.ts`):
- POST /api/admin/password/change (authenticated)
- POST /api/admin/password/reset/request (unauthenticated)
- POST /api/admin/password/reset/complete (unauthenticated)
- Authentication middleware integration
- Error response formats

**Email Service Tests** (`backend/src/services/email.test.ts`):
- Password change confirmation email
- Password reset email with token
- Password reset completion email
- Email failure handling

#### Property-Based Tests

**Password Validation Properties** (`backend/src/services/password.property.test.ts`):
- Property 2: Password validation completeness
- Property 3: Password validation error messages
- Property 4: Bcrypt hash format

**Password Change Properties**:
- Property 1: Current password verification
- Property 5: Password change persistence
- Property 6: Password change email notification
- Property 19: Password change audit logging

**Password Reset Properties**:
- Property 7: Reset token generation security
- Property 8: Reset token expiration
- Property 9: Reset token persistence
- Property 10: Email enumeration prevention
- Property 11: Reset email delivery
- Property 14: Reset token validation
- Property 15: Password reset persistence and token invalidation
- Property 16: Password reset email notification
- Property 17: Single active token per user
- Property 20: Password reset initiation audit logging
- Property 21: Password reset completion audit logging

**Rate Limiting Properties**:
- Property 12: Rate limit enforcement
- Property 13: Rate limit independence
- Property 22: Rate limit audit logging

**Resilience Properties**:
- Property 18: Email failure resilience

**Session Management Properties**:
- Property 27: Session persistence after password change

### Frontend Testing

#### Unit Tests

**ChangePasswordForm Tests** (`admin-frontend/src/components/ChangePasswordForm.test.tsx`):
- Form rendering with all fields
- Current password field validation
- New password field validation
- Confirm password matching
- Submit button disabled during submission
- Success/error toast notifications
- API integration

**ForgotPasswordForm Tests** (`admin-frontend/src/components/ForgotPasswordForm.test.tsx`):
- Form rendering
- Email field validation
- Submit button disabled during submission
- Success message display
- Rate limit error handling

**ResetPasswordForm Tests** (`admin-frontend/src/components/ResetPasswordForm.test.tsx`):
- Token validation on mount
- New password field validation
- Confirm password matching
- Submit button disabled during submission
- Redirect to login on success
- Invalid token error handling

**PasswordStrengthIndicator Tests** (`admin-frontend/src/components/PasswordStrengthIndicator.test.tsx`):
- Strength calculation (weak/medium/strong)
- Requirements checklist display
- Real-time updates as user types
- Visual feedback (color coding)

#### Property-Based Tests

**Frontend Validation Properties** (`admin-frontend/src/components/password-forms.property.test.tsx`):
- Property 23: Frontend password mismatch validation
- Property 24: Frontend submit button state
- Property 25: Frontend password strength indicator
- Property 26: Frontend validation error display
- Property 28: Redirect after password reset

### Integration Testing

**End-to-End Password Change Flow**:
1. Admin logs in
2. Navigates to password change form
3. Enters current password and new password
4. Submits form
5. Receives success notification
6. Verifies email confirmation received
7. Logs out and logs in with new password

**End-to-End Password Reset Flow**:
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Receives reset email
4. Clicks reset link in email
5. Enters new password
6. Submits form
7. Redirected to login page
8. Logs in with new password
9. Verifies confirmation email received

**Rate Limiting Flow**:
1. Submit 3 password reset requests for same email
2. Verify 4th request is rejected with rate limit error
3. Verify error includes retry-after time
4. Wait for rate limit window to expire
5. Verify subsequent request succeeds

### Test Data Generation

**fast-check Generators**:

```typescript
// Valid password generator
const validPasswordArb = fc.string({ minLength: 8 }).filter(pwd => 
  /[A-Z]/.test(pwd) && 
  /[a-z]/.test(pwd) && 
  /[0-9]/.test(pwd) && 
  /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)
);

// Invalid password generators (for testing validation)
const tooShortPasswordArb = fc.string({ maxLength: 7 });
const noUppercasePasswordArb = fc.string().filter(pwd => !/[A-Z]/.test(pwd));
const noLowercasePasswordArb = fc.string().filter(pwd => !/[a-z]/.test(pwd));
const noDigitPasswordArb = fc.string().filter(pwd => !/[0-9]/.test(pwd));
const noSpecialCharPasswordArb = fc.string().filter(pwd => 
  !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)
);

// Admin user generator
const adminUserArb = fc.record({
  id: fc.integer({ min: 1 }),
  email: fc.emailAddress(),
  passwordHash: fc.string(),
  fullName: fc.string(),
  role: fc.constant('administrator')
});

// Reset token generator
const resetTokenArb = fc.hexaString({ minLength: 64, maxLength: 64 });
```

### Test Coverage Goals

- **Line Coverage**: Minimum 80% for all password management code
- **Branch Coverage**: Minimum 75% for all conditional logic
- **Property Tests**: All 28 correctness properties implemented
- **Integration Tests**: All critical user flows covered

### Continuous Integration

- Run all tests on every commit
- Fail build if any test fails
- Generate coverage reports
- Alert on coverage decrease
- Run property tests with increased iterations (1000+) in CI

