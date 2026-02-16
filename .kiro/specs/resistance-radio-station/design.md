# Design Document: Resistance Radio Station Website

## Overview

The Resistance Radio Station website is a full-stack web application built on React/TypeScript (frontend) and Node.js/Express/PostgreSQL (backend). The platform extends the existing advocacy platform codebase to create a comprehensive radio broadcasting website with live streaming, on-demand content, content management, and community engagement features.

The design follows a modern headless CMS architecture where content is managed through a custom admin interface and delivered via RESTful APIs. The frontend is a single-page application (SPA) that provides a seamless user experience with client-side routing, while the backend handles authentication, content management, media storage, and data persistence.

### Key Design Principles

1. **Content-First Architecture**: All content (shows, episodes, articles, events) is stored in PostgreSQL and served via APIs, enabling flexibility and future expansion
2. **Progressive Enhancement**: Core content is accessible even without JavaScript, with enhanced interactivity for modern browsers
3. **Mobile-First Responsive Design**: All interfaces are designed for mobile devices first, then enhanced for larger screens
4. **Security by Default**: All user inputs are sanitized, all endpoints are rate-limited, and all sensitive data is encrypted
5. **Performance Optimization**: Lazy loading, code splitting, image optimization, and caching strategies ensure fast load times
6. **Accessibility Compliance**: WCAG 2.1 AA standards are met through semantic HTML, ARIA labels, keyboard navigation, and color contrast

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Public Site │  │  Audio Player│  │  Admin Panel │      │
│  │  (Pages)     │  │  Component   │  │  (CMS)       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    API Client (Axios)                        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS/REST
┌────────────────────────────┴────────────────────────────────┐
│                    Backend (Express/Node.js)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth        │  │  Content     │  │  Media       │      │
│  │  Middleware  │  │  Routes      │  │  Upload      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    Database Layer (pg)                       │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  users       │  │  shows       │  │  episodes    │      │
│  │  articles    │  │  events      │  │  resources   │      │
│  │  submissions │  │  subscribers │  │  ...         │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  CDN/Storage │  │  Email       │  │  Analytics   │
│  (S3/R2)     │  │  (SendGrid)  │  │  (Plausible) │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- React Router v6 for client-side routing
- Axios for API communication
- react-hls-player for HLS audio streaming
- Vite for build tooling and development server

**Backend:**
- Node.js 18+ with Express
- TypeScript for type safety
- PostgreSQL 14+ for data persistence
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- express-validator for input validation
- helmet for security headers
- express-rate-limit for rate limiting

**Infrastructure:**
- Cloud storage (AWS S3 or Cloudflare R2) for audio files and media
- CDN for static asset delivery
- Email service (SendGrid or similar) for transactional emails
- Analytics service (Plausible or Google Analytics)

## Components and Interfaces

### Frontend Components

#### 1. Layout Components

**Header Component**
- Displays logo and site tagline
- Renders navigation menu (desktop: horizontal, mobile: hamburger)
- Shows "Listen Live" indicator when broadcast is active
- Provides search functionality (future enhancement)

```typescript
interface HeaderProps {
  isLiveActive: boolean;
  currentShow?: Show;
}

interface NavigationItem {
  label: string;
  path: string;
  children?: NavigationItem[];
}
```

**Footer Component**
- Displays footer navigation links
- Shows social media icons with links
- Renders newsletter signup form
- Displays copyright and legal links

```typescript
interface FooterProps {
  socialLinks: SocialLink[];
  legalLinks: LegalLink[];
}

interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube';
  url: string;
}
```

**AudioPlayer Component**
- Persistent audio player that remains active across page navigation
- Supports both live streaming (HLS) and on-demand playback (MP3)
- Displays current track information (show name, episode title)
- Provides playback controls (play, pause, volume, seek)
- Shows loading states and error messages

```typescript
interface AudioPlayerProps {
  streamUrl?: string;
  episodeUrl?: string;
  isLive: boolean;
  currentShow?: Show;
  currentEpisode?: Episode;
}

interface AudioPlayerState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error?: string;
}
```

