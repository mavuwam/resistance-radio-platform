# Backend Schema Alignment Fixes

## Summary of Required Changes

All backend routes need to be updated to match the actual database schema. Here are the critical fixes:

### 1. Shows Route (`backend/src/routes/admin/shows.ts`)

**Changes Required:**
- `host` → `host_name` (database column)
- `image_url` → `cover_image_url` (database column)
- Remove `thumbnail_url` (doesn't exist in schema)
- Remove category validation (allow any string)

**POST Route Fix:**
```typescript
// Line ~140: Change validation
body('host_name').trim().notEmpty().withMessage('Host name is required'),
body('category').optional().trim(),

// Line ~155: Change INSERT query
INSERT INTO shows (title, slug, description, host_name, category, broadcast_schedule, cover_image_url, is_active, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())

// Line ~157: Change parameters
[title, slug, description, host_name, category || null, broadcast_schedule, image_url || null, is_active !== false]
```

**PUT Route Fix:**
```typescript
// Line ~185: Change validation
body('host_name').optional().trim().notEmpty(),
body('category').optional().trim(),

// Line ~210: Add field mapping
const mappedFields = fields.map(field => field === 'image_url' ? 'cover_image_url' : field);
const setClause = mappedFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
```

**DELETE Route Fix:**
```typescript
// Line ~235: Change column names
SELECT id, cover_image_url FROM shows WHERE id = $1
```

---

### 2. Episodes Route (`backend/src/routes/admin/episodes.ts`)

**Changes Required:**
- `duration` (string) → `duration_seconds` (integer)
- `episode_number` → Remove or add to schema
- Remove `thumbnail_url` (doesn't exist in schema)
- Add `slug` generation

**POST Route Fix:**
```typescript
// Line ~140: Change validation
body('duration_seconds').optional().isInt({ min: 0 }).withMessage('Duration must be in seconds'),

// Line ~175: Generate slug
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Line ~180: Change INSERT query
INSERT INTO episodes (
  show_id, title, slug, description, audio_url, 
  duration_seconds, file_size_bytes, published_at, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())

// Remove episode_number and thumbnail_url from parameters
```

**PUT Route Fix:**
```typescript
// Line ~220: Change validation
body('duration_seconds').optional().isInt({ min: 0 }),

// Line ~250: Map fields
const mappedFields = fields.map(field => {
  if (field === 'duration') return 'duration_seconds';
  return field;
});
```

---

### 3. Resources Route (`backend/src/routes/admin/resources.ts`)

**Changes Required:**
- `file_type` → `resource_type` (database column)
- `file_size` → `file_size_bytes` (database column)
- Add `slug` generation

**POST Route Fix:**
```typescript
// Line ~130: Change validation
body('resource_type').isIn(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'other']),
body('file_size_bytes').optional().isInt({ min: 0 }),

// Line ~150: Generate slug
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Line ~155: Change INSERT query
INSERT INTO resources (
  title, slug, description, resource_type, file_url, file_size_bytes, category, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())

// Line ~160: Change parameters
[title, slug, description, resource_type, file_url, file_size_bytes || null, category || null]
```

**PUT Route Fix:**
```typescript
// Line ~190: Change validation
body('resource_type').optional().isIn([...]),
body('file_size_bytes').optional().isInt({ min: 0 }),

// Line ~220: Map fields
const mappedFields = fields.map(field => {
  if (field === 'file_type') return 'resource_type';
  if (field === 'file_size') return 'file_size_bytes';
  return field;
});
```

---

### 4. Articles Route (`backend/src/routes/admin/articles.ts`)

**Status:** ✅ Already Fixed
- `author` → `author_name` ✅
- `image_url` → `featured_image_url` ✅
- Removed `thumbnail_url` ✅

---

### 5. Events Route (`backend/src/routes/admin/events.ts`)

**Status:** ✅ Already Aligned
- All fields match schema correctly

---

## Quick Fix Commands

Run these commands to restart the backend after making changes:

```bash
# Stop the backend
# (Ctrl+C in the terminal running the backend)

# Restart the backend
cd backend
npm run dev
```

## Testing Checklist

After applying fixes, test each section:

- [ ] Articles - Create, Edit, Publish, Delete
- [ ] Shows - Create, Edit, Delete
- [ ] Episodes - Create, Edit, Delete
- [ ] Events - Create, Edit, Delete
- [ ] Resources - Create, Edit, Delete
- [ ] Submissions - View, Approve, Reject

