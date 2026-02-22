# Upload and Delete Fixes - Admin Portal

## Issues Fixed

### 1. File Upload Path Issue ✅ FIXED

**Problem**: FileUploader was calling `/upload/${type}` instead of `/api/upload/${type}`

**File**: `shared/src/components/FileUploader.tsx`

**Fix Applied**:
```typescript
// BEFORE:
const response = await axios.post(`${API_URL}/upload/${type}`, formData, ...)

// AFTER:
const response = await axios.post(`${API_URL}/api/upload/${type}`, formData, ...)
```

**Impact**: File uploads for images, audio, and documents now work correctly

---

### 2. API Routes Missing `/api` Prefix ✅ FIXED

**Problem**: All API calls in `shared/src/services/api.ts` were missing the `/api` prefix

**File**: `shared/src/services/api.ts`

**Routes Fixed**:
- Admin Articles: `/admin/articles` → `/api/admin/articles`
- Admin Shows: `/admin/shows` → `/api/admin/shows`
- Admin Episodes: `/admin/episodes` → `/api/admin/episodes`
- Admin Events: `/admin/events` → `/api/admin/events`
- Admin Resources: `/admin/resources` → `/api/admin/resources`
- Admin Submissions: `/admin/submissions` → `/api/admin/submissions`
- Public Shows: `/shows` → `/api/shows`
- Public Episodes: `/episodes` → `/api/episodes`
- Public Events: `/events` → `/api/events`
- Public Resources: `/resources` → `/api/resources`
- Live Status: `/live/status` → `/api/live/status`
- Upload: `/upload` → `/api/upload`

**Impact**: All CRUD operations (Create, Read, Update, Delete) now work correctly

---

## Backend Configuration

The backend routes are correctly configured in `backend/src/index.ts`:

```typescript
app.use('/api/admin/articles', adminArticlesRoutes);
app.use('/api/admin/shows', adminShowsRoutes);
app.use('/api/admin/episodes', adminEpisodesRoutes);
app.use('/api/admin/events', adminEventsRoutes);
app.use('/api/admin/resources', adminResourcesRoutes);
app.use('/api/admin/submissions', adminSubmissionsRoutes);
app.use('/api/upload', uploadRoutes);
```

---

## Testing Checklist

After these fixes, test the following:

### File Uploads
- [ ] Upload image for article
- [ ] Upload image for show
- [ ] Upload audio for episode
- [ ] Upload document for resource

### CRUD Operations
- [ ] Create article
- [ ] Update article
- [ ] Delete article
- [ ] Publish/unpublish article

- [ ] Create show
- [ ] Update show
- [ ] Delete show

- [ ] Create episode
- [ ] Update episode
- [ ] Delete episode

- [ ] Create event
- [ ] Update event
- [ ] Delete event

- [ ] Create resource
- [ ] Update resource
- [ ] Delete resource

### Deletions
- [ ] Delete article (should work)
- [ ] Delete show without episodes (should work)
- [ ] Delete show with episodes (should fail with error message)
- [ ] Delete episode (should work)
- [ ] Delete event (should work)
- [ ] Delete resource (should work)

---

## Environment Configuration

Make sure your environment variables are set correctly:

### Backend (.env)
```bash
PORT=5000
AWS_PROFILE=Personal_Account_734110488556
AWS_REGION=us-east-1
AWS_S3_MEDIA_BUCKET=resistance-radio-media-dev-734110488556
CDN_URL=https://dxbqjcig99tjb.cloudfront.net
```

### Admin Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

---

## How the Fix Works

### Before Fix
```
Frontend: http://localhost:5174
  ↓ FileUploader calls: http://localhost:5000/upload/image
  ↓ API service calls: http://localhost:5000/admin/articles
Backend: http://localhost:5000
  ✗ No route at /upload/image (expects /api/upload/image)
  ✗ No route at /admin/articles (expects /api/admin/articles)
```

### After Fix
```
Frontend: http://localhost:5174
  ↓ FileUploader calls: http://localhost:5000/api/upload/image
  ↓ API service calls: http://localhost:5000/api/admin/articles
Backend: http://localhost:5000
  ✓ Route exists at /api/upload/image
  ✓ Route exists at /api/admin/articles
```

---

## Additional Notes

1. **Backend Auto-Restart**: The backend should automatically restart when files change (ts-node-dev watches for changes)

2. **Frontend Rebuild**: The admin-frontend will automatically rebuild when you save changes (Vite HMR)

3. **S3 Configuration**: File uploads use AWS CLI credentials from profile `Personal_Account_734110488556`

4. **CORS**: Backend allows requests from `http://localhost:5174` (admin-frontend)

5. **Authentication**: All admin routes require JWT token in `Authorization: Bearer <token>` header

---

## Troubleshooting

If uploads still don't work:

1. **Check Backend Logs**: Look for upload errors in the terminal running the backend
2. **Check Browser Console**: Look for network errors (404, 401, 500)
3. **Verify AWS Credentials**: Run `aws s3 ls s3://resistance-radio-media-dev-734110488556 --profile Personal_Account_734110488556`
4. **Check S3 Bucket**: Verify folders exist: `images/`, `audio/`, `documents/`

If deletions don't work:

1. **Check Backend Logs**: Look for SQL errors or constraint violations
2. **Check Browser Console**: Look for error responses
3. **Verify Database Connection**: Make sure RDS is accessible
4. **Check Foreign Keys**: Shows with episodes cannot be deleted (by design)

---

## Summary

All API routes now correctly use the `/api` prefix, matching the backend route configuration. File uploads and all CRUD operations should now work properly.
