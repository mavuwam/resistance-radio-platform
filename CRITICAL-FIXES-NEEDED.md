# Critical Fixes Needed - Admin Portal

## Current Status from Backend Logs

```
✅ Articles - Working (201 created, 200 published, 204 deleted)
❌ Shows - 400 Bad Request (validation error)
❌ Episodes - 400 Bad Request (validation error)  
❌ Resources - 500 Server Error (column doesn't exist - error 42703)
✅ Events - Working
```

## Root Cause

Backend routes expect different field names than what the database schema has.

## Fix Priority

### 1. CRITICAL: Fix Shows Route (Blocking show creation)

**File:** `backend/src/routes/admin/shows.ts`

**Problem:** Backend expects `host` but database has `host_name`

**Fix Line ~140:**
```typescript
// CHANGE FROM:
body('host').trim().notEmpty().withMessage('Host is required'),

// CHANGE TO:
body('host_name').trim().notEmpty().withMessage('Host name is required'),
```

**Fix Line ~155:**
```typescript
// CHANGE FROM:
const { title, slug, description, host, category, broadcast_schedule, image_url, thumbnail_url, is_active } = req.body;

// CHANGE TO:
const { title, slug, description, host_name, category, broadcast_schedule, image_url, is_active } = req.body;
```

**Fix Line ~165:**
```typescript
// CHANGE FROM:
INSERT INTO shows (title, slug, description, host, category, broadcast_schedule, image_url, thumbnail_url, is_active, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())

// CHANGE TO:
INSERT INTO shows (title, slug, description, host_name, category, broadcast_schedule, cover_image_url, is_active, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
```

**Fix Line ~167:**
```typescript
// CHANGE FROM:
[title, slug, description, host, category, broadcast_schedule, image_url || null, thumbnail_url || null, is_active !== false]

// CHANGE TO:
[title, slug, description, host_name, category || null, broadcast_schedule, image_url || null, is_active !== false]
```

---

### 2. CRITICAL: Fix Episodes Route (Blocking episode creation)

**File:** `backend/src/routes/admin/episodes.ts`

**Problem:** Missing `slug` column, wrong field names

**Fix Line ~140:**
```typescript
// ADD after title validation:
body('slug').optional().trim(),
```

**Fix Line ~175:**
```typescript
// ADD slug generation:
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
```

**Fix Line ~185:**
```typescript
// CHANGE FROM:
INSERT INTO episodes (
  show_id, title, description, episode_number, audio_url, 
  duration, published_at, thumbnail_url, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())

// CHANGE TO:
INSERT INTO episodes (
  show_id, title, slug, description, audio_url, 
  duration_seconds, published_at, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
```

**Fix Line ~190:**
```typescript
// CHANGE FROM:
[show_id, title, description, episode_number || null, audio_url, duration || null, published_at || null, thumbnail_url || null]

// CHANGE TO:
[show_id, title, slug, description, audio_url, duration || null, published_at || null]
```

---

### 3. CRITICAL: Fix Resources Route (500 error - column doesn't exist)

**File:** `backend/src/routes/admin/resources.ts`

**Problem:** Using `file_type` and `file_size` but database has `resource_type` and `file_size_bytes`

**Fix Line ~130:**
```typescript
// CHANGE FROM:
body('file_type').isIn(['pdf', 'doc', 'docx', ...]),
body('file_size').optional().isInt({ min: 0 }),

// CHANGE TO:
body('resource_type').isIn(['pdf', 'doc', 'docx', ...]),
body('file_size_bytes').optional().isInt({ min: 0 }),
```

**Fix Line ~150:**
```typescript
// ADD slug generation:
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
```

**Fix Line ~155:**
```typescript
// CHANGE FROM:
const { title, description, file_url, file_type, file_size, category } = req.body;

// CHANGE TO:
const { title, description, file_url, resource_type, file_size_bytes, category } = req.body;
```

**Fix Line ~160:**
```typescript
// CHANGE FROM:
INSERT INTO resources (
  title, description, file_url, file_type, file_size, category, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())

// CHANGE TO:
INSERT INTO resources (
  title, slug, description, resource_type, file_url, file_size_bytes, category, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
```

**Fix Line ~165:**
```typescript
// CHANGE FROM:
[title, description, file_url, file_type, file_size || null, category || null]

// CHANGE TO:
[title, slug, description, resource_type, file_url, file_size_bytes || null, category || null]
```

---

## After Fixing

The backend will automatically restart (ts-node-dev watches for changes).

Test each section:
1. Shows - Try creating a show
2. Episodes - Try creating an episode
3. Resources - Try creating a resource

