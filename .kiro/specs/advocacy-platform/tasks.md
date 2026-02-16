# Implementation Plan: Advocacy Platform

## Overview

This implementation plan breaks down the advocacy platform into incremental coding tasks. The platform will be built using TypeScript, Node.js/Express for the backend, React for the frontend, and PostgreSQL for the database. Each task builds on previous work, with testing integrated throughout to catch errors early.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create monorepo structure with backend and frontend directories
  - Initialize Node.js/TypeScript projects with tsconfig.json
  - Install core dependencies: Express, React, PostgreSQL client (pg), bcrypt, jsonwebtoken
  - Install testing dependencies: Jest, Supertest, fast-check, React Testing Library
  - Set up ESLint and Prettier for code quality
  - Create .env.example files for configuration
  - _Requirements: All (foundation)_

- [x] 2. Set up database schema and migrations
  - Create PostgreSQL database schema for users, petitions, and signatures tables
  - Implement database constraints (unique emails, foreign keys, check constraints)
  - Create petition_signature_counts view for efficient querying
  - Create database indexes for performance (email, petition owner, signatures)
  - Write database migration scripts
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 3. Implement user authentication backend
  - [x] 3.1 Create User model and database operations
    - Implement user creation with password hashing using bcrypt
    - Implement user lookup by email and by ID
    - _Requirements: 1.1, 7.1, 7.4_
  
  - [ ]* 3.2 Write property test for user creation
    - **Property 1: Valid registration creates account**
    - **Validates: Requirements 1.1, 7.1**
  
  - [ ]* 3.3 Write property test for password hashing
    - **Property 6: Password hashing**
    - **Validates: Requirements 7.4**
  
  - [x] 3.4 Implement registration endpoint POST /api/auth/register
    - Validate email format, password strength (8+ chars, letter + number)
    - Check for duplicate emails
    - Hash password and create user account
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 3.5 Write property tests for registration validation
    - **Property 2: Duplicate email rejection**
    - **Property 5: Password validation**
    - **Validates: Requirements 1.2, 1.5**
  
  - [x] 3.6 Implement login endpoint POST /api/auth/login
    - Validate credentials against stored hash
    - Generate JWT token on successful authentication
    - Return user information with token
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 3.7 Write property tests for authentication
    - **Property 3: Authentication round trip**
    - **Property 4: Invalid credentials rejection**
    - **Validates: Requirements 1.3, 1.4**

- [x] 4. Implement authentication middleware
  - Create JWT verification middleware
  - Extract user information from valid tokens
  - Return 401 errors for invalid/missing tokens
  - Attach user data to request object for downstream handlers
  - _Requirements: 1.3_

- [x] 5. Implement petition creation and management backend
  - [x] 5.1 Create Petition model and database operations
    - Implement petition creation with owner assignment
    - Generate unique URLs using slugify or nanoid
    - Implement petition retrieval by ID and by URL
    - Implement petition update and status change operations
    - _Requirements: 2.1, 2.2, 2.3, 7.2_
  
  - [ ]* 5.2 Write property tests for petition creation
    - **Property 7: Valid petition creation**
    - **Property 8: Petition ownership assignment**
    - **Property 9: Petition ID and URL uniqueness**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [x] 5.3 Implement POST /api/petitions endpoint
    - Require authentication
    - Validate title length (10-200 chars) and description length (50+ chars)
    - Validate goal is positive integer
    - Create petition with authenticated user as owner
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 5.4 Write property tests for petition validation
    - **Property 10: Petition title validation**
    - **Property 11: Petition description validation**
    - **Validates: Requirements 2.4, 2.5**
  
  - [x] 5.5 Implement PUT /api/petitions/:id endpoint
    - Require authentication and ownership verification
    - Allow updating title, description, and goal
    - Preserve existing signatures
    - _Requirements: 5.2, 5.5_
  
  - [ ]* 5.6 Write property tests for petition editing
    - **Property 12: Petition edit preserves signatures**
    - **Property 15: Owner-only modification**
    - **Validates: Requirements 5.2, 5.5**
  
  - [x] 5.7 Implement POST /api/petitions/:id/close endpoint
    - Require authentication and ownership verification
    - Update petition status to 'closed'
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ]* 5.8 Write property tests for petition closure
    - **Property 13: Petition closure prevents new signatures**
    - **Property 14: Closed petitions remain viewable**
    - **Validates: Requirements 5.3, 5.4**

- [ ] 6. Checkpoint - Ensure authentication and petition management tests pass
  - Run all tests for authentication and petition management
  - Verify database operations work correctly
  - Ask the user if questions arise

