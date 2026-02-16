# Design Document: Advocacy Platform

## Overview

The Advocacy Platform is a full-stack web application that enables political advocacy through petition creation and signature collection. The system follows a three-tier architecture with a React-based frontend, RESTful API backend, and PostgreSQL database.

The platform prioritizes security, data integrity, and user experience across devices. Key design principles include:

- **Security-first**: All user data is protected with industry-standard encryption and authentication
- **Scalability**: Architecture supports growth in users and petitions
- **Accessibility**: Responsive design ensures usability across all devices
- **Data integrity**: Strong referential integrity and validation at all layers

## Architecture

### System Architecture

The platform uses a client-server architecture with clear separation of concerns:

```
┌─────────────────┐
│  React Frontend │ (Browser)
│  - UI Components│
│  - State Mgmt   │
└────────┬────────┘
         │ HTTPS/REST
         │
┌────────▼────────┐
│   API Server    │ (Node.js/Express)
│  - Auth Layer   │
│  - Business     │
│    Logic        │
│  - Validation   │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Database      │
│  - Users        │
│  - Petitions    │
│  - Signatures   │
└─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ for UI components
- React Router for navigation
- Axios for API communication
- CSS Modules for styling with responsive design

**Backend:**
- Node.js with Express framework
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- express-validator for input validation
- helmet for security headers

**Database:**
- PostgreSQL 14+ for relational data storage
- Database migrations for schema management

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**LoginForm**
- Handles user login
- Validates credentials client-side
- Manages authentication state
- Interface:
  ```typescript
  interface LoginFormProps {
    onLoginSuccess: (token: string) => void;
    onLoginError: (error: string) => void;
  }
  ```

**RegisterForm**
- Handles new user registration
- Validates registration data client-side
- Interface:
  ```typescript
  interface RegisterFormProps {
    onRegisterSuccess: () => void;
    onRegisterError: (error: string) => void;
  }
  ```

#### 2. Petition Components

**PetitionList**
- Displays list of petitions with filtering and sorting
- Supports search functionality
- Interface:
  ```typescript
  interface PetitionListProps {
    searchQuery?: string;
    sortBy: 'recent' | 'signatures' | 'progress';
  }
  ```

**PetitionCard**
- Shows petition summary in list view
- Displays title, excerpt, progress bar, signature count
- Interface:
  ```typescript
  interface PetitionCardProps {
    petition: {
      id: string;
      title: string;
      description: string;
      currentSignatures: number;
      goalSignatures: number;
      createdAt: Date;
    };
  }
  ```

**PetitionDetail**
- Shows full petition information
- Includes sign button and signature list
- Displays share options
- Interface:
  ```typescript
  interface PetitionDetailProps {
    petitionId: string;
    isOwner: boolean;
  }
  ```

**PetitionForm**
- Creates or edits petitions
- Validates petition data client-side
- Interface:
  ```typescript
  interface PetitionFormProps {
    petition?: Petition;
    onSave: (petition: PetitionData) => void;
    onCancel: () => void;
  }
  ```

#### 3. Signature Components

**SignatureButton**
- Handles petition signing action
- Shows signed state
- Interface:
  ```typescript
  interface SignatureButtonProps {
    petitionId: string;
    hasSigned: boolean;
    onSign: () => void;
  }
  ```

**SignatureList**
- Displays list of petition signatures
- Shows supporter names and timestamps
- Interface:
  ```typescript
  interface SignatureListProps {
    petitionId: string;
    isOwner: boolean;
  }
  ```

### Backend API Endpoints

#### Authentication Endpoints

**POST /api/auth/register**
- Creates new user account
- Request body: `{ email, password, name }`
- Response: `{ message, userId }`
- Validates email format, password strength

**POST /api/auth/login**
- Authenticates user and returns JWT
- Request body: `{ email, password }`
- Response: `{ token, user: { id, email, name } }`

#### Petition Endpoints

**POST /api/petitions**
- Creates new petition (authenticated)
- Request body: `{ title, description, goalSignatures }`
- Response: `{ petition: { id, title, description, goalSignatures, url, ownerId, createdAt } }`

**GET /api/petitions**
- Lists petitions with optional filtering
- Query params: `search`, `sortBy`, `limit`, `offset`
- Response: `{ petitions: [...], total }`

**GET /api/petitions/:id**
- Gets single petition details
- Response: `{ petition: {...}, signatures: [...] }`

**PUT /api/petitions/:id**
- Updates petition (owner only, authenticated)
- Request body: `{ title?, description?, goalSignatures? }`
- Response: `{ petition: {...} }`

**POST /api/petitions/:id/close**
- Closes petition (owner only, authenticated)
- Response: `{ petition: {...} }`

#### Signature Endpoints

**POST /api/petitions/:id/sign**
- Signs a petition (authenticated)
- Response: `{ signature: { id, petitionId, userId, createdAt }, newCount }`

**GET /api/petitions/:id/signatures**
- Gets signatures for a petition
- Query params: `limit`, `offset`
- Response: `{ signatures: [...], total }`

### Middleware

**authMiddleware**
- Validates JWT tokens
- Attaches user information to request
- Returns 401 for invalid/missing tokens

**validationMiddleware**
- Validates request data using express-validator
- Returns 400 with validation errors

**rateLimitMiddleware**
- Implements rate limiting per IP address
- Prevents abuse of endpoints

**sanitizationMiddleware**
- Sanitizes user inputs to prevent XSS
- Strips dangerous HTML tags

## Data Models

### User Model

```typescript
interface User {
  id: string;              // UUID
  email: string;           // Unique, validated email
  passwordHash: string;    // bcrypt hashed password
  name: string;            // Display name
  createdAt: Date;
  updatedAt: Date;
}
```

**Database Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Petition Model

```typescript
interface Petition {
  id: string;              // UUID
  title: string;           // 10-200 characters
  description: string;     // Minimum 50 characters
  goalSignatures: number;  // Target signature count
  currentSignatures: number; // Current count (computed)
  ownerId: string;         // Foreign key to User
  url: string;             // Shareable URL slug
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}
```

**Database Schema:**
```sql
CREATE TABLE petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  goal_signatures INTEGER NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT title_length CHECK (LENGTH(title) >= 10 AND LENGTH(title) <= 200),
  CONSTRAINT description_length CHECK (LENGTH(description) >= 50),
  CONSTRAINT goal_positive CHECK (goal_signatures > 0)
);

