# Admin Login Fix Bugfix Design

## Overview

The admin login functionality is broken due to multiple authentication flow issues: localStorage key mismatches between AuthContext and api.ts, inconsistent axios instance usage, missing Authorization header interceptors, potential missing admin user in the Lambda database, and incorrect environment variable configuration in CloudFront deployment. This fix will standardize the authentication token storage and retrieval, consolidate axios instance usage, implement proper request interceptors, ensure admin user creation during deployment, and configure the correct API endpoint URL.

## Glossary

- **Bug_Condition (C)**: The condition that triggers authentication failures - when users attempt to login with valid credentials but the token is not properly stored, retrieved, or transmitted in subsequent requests
- **Property (P)**: The desired behavior when authentication occurs - tokens should be consistently stored and retrieved, Authorization headers should be automatically attached, and the admin user should exist in the database
- **Preservation**: Existing authentication behaviors (logout, registration, 401 handling, JWT validation, password hashing, CORS, rate limiting) that must remain unchanged by the fix
- **AuthContext**: The React context in `frontend/src/contexts/AuthContext.tsx` that manages authentication state and login/logout operations
- **api.ts**: The centralized API service in `frontend/src/services/api.ts` that provides axios instance and API functions
- **localStorage key**: The key used to store the JWT token in browser localStorage (currently inconsistent: `auth_token` vs `token`)
- **axios interceptor**: Middleware that automatically modifies requests/responses before they are handled
- **Lambda backend**: The AWS Lambda function serving the Express API via API Gateway

## Bug Details

### Fault Condition

The bug manifests when a user submits valid admin credentials at `/admin/login`. The AuthContext successfully receives a token from the backend but stores it with key `auth_token`, while api.ts attempts to retrieve it using key `token`. Additionally, AuthContext uses a separate axios instance for login requests, and api.ts admin functions manually add Authorization headers instead of using interceptors. The Lambda deployment may not have the admin user pre-created, and the CloudFront deployment may have an incorrect VITE_API_URL.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type LoginAttempt { email: string, password: string, context: string }
  OUTPUT: boolean
  
  RETURN (input.email == 'admin@resistanceradio.org' 
         AND input.password == 'admin123'
         AND input.context == 'admin-login')
         AND (localStorageKeyMismatch() 
              OR axiosInstanceInconsistent()
              OR authorizationHeaderMissing()
              OR adminUserNotInDatabase()
              OR apiUrlMisconfigured())
END FUNCTION

FUNCTION localStorageKeyMismatch()
  RETURN AuthContext.storageKey != api.ts.retrievalKey
END FUNCTION

FUNCTION axiosInstanceInconsistent()
  RETURN AuthContext.axiosInstance != api.ts.axiosInstance
END FUNCTION

FUNCTION authorizationHeaderMissing()
  RETURN NOT api.interceptor.addsAuthorizationHeader()
END FUNCTION

FUNCTION adminUserNotInDatabase()
  RETURN NOT EXISTS(SELECT * FROM users WHERE email = 'admin@resistanceradio.org')
END FUNCTION

FUNCTION apiUrlMisconfigured()
  RETURN VITE_API_URL != 'https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev'