#### 2. Page Components

**HomePage**
- Hero section with tagline and CTA buttons
- Featured shows carousel/grid
- Upcoming broadcasts schedule
- Mission statement section
- Recent articles preview

**ShowsPage**
- Grid of show cards with filtering by category
- Each card displays show image, title, host, description, broadcast time
- Click navigates to show detail page

**ShowDetailPage**
- Full show information
- List of past episodes with playback buttons
- Host bio and photo
- Related shows

**ListenPage**
- Embedded audio player (prominent)
- Live broadcast status and schedule
- On-demand library with category filters
- Episode search functionality

**ArticlePage**
- Article content with rich text formatting
- Author information and publication date
- Social sharing buttons
- Related articles section

**EventsPage**
- Upcoming events list with date/time
- Past events archive
- Event detail modal or page
- Calendar view (optional enhancement)

**GetInvolvedPage**
- Story submission form
- Volunteer application form
- Contributor pitch form
- Support/donation information

**ResourcesPage**
- Categorized resource library
- Download buttons for files
- Preview for documents
- Search and filter functionality

**ContactPage**
- General enquiries form
- Press contact information
- Partnerships contact information
- Office location/hours (if applicable)

#### 3. Admin Components

**AdminDashboard**
- Overview statistics (total shows, episodes, articles, submissions)
- Recent activity feed
- Quick actions (create show, upload episode, publish article)

**ContentEditor**
- Rich text editor for articles
- Form fields for metadata (title, author, category, tags)
- Image upload for featured images
- Preview functionality
- Save as draft or publish

**ShowManager**
- List of all shows with edit/delete actions
- Create new show form
- Episode management for each show
- Schedule management

**EpisodeUploader**
- File upload interface for audio files
- Metadata form (title, description, show, date, duration)
- Automatic duration detection
- Transcoding status (if applicable)

**SubmissionReviewer**
- List of pending submissions (stories, volunteer applications, contributor pitches)
- Approve/reject actions
- Email response functionality

### Backend API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

#### Public Content Endpoints

```
GET    /api/shows
GET    /api/shows/:id
GET    /api/shows/:id/episodes
GET    /api/episodes
GET    /api/episodes/:id
GET    /api/articles
GET    /api/articles/:slug
GET    /api/events
GET    /api/events/:id
GET    /api/resources
GET    /api/resources/:id
GET    /api/live-status
```

#### Admin Content Management Endpoints

```
POST   /api/admin/shows
PUT    /api/admin/shows/:id
DELETE /api/admin/shows/:id
POST   /api/admin/episodes
PUT    /api/admin/episodes/:id
DELETE /api/admin/episodes/:id
POST   /api/admin/articles
PUT    /api/admin/articles/:id
DELETE /api/admin/articles/:id
POST   /api/admin/events
PUT    /api/admin/events/:id
DELETE /api/admin/events/:id
POST   /api/admin/resources
PUT    /api/admin/resources/:id
DELETE /api/admin/resources/:id
```

#### Form Submission Endpoints

```
POST   /api/submissions/story
POST   /api/submissions/volunteer
POST   /api/submissions/contributor
POST   /api/submissions/contact
POST   /api/newsletter/subscribe
POST   /api/newsletter/confirm
```

#### Media Upload Endpoints

```
POST   /api/media/upload
GET    /api/media/:id
DELETE /api/media/:id
```

#### Admin Submission Management Endpoints

```
GET    /api/admin/submissions
GET    /api/admin/submissions/:id
PUT    /api/admin/submissions/:id/approve
PUT    /api/admin/submissions/:id/reject
```

## Data Models

### Database Schema

#### users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'content_manager',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### shows Table
```sql
CREATE TABLE shows (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  host_name VARCHAR(255) NOT NULL,
  host_bio TEXT,
  host_image_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  category VARCHAR(100),
  broadcast_schedule VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shows_slug ON shows(slug);
CREATE INDEX idx_shows_category ON shows(category);
CREATE INDEX idx_shows_active ON shows(is_active);
```