CREATE INDEX idx_petitions_owner ON petitions(owner_id);
CREATE INDEX idx_petitions_status ON petitions(status);
CREATE INDEX idx_petitions_url ON petitions(url);
```

### Signature Model

```typescript
interface Signature {
  id: string;              // UUID
  petitionId: string;      // Foreign key to Petition
  userId: string;          // Foreign key to User
  createdAt: Date;
}
```

**Database Schema:**
```sql
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(petition_id, user_id)
);

CREATE INDEX idx_signatures_petition ON signatures(petition_id);
CREATE INDEX idx_signatures_user ON signatures(user_id);
```

### View for Petition Counts

```sql
CREATE VIEW petition_signature_counts AS
SELECT 
  p.id,
  p.title,
  p.description,
  p.goal_signatures,
  COUNT(s.id) as current_signatures,
  p.owner_id,
  p.url,
  p.status,
  p.created_at,
  p.updated_at
FROM petitions p
LEFT JOIN signatures s ON p.id = s.petition_id
GROUP BY p.id;
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Authentication and User Management Properties

**Property 1: Valid registration creates account**
*For any* valid registration data (email, password with 8+ chars including letter and number, name), submitting registration should successfully create a user account that can be retrieved.
**Validates: Requirements 1.1, 7.1**

**Property 2: Duplicate email rejection**
*For any* user account that exists, attempting to register again with the same email should be rejected with an error.
**Validates: Requirements 1.2**

**Property 3: Authentication round trip**
*For any* user account created, logging in with the correct credentials should succeed and return a valid authentication token.
**Validates: Requirements 1.3, 7.1**

**Property 4: Invalid credentials rejection**
*For any* user account, attempting to login with incorrect password should be rejected with an error.
**Validates: Requirements 1.4**

**Property 5: Password validation**
*For any* password that is less than 8 characters OR contains no letters OR contains no numbers, registration should be rejected.
**Validates: Requirements 1.5**

