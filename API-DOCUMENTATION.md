# API Documentation

## Overview

The Resistance Radio Station API provides endpoints for managing radio shows, episodes, articles, events, resources, and user submissions. All endpoints return JSON responses.

**Base URL**: `https://api.resistanceradio.org` (production) or `http://localhost:3000` (development)

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Getting a Token

**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### Using the Token

Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

### Token Expiration

Tokens expire after 24 hours. You'll receive a 401 error when the token expires.

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Submissions: 3 requests per hour

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

## Endpoints

### Authentication

#### Register User
**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "User Name"
}
```

Response: `201 Created`
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### Login
**POST** `/api/auth/login`

See [Authentication](#authentication) section above.

#### Get Current User
**GET** `/api/auth/me`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### Shows

#### List Shows
**GET** `/api/shows`

Query Parameters:
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "shows": [
    {
      "id": 1,
      "title": "The Resistance Hour",
      "slug": "resistance-hour",
      "description": "Weekly news and analysis",
      "category": "News",
      "host": "John Doe",
      "schedule": "Mondays 8PM",
      "image_url": "https://cdn.example.com/show.jpg",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

#### Get Show by Slug
**GET** `/api/shows/:slug`

Response:
```json
{
  "show": {
    "id": 1,
    "title": "The Resistance Hour",
    "slug": "resistance-hour",
    "description": "Weekly news and analysis",
    "category": "News",
    "host": "John Doe",
    "schedule": "Mondays 8PM",
    "image_url": "https://cdn.example.com/show.jpg",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Show (Admin)
**POST** `/api/admin/shows`

Headers: `Authorization: Bearer <admin_token>`

Request:
```json
{
  "title": "New Show",
  "description": "Show description",
  "category": "News",
  "host": "Host Name",
  "schedule": "Tuesdays 7PM",
  "image_url": "https://cdn.example.com/image.jpg"
}
```

Response: `201 Created`

#### Update Show (Admin)
**PUT** `/api/admin/shows/:id`

Headers: `Authorization: Bearer <admin_token>`

Request: Same as Create Show

Response: `200 OK`

#### Delete Show (Admin)
**DELETE** `/api/admin/shows/:id`

Headers: `Authorization: Bearer <admin_token>`

Response: `204 No Content`

### Episodes

#### List Episodes
**GET** `/api/episodes`

Query Parameters:
- `show_id` (optional): Filter by show
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "episodes": [
    {
      "id": 1,
      "title": "Episode 1: Introduction",
      "slug": "episode-1-introduction",
      "description": "Our first episode",
      "audio_url": "https://cdn.example.com/episode1.mp3",
      "duration": 3600,
      "published_at": "2024-01-01T00:00:00Z",
      "show_id": 1,
      "show_title": "The Resistance Hour",
      "show_slug": "resistance-hour"
    }
  ],
  "total": 50
}
```

#### Get Episode by Slug
**GET** `/api/episodes/:slug`

Response:
```json
{
  "episode": {
    "id": 1,
    "title": "Episode 1: Introduction",
    "slug": "episode-1-introduction",
    "description": "Our first episode",
    "audio_url": "https://cdn.example.com/episode1.mp3",
    "duration": 3600,
    "published_at": "2024-01-01T00:00:00Z",
    "show_id": 1,
    "show_title": "The Resistance Hour"
  }
}
```

#### Create Episode (Admin)
**POST** `/api/admin/episodes`

Headers: `Authorization: Bearer <admin_token>`

Request:
```json
{
  "title": "New Episode",
  "description": "Episode description",
  "show_id": 1,
  "audio_url": "https://cdn.example.com/audio.mp3",
  "duration": 3600,
  "published_at": "2024-01-01T00:00:00Z"
}
```

Response: `201 Created`

### Articles

#### List Articles
**GET** `/api/articles`

Query Parameters:
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Breaking News",
      "slug": "breaking-news",
      "summary": "Article summary",
      "content": "Full article content...",
      "category": "News",
      "author": "Jane Doe",
      "published_at": "2024-01-01T00:00:00Z",
      "image_url": "https://cdn.example.com/article.jpg"
    }
  ],
  "total": 100
}
```

#### Get Article by Slug
**GET** `/api/articles/:slug`

Response:
```json
{
  "article": {
    "id": 1,
    "title": "Breaking News",
    "slug": "breaking-news",
    "summary": "Article summary",
    "content": "Full article content...",
    "category": "News",
    "author": "Jane Doe",
    "published_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z",
    "image_url": "https://cdn.example.com/article.jpg"
  }
}
```

#### Create Article (Admin)
**POST** `/api/admin/articles`

Headers: `Authorization: Bearer <admin_token>`

Request:
```json
{
  "title": "New Article",
  "summary": "Brief summary",
  "content": "Full content...",
  "category": "News",
  "author": "Author Name",
  "image_url": "https://cdn.example.com/image.jpg",
  "published_at": "2024-01-01T00:00:00Z"
}
```

Response: `201 Created`

### Events

#### List Events
**GET** `/api/events`

Query Parameters:
- `type` (optional): Filter by event type
- `upcoming` (optional): Only future events (true/false)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "events": [
    {
      "id": 1,
      "title": "Community Rally",
      "description": "Join us for a rally",
      "type": "Rally",
      "date": "2024-06-01T18:00:00Z",
      "location": "City Hall",
      "registration_url": "https://example.com/register"
    }
  ],
  "total": 25
}
```

#### Get Event by ID
**GET** `/api/events/:id`

Response:
```json
{
  "event": {
    "id": 1,
    "title": "Community Rally",
    "description": "Join us for a rally",
    "type": "Rally",
    "date": "2024-06-01T18:00:00Z",
    "location": "City Hall",
    "registration_url": "https://example.com/register"
  }
}
```

### Resources

#### List Resources
**GET** `/api/resources`

Query Parameters:
- `category` (optional): Filter by category
- `type` (optional): Filter by resource type
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "resources": [
    {
      "id": 1,
      "title": "Activist Toolkit",
      "description": "Essential resources for activists",
      "category": "Guides",
      "type": "Document",
      "file_url": "https://cdn.example.com/toolkit.pdf",
      "external_url": null
    }
  ],
  "total": 30
}
```

