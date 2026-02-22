# Schema Alignment Issues - Admin Portal

## Critical Mismatches Found

### 1. Articles Table ✅ FIXED
**Database Schema:**
- `author_name` (VARCHAR)
- `featured_image_url` (VARCHAR)

**Backend Route Expected:**
- `author` → Fixed to map to `author_name`
- `image_url` → Fixed to map to `featured_image_url`
- `thumbnail_url` → Removed (doesn't exist in schema)

**Status:** Fixed in backend/src/routes/admin/articles.ts

---

### 2. Shows Table ❌ MISMATCH
**Database Schema:**
- `host_name` (VARCHAR)
- `host_bio` (TEXT)
- `host_image_url` (VARCHAR)
- `cover_image_url` (VARCHAR)

**Backend Route Expected:**
- `host` → Should be `host_name`
- `image_url` → Should be `cover_image_url`
- `thumbnail_url` → Doesn't exist in schema

**Frontend Expected:**
- Uses `host_name` ✅
- Uses `image_url` and `thumbnail_url` ❌

**Action Required:** Fix shows route and frontend

---

### 3. Episodes Table ❌ MISMATCH
**Database Schema:**
- `duration_seconds` (INTEGER)
- `file_size_bytes` (BIGINT)
- No `thumbnail_url` column
- No `episode_number` column

**Backend Route Expected:**
- `duration` → Should be `duration_seconds`
- `thumbnail_url` → Doesn't exist
- `episode_number` → Doesn't exist

**Frontend Expected:**
- Uses `duration` (string like "45:30") ❌
- Uses `thumbnail_url` ❌
- Uses `episode_number` ❌

**Action Required:** Fix episodes route and frontend, or update schema

---

### 4. Resources Table ❌ MISMATCH
**Database Schema:**
- `resource_type` (VARCHAR)
- `file_size_bytes` (BIGINT)

**Backend Route Expected:**
- `file_type` → Should be `resource_type`
- `file_size` → Should be `file_size_bytes`

**Frontend Expected:**
- Uses `file_type` ❌
- Uses `file_size` ❌

**Action Required:** Fix resources route and frontend

---

### 5. Events Table ✅ ALIGNED
**Database Schema:**
- `event_type`, `start_time`, `end_time`, `location`, `is_virtual`, `registration_url`, `max_participants`, `status`

**Backend Route:** ✅ Correctly aligned
**Frontend:** ✅ Correctly aligned

---

## Recommended Actions

### Option 1: Update Backend Routes (Recommended)
Map frontend field names to database column names in the backend routes:
- Shows: `host` → `host_name`, `image_url` → `cover_image_url`
- Episodes: `duration` → `duration_seconds`, add `episode_number` column or remove from frontend
- Resources: `file_type` → `resource_type`, `file_size` → `file_size_bytes`

### Option 2: Update Database Schema
Add missing columns to match frontend expectations:
- Episodes: Add `episode_number`, `thumbnail_url`, change `duration_seconds` to `duration`
- Shows: Add `thumbnail_url`
- Resources: Rename columns to match frontend

### Option 3: Update Frontend
Change frontend to use exact database column names (not recommended - more changes required)

## Priority Fixes

1. **Shows** - Backend route uses `host` instead of `host_name`
2. **Episodes** - Multiple mismatches (duration, episode_number, thumbnail_url)
3. **Resources** - Field name mismatches (file_type, file_size)