**Property 6: Password hashing**
*For any* user account created, the stored password should be hashed (not equal to the plaintext password provided).
**Validates: Requirements 7.4**

### Petition Creation and Management Properties

**Property 7: Valid petition creation**
*For any* authenticated user and valid petition data (title 10-200 chars, description 50+ chars, positive goal), creating a petition should succeed and return a petition with unique ID and URL.
**Validates: Requirements 2.1, 2.3**

**Property 8: Petition ownership assignment**
*For any* authenticated user creating a petition, the created petition's owner ID should equal the creating user's ID.
**Validates: Requirements 2.2**

**Property 9: Petition ID and URL uniqueness**
*For any* set of petitions created, all petition IDs should be unique and all petition URLs should be unique.
**Validates: Requirements 2.3**

**Property 10: Petition title validation**
*For any* petition title that is less than 10 characters OR greater than 200 characters, petition creation should be rejected.
**Validates: Requirements 2.4**

**Property 11: Petition description validation**
*For any* petition description that is less than 50 characters, petition creation should be rejected.
**Validates: Requirements 2.5**

**Property 12: Petition edit preserves signatures**
*For any* petition with signatures, editing the petition (title, description, or goal) should not change the signature count or remove any signatures.
**Validates: Requirements 5.2**

**Property 13: Petition closure prevents new signatures**
*For any* petition that is closed, attempting to sign it should be rejected with an error.
**Validates: Requirements 5.3**

**Property 14: Closed petitions remain viewable**
*For any* petition that is closed, it should still be retrievable and display its final signature count.
**Validates: Requirements 5.4**

**Property 15: Owner-only modification**
*For any* petition and any authenticated user who is not the owner, attempting to edit or close the petition should be rejected with authorization error.
**Validates: Requirements 5.5**

### Signature Properties

**Property 16: Signature recording**
*For any* authenticated user and active petition, signing the petition should create a signature record with the user's ID, petition ID, and timestamp.
**Validates: Requirements 3.1, 7.3**

**Property 17: Duplicate signature prevention (Idempotence)**
*For any* user and petition, signing the petition multiple times should result in exactly one signature record.
**Validates: Requirements 3.2**

**Property 18: Signature count invariant**
*For any* petition, the current signature count should always equal the number of signature records for that petition.
**Validates: Requirements 3.3**

**Property 19: Unauthenticated signing rejection**
*For any* petition, attempting to sign without authentication should be rejected with authentication error.
**Validates: Requirements 3.5, 8.5**

**Property 20: Referential integrity on deletion**
*For any* user with signatures, deleting the user should cascade delete their signatures, maintaining database integrity.
**Validates: Requirements 7.5**

### Petition Discovery and Display Properties

**Property 21: Active petition filtering**
*For any* request to list petitions without filters, all returned petitions should have status 'active'.
**Validates: Requirements 4.1**

**Property 22: Search term matching**
*For any* search query and petition set, all returned petitions should contain the search term in either title or description (case-insensitive).
**Validates: Requirements 4.2**

**Property 23: Petition list completeness**
*For any* petition in a list response, it should include title, description, current signature count, and goal signature count.
**Validates: Requirements 4.3**

**Property 24: Sort order correctness**
*For any* petition list sorted by 'recent', petitions should be ordered by creation date descending; sorted by 'signatures', ordered by signature count descending; sorted by 'progress', ordered by (current/goal) ratio descending.
**Validates: Requirements 4.4**

**Property 25: Signature list ordering**
*For any* petition's signature list, signatures should be ordered by creation timestamp descending (most recent first).
**Validates: Requirements 6.2**

**Property 26: Email privacy protection**
*For any* public petition or signature list response, email addresses should not be included in the response data.
**Validates: Requirements 6.5**

**Property 27: Signature data completeness**
*For any* signature in a signature list response (for owners), it should include supporter name and timestamp.
**Validates: Requirements 6.1**

### Sharing and Access Properties

**Property 28: Petition URL generation**
*For any* petition created, it should have a non-empty URL field that is a valid URL path.
**Validates: Requirements 8.1**

**Property 29: Social media metadata**
*For any* petition detail page HTML, it should include Open Graph meta tags for title, description, and URL.
**Validates: Requirements 8.3**

