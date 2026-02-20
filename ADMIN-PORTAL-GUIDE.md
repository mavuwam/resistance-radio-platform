# Admin Portal User Guide

## Overview

The Resistance Radio admin portal is a comprehensive content management system that allows administrators to manage all platform content including articles, events, resources, episodes, shows, and user submissions.

---

## Accessing the Admin Portal

### URL
- **Production**: https://resistanceradiostation.org/admin/login
- **Local Development**: http://localhost:5173/admin/login

### Creating an Admin User

If you don't have an admin account yet, you can create one using the backend script:

```bash
cd backend
npm run create-admin
```

This will prompt you for:
- Email address
- Password
- Full name
- Role (administrator or content_manager)

**Roles**:
- `administrator` - Full access to all features
- `content_manager` - Can manage content but not user accounts

---

## Admin Portal Features

### 1. Dashboard (`/admin/dashboard`)

The dashboard provides an overview of:
- Total articles, events, resources, episodes
- Recent submissions
- Quick actions
- System status

### 2. Articles Management (`/admin/articles`)

**Features**:
- ✅ Create, edit, and delete articles
- ✅ Rich text editor for content
- ✅ Image upload for article covers
- ✅ Publish/unpublish articles
- ✅ Bulk publish/unpublish
- ✅ Search by keyword
- ✅ Filter by status (draft/published)
- ✅ Filter by category
- ✅ Pagination

**How to Create an Article**:
1. Click "Create Article" button
2. Fill in required fields:
   - Title (required)
   - Author (required)
   - Content (required - use rich text editor)
   - Excerpt (optional summary)
   - Category (optional)
   - Status (draft or published)
3. Upload article image (optional)
4. Click "Create" to save

**How to Publish/Unpublish**:
- Single article: Click "Publish" or "Unpublish" button in the actions column
- Multiple articles: Select checkboxes, then use "Publish Selected" or "Unpublish Selected"

---

### 3. Events Management (`/admin/events`)

**Features**:
- ✅ Create, edit, and delete events
- ✅ Rich text editor for descriptions
- ✅ Date/time picker for event dates
- ✅ Image upload for event covers
- ✅ Search by keyword
- ✅ Filter by date range
- ✅ Pagination

**How to Create an Event**:
1. Click "Create Event" button
2. Fill in required fields:
   - Title (required)
   - Description (required)
   - Event Date (required)
   - Location (required)
   - Organizer (optional)
   - Registration URL (optional)
3. Upload event image (optional)
4. Click "Create" to save

---

### 4. Resources Management (`/admin/resources`)

**Features**:
- ✅ Create, edit, and delete resources
- ✅ File upload for documents (PDF, DOC, DOCX, etc.)
- ✅ Automatic file type and size detection
- ✅ Search by keyword
- ✅ Filter by file type
- ✅ Pagination

**How to Create a Resource**:
1. Click "Create Resource" button
2. Fill in required fields:
   - Title (required)
   - Description (required)
   - Category (optional)
3. Upload document file (required)
   - Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP
   - Max size: 10MB
4. Click "Create" to save

**Supported File Types**:
- Documents: PDF, DOC, DOCX, TXT
- Spreadsheets: XLS, XLSX
- Presentations: PPT, PPTX
- Archives: ZIP

---

### 5. Episodes Management (`/admin/episodes`)

**Features**:
- ✅ Create, edit, and delete episodes
- ✅ Audio file upload
- ✅ Automatic duration detection
- ✅ Link episodes to shows
- ✅ Search by keyword
- ✅ Filter by show
- ✅ Pagination

**How to Create an Episode**:
1. Click "Create Episode" button
2. Fill in required fields:
   - Show (required - select from dropdown)
   - Title (required)
   - Description (required)
   - Episode Number (optional)
3. Upload audio file (required)
   - Supported formats: MP3, WAV, OGG, AAC, FLAC
   - Max size: 100MB
4. Upload thumbnail image (optional)
5. Click "Create" to save

---

### 6. Shows Management (`/admin/shows`)

