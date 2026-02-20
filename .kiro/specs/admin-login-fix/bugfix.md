# Bugfix Requirements Document

## Introduction

The admin portal login functionality is currently non-functional, preventing authorized users from accessing the content management system. Users cannot authenticate when attempting to log in at `/admin/login` with valid credentials (admin@resistanceradio.org / admin123). This blocks access to all admin features including content management for shows, episodes, articles, events, and resources.

The bug affects the complete authentication flow from frontend login form submission through backend validation to token storage and subsequent authenticated requests. Multiple issues have been identified including token storage key mismatches, inconsistent API client usage, and potential missing admin user in the database.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user submits the login form with valid credentials THEN the AuthContext stores the token with key `auth_token` in localStorage

1.2 WHEN the api.ts service attempts to retrieve the authentication token THEN it reads from localStorage key `token` instead of `auth_token`

1.3 WHEN the AuthContext makes login requests THEN it uses a direct axios instance with API_URL from environment variables

1.4 WHEN admin API functions in api.ts make authenticated requests THEN they use a different axios instance (api) with different base URL configuration

1.5 WHEN the Lambda backend starts THEN it may not have the admin user (admin@resistanceradio.org) in the database if create-admin.ts was not executed

1.6 WHEN authenticated requests are made after login THEN the Authorization header is not included because the token cannot be retrieved from localStorage

1.7 WHEN the frontend is deployed to CloudFront THEN the VITE_API_URL environment variable may not be properly configured to point to the Lambda API Gateway endpoint

### Expected Behavior (Correct)

2.1 WHEN a user submits the login form with valid credentials THEN the AuthContext SHALL store the token with a consistent key that matches what api.ts expects

2.2 WHEN the api.ts service attempts to retrieve the authentication token THEN it SHALL read from the same localStorage key used by AuthContext

2.3 WHEN the AuthContext makes login requests THEN it SHALL use the same axios instance and configuration as api.ts for consistency

2.4 WHEN admin API functions in api.ts make authenticated requests THEN they SHALL use the centralized axios instance with proper Authorization headers

2.5 WHEN the Lambda backend is deployed THEN it SHALL have the admin user (admin@resistanceradio.org) pre-created in the database

2.6 WHEN authenticated requests are made after login THEN the Authorization header SHALL be automatically included via axios interceptors

2.7 WHEN the frontend is deployed to CloudFront THEN the VITE_API_URL environment variable SHALL be set to the Lambda API Gateway endpoint (https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user logs out THEN the system SHALL CONTINUE TO clear all authentication data from localStorage and axios headers

3.2 WHEN a user registers a new account THEN the system SHALL CONTINUE TO automatically log them in after successful registration

3.3 WHEN an authenticated request receives a 401 response THEN the system SHALL CONTINUE TO clear auth data and redirect to login

3.4 WHEN the backend validates JWT tokens THEN it SHALL CONTINUE TO verify token signature, expiration, and user existence

3.5 WHEN password hashing occurs during user creation THEN the system SHALL CONTINUE TO use bcrypt with 10 salt rounds

3.6 WHEN CORS requests are made from allowed origins THEN the backend SHALL CONTINUE TO accept them with credentials enabled

3.7 WHEN rate limiting is applied to auth endpoints THEN the system SHALL CONTINUE TO enforce the configured limits