END FUNCTION
```

### Examples

- **Example 1**: User enters admin@resistanceradio.org / admin123 → AuthContext stores token with key `auth_token` → api.getAdminShows() reads from key `token` → returns null → Authorization header is `Bearer null` → backend returns 401
- **Example 2**: User logs in successfully → AuthContext sets axios.defaults.headers.common['Authorization'] → api.ts uses separate axios instance → Authorization header not present → backend returns 401
- **Example 3**: User attempts login → backend queries database for admin@resistanceradio.org → user not found (create-admin.ts never executed) → backend returns 401 Invalid credentials
- **Example 4**: Frontend deployed to CloudFront → VITE_API_URL not set or points to wrong endpoint → login request fails with network error or CORS error
- **Edge case**: User logs in, token stored correctly, but api.ts interceptor clears token on 401 using wrong key `token` instead of `auth_token` → logout doesn't fully clear state

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Logout functionality must continue to clear all authentication data from localStorage and axios headers
- Registration must continue to automatically log users in after successful account creation
- 401 responses must continue to trigger auth data clearing and redirect to login page
- JWT token validation must continue to verify signature, expiration, and user existence
- Password hashing must continue to use bcrypt with 10 salt rounds
- CORS must continue to accept requests from allowed origins with credentials enabled
- Rate limiting must continue to enforce configured limits on auth endpoints

**Scope:**
All authentication flows that do NOT involve the admin login with valid credentials should be completely unaffected by this fix. This includes:
- Regular user registration and login
- Token expiration and refresh behavior
- Password validation rules
- Error handling for invalid credentials
- Security middleware (CSRF, rate limiting, CORS)

## Hypothesized Root Cause

Based on the bug description and code analysis, the issues are:

1. **localStorage Key Mismatch**: AuthContext stores tokens with key `auth_token` (line 48 in AuthContext.tsx) but api.ts retrieves with key `token` (line 35 in api.ts response interceptor, and throughout admin API functions). This causes all authenticated requests to fail because the token cannot be retrieved.

2. **Inconsistent Axios Instances**: AuthContext creates login requests using a separate axios instance with `axios.post(\`${API_URL}/auth/login\`)` while api.ts uses a configured axios instance with interceptors. This means login requests don't benefit from CSRF protection, request IDs, or error handling.

3. **Missing Authorization Interceptor**: api.ts does not have a request interceptor that automatically adds the Authorization header from localStorage. Instead, every admin API function manually retrieves the token and adds the header, which is error-prone and inconsistent.

4. **Admin User Not Pre-Created**: The create-admin.ts script exists but is not automatically executed during Lambda deployment. The deployment process runs migrations but doesn't seed the admin user, so the first login attempt fails.

5. **Environment Variable Misconfiguration**: The CloudFront deployment may not have VITE_API_URL properly set to the Lambda API Gateway endpoint (https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev), causing requests to fail or go to the wrong endpoint.

6. **Manual Header Addition**: All admin API functions in api.ts manually retrieve the token and add it to headers, which is repetitive and creates multiple points of failure.

7. **Interceptor Uses Wrong Key**: The 401 response interceptor in api.ts clears `localStorage.removeItem('token')` but should clear `auth_token` to match what AuthContext uses.

## Correctness Properties

Property 1: Fault Condition - Admin Login Authentication Flow

_For any_ login attempt where valid admin credentials (admin@resistanceradio.org / admin123) are submitted, the fixed authentication system SHALL store the JWT token with a consistent localStorage key, automatically attach the Authorization header to all subsequent authenticated requests via axios interceptors, successfully authenticate against an existing admin user in the database, and use the correct API endpoint URL.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

Property 2: Preservation - Non-Admin Authentication Behavior

_For any_ authentication operation that is NOT an admin login with valid credentials (logout, registration, 401 handling, token validation, password hashing, CORS, rate limiting), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing security and authentication functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `frontend/src/services/api.ts`

**Changes**:
1. **Add Authorization Request Interceptor**: Add a new request interceptor that automatically retrieves the token from localStorage using key `auth_token` and adds it to the Authorization header
   - Insert after line 23 (after CSRF token logic)
   - Retrieve token: `const token = localStorage.getItem('auth_token');`
   - Add header: `if (token) { config.headers['Authorization'] = \`Bearer ${token}\`; }`

2. **Fix 401 Interceptor localStorage Key**: Change line 35 from `localStorage.removeItem('token')` to `localStorage.removeItem('auth_token')`

3. **Remove Manual Authorization Headers**: Remove all manual token retrieval and Authorization header additions from admin API functions (lines 110, 117, 125, 133, 141, 149, 157, 165, 173, 181, 189, 197, 205, 213, 221, 229, 237, 245, 253, 261, 269, 277, 285, 293, 301, 309, 317, 325, 333, 341, 349, 357)
   - Delete the `const token = localStorage.getItem('token');` lines
   - Remove `headers: { Authorization: \`Bearer ${token}\` }` from all requests
   - The interceptor will handle this automatically

**File 2**: `frontend/src/contexts/AuthContext.tsx`

**Changes**:
1. **Use Centralized API Instance**: Import the api instance from services/api.ts at the top
   - Add: `import api from '../services/api';`
   - Remove the local `API_URL` constant and direct axios usage

2. **Update Login Function**: Replace the direct axios.post call with api.post
   - Change line 38 from `await axios.post(\`${API_URL}/auth/login\`, ...)` to `await api.post('/auth/login', ...)`
   - This ensures login requests use the same axios instance with all interceptors

3. **Update Register Function**: Replace the direct axios.post call with api.post
   - Change line 54 from `await axios.post(\`${API_URL}/auth/register\`, ...)` to `await api.post('/auth/register', ...)`

4. **Remove Manual Axios Header Setting**: Remove lines that manually set axios.defaults.headers
   - Delete line 30: `axios.defaults.headers.common['Authorization'] = \`Bearer ${storedToken}\`;`
   - Delete line 51: `axios.defaults.headers.common['Authorization'] = \`Bearer ${newToken}\`;`
   - Delete line 71: `delete axios.defaults.headers.common['Authorization'];`
   - The api.ts interceptor will handle this automatically

**File 3**: `backend/src/db/migrate.ts`

**Changes**:
1. **Add Admin User Creation After Migrations**: After successful migration execution, automatically create the admin user
   - Import create-admin logic or execute it directly
   - Add after line where migrations complete successfully
   - Use the same logic from create-admin.ts: hash password, insert/update user with ON CONFLICT

**File 4**: `aws/setup-cloudfront.sh` or deployment configuration

**Changes**:
1. **Set VITE_API_URL Environment Variable**: Ensure the CloudFront deployment sets the correct API endpoint
   - Add environment variable: `VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev`
   - This may need to be set in the build process or CloudFront configuration
   - Verify the frontend build includes this value

**File 5**: `backend/package.json` (optional enhancement)

**Changes**:
1. **Add Post-Migration Hook**: Add a script that runs after migrations to ensure admin user exists
   - Add script: `"postmigrate": "ts-node src/db/create-admin.ts"`
   - This ensures admin user is created whenever migrations run

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate the admin login flow and inspect localStorage keys, axios headers, and database state. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **localStorage Key Mismatch Test**: Login as admin, inspect localStorage, verify key is `auth_token`, then call api.getAdminShows() and inspect the token retrieval - expect it to read from wrong key `token` (will fail on unfixed code)
2. **Axios Instance Test**: Mock axios.post and api.post, login as admin, verify which instance was used - expect separate instance without interceptors (will fail on unfixed code)
3. **Authorization Header Test**: Login as admin, make authenticated request, inspect request headers - expect Authorization header to be missing or null (will fail on unfixed code)
4. **Admin User Existence Test**: Query database for admin@resistanceradio.org before any manual creation - expect user not found (will fail on unfixed code)
5. **Environment Variable Test**: Check VITE_API_URL in deployed frontend - expect it to be undefined or incorrect (may fail on unfixed code)

**Expected Counterexamples**:
- Token stored with key `auth_token` but retrieved with key `token` returns null
- Login uses axios.post while admin APIs use api instance
- Authorization header is `Bearer null` or missing entirely
- Database query for admin user returns empty result
- API requests go to wrong endpoint or fail with CORS errors

Possible causes: localStorage key inconsistency, separate axios instances, missing interceptor, admin user not seeded, environment variable not set

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := authenticateAdmin_fixed(input)
  ASSERT expectedBehavior(result)
END FOR

FUNCTION expectedBehavior(result)
  RETURN result.tokenStoredWithCorrectKey
         AND result.authorizationHeaderPresent
         AND result.adminUserExists
         AND result.apiUrlCorrect
         AND result.requestSuccessful
END FUNCTION
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT authenticateOriginal(input) = authenticateFixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for logout, registration, 401 handling, and other auth operations, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Logout Preservation**: Observe that logout clears localStorage and headers on unfixed code, then write test to verify this continues after fix
2. **Registration Preservation**: Observe that registration auto-logs in user on unfixed code, then write test to verify this continues after fix
3. **401 Handling Preservation**: Observe that 401 responses clear auth and redirect on unfixed code, then write test to verify this continues after fix
4. **Token Validation Preservation**: Observe that JWT validation checks signature and expiration on unfixed code, then write test to verify this continues after fix
5. **Password Hashing Preservation**: Observe that passwords are hashed with bcrypt on unfixed code, then write test to verify this continues after fix
6. **CORS Preservation**: Observe that CORS allows credentials from allowed origins on unfixed code, then write test to verify this continues after fix
7. **Rate Limiting Preservation**: Observe that rate limits are enforced on unfixed code, then write test to verify this continues after fix

### Unit Tests

- Test localStorage key consistency between AuthContext and api.ts
- Test axios interceptor adds Authorization header correctly
- Test 401 interceptor clears correct localStorage key
- Test admin user creation during migration
- Test environment variable configuration in build process
- Test that manual Authorization headers are removed from admin API functions

### Property-Based Tests

- Generate random valid/invalid credentials and verify authentication behavior is consistent
- Generate random token values and verify they are stored and retrieved with the same key
- Generate random API requests and verify Authorization headers are automatically attached
- Test that all non-admin authentication flows produce identical results before and after fix

### Integration Tests

- Test full admin login flow from form submission to dashboard access
- Test that authenticated admin requests successfully reach backend endpoints
- Test that logout properly clears all authentication state
- Test that 401 responses trigger proper cleanup and redirect
- Test that admin user exists in database after deployment
- Test that frontend can communicate with Lambda API Gateway endpoint
