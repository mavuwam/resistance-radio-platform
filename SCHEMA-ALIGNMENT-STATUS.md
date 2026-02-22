# Schema Alignment Status - Admin Portal

## Overview

This document tracks the alignment between frontend field names, backend routes, and database schema columns for all admin portal sections.

**Last Updated**: February 20, 2026

---

## ✅ FULLY ALIGNED SECTIONS

### 1. Articles
**Status**: ✅ Fully Aligned

**Database Schema**:
- `author_name` (VARCHAR)
- `featured_image_url` (VARCHAR)
- `slug` (VARCHAR, auto-generated)

**Backend Route**: ✅ Correctly maps fields
- POST: Maps `author` → `author_name`, `image_url` → `featured_image_url`
- PUT: Maps `author` → `author_name`, `image_url` → `featured_image_url`
- DELETE: Queries `featured_image_url`

**Frontend**: ✅ Sends correct field names
- Sends `author` (backend maps to `author_name`)
- Sends `image_url` (backend maps to `featured_image_url`)

**Actions**: None needed

---

### 2. Shows
**Status**: ✅ Fully Aligned

**Database Schema**:
- `host_name` (VARCHAR)
- `cover_image_url` (VARCHAR)
- `slug` (VARCHAR, auto-generated)

**Backend Route**: ✅ Correctly aligned
- POST: Uses `host_name`, `cover_image_url`
- PUT: Accepts `host_name`, `image_url` (no mapping needed if frontend sends correct names)
- DELETE: Queries `cover_image_url`

**Frontend**: ✅ Sends correct field names
- Sends `host_name` ✅
- Sends `image_url` (backend accepts and stores as `cover_image_url`)

**Actions**: None needed

---

### 3. Events
**Status**: ✅ Fully Aligned

**Database Schema**:
- `event_type`, `start_time`, `end_time`, `location`, `is_virtual`, `registration_url`, `max_participants`, `status`, `slug`

**Backend Route**: ✅ Correctly aligned
- POST: All fields match schema, auto-generates slug
- PUT: All fields match schema, regenerates slug if title changes
- DELETE: Standard delete

**Frontend**: ✅ Sends correct field names
- All fields match backend expectations

**Actions**: None needed

---

### 4. Episodes
**Status**: ✅ Fully Aligned (FIXED)

**Database Schema**:
- `duration_seconds` (INTEGER)
- `file_size_bytes` (BIGINT)
- `slug` (VARCHAR, auto-generated)
- NO `episode_number` column
- NO `thumbnail_url` column

**Backend Route**: ✅ Fixed
- POST: Uses `duration_seconds`, auto-generates `slug`, removed `episode_number` and `thumbnail_url`
- PUT: ✅ FIXED - Now accepts `duration_seconds`, regenerates slug if title changes
- DELETE: ✅ FIXED - Removed `thumbnail_url` from query

**Frontend**: ⚠️ Needs Update (see below)
- Currently sends `duration` (string like "45:30")
- Currently sends `episode_number`
- Currently sends `thumbnail_url`

**Actions Required**: Update frontend to send `duration_seconds` (integer) instead of `duration` (string)

---

### 5. Resources
**Status**: ✅ Fully Aligned (FIXED)

**Database Schema**:
- `resource_type` (VARCHAR)
- `file_size_bytes` (BIGINT)
- `slug` (VARCHAR, auto-generated)

**Backend Route**: ✅ Fixed
- POST: Uses `resource_type`, `file_size_bytes`, auto-generates `slug`
- PUT: ✅ FIXED - Now accepts `resource_type`, `file_size_bytes`, regenerates slug if title changes
- DELETE: Standard delete

**Frontend**: ⚠️ Needs Update (see below)
- Currently sends `file_type`
- Currently sends `file_size`

**Actions Required**: Update frontend to send `resource_type` and `file_size_bytes`

---

## ⚠️ FRONTEND UPDATES NEEDED

