# Backend API Summary

## Overview

The Resistance Radio Station backend API is built with Express.js, TypeScript, and PostgreSQL. It provides comprehensive endpoints for content management, user authentication, form submissions, and admin operations.

## Completed Features

### ✅ 1. Database Schema and Migrations
- PostgreSQL database with 9 tables
- Tables: users, shows, episodes, articles, events, resources, submissions, newsletter_subscribers, live_broadcasts
- Proper indexes and foreign keys
- Migration scripts and seed data

### ✅ 2. Authentication and Authorization
- JWT-based authentication
- Role-based access control (user, content_manager, administrator)
- 24-hour session expiration
- Password hashing with bcrypt
- Protected routes with middleware

### ✅ 3. Public Content Endpoints
- GET /api/shows - List all shows with filtering
- GET /api/shows/:slug - Get show details
- GET /api/episodes - List episodes with pagination
- GET /api/episodes/:slug - Get episode details
- GET /api/articles - List articles with filtering
- GET /api/articles/:slug - Get article details
- GET /api/events - List events
- GET /api/events/:slug - Get event details
- GET /api/resources - List resources
- GET /api/live - Get live broadcast status

### ✅ 4. Admin Content Management Endpoints
- POST/PUT/DELETE /api/admin/shows - Manage shows
- Admin routes protected with authentication and role checks
- Input validation with express-validator
- Duplicate checking and error handling

### ✅ 5. Form Submission Endpoints
- POST /api/submissions/story - Submit stories
- POST /api/submissions/volunteer - Volunteer applications
- POST /api/submissions/contributor - Contributor pitches
- POST /api/submissions/contact - Contact form
- POST /api/submissions/newsletter - Newsletter subscription
- Rate limiting: 5 submissions per hour per IP
- Email validation and sanitization

### ✅ 6. Submission Management Endpoints
- GET /api/admin/submissions - List submissions with filtering
- GET /api/admin/submissions/:id - Get submission details
- PUT /api/admin/submissions/:id/approve - Approve submission
- PUT /api/admin/submissions/:id/reject - Reject submission
- DELETE /api/admin/submissions/:id - Delete submission
- Protected with content_manager/administrator roles

### ✅ 7. Security Middleware and Headers
- HTTPS enforcement (production)
- Helmet for security headers
- Custom CSP, X-Frame-Options, X-Content-Type-Options
- Input sanitization (XSS prevention)
- Rate limiting (multiple tiers)
- CSRF protection
- CORS configuration

### ✅ 8. Error Handling and Logging
- Winston-based structured logging
- Multiple log levels (error, warn, info, http, debug)
- File logging (error.log, combined.log)
- HTTP request logging with Morgan
- Custom error classes for different HTTP status codes
- Centralized error handler middleware
- Production-safe error responses
- Unhandled rejection and uncaught exception handlers

## API Endpoints

### Public Endpoints

#### Content
- `GET /api/shows` - List shows
- `GET /api/shows/:slug` - Get show details
- `GET /api/episodes` - List episodes
- `GET /api/episodes/:slug` - Get episode details
- `GET /api/articles` - List articles
- `GET /api/articles/:slug` - Get article details
- `GET /api/events` - List events
- `GET /api/events/:slug` - Get event details
- `GET /api/resources` - List resources
- `GET /api/live` - Get live broadcast status

#### Forms
- `POST /api/submissions/story` - Submit story
- `POST /api/submissions/volunteer` - Volunteer application
- `POST /api/submissions/contributor` - Contributor pitch
- `POST /api/submissions/contact` - Contact form
- `POST /api/submissions/newsletter` - Newsletter subscription

#### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Utility
- `GET /health` - Health check
- `GET /api/csrf-token` - Get CSRF token

### Admin Endpoints (Protected)

#### Content Management
- `POST /api/admin/shows` - Create show
- `PUT /api/admin/shows/:id` - Update show
- `DELETE /api/admin/shows/:id` - Delete show

#### Submission Management
- `GET /api/admin/submissions` - List submissions
- `GET /api/admin/submissions/:id` - Get submission
- `PUT /api/admin/submissions/:id/approve` - Approve submission
- `PUT /api/admin/submissions/:id/reject` - Reject submission
- `DELETE /api/admin/submissions/:id` - Delete submission

## Security Features

1. **HTTPS Enforcement**: Redirects HTTP to HTTPS in production
2. **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options, XSS Protection
3. **Input Sanitization**: Strips HTML tags to prevent XSS
4. **Rate Limiting**: 
   - General: 100 requests per 15 minutes
   - Auth: 5 attempts per 15 minutes
   - Forms: 5 submissions per hour
5. **CSRF Protection**: Token-based protection
6. **JWT Authentication**: Secure token-based auth with 24-hour expiration
7. **Role-Based Access Control**: User, content_manager, administrator roles

## Logging

- **Console**: Colored output for development
- **Files**: 
  - `logs/error.log` - Error-level logs only
  - `logs/combined.log` - All logs
- **HTTP Requests**: Morgan middleware logs all HTTP requests
- **Log Levels**: error, warn, info, http, debug

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your_secret_key

# AWS (optional)
AWS_REGION=us-east-1
S3_MEDIA_BUCKET=bucket-name
```

## Database Connection

- **Host**: resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com
- **Port**: 5432
- **Database**: resistance_radio_dev
- **Connection pooling**: Max 20 connections

## Next Steps

1. ✅ All backend core features implemented
2. ⏳ Frontend admin dashboard (Task 23)
3. ⏳ Frontend admin content management (Task 24)
4. ⏳ Frontend admin submission review (Task 25)
5. ⏳ Media storage integration (Task 29)
6. ⏳ Email service integration (Task 30)

## Testing

To test the API:

1. Start the server: `npm run dev`
2. Use Postman, Insomnia, or curl to test endpoints
3. Check logs in `logs/` directory
4. Monitor console output for HTTP requests

## Notes

- All endpoints use JSON for request/response
- Authentication uses Bearer tokens in Authorization header
- Rate limiting headers included in responses
- Error responses follow consistent format:
  ```json
  {
    "error": {
      "message": "Error message",
      "code": "ERROR_CODE"
    }
  }
  ```