### Submissions

#### Submit Story
**POST** `/api/submissions/story`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "story_title": "My Story",
  "story_content": "Full story content...",
  "consent": true
}
```

Response: `201 Created`
```json
{
  "message": "Story submitted successfully",
  "submission_id": "sub_123"
}
```

#### Submit Volunteer Application
**POST** `/api/submissions/volunteer`

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "skills": "Writing, Research",
  "availability": "Weekends",
  "motivation": "I want to help..."
}
```

Response: `201 Created`

#### Submit Contributor Pitch
**POST** `/api/submissions/contributor`

Request:
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "pitch_title": "Show Idea",
  "pitch_description": "Description of the show...",
  "experience": "5 years in radio",
  "samples": "https://example.com/samples"
}
```

Response: `201 Created`

#### Contact Form
**POST** `/api/submissions/contact`

Request:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "subject": "General Inquiry",
  "message": "Your message here..."
}
```

Response: `201 Created`

#### Newsletter Subscription
**POST** `/api/submissions/newsletter`

Request:
```json
{
  "email": "user@example.com"
}
```

Response: `201 Created`
```json
{
  "message": "Please check your email to confirm subscription"
}
```

### Live Broadcasting

#### Get Live Status
**GET** `/api/live/status`

Response:
```json
{
  "is_live": true,
  "broadcast": {
    "title": "Live Show",
    "stream_url": "https://stream.example.com/live.m3u8",
    "started_at": "2024-01-01T20:00:00Z"
  }
}
```

### File Upload

#### Upload Audio
**POST** `/api/upload/audio`

Headers: 
- `Authorization: Bearer <admin_token>`
- `Content-Type: multipart/form-data`

Request:
```
file: <audio_file.mp3>
```

Response:
```json
{
  "url": "https://cdn.example.com/audio/file.mp3",
  "cdn_url": "https://cdn.example.com/audio/file.mp3",
  "size": 5242880,
  "duration": 3600
}
```

#### Upload Image
**POST** `/api/upload/image`

Headers: 
- `Authorization: Bearer <admin_token>`
- `Content-Type: multipart/form-data`

Request:
```
file: <image.jpg>
```

Response:
```json
{
  "url": "https://cdn.example.com/images/file.jpg",
  "cdn_url": "https://cdn.example.com/images/file.jpg",
  "size": 1048576
}
```

### Sitemap

#### Get Sitemap
**GET** `/sitemap.xml`

Response: XML sitemap for SEO

## Webhooks

Webhooks are not currently implemented but planned for future releases.

## SDKs and Libraries

Official SDKs:
- JavaScript/TypeScript: Coming soon
- Python: Coming soon
- Ruby: Coming soon

## Support

For API support:
- Email: api@resistanceradio.org
- Documentation: https://docs.resistanceradio.org
- GitHub Issues: https://github.com/resistanceradio/api/issues

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- Content management endpoints
- Submission endpoints
- File upload endpoints