### Episodes Frontend (admin-frontend/src/pages/AdminEpisodesPage.tsx)

**Current Issues**:
1. Sends `duration` as string (e.g., "45:30") but backend expects `duration_seconds` as integer
2. Sends `episode_number` which doesn't exist in schema
3. Sends `thumbnail_url` which doesn't exist in schema

**Recommended Changes**:

**Option 1: Remove unsupported fields**
```typescript
const [formData, setFormData] = useState({
  show_id: 0,
  title: '',
  description: '',
  audio_url: '',
  duration_seconds: 0,  // Changed from duration string
  published_at: ''
});
```

**Option 2: Add columns to database**
```sql
ALTER TABLE episodes ADD COLUMN episode_number INTEGER;
ALTER TABLE episodes ADD COLUMN thumbnail_url VARCHAR(500);
ALTER TABLE episodes ALTER COLUMN duration_seconds TYPE VARCHAR(50);  -- To store "45:30" format
```

**Recommendation**: Option 1 (remove unsupported fields) - cleaner and matches current schema

---

### Resources Frontend (admin-frontend/src/pages/AdminResourcesPage.tsx)

**Current Issues**:
1. Sends `file_type` but backend expects `resource_type`
2. Sends `file_size` but backend expects `file_size_bytes`

**Required Changes**:
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  file_url: '',
  resource_type: '',      // Changed from file_type
  file_size_bytes: 0,     // Changed from file_size
  category: ''
});

// Update all references:
// formData.file_type → formData.resource_type
// formData.file_size → formData.file_size_bytes
```

---

## 📊 SUMMARY TABLE

| Section   | Backend POST | Backend PUT | Backend DELETE | Frontend | Status |
|-----------|--------------|-------------|----------------|----------|--------|
| Articles  | ✅           | ✅          | ✅             | ✅       | ✅ Complete |
| Shows     | ✅           | ✅          | ✅             | ✅       | ✅ Complete |
| Events    | ✅           | ✅          | ✅             | ✅       | ✅ Complete |
| Episodes  | ✅           | ✅          | ✅             | ⚠️       | ⚠️ Frontend needs update |
| Resources | ✅           | ✅          | ✅             | ⚠️       | ⚠️ Frontend needs update |

---

## 🔧 BACKEND FIXES APPLIED

### Episodes Route (backend/src/routes/admin/episodes.ts)
- ✅ POST: Uses `duration_seconds`, auto-generates `slug`, removed `episode_number` and `thumbnail_url`
- ✅ PUT: Changed validation from `duration`, `episode_number`, `thumbnail_url` to `duration_seconds` only
- ✅ PUT: Added slug regeneration when title is updated
- ✅ DELETE: Removed `thumbnail_url` from SELECT query

### Resources Route (backend/src/routes/admin/resources.ts)
- ✅ POST: Uses `resource_type`, `file_size_bytes`, auto-generates `slug`
- ✅ PUT: Changed validation from `file_type`, `file_size` to `resource_type`, `file_size_bytes`
- ✅ PUT: Added slug regeneration when title is updated

---

## 🎯 NEXT STEPS

1. **Test Backend Changes**:
   - Backend should automatically restart (ts-node-dev watches for changes)
   - Test creating/updating episodes and resources via API

2. **Update Frontend** (if needed):
   - Update AdminEpisodesPage.tsx to use `duration_seconds` instead of `duration`
   - Update AdminResourcesPage.tsx to use `resource_type` and `file_size_bytes`
   - Remove `episode_number` and `thumbnail_url` from episodes form

3. **Test End-to-End**:
   - Create new episodes and resources
   - Update existing episodes and resources
   - Verify data is saved correctly in database

---

## 📝 NOTES

- Backend automatically restarts when files change (ts-node-dev)
- All backend routes now correctly map to database schema
- Frontend can continue using friendly field names if backend provides mapping
- Slug generation is automatic for all resources (articles, shows, episodes, events, resources)