#### episodes Table
```sql
CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  audio_url VARCHAR(500) NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  published_at TIMESTAMP NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_episodes_show_id ON episodes(show_id);
CREATE INDEX idx_episodes_slug ON episodes(slug);
CREATE INDEX idx_episodes_published_at ON episodes(published_at DESC);
CREATE INDEX idx_episodes_category ON episodes(category);
```

#### articles Table
```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_name VARCHAR(255) NOT NULL,
  author_bio TEXT,
  featured_image_url VARCHAR(500),
  category VARCHAR(100),
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);
```

#### events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location VARCHAR(255),
  is_virtual BOOLEAN DEFAULT false,
  registration_url VARCHAR(500),
  max_participants INTEGER,
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(event_type);
```

#### resources Table
```sql
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  resource_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  file_url VARCHAR(500),
  file_size_bytes BIGINT,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_slug ON resources(slug);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_type ON resources(resource_type);
```

#### submissions Table
```sql
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  submission_type VARCHAR(50) NOT NULL,
  submitter_name VARCHAR(255) NOT NULL,
  submitter_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_type ON submissions(submission_type);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
```

#### newsletter_subscribers Table
```sql
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  confirmation_token VARCHAR(255),
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_subscribers_status ON newsletter_subscribers(status);
```

#### live_broadcasts Table
```sql
CREATE TABLE live_broadcasts (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id),
  stream_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  listener_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_broadcasts_active ON live_broadcasts(is_active);