**Features**:
- ✅ Create, edit, and delete shows
- ✅ Cover image upload
- ✅ Thumbnail generation
- ✅ Episode count display
- ✅ Delete protection (can't delete shows with episodes)
- ✅ Search by keyword
- ✅ Filter by active status
- ✅ Pagination

**How to Create a Show**:
1. Click "Create Show" button
2. Fill in required fields:
   - Title (required)
   - Description (required)
   - Host (required)
   - Schedule (optional)
   - Active status (checkbox)
3. Upload cover image (optional)
4. Click "Create" to save

**Note**: You cannot delete a show that has episodes. Delete all episodes first, or keep the show and mark it as inactive.

---

### 7. Submissions Management (`/admin/submissions`)

**Features**:
- ✅ View all user submissions
- ✅ Approve or reject submissions
- ✅ View submission details
- ✅ Search by keyword
- ✅ Filter by status (pending/approved/rejected)
- ✅ Pagination

**How to Review Submissions**:
1. Navigate to Submissions page
2. Click on a submission to view details
3. Review the content
4. Click "Approve" to publish or "Reject" to decline
5. Optionally add a note explaining the decision

---

## File Upload Guidelines

### Image Files
- **Formats**: JPEG, PNG, GIF, WebP, SVG
- **Max Size**: 5MB
- **Recommended Dimensions**: 
  - Article covers: 1200x630px
  - Event covers: 1200x630px
  - Show covers: 800x800px
  - Thumbnails: Auto-generated at 300x300px

### Audio Files
- **Formats**: MP3, WAV, OGG, AAC, FLAC
- **Max Size**: 100MB
- **Recommended**: MP3 at 128kbps or higher

### Document Files
- **Formats**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP
- **Max Size**: 10MB

---

## Search and Filtering

### Search
- Search works across titles, content, and descriptions
- Search is case-insensitive
- Results update automatically as you type

### Filters
- **Articles**: Status (draft/published), Category
- **Events**: Date range (start date, end date)
- **Resources**: File type
- **Episodes**: Show
- **Shows**: Active status
- **Submissions**: Status (pending/approved/rejected)

### Sorting
- Click column headers to sort
- Click again to reverse sort order
- Default sort: Most recent first

---

## Bulk Actions

### Articles Only
- Select multiple articles using checkboxes
- Use "Publish Selected" to publish all selected articles
- Use "Unpublish Selected" to unpublish all selected articles
- Bulk actions are atomic (all succeed or all fail)

---

## Security Features

### Authentication
- JWT-based authentication
- 24-hour session duration
- Automatic logout on token expiration

### Authorization
- Role-based access control
- Administrators have full access
- Content managers can manage content only

### File Upload Security
- File type validation
- File size limits
- Virus scanning (if configured)
- Secure S3 storage

### Input Sanitization
- HTML content is sanitized
- XSS protection
- SQL injection prevention

---

## Keyboard Shortcuts

- `Esc` - Close modal
- `Ctrl/Cmd + S` - Save form (when in modal)
- `Ctrl/Cmd + K` - Focus search input

---

## Mobile Access

The admin portal is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)

**Note**: For best experience, use a desktop browser for content creation and editing.

---

## Troubleshooting

### Can't Login
1. Verify your email and password
2. Check if your account is active
3. Clear browser cache and cookies
4. Try incognito/private mode

### File Upload Fails
1. Check file size (must be under limit)
2. Check file format (must be supported)
3. Check internet connection
4. Try a different file

### Content Not Saving
1. Check all required fields are filled
2. Check for validation errors
3. Check internet connection
4. Try refreshing the page

### Images Not Displaying
1. Check if image URL is valid
2. Check if S3 bucket is accessible
3. Check browser console for errors
4. Try re-uploading the image

---

## API Endpoints

All admin endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Articles
- `GET /api/admin/articles` - List articles
- `POST /api/admin/articles` - Create article
- `GET /api/admin/articles/:id` - Get article
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete article
- `POST /api/admin/articles/:id/publish` - Publish article
- `POST /api/admin/articles/:id/unpublish` - Unpublish article
- `POST /api/admin/articles/bulk/publish` - Bulk publish
- `POST /api/admin/articles/bulk/unpublish` - Bulk unpublish

