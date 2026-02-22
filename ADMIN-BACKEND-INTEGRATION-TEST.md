# Admin Backend Integration - Manual Testing Guide

## Overview

This guide helps you test the admin portal integration with the backend API to identify any issues that need fixing.

## Prerequisites

- Backend running on port 5000: `npm run dev:backend`
- Admin frontend running on port 5174: `cd admin-frontend && npm run dev`
- Database migrated and seeded
- Admin user created (email/password)

## Testing Checklist

### 1. Authentication Flow ✓ Test First

**Login:**
- [ ] Navigate to http://localhost:5174/admin/login
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] **Expected**: Redirect to dashboard, token stored in localStorage
- [ ] **Check**: Open DevTools → Application → Local Storage → auth_token exists

**Session Management:**
- [ ] Work in admin portal for a few minutes
- [ ] Check that session doesn't expire unexpectedly
- [ ] **Expected**: No unexpected logouts

**Logout:**
- [ ] Click logout button
- [ ] **Expected**: Redirect to login, localStorage cleared

### 2. Dashboard Statistics

- [ ] Navigate to dashboard
- [ ] **Expected**: See statistics for shows, episodes, articles, events, resources, submissions
- [ ] **Check**: Are numbers accurate? Do they match database?
- [ ] **Issue**: If "Failed to load dashboard statistics" appears, we need to implement the endpoint

### 3. Shows Management

**List View:**
- [ ] Navigate to Shows page
- [ ] **Expected**: See list of shows in table
- [ ] **Check**: Pagination works, search works

**Create Show:**
- [ ] Click "Create Show" button
- [ ] Fill in: Title, Slug, Description, Host, Category
- [ ] Upload image (optional)
- [ ] Click "Save"
- [ ] **Expected**: Success toast, show appears in list
- [ ] **Check DevTools Network**: POST /api/admin/shows returns 201

**Edit Show:**
- [ ] Click edit button on a show
- [ ] Modify title or description
- [ ] Click "Save"
- [ ] **Expected**: Success toast, changes reflected
- [ ] **Check Network**: PUT /api/admin/shows/:id returns 200

**Delete Show:**
- [ ] Click delete button on a show WITHOUT episodes
- [ ] Confirm deletion
- [ ] **Expected**: Success toast, show removed
- [ ] **Check Network**: DELETE /api/admin/shows/:id returns 200

**Delete Show with Episodes (Error Case):**
- [ ] Try to delete a show that HAS episodes
- [ ] **Expected**: Error message "Cannot delete show with episodes"
- [ ] **Check Network**: DELETE returns 409 with code HAS_EPISODES

### 4. Episodes Management

**Create Episode:**
- [ ] Navigate to Episodes page
- [ ] Click "Create Episode"
- [ ] Select a show from dropdown
- [ ] Fill in title, description
- [ ] Upload audio file (MP3)
- [ ] **Expected**: Upload progress bar appears
- [ ] **Expected**: Success toast after upload completes
- [ ] Click "Save"
- [ ] **Expected**: Episode appears in list

**File Upload Progress:**
- [ ] During audio upload, watch for progress indicator
- [ ] **Check**: Does progress bar show 0-100%?
- [ ] **Issue**: If no progress shown, we need to add onUploadProgress callback

### 5. Articles Management

**Create Article:**
- [ ] Navigate to Articles page
- [ ] Click "Create Article"
- [ ] Fill in title, content, author
- [ ] Upload featured image (optional)
- [ ] Set status to "draft"
- [ ] Click "Save"
- [ ] **Expected**: Article created as draft

**Publish Article:**
- [ ] Click "Publish" button on draft article
- [ ] **Expected**: Status changes to "published"
- [ ] **Check Network**: POST /api/admin/articles/:id/publish

**Bulk Publish:**
- [ ] Select multiple draft articles (checkboxes)
- [ ] Click "Bulk Publish" button
- [ ] **Expected**: All selected articles published
- [ ] **Check Network**: POST /api/admin/articles/bulk/publish with IDs array