**Property 30: URL format validation**
*For any* petition URL generated, it should be alphanumeric with hyphens, lowercase, and less than 100 characters.
**Validates: Requirements 8.4**

**Property 31: Unauthenticated viewing allowed**
*For any* petition, unauthenticated requests to view the petition should succeed and return petition data.
**Validates: Requirements 8.5**

### Security and Validation Properties

**Property 32: Input validation enforcement**
*For any* API endpoint receiving user input, submitting data that violates validation rules (format, length, type) should be rejected with 400 error.
**Validates: Requirements 9.1**

**Property 33: XSS prevention**
*For any* user-generated content containing HTML script tags, the stored and returned content should have scripts removed or escaped.
**Validates: Requirements 9.2**

**Property 34: Rate limiting enforcement**
*For any* endpoint with rate limiting, making requests exceeding the rate limit should result in 429 (Too Many Requests) errors.
**Validates: Requirements 9.4**

### Cross-Platform Properties

**Property 35: API functionality parity**
*For any* API endpoint, it should provide the same functionality and responses regardless of the client device or user agent.
**Validates: Requirements 10.4**

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  }
}
```

### Error Categories

**Authentication Errors (401)**
- Invalid or expired JWT token
- Missing authentication token
- Invalid credentials during login

**Authorization Errors (403)**
- Attempting to modify petition owned by another user
- Attempting to access owner-only resources

**Validation Errors (400)**
- Invalid input format (email, password strength)
- Constraint violations (title length, description length)
- Missing required fields

**Not Found Errors (404)**
- Petition ID does not exist
- User ID does not exist

**Conflict Errors (409)**
- Duplicate email during registration
- Duplicate signature attempt (handled gracefully)

**Rate Limit Errors (429)**
- Too many requests from same IP
- Includes retry-after header

**Server Errors (500)**
- Database connection failures
- Unexpected server errors
- All errors logged for debugging

### Error Handling Strategy

**Frontend:**
- Display user-friendly error messages
- Provide actionable feedback (e.g., "Email already in use, try logging in")
- Log errors to console for debugging
- Implement retry logic for transient failures

**Backend:**
- Validate all inputs before processing
- Use try-catch blocks around database operations
- Log all errors with context (user ID, request ID, timestamp)
- Return appropriate HTTP status codes
- Never expose sensitive information in error messages

## Testing Strategy

### Dual Testing Approach

The platform requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests:**
- Specific examples demonstrating correct behavior
- Edge cases (empty strings, boundary values, null handling)
- Error conditions and error message validation
- Integration points between components
- Mock external dependencies (database, authentication)

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Generate random valid and invalid inputs
- Verify invariants and business rules
- Test with minimum 100 iterations per property
- Each property test references its design document property

### Testing Framework Selection

**Frontend Testing:**
- Jest for unit tests
- React Testing Library for component tests
- fast-check for property-based testing in TypeScript

**Backend Testing:**
- Jest for unit tests
- Supertest for API endpoint testing
- fast-check for property-based testing
- Test database with Docker PostgreSQL container

### Property Test Configuration

Each property-based test must:
1. Run minimum 100 iterations
2. Include a comment tag: `// Feature: advocacy-platform, Property N: [property text]`
3. Reference the specific property number from this design document
4. Generate appropriate random test data using fast-check generators

### Test Data Generation

**User Generators:**
```typescript
const validEmail = fc.emailAddress();
const validPassword = fc.string({ minLength: 8 })
  .filter(s => /[a-zA-Z]/.test(s) && /[0-9]/.test(s));
const userName = fc.string({ minLength: 1, maxLength: 100 });
```

**Petition Generators:**
```typescript
const petitionTitle = fc.string({ minLength: 10, maxLength: 200 });
const petitionDescription = fc.string({ minLength: 50, maxLength: 5000 });
const goalSignatures = fc.integer({ min: 1, max: 1000000 });
```

### Test Coverage Goals

- Minimum 80% code coverage for backend
- Minimum 70% code coverage for frontend
- 100% of correctness properties implemented as property tests
- All error paths tested with unit tests
- All API endpoints tested with integration tests

### Continuous Integration

- Run all tests on every pull request
- Block merges if tests fail
- Run property tests with 100 iterations in CI
- Generate coverage reports
- Run security scanning (npm audit, Snyk)

