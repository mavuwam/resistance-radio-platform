# Content Management Guide

## Overview

This guide explains how to manage content on the Resistance Radio Station website. It covers the admin dashboard, content creation, and best practices for maintaining the platform.

## Accessing the Admin Dashboard

### Login
1. Navigate to `/admin/login`
2. Enter your email and password
3. Click "Login"

### User Roles
- **Administrator**: Full access to all features
- **Content Manager**: Can create, edit, and publish content
- **User**: Basic access (no admin privileges)

## Dashboard Overview

The admin dashboard (`/admin/dashboard`) provides:
- Quick statistics (shows, episodes, articles, events)
- Recent activity
- Quick actions
- Navigation to content management sections

## Managing Shows

### Creating a New Show
1. Go to Admin Dashboard → Shows
2. Click "Create New Show"
3. Fill in the required fields:
   - **Title**: Show name (e.g., "The Resistance Hour")
   - **Slug**: URL-friendly version (auto-generated from title)
   - **Description**: Brief overview of the show
   - **Category**: Select from dropdown (News, Politics, Culture, etc.)
   - **Host**: Name of the show host
   - **Schedule**: When the show airs (e.g., "Mondays 8PM")
   - **Image**: Upload show artwork (recommended: 1200x630px)
4. Click "Create Show"

### Editing a Show
1. Go to Admin Dashboard → Shows
2. Click "Edit" on the show you want to modify
3. Update the fields
4. Click "Save Changes"

### Deleting a Show
1. Go to Admin Dashboard → Shows
2. Click "Delete" on the show
3. Confirm deletion (this will also delete all episodes)

## Managing Episodes

### Uploading a New Episode
1. Go to Admin Dashboard → Shows
2. Select the show
3. Click "Add Episode"
4. Fill in the required fields:
   - **Title**: Episode title
   - **Slug**: URL-friendly version
   - **Description**: Episode summary
   - **Audio File**: Upload MP3 file (max 100MB)
   - **Duration**: Automatically calculated from audio file
   - **Published Date**: When to publish (can schedule for future)
5. Click "Upload Episode"

### Audio File Requirements
- **Format**: MP3
- **Bitrate**: 128kbps or higher recommended
- **Sample Rate**: 44.1kHz
- **Max Size**: 100MB
- **Naming**: Use descriptive names (e.g., "resistance-hour-ep01.mp3")

### Editing an Episode
1. Go to Admin Dashboard → Shows → Select Show
2. Click "Edit" on the episode
3. Update fields (note: audio file cannot be changed, must delete and re-upload)
4. Click "Save Changes"

### Deleting an Episode
1. Go to Admin Dashboard → Shows → Select Show
2. Click "Delete" on the episode
3. Confirm deletion

## Managing Articles

### Creating a New Article
1. Go to Admin Dashboard → Articles
2. Click "Create New Article"
3. Fill in the required fields:
   - **Title**: Article headline
   - **Slug**: URL-friendly version
   - **Summary**: Brief description (shown in article list)
   - **Content**: Full article text (supports Markdown)
   - **Category**: Select from dropdown
   - **Author**: Your name or pen name
   - **Image**: Featured image (recommended: 1200x630px)
   - **Published Date**: When to publish
4. Click "Publish Article"

### Content Formatting
Articles support Markdown formatting:
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Headings**: `## Heading`
- **Links**: `[text](url)`
- **Lists**: `- item` or `1. item`
- **Quotes**: `> quote`

### Editing an Article
1. Go to Admin Dashboard → Articles
2. Click "Edit" on the article
3. Update fields
4. Click "Save Changes"

### Deleting an Article
1. Go to Admin Dashboard → Articles
2. Click "Delete" on the article
3. Confirm deletion

## Managing Events

### Creating a New Event
1. Go to Admin Dashboard → Events
2. Click "Create New Event"
3. Fill in the required fields:
   - **Title**: Event name
   - **Description**: Event details
   - **Type**: Select from dropdown (Rally, Workshop, Broadcast, etc.)
   - **Date**: Event date and time
   - **Location**: Physical or virtual location
   - **Registration URL**: Link to RSVP/register (optional)
4. Click "Create Event"

### Editing an Event
1. Go to Admin Dashboard → Events
2. Click "Edit" on the event
3. Update fields
4. Click "Save Changes"

### Deleting an Event
1. Go to Admin Dashboard → Events
2. Click "Delete" on the event
3. Confirm deletion

## Managing Resources