- [x] 7. Implement signature functionality backend
  - [x] 7.1 Create Signature model and database operations
    - Implement signature creation with user and petition IDs
    - Use UNIQUE constraint to prevent duplicates
    - Implement signature retrieval by petition ID
    - Implement signature counting using the database view
    - _Requirements: 3.1, 3.2, 7.3, 7.5_
  
  - [ ]* 7.2 Write property tests for signature operations
    - **Property 16: Signature recording**
    - **Property 17: Duplicate signature prevention (Idempotence)**
    - **Property 18: Signature count invariant**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [x] 7.3 Implement POST /api/petitions/:id/sign endpoint
    - Require authentication
    - Verify petition exists and is active (not closed)
    - Create signature record (handle duplicate gracefully)
    - Return updated signature count
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [ ]* 7.4 Write property tests for signature access control
    - **Property 19: Unauthenticated signing rejection**
    - **Validates: Requirements 3.5, 8.5**
  
  - [x] 7.5 Implement GET /api/petitions/:id/signatures endpoint
    - Return signatures with supporter names and timestamps
    - Order by most recent first
    - Exclude email addresses from response
    - Support pagination with limit and offset
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ]* 7.6 Write property tests for signature display
    - **Property 25: Signature list ordering**
    - **Property 26: Email privacy protection**
    - **Property 27: Signature data completeness**
    - **Validates: Requirements 6.1, 6.2, 6.5**

- [x] 8. Implement petition discovery and listing backend
  - [x] 8.1 Implement GET /api/petitions endpoint
    - Filter by status (default to 'active')
    - Support search query parameter for title/description matching
    - Support sortBy parameter (recent, signatures, progress)
    - Include signature counts using the database view
    - Support pagination with limit and offset
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 8.2 Write property tests for petition listing
    - **Property 21: Active petition filtering**
    - **Property 22: Search term matching**
    - **Property 23: Petition list completeness**
    - **Property 24: Sort order correctness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  
  - [x] 8.3 Implement GET /api/petitions/:id endpoint
    - Return full petition details with signature count
    - Allow unauthenticated access for viewing
    - Include owner information (name only, not email)
    - _Requirements: 8.5, 3.5_
  
  - [ ]* 8.4 Write property test for unauthenticated viewing
    - **Property 31: Unauthenticated viewing allowed**
    - **Validates: Requirements 8.5**

- [ ] 9. Implement security middleware and validation
  - [ ] 9.1 Create input validation middleware
    - Use express-validator for all endpoints
    - Validate email formats, string lengths, numeric ranges
    - Return 400 errors with detailed validation messages
    - _Requirements: 9.1_
  
  - [ ]* 9.2 Write property test for input validation
    - **Property 32: Input validation enforcement**
    - **Validates: Requirements 9.1**
  
  - [ ] 9.3 Create sanitization middleware
    - Sanitize HTML in user-generated content (titles, descriptions)
    - Strip or escape script tags and dangerous HTML
    - Use library like DOMPurify or sanitize-html
    - _Requirements: 9.2_
  
  - [ ]* 9.4 Write property test for XSS prevention
    - **Property 33: XSS prevention**
    - **Validates: Requirements 9.2**
  
  - [ ] 9.5 Implement rate limiting middleware
    - Use express-rate-limit library
    - Apply to registration, login, and signing endpoints
    - Return 429 errors when limit exceeded
    - _Requirements: 9.4_
  
  - [ ]* 9.6 Write property test for rate limiting
    - **Property 34: Rate limiting enforcement**
    - **Validates: Requirements 9.4**

- [ ] 10. Checkpoint - Ensure all backend tests pass
  - Run complete backend test suite
  - Verify all property tests pass with 100+ iterations
  - Check test coverage meets 80% goal
  - Ask the user if questions arise

- [x] 11. Implement React frontend authentication components
  - [x] 11.1 Create authentication context and hooks
    - Implement AuthContext for managing auth state
    - Store JWT token in localStorage
    - Provide login, logout, and register functions
    - Create useAuth hook for components
    - _Requirements: 1.1, 1.3_
  
  - [x] 11.2 Create LoginForm component
    - Form with email and password fields
    - Client-side validation for email format
    - Call login API endpoint
    - Handle success and error states
    - Redirect to home on successful login
    - _Requirements: 1.3, 1.4_
  
  - [x] 11.3 Create RegisterForm component
    - Form with email, password, and name fields
    - Client-side validation for password strength
    - Call registration API endpoint
    - Display validation errors
    - Redirect to login on successful registration
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 11.4 Write unit tests for authentication components
    - Test form validation
    - Test API call handling
    - Test error display
    - _Requirements: 1.1, 1.3_