### Events
- `GET /api/admin/events` - List events
- `POST /api/admin/events` - Create event
- `GET /api/admin/events/:id` - Get event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

### Resources
- `GET /api/admin/resources` - List resources
- `POST /api/admin/resources` - Create resource
- `GET /api/admin/resources/:id` - Get resource
- `PUT /api/admin/resources/:id` - Update resource
- `DELETE /api/admin/resources/:id` - Delete resource

### Episodes
- `GET /api/admin/episodes` - List episodes
- `POST /api/admin/episodes` - Create episode
- `GET /api/admin/episodes/:id` - Get episode
- `PUT /api/admin/episodes/:id` - Update episode
- `DELETE /api/admin/episodes/:id` - Delete episode

### Shows
- `GET /api/admin/shows` - List shows
- `POST /api/admin/shows` - Create show
- `GET /api/admin/shows/:id` - Get show
- `PUT /api/admin/shows/:id` - Update show
- `DELETE /api/admin/shows/:id` - Delete show

### Submissions
- `GET /api/admin/submissions` - List submissions
- `PUT /api/admin/submissions/:id` - Update submission status
- `DELETE /api/admin/submissions/:id` - Delete submission

### File Upload
- `POST /api/upload/image` - Upload image
- `POST /api/upload/audio` - Upload audio
- `POST /api/upload/document` - Upload document

---

## Best Practices

### Content Creation
1. **Write clear, concise titles** - Keep titles under 60 characters
2. **Use excerpts** - Provide a brief summary for articles
3. **Add images** - Visual content increases engagement
4. **Categorize content** - Use categories consistently
5. **Preview before publishing** - Review content in preview mode

### Image Optimization
1. **Compress images** - Use tools like TinyPNG before uploading
2. **Use appropriate dimensions** - Follow recommended sizes
3. **Use descriptive filenames** - Helps with SEO
4. **Add alt text** - Improves accessibility

### Audio Files
1. **Use MP3 format** - Best compatibility
2. **Optimize bitrate** - 128kbps is usually sufficient
3. **Normalize audio levels** - Consistent volume across episodes
4. **Add metadata** - Title, artist, album info

### Content Organization
1. **Use consistent naming** - Follow naming conventions
2. **Tag appropriately** - Use relevant categories
3. **Schedule publishing** - Plan content calendar
4. **Archive old content** - Keep platform fresh

---

## Support

### Getting Help
- **Documentation**: Check this guide first
- **Backend API Docs**: See `backend/API-SUMMARY.md`
- **Technical Issues**: Check browser console for errors
- **Feature Requests**: Contact platform administrators

### Reporting Bugs
When reporting bugs, include:
1. What you were trying to do
2. What happened instead
3. Steps to reproduce
4. Browser and OS version
5. Screenshots (if applicable)

---

## Quick Start Checklist

- [ ] Create admin account using `npm run create-admin`
- [ ] Login at `/admin/login`
- [ ] Explore the dashboard
- [ ] Create a test show
- [ ] Create a test episode for the show
- [ ] Create a test article
- [ ] Upload a test resource
- [ ] Create a test event
- [ ] Review any pending submissions
- [ ] Familiarize yourself with search and filters
- [ ] Test bulk actions on articles

---

## Next Steps

Once you're comfortable with the admin portal:

1. **Create your first show** - Set up your radio show
2. **Upload episodes** - Add audio content
3. **Write articles** - Share news and insights
4. **Add events** - Promote community activities
5. **Upload resources** - Share documents and materials
6. **Review submissions** - Engage with community content

---

## Production Deployment

The admin portal is already deployed and accessible at:
- **URL**: https://resistanceradiostation.org/admin/login
- **Backend API**: https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api
- **Database**: AWS RDS PostgreSQL
- **File Storage**: AWS S3

All changes are automatically deployed via CI/CD pipeline when you push to the main branch.

---

## Summary

The admin portal provides a complete content management system with:
- ✅ Full CRUD operations for all content types
- ✅ File upload with validation
- ✅ Rich text editing
- ✅ Search and filtering
- ✅ Bulk actions
- ✅ Role-based access control
- ✅ Mobile responsive design
- ✅ Secure authentication
- ✅ Real-time updates

You're ready to start managing content!