### Adding a New Resource
1. Go to Admin Dashboard → Resources
2. Click "Add New Resource"
3. Fill in the required fields:
   - **Title**: Resource name
   - **Description**: What the resource is about
   - **Category**: Select from dropdown
   - **Type**: Document, Guide, Template, etc.
   - **File**: Upload PDF, DOC, or other file (max 10MB)
   - **URL**: External link (if not uploading file)
4. Click "Add Resource"

### Resource File Requirements
- **Formats**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Max Size**: 10MB
- **Naming**: Use descriptive names

### Editing a Resource
1. Go to Admin Dashboard → Resources
2. Click "Edit" on the resource
3. Update fields
4. Click "Save Changes"

### Deleting a Resource
1. Go to Admin Dashboard → Resources
2. Click "Delete" on the resource
3. Confirm deletion

## Managing Submissions

### Viewing Submissions
1. Go to Admin Dashboard → Submissions
2. Filter by type:
   - Story Submissions
   - Volunteer Applications
   - Contributor Pitches
   - Contact Messages
   - Newsletter Subscriptions

### Reviewing a Submission
1. Click on a submission to view details
2. Review the content
3. Take action:
   - **Approve**: Mark as approved and send confirmation email
   - **Reject**: Mark as rejected and send notification
   - **Respond**: Send a custom email response
   - **Delete**: Remove the submission

### Responding to Submissions
1. Click "Respond" on a submission
2. Write your message
3. Click "Send Email"
4. The submitter will receive your response

## Live Broadcasting

### Starting a Live Broadcast
1. Go to Admin Dashboard → Live
2. Click "Start Live Broadcast"
3. Enter stream details:
   - **Title**: Broadcast title
   - **Stream URL**: HLS stream URL from your streaming service
4. Click "Go Live"

### Stopping a Live Broadcast
1. Go to Admin Dashboard → Live
2. Click "Stop Broadcast"
3. Confirm

### Live Stream Setup
To broadcast live, you need:
1. Streaming software (OBS, Streamlabs, etc.)
2. Streaming service (YouTube Live, Twitch, custom RTMP server)
3. HLS stream URL from your service
4. Stable internet connection (5+ Mbps upload)

## Best Practices

### Content Quality
- **Proofread**: Check for spelling and grammar errors
- **Fact-check**: Verify all information before publishing
- **Attribution**: Credit sources and original authors
- **Images**: Use high-quality, properly licensed images
- **Audio**: Ensure clear audio quality for episodes

### SEO Optimization
- **Titles**: Use descriptive, keyword-rich titles
- **Descriptions**: Write compelling summaries
- **Slugs**: Keep URLs short and readable
- **Images**: Add descriptive alt text
- **Content**: Use headings and structure content well

### Accessibility
- **Alt Text**: Describe all images
- **Transcripts**: Provide transcripts for audio content
- **Headings**: Use proper heading hierarchy
- **Links**: Use descriptive link text
- **Colors**: Ensure sufficient contrast

### Scheduling
- **Consistency**: Publish on a regular schedule
- **Advance Planning**: Schedule content in advance
- **Peak Times**: Publish when your audience is most active
- **Time Zones**: Consider your global audience

### Media Management
- **Organization**: Use clear, consistent naming conventions
- **Backups**: Keep backups of all media files
- **Optimization**: Compress images and audio before uploading
- **Storage**: Monitor storage usage and clean up old files

## Troubleshooting

### Upload Failures
- Check file size limits
- Verify file format is supported
- Ensure stable internet connection
- Try a different browser

### Login Issues
- Verify email and password
- Check if account is active
- Clear browser cache and cookies
- Contact administrator if locked out

### Content Not Appearing
- Check publication date (may be scheduled for future)
- Verify content is published (not draft)
- Clear browser cache
- Check if content was accidentally deleted

### Image Display Issues
- Verify image format (JPG, PNG, WebP)
- Check image file size (should be under 5MB)
- Ensure image uploaded successfully
- Try re-uploading the image

## Support

For technical issues or questions:
- Email: support@resistanceradio.org
- Check documentation: `/docs`
- Contact your administrator

## Security

### Password Security
- Use strong, unique passwords
- Change password regularly
- Never share your credentials
- Log out when finished

### Content Security
- Review submissions carefully before approving
- Watch for spam or malicious content
- Report suspicious activity
- Keep software updated

## Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save changes
- `Ctrl/Cmd + P`: Preview content
- `Esc`: Close modal/dialog
- `Tab`: Navigate between fields

## Additional Resources

- [API Documentation](./API-DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Accessibility Guide](./ACCESSIBILITY.md)