- [ ] 12. Implement React frontend petition components
  - [ ] 12.1 Create PetitionList component
    - Display grid/list of petition cards
    - Implement search input with debouncing
    - Implement sort dropdown (recent, signatures, progress)
    - Handle loading and error states
    - Implement pagination controls
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ] 12.2 Create PetitionCard component
    - Display petition title, description excerpt
    - Show progress bar with current/goal signatures
    - Display creation date
    - Link to petition detail page
    - _Requirements: 4.3_
  
  - [ ] 12.3 Create PetitionDetail component
    - Display full petition information
    - Show signature count and progress
    - Conditionally show edit/close buttons for owners
    - Display signature list
    - Include share buttons and URL
    - _Requirements: 5.1, 6.1, 8.1_
  
  - [ ] 12.4 Create PetitionForm component
    - Form for creating/editing petitions
    - Fields for title, description, goal
    - Client-side validation for lengths
    - Handle create and update modes
    - _Requirements: 2.1, 5.2_
  
  - [ ]* 12.5 Write unit tests for petition components
    - Test rendering with mock data
    - Test user interactions
    - Test conditional rendering
    - _Requirements: 2.1, 4.1_

- [ ] 13. Implement signature functionality frontend
  - [ ] 13.1 Create SignatureButton component
    - Display "Sign Petition" or "Signed" state
    - Disable when already signed or petition closed
    - Call sign API endpoint on click
    - Show confirmation message on success
    - Require authentication (redirect to login if needed)
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [ ] 13.2 Create SignatureList component
    - Display list of signatures with names and dates
    - Show most recent first
    - Implement pagination
    - Only show to petition owners or limit public view
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ]* 13.3 Write unit tests for signature components
    - Test button states
    - Test API interactions
    - Test authentication requirements
    - _Requirements: 3.1, 3.5_

- [ ] 14. Implement sharing and social features frontend
  - [ ] 14.1 Add social media share buttons
    - Create ShareButtons component
    - Include Twitter, Facebook, LinkedIn share links
    - Copy-to-clipboard for petition URL
    - _Requirements: 8.1, 8.2_
  
  - [ ] 14.2 Add Open Graph meta tags
    - Create MetaTags component using react-helmet
    - Include og:title, og:description, og:url, og:image
    - Dynamically set based on petition data
    - _Requirements: 8.3_
  
  - [ ]* 14.3 Write property test for metadata
    - **Property 29: Social media metadata**
    - **Validates: Requirements 8.3**

- [ ] 15. Implement responsive design and styling
  - Create global CSS with responsive breakpoints
  - Style all components for mobile, tablet, and desktop
  - Ensure touch-friendly button sizes (min 44x44px)
  - Test layouts at different screen sizes
  - Implement mobile navigation menu
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 16. Implement routing and navigation
  - Set up React Router with routes for home, login, register, petition detail, create petition
  - Create navigation header with links and auth status
  - Implement protected routes requiring authentication
  - Handle 404 not found pages
  - _Requirements: All (navigation)_

- [ ] 17. Add database referential integrity tests
  - [ ]* 17.1 Write property test for cascade deletion
    - **Property 20: Referential integrity on deletion**
    - **Validates: Requirements 7.5**

- [ ] 18. Add URL and sharing property tests
  - [ ]* 18.1 Write property tests for URL generation
    - **Property 28: Petition URL generation**
    - **Property 30: URL format validation**
    - **Validates: Requirements 8.1, 8.4**

- [ ] 19. Add cross-platform API parity test
  - [ ]* 19.1 Write property test for API consistency
    - **Property 35: API functionality parity**
    - **Validates: Requirements 10.4**

- [ ] 20. Final integration and testing
  - [ ] 20.1 Run complete test suite (backend and frontend)
    - Verify all property tests pass with 100+ iterations
    - Verify all unit tests pass
    - Check code coverage meets goals (80% backend, 70% frontend)
  
  - [ ] 20.2 Manual end-to-end testing
    - Test complete user flows: register → login → create petition → sign → share
    - Test on multiple browsers (Chrome, Firefox, Safari)
    - Test on mobile devices
    - Verify responsive design works correctly
  
  - [ ] 20.3 Security verification
    - Run npm audit to check for vulnerabilities
    - Verify HTTPS is enforced
    - Test rate limiting works
    - Verify XSS protection works
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [ ] 21. Final checkpoint - Deployment readiness
  - Ensure all tests pass
  - Verify environment configuration is documented
  - Create README with setup instructions
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Testing is integrated throughout to catch errors early
- The implementation follows a bottom-up approach: database → backend API → frontend components