### 6. Events Management

**Create Event:**
- [ ] Navigate to Events page
- [ ] Click "Create Event"
- [ ] Fill in title, description, dates
- [ ] Upload event image (optional)
- [ ] Click "Save"
- [ ] **Expected**: Event created

### 7. Resources Management

**Create Resource:**
- [ ] Navigate to Resources page
- [ ] Click "Create Resource"
- [ ] Fill in title, description
- [ ] Upload PDF file
- [ ] **Expected**: Upload progress shown
- [ ] Click "Save"
- [ ] **Expected**: Resource created with file_url

### 8. Submissions Management

**View Submissions:**
- [ ] Navigate to Submissions page
- [ ] **Expected**: See list of pending submissions
- [ ] Filter by status (pending/approved/rejected)

**Approve Submission:**
- [ ] Click "Approve" on a pending submission
- [ ] Add optional feedback
- [ ] Click "Confirm"
- [ ] **Expected**: Status changes to "approved"

**Reject Submission:**
- [ ] Click "Reject" on a pending submission
- [ ] Add feedback explaining why
- [ ] Click "Confirm"
- [ ] **Expected**: Status changes to "rejected"

### 9. Search and Filtering

**Search:**
- [ ] On any content page, enter search term
- [ ] **Expected**: Results filtered by search term
- [ ] **Check**: Case-insensitive search works

**Filter by Status:**
- [ ] On Articles page, select "Published" from status filter
- [ ] **Expected**: Only published articles shown

**Filter by Show:**
- [ ] On Episodes page, select a show from dropdown
- [ ] **Expected**: Only episodes for that show shown

### 10. Pagination

**Navigate Pages:**
- [ ] On any content page with multiple pages
- [ ] Click "Next" button
- [ ] **Expected**: Next page of results loads
- [ ] **Check**: Page number updates correctly
- [ ] Click "Previous"
- [ ] **Expected**: Previous page loads

### 11. Sorting

**Sort by Column:**
- [ ] Click a column header (e.g., "Title")
- [ ] **Expected**: Results sorted ascending
- [ ] Click again
- [ ] **Expected**: Results sorted descending
- [ ] **Check Network**: sort and order parameters sent

### 12. Error Handling

**Network Error:**
- [ ] Stop the backend server
- [ ] Try to create/edit content
- [ ] **Expected**: "Network error" message with retry button
- [ ] Restart backend
- [ ] Click retry
- [ ] **Expected**: Operation succeeds

**Validation Error:**
- [ ] Try to create show with empty title
- [ ] **Expected**: "Title is required" error message
- [ ] **Check**: Form submission prevented

**Duplicate Slug:**
- [ ] Try to create show with existing slug
- [ ] **Expected**: "Slug already exists" error message
- [ ] **Check Network**: 409 status with DUPLICATE_SLUG code

### 13. File Uploads

**Image Upload:**
- [ ] Upload JPG/PNG image
- [ ] **Expected**: Upload succeeds, URL returned
- [ ] **Check**: Image accessible at returned URL

**Audio Upload:**
- [ ] Upload MP3 file
- [ ] **Expected**: Upload succeeds, progress shown
- [ ] **Check**: Audio file accessible

**Document Upload:**
- [ ] Upload PDF file
- [ ] **Expected**: Upload succeeds
- [ ] **Check**: PDF accessible

**Upload Error:**
- [ ] Try to upload file >10MB (if size limit exists)
- [ ] **Expected**: Error message about file size

## Issues Found

Document any issues discovered during testing:

### Issue 1: [Title]
- **What**: Description of the issue
- **Steps to Reproduce**: 
- **Expected**: What should happen
- **Actual**: What actually happens
- **Fix Needed**: What needs to be implemented/fixed

### Issue 2: [Title]
...

## Next Steps

After completing manual testing:
1. Review issues found
2. Prioritize fixes by severity
3. Implement fixes for critical issues
4. Re-test to verify fixes
5. Document any known limitations

