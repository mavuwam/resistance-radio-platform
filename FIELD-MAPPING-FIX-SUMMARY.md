# Admin Backend Field Mapping Fix

## Issue
Articles and other resources created through the admin portal were not appearing in the admin panel after successful creation. The root cause was a mismatch between database column names and the field names expected by the frontend.

## Root Cause
The backend API routes were returning raw database rows with database column names (e.g., `author_name`, `featured_image_url`, `cover_image_url`, `duration_seconds`, `file_size_bytes`), but the frontend TypeScript interfaces expected different field names (e.g., `author`, `image_url`, `duration`, `file_size`).

## Solution
Added field mapping in all admin API routes to transform database column names to frontend-expected field names before sending responses.

## Files Modified

### 1. Articles (`backend/src/routes/admin/articles.ts`)
**Mappings Applied:**
- `author_name` → `author`
- `featured_image_url` → `image_url`

**Routes Fixed:**
- GET `/api/admin/articles` (list)
- GET `/api/admin/articles/:id` (single)
- POST `/api/admin/articles` (create)
- PUT `/api/admin/articles/:id` (update)
- POST `/api/admin/articles/:id/publish` (publish)
- POST `/api/admin/articles/:id/unpublish` (unpublish)

### 2. Shows (`backend/src/routes/admin/shows.ts`)
**Mappings Applied:**
- `cover_image_url` → `image_url`

**Routes Fixed:**
- GET `/api/admin/shows` (list)
- GET `/api/admin/shows/:id` (single)
- POST `/api/admin/shows` (create)
- PUT `/api/admin/shows/:id` (update)

### 3. Episodes (`backend/src/routes/admin/episodes.ts`)
**Mappings Applied:**
- `duration_seconds` → `duration` (converted to MM:SS format string)

**Routes Fixed:**
- GET `/api/admin/episodes` (list)
- GET `/api/admin/episodes/:id` (single)
- POST `/api/admin/episodes` (create)
- PUT `/api/admin/episodes/:id` (update)

**Duration Conversion Logic:**
```typescript
duration: row.duration_seconds 
  ? `${Math.floor(row.duration_seconds / 60)}:${String(row.duration_seconds % 60).padStart(2, '0')}` 
  : undefined
```

### 4. Resources (`backend/src/routes/admin/resources.ts`)
**Mappings Applied:**
- `file_size_bytes` → `file_size`

**Routes Fixed:**
- GET `/api/admin/resources` (list)
- GET `/api/admin/resources/:id` (single)
- POST `/api/admin/resources` (create)
- PUT `/api/admin/resources/:id` (update)

### 5. Events
**No changes needed** - Events table column names already match frontend expectations.

## Testing
Created and executed test scripts to verify:
1. Article creation returns correct field names (`author`, `image_url`)
2. Article appears immediately in the list after creation
3. All CRUD operations work correctly with field mapping

## Impact
- Articles, shows, episodes, and resources now display correctly in the admin panel immediately after creation
- All admin CRUD operations work seamlessly
- No frontend changes required - backend now provides data in the expected format

## Database Schema Reference
The database schema remains unchanged. Only the API response transformation was modified:

| Resource  | Database Column      | Frontend Field | Transformation |
|-----------|---------------------|----------------|----------------|
| Articles  | author_name         | author         | Direct copy    |
| Articles  | featured_image_url  | image_url      | Direct copy    |
| Shows     | cover_image_url     | image_url      | Direct copy    |
| Episodes  | duration_seconds    | duration       | Format to MM:SS|
| Resources | file_size_bytes     | file_size      | Direct copy    |