CREATE INDEX idx_broadcasts_show_id ON live_broadcasts(show_id);
```

### TypeScript Interfaces

```typescript
// Core domain models
interface Show {
  id: number;
  title: string;
  slug: string;
  description: string;
  hostName: string;
  hostBio?: string;
  hostImageUrl?: string;
  coverImageUrl?: string;
  category?: string;
  broadcastSchedule?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Episode {
  id: number;
  showId: number;
  title: string;
  slug: string;
  description?: string;
  audioUrl: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  publishedAt: Date;
  category?: string;
  tags?: string[];
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorName: string;
  authorBio?: string;
  featuredImageUrl?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  isVirtual: boolean;
  registrationUrl?: string;
  maxParticipants?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface Resource {
  id: number;
  title: string;
  slug: string;
  description?: string;
  resourceType: string;
  category?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  downloadCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Submission {
  id: number;
  submissionType: 'story' | 'volunteer' | 'contributor' | 'contact';
  submitterName: string;
  submitterEmail: string;
  subject?: string;
  content: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: number;
  reviewedAt?: Date;
  createdAt: Date;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'administrator' | 'content_manager';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

interface LiveBroadcast {
  id: number;
  showId?: number;
  streamUrl: string;
  isActive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  listenerCount: number;
  createdAt: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified several areas where properties can be consolidated:

**Consolidation Opportunities:**
1. Multiple properties about "rendering with required fields" (show cards, episodes, articles, events) can be unified into a single property about content rendering completeness
2. Form validation properties (9.6, 11.4, 13.2-13.6, 14.5) can be consolidated into a general form validation property
3. Navigation properties (1.1, 1.2, 1.5, 12.5) about consistent UI elements can be combined
4. Responsive design properties (15.1-15.6) can be consolidated into fewer comprehensive properties
5. Metadata properties (17.1-17.3, 20.4-20.5) about SEO and social sharing can be combined
6. Accessibility properties (18.1-18.6) can be consolidated into fewer comprehensive properties

**Properties to Keep Separate:**
- Authentication and authorization (14.1-14.3) - these test different security aspects
- Content moderation workflow (25.1-25.5) - each step is distinct
- Audio player behavior (5.2, 5.4, 5.5) - different player states
- Sorting and filtering (7.5, 8.5, 6.3) - different data types

### Correctness Properties

Property 1: Navigation consistency across pages
*For any* page in the system, the navigation menu should contain all required links (Home, About, Shows, Listen, News & Insights, Events, Get Involved, Resources, Contact) and the footer should contain all legal/policy links
**Validates: Requirements 1.1, 1.2, 1.5, 12.5**

Property 2: Content rendering completeness
*For any* content item (show, episode, article, event, resource), when rendered in a list or card view, all required fields for that content type should be present and non-empty
**Validates: Requirements 2.3, 2.4, 4.2, 4.4, 6.5, 7.1, 7.3, 8.1, 8.3**

Property 3: Form validation enforcement
*For any* form submission with missing required fields, the system should reject the submission and display field-specific validation errors
**Validates: Requirements 9.6, 11.4, 13.2, 13.4, 13.5, 13.6, 14.5, 19.2**

Property 4: Audio player state persistence
*For any* navigation action while audio is playing, the audio player state (playing status, current time, volume) should be preserved and playback should continue uninterrupted
**Validates: Requirements 5.4**

Property 5: Content filtering accuracy
*For any* category filter applied to a content collection (episodes, articles, events), all returned items should belong to the selected category and no items from other categories should be included
**Validates: Requirements 6.3**

Property 6: Chronological ordering correctness
*For any* time-ordered content list (articles, events, broadcasts), items should be sorted by their timestamp in the specified order (descending for articles, ascending for upcoming events)
**Validates: Requirements 7.5, 8.5**

Property 7: Authentication requirement enforcement
*For any* admin endpoint access attempt without valid authentication, the system should deny access and return an authentication error
**Validates: Requirements 14.1, 14.3**

Property 8: Role-based authorization
*For any* authenticated user, the system should grant access only to features and endpoints permitted for their role (Content Manager or Administrator)
**Validates: Requirements 14.2**

Property 9: Password security
*For any* password stored in the database, the stored value should be a bcrypt hash and not the plaintext password
**Validates: Requirements 14.6**

Property 10: Session expiration
*For any* user session inactive for 24 hours, subsequent requests should require re-authentication
**Validates: Requirements 14.4**

Property 11: Responsive layout adaptation
*For any* viewport width below 768px, the system should display mobile-optimized layouts including hamburger navigation, stacked content, and appropriately sized interactive elements (minimum 44x44 pixels)
**Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6**

Property 12: Image optimization
*For any* image rendered on the site, the system should provide responsive image sources (srcset) appropriate for different device sizes
**Validates: Requirements 16.2**

Property 13: SEO metadata completeness
*For any* public page, the system should include meta title, meta description, and appropriate Schema.org structured data for the content type
**Validates: Requirements 17.1, 17.2, 17.3**

Property 14: URL structure consistency
*For any* content detail page (show, article, event), the URL should follow the pattern /{content-type}/{slug} where slug is a URL-safe version of the title
**Validates: Requirements 17.6**

Property 15: Semantic HTML hierarchy
*For any* page, the heading structure should follow proper hierarchy (single h1, h2 under h1, h3 under h2) without skipping levels
**Validates: Requirements 17.5**

Property 16: Keyboard accessibility
*For any* interactive element (button, link, form input), the element should be keyboard-accessible with visible focus indicators
**Validates: Requirements 18.1, 18.5**

Property 17: Screen reader accessibility
*For any* non-text content (images, icons, audio player), the system should provide appropriate ARIA labels or alt text for screen readers
**Validates: Requirements 18.2, 18.4**

Property 18: Color contrast compliance
*For any* text element, the color contrast ratio between text and background should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
**Validates: Requirements 18.3**

Property 19: Newsletter subscription workflow
*For any* valid email submitted to the newsletter form, the system should save the subscription with "pending" status, send a confirmation email, and activate the subscription only after the user clicks the confirmation link
**Validates: Requirements 19.2, 19.3, 19.4, 19.5**

Property 20: Social sharing metadata
*For any* shareable content page (article, episode), the system should include Open Graph and Twitter Card meta tags with title, description, and image
**Validates: Requirements 20.4, 20.5**

Property 21: Input sanitization
*For any* user-submitted data, the system should sanitize inputs to remove or escape potentially malicious content (XSS, SQL injection attempts)
**Validates: Requirements 23.2**

Property 22: HTTPS enforcement
*For any* request to the application, the system should enforce HTTPS and redirect HTTP requests to HTTPS
**Validates: Requirements 23.1**

Property 23: Security headers presence
*For any* HTTP response, the system should include security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security)
**Validates: Requirements 23.6**

Property 24: Rate limiting enforcement
*For any* form submission endpoint, when requests exceed the rate limit threshold (e.g., 5 requests per minute), the system should reject subsequent requests with a 429 status code
**Validates: Requirements 23.4**

Property 25: CSRF protection
*For any* state-changing request (POST, PUT, DELETE), the system should require a valid CSRF token and reject requests without valid tokens
**Validates: Requirements 23.5**

Property 26: Data encryption at rest
*For any* sensitive user data (email addresses, personal information), the data should be encrypted in the database using AES-256 or equivalent
**Validates: Requirements 23.3**

Property 27: Content moderation workflow
*For any* user submission (story, volunteer application, contributor pitch), the initial status should be "pending", and the submission should not appear on public pages until a content manager changes the status to "approved"
**Validates: Requirements 25.1, 25.5**

Property 28: Submission status transitions
*For any* submission status change (pending → approved or pending → rejected), the system should update the status, record the reviewer and timestamp, and trigger appropriate notifications
**Validates: Requirements 25.3, 25.4**

Property 29: Audio file format validation
*For any* episode upload, the system should accept only valid audio formats (MP3, WAV, AAC) and reject other file types with an appropriate error message
**Validates: Requirements 13.3**

Property 30: Scheduled content publication
*For any* content item with a future publication date, the content should not appear on public pages until the scheduled date/time is reached
**Validates: Requirements 13.8**

## Error Handling

### Error Categories and Handling Strategies

#### 1. Client Errors (4xx)

**400 Bad Request**
- Triggered by: Invalid input data, malformed requests
- Response: JSON error object with field-specific validation messages
- Example: `{ "error": "Validation failed", "fields": { "email": "Invalid email format" } }`

**401 Unauthorized**
- Triggered by: Missing or invalid authentication token
- Response: JSON error with message "Authentication required"
- Frontend action: Redirect to login page

**403 Forbidden**
- Triggered by: Insufficient permissions for requested resource
- Response: JSON error with message "Insufficient permissions"
- Frontend action: Display access denied message

**404 Not Found**
- Triggered by: Requested resource doesn't exist
- Response: Custom 404 page with navigation options
- Logging: Log requested URL for monitoring broken links

**429 Too Many Requests**
- Triggered by: Rate limit exceeded
- Response: JSON error with retry-after header
- Frontend action: Display "Please try again later" message

#### 2. Server Errors (5xx)

**500 Internal Server Error**
- Triggered by: Unhandled exceptions, database errors
- Response: Generic error page (don't expose internal details)
- Logging: Full error stack trace logged to error monitoring service
- Notification: Alert administrators for critical errors

**503 Service Unavailable**
- Triggered by: Database connection failure, external service outage
- Response: Maintenance page with estimated recovery time
- Logging: Log service availability issues

#### 3. Application-Specific Errors

**Audio Streaming Errors**
- Stream not available: Display "Broadcast not currently active" with next broadcast time
- Stream loading failure: Display error with retry button
- Unsupported format: Display message to update browser

**File Upload Errors**
- File too large: Display maximum file size limit
- Invalid format: Display list of accepted formats
- Upload timeout: Display retry option with progress indicator

**Form Submission Errors**
- Network failure: Display "Connection lost" with retry option
- Validation errors: Display inline field-specific errors
- Duplicate submission: Display "Already submitted" message

### Error Logging Strategy

**Log Levels:**
- ERROR: Application errors requiring immediate attention (500 errors, database failures)
- WARN: Recoverable issues (rate limit hits, invalid login attempts)
- INFO: Normal operations (successful logins, content publications)
- DEBUG: Detailed diagnostic information (development only)

**Log Format:**
```typescript
interface LogEntry {
  timestamp: Date;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  context: {
    userId?: number;
    requestId: string;
    endpoint: string;
    method: string;
    statusCode?: number;
  };
  error?: {
    name: string;
    message: string;
    stack: string;
  };
}
```

**Error Monitoring:**
- Integrate with error tracking service (e.g., Sentry, Rollbar)
- Alert administrators for critical errors (500s, database failures)
- Weekly error summary reports
- Track error rates and trends

### Graceful Degradation

**Progressive Enhancement Strategy:**
1. Core content accessible without JavaScript
2. Enhanced interactivity with JavaScript enabled
3. Fallbacks for unsupported features

**Specific Degradation Scenarios:**
- Audio player unavailable: Display download link for episodes
- JavaScript disabled: Show static content with server-side rendering
- Slow connection: Display loading indicators, enable offline mode
- Old browsers: Provide basic functionality with polyfills

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests:**
- Verify specific examples and edge cases
- Test integration points between components
- Validate error conditions and boundary cases
- Test specific user workflows (e.g., login flow, form submission)

**Property-Based Tests:**
- Verify universal properties across all inputs
- Use randomized input generation to discover edge cases
- Test invariants that should hold for all valid data
- Minimum 100 iterations per property test

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Testing Tools and Libraries

**Frontend Testing:**
- Jest: Test runner and assertion library
- React Testing Library: Component testing with user-centric queries
- fast-check: Property-based testing library for TypeScript
- MSW (Mock Service Worker): API mocking for integration tests
- Playwright: End-to-end testing for critical user flows

**Backend Testing:**
- Jest: Test runner and assertion library
- Supertest: HTTP assertion library for API testing
- fast-check: Property-based testing for business logic
- pg-mem: In-memory PostgreSQL for database testing
- Faker: Generate realistic test data

### Property-Based Test Configuration

Each property test must:
1. Run minimum 100 iterations (configured in fast-check)
2. Reference its design document property in a comment
3. Use the tag format: `// Feature: resistance-radio-station, Property {number}: {property_text}`

Example:
```typescript
// Feature: resistance-radio-station, Property 3: Form validation enforcement
test('form validation rejects submissions with missing required fields', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: fc.option(fc.string(), { nil: undefined }),
        email: fc.option(fc.emailAddress(), { nil: undefined }),
        message: fc.option(fc.string(), { nil: undefined })
      }),
      (formData) => {
        const result = validateContactForm(formData);
        const hasAllFields = formData.name && formData.email && formData.message;
        
        if (hasAllFields) {
          expect(result.isValid).toBe(true);
        } else {
          expect(result.isValid).toBe(false);
          expect(result.errors).toBeDefined();
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Organization

**Frontend Tests:**
```
frontend/src/
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.test.tsx          # Unit tests
│   │   └── Header.properties.test.tsx  # Property tests
│   ├── AudioPlayer/
│   │   ├── AudioPlayer.tsx
│   │   ├── AudioPlayer.test.tsx
│   │   └── AudioPlayer.properties.test.tsx
├── pages/
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.test.tsx
│   │   └── HomePage.properties.test.tsx
└── utils/
    ├── validation.ts
    ├── validation.test.ts
    └── validation.properties.test.ts
```

**Backend Tests:**
```
backend/src/
├── routes/
│   ├── shows.ts
│   ├── shows.test.ts
│   └── shows.properties.test.ts
├── models/
│   ├── Show.ts
│   ├── Show.test.ts
│   └── Show.properties.test.ts
├── middleware/
│   ├── auth.ts
│   ├── auth.test.ts
│   └── auth.properties.test.ts
└── utils/
    ├── sanitize.ts
    ├── sanitize.test.ts
    └── sanitize.properties.test.ts
```

### Critical Test Scenarios

**Authentication and Authorization:**
- Unit: Test login with valid/invalid credentials
- Unit: Test token generation and validation
- Property: All admin endpoints require authentication
- Property: Role-based access control is enforced

**Content Management:**
- Unit: Test creating show with all required fields
- Unit: Test uploading episode with valid audio file
- Property: All content forms validate required fields
- Property: Scheduled content appears only after publication date

**Audio Streaming:**
- Unit: Test player initialization with live stream URL
- Unit: Test player state transitions (play, pause, stop)
- Property: Player state persists across navigation
- Unit: Test error handling for unavailable streams

**Form Submissions:**
- Unit: Test story submission with valid data
- Unit: Test volunteer form with missing fields
- Property: All forms sanitize user inputs
- Property: All forms enforce rate limiting

**Responsive Design:**
- Unit: Test navigation menu at mobile breakpoint
- Unit: Test form layout on small screens
- Property: All interactive elements meet minimum touch target size
- Property: All pages adapt layout below 768px width

**Security:**
- Unit: Test password hashing on user creation
- Unit: Test CSRF token validation
- Property: All passwords are hashed in database
- Property: All state-changing requests require CSRF tokens
- Property: All user inputs are sanitized

**Accessibility:**
- Unit: Test keyboard navigation through main menu
- Unit: Test screen reader labels on audio player
- Property: All interactive elements are keyboard-accessible
- Property: All images have alt text
- Property: All text meets color contrast requirements

### Continuous Integration

**CI Pipeline:**
1. Lint code (ESLint)
2. Type check (TypeScript)
3. Run unit tests
4. Run property-based tests
5. Run integration tests
6. Generate coverage report (minimum 80% coverage)
7. Build production bundle
8. Run E2E tests on critical paths

**Pre-deployment Checks:**
- All tests passing
- No TypeScript errors
- No ESLint errors
- Coverage threshold met
- Security audit passing (npm audit)
- Performance budget met (Lighthouse score > 90)

## Deployment Architecture

### Infrastructure Components

**Frontend Deployment:**
- Platform: Vercel or Netlify
- Build: Vite production build with code splitting
- CDN: Automatic edge caching for static assets
- Environment variables: API URL, analytics keys

**Backend Deployment:**
- Platform: Railway, Render, or AWS ECS
- Runtime: Node.js 18+ with PM2 process manager
- Database: PostgreSQL 14+ (managed service)
- Environment variables: Database credentials, JWT secret, API keys

**Media Storage:**
- Service: AWS S3 or Cloudflare R2
- Organization: /audio/{show-slug}/{episode-slug}.mp3
- CDN: CloudFront or Cloudflare CDN for fast delivery
- Access: Signed URLs for protected content

**Email Service:**
- Provider: SendGrid or AWS SES
- Templates: Transactional emails (confirmation, notifications)
- Tracking: Open rates, click rates

### Environment Configuration

**Development:**
```
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/radio_dev
JWT_SECRET=dev_secret_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
STORAGE_PROVIDER=local
```

**Production:**
```
NODE_ENV=production
DATABASE_URL=postgresql://[managed-db-url]
JWT_SECRET=[secure-random-key]
FRONTEND_URL=https://resistanceradio.org
BACKEND_URL=https://api.resistanceradio.org
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=radio-media
AWS_REGION=us-east-1
SENDGRID_API_KEY=[api-key]
```

### Monitoring and Observability

**Application Monitoring:**
- Error tracking: Sentry or Rollbar
- Performance monitoring: New Relic or Datadog
- Uptime monitoring: UptimeRobot or Pingdom

**Metrics to Track:**
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Audio streaming quality (buffering, failures)
- User engagement (page views, episode plays)

**Alerts:**
- Error rate exceeds 1% (immediate)
- API response time > 2s (warning)
- Database connection failures (immediate)
- Disk space > 80% (warning)

### Backup and Disaster Recovery

**Database Backups:**
- Automated daily backups (retained 30 days)
- Weekly full backups (retained 90 days)
- Point-in-time recovery capability
- Backup verification: Monthly restore tests

**Media Backups:**
- S3 versioning enabled
- Cross-region replication for critical content
- Lifecycle policies for archival

**Recovery Procedures:**
1. Database failure: Restore from most recent backup (RTO: 1 hour)
2. Application failure: Rollback to previous deployment (RTO: 15 minutes)
3. Media storage failure: Failover to replica region (RTO: 30 minutes)

## Migration Strategy

### Existing Platform Integration

The current advocacy platform will be extended rather than replaced:

**Approach 1: Separate Application (Recommended)**
- Deploy radio station as separate application
- Share authentication database between platforms
- Cross-link between advocacy and radio sites
- Maintain separate codebases for easier maintenance

**Approach 2: Integrated Application**
- Add radio features to existing codebase
- Unified navigation between advocacy and radio sections
- Shared user accounts and authentication
- Single deployment pipeline

**Recommendation:** Approach 1 (Separate Application) is recommended because:
- Cleaner separation of concerns
- Independent scaling and deployment
- Easier to maintain and update
- Different content management needs

### Data Migration

**Initial Content Setup:**
1. Create admin user accounts for content managers
2. Import initial show data (titles, hosts, descriptions)
3. Upload initial episode library to media storage
4. Import existing articles/blog posts
5. Set up initial event calendar

**Migration Scripts:**
```typescript
// Example: Import shows from CSV
async function importShows(csvPath: string) {
  const shows = await parseCSV(csvPath);
  for (const show of shows) {
    await db.query(
      'INSERT INTO shows (title, slug, description, host_name, broadcast_schedule) VALUES ($1, $2, $3, $4, $5)',
      [show.title, slugify(show.title), show.description, show.host, show.schedule]
    );
  }
}
```

### Rollout Plan

**Phase 1: Internal Testing (Week 1-2)**
- Deploy to staging environment
- Content managers test CMS functionality
- Upload initial content (shows, episodes, articles)
- Test all forms and user interactions

**Phase 2: Beta Launch (Week 3-4)**
- Deploy to production with limited announcement
- Invite core community members to test
- Gather feedback on usability and content
- Fix critical bugs and issues

**Phase 3: Public Launch (Week 5)**
- Full public announcement
- Social media campaign
- Email newsletter to existing advocacy platform users
- Monitor performance and user feedback

**Phase 4: Post-Launch (Week 6+)**
- Analyze usage metrics
- Iterate on features based on feedback
- Optimize performance based on real-world usage
- Plan future enhancements

## Future Enhancements

**Phase 2 Features:**
- User accounts for listeners (save favorites, create playlists)
- Comments and discussions on episodes and articles
- Live chat during broadcasts
- Mobile apps (iOS and Android)
- Podcast RSS feed for distribution to Apple Podcasts, Spotify

**Phase 3 Features:**
- Advanced search with filters and full-text search
- Personalized content recommendations
- Community forums
- Crowdfunding/donation campaigns
- Merchandise store

**Technical Improvements:**
- GraphQL API for more efficient data fetching
- Server-side rendering for improved SEO and performance
- Progressive Web App (PWA) for offline access
- Real-time analytics dashboard for administrators
- A/B testing framework for content optimization

## Conclusion

This design provides a comprehensive blueprint for building the Resistance Radio Station website as a modern, scalable, and accessible platform. The architecture leverages the existing advocacy platform's technology stack while introducing new features specific to radio broadcasting and civic education.

Key design decisions:
- Headless CMS architecture for content flexibility
- Property-based testing for robust correctness guarantees
- Mobile-first responsive design for accessibility
- Security-first approach with comprehensive input validation
- Performance optimization through lazy loading and caching
- Comprehensive error handling and monitoring

The implementation will follow the task list in tasks.md, with each task building incrementally on previous work to ensure a stable, well-tested platform that serves the station's mission of amplifying truth, courage, and community.
