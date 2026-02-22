# Design Document: Content Protection and Recovery System

## Overview

The Content Protection and Recovery System introduces two complementary safety mechanisms for the Zimbabwe Voice admin portal: a trash/recycle bin system for soft deletion with recovery capabilities, and a protected content flag system to prevent accidental deletion of critical content.

This design transforms the current hard-delete operations (immediate permanent removal via `DELETE FROM` queries) into a soft-delete system where content is marked as deleted but remains recoverable for a retention period. Additionally, it introduces role-based protection flags that prevent regular admins from deleting seed or critical content while allowing super admins full control.

The system addresses three key pain points:
1. Accidental deletions with no recovery mechanism
2. Lack of protection for critical seed content
3. No audit trail for deletion operations

The implementation leverages PostgreSQL's timestamp and boolean columns for state tracking, Express.js middleware for role-based access control, and React components for intuitive trash management and protection UI.

## Architecture

### System Components

The system consists of four primary layers:

1. **Database Layer**: Schema modifications to support soft deletion and protection flags
2. **Backend API Layer**: New endpoints and modified query logic for trash operations
3. **Scheduled Jobs Layer**: Automated cleanup process for expired trash items
4. **Frontend UI Layer**: Admin interface components for trash view and protection management

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin User Action                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐            ┌────────▼────────┐
        │  Delete Content │            │ Protect Content │
        │   (Soft Delete) │            │  (Toggle Flag)  │
        └───────┬────────┘            └────────┬────────┘
                │                               │
        ┌───────▼────────────────────────┐     │
        │  Check Protection Status       │◄────┘
        │  - Protected? Check role       │
        │  - Super admin? Allow          │
        │  - Regular admin? Block        │
        └───────┬────────────────────────┘
                │
        ┌───────▼────────────────────────┐
        │  Update Database               │
        │  - Set deleted_at = NOW()      │
        │  - Set deleted_by = user_id    │
        │  - Keep all data intact        │
        └───────┬────────────────────────┘
                │
        ┌───────▼────────────────────────┐
        │  Audit Logging                 │
        │  - Log action with Winston     │
        │  - Record user, content, time  │
        └────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Trash View & Recovery                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────▼───────────────────────┐
        │  Query Soft-Deleted Items                     │
        │  - WHERE deleted_at IS NOT NULL               │
        │  - ORDER BY deleted_at DESC                   │
        │  - LIMIT 5 per content type                   │
        └───────────────────────┬───────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐            ┌────────▼────────┐
        │ Restore Content │            │ View Trash List │
        └───────┬────────┘            └─────────────────┘
                │
        ┌───────▼────────────────────────┐
        │  Update Database               │
        │  - SET deleted_at = NULL       │
        │  - SET deleted_by = NULL       │
        │  - Content becomes visible     │
        └────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Automated Cleanup Job                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────▼───────────────────────┐
        │  Daily Cron Job (runs at 2 AM)                │
        │  - Find items deleted > 30 days (regular)     │
        │  - Find items deleted > 60 days (protected)   │
        └───────────────────────┬───────────────────────┘
                                │
        ┌───────────────────────▼───────────────────────┐
        │  Permanent Deletion                           │
        │  - DELETE FROM table WHERE id = ...           │
        │  - Delete associated S3 files                 │
        │  - Log permanent deletion                     │
        └───────────────────────────────────────────────┘
```

### Role-Based Access Control

The system enforces different permissions based on user roles:

| Action | Regular Admin | Super Admin |
|--------|--------------|-------------|
| View content | ✓ | ✓ |
| Edit content | ✓ | ✓ |
| Delete unprotected content | ✓ | ✓ |
| Delete protected content | ✗ | ✓ |
| Mark content as protected | ✗ | ✓ |
| Unmark content as protected | ✗ | ✓ |
| View trash | ✓ | ✓ |
| Restore from trash | ✓ | ✓ |

## Components and Interfaces

### Database Schema Changes

#### Schema Migration

A new migration file will add three columns to all content tables (articles, shows, episodes, events, resources):

```sql
-- Migration: add_soft_delete_and_protection.sql

-- Add soft delete columns
ALTER TABLE articles ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE articles ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN protected BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE shows ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE shows ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE shows ADD COLUMN protected BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE episodes ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE episodes ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE episodes ADD COLUMN protected BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE events ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE events ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN protected BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE resources ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE resources ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE resources ADD COLUMN protected BOOLEAN DEFAULT false NOT NULL;

-- Create indexes for efficient queries
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_articles_protected ON articles(protected) WHERE protected = true;

CREATE INDEX idx_shows_deleted_at ON shows(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_shows_protected ON shows(protected) WHERE protected = true;

CREATE INDEX idx_episodes_deleted_at ON episodes(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_episodes_protected ON episodes(protected) WHERE protected = true;

CREATE INDEX idx_events_deleted_at ON events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_events_protected ON events(protected) WHERE protected = true;

CREATE INDEX idx_resources_deleted_at ON resources(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_resources_protected ON resources(protected) WHERE protected = true;
```

#### Column Specifications

- `deleted_at`: TIMESTAMP, nullable, defaults to NULL. When NULL, content is active. When set, indicates soft deletion timestamp.
- `deleted_by`: INTEGER, nullable, foreign key to users(id) with ON DELETE SET NULL. Records which admin performed the deletion.
- `protected`: BOOLEAN, non-nullable, defaults to false. When true, prevents deletion by regular admins.

#### Partial Indexes

The design uses partial indexes (with WHERE clauses) to optimize queries:
- Deleted items index only includes rows where `deleted_at IS NOT NULL`
- Protected items index only includes rows where `protected = true`

This approach reduces index size and improves query performance since most content is neither deleted nor protected.

### Backend API Components

#### Modified Query Logic

All existing GET endpoints must be updated to exclude soft-deleted items:

**Before:**
```typescript
const result = await pool.query('SELECT * FROM articles WHERE 1=1');
```

**After:**
```typescript
const result = await pool.query('SELECT * FROM articles WHERE deleted_at IS NULL');
```

This change applies to:
- Public API endpoints (frontend/src/services/api.ts consumers)
- Admin list endpoints (GET /api/admin/:contentType)
- Admin detail endpoints (GET /api/admin/:contentType/:id)

#### Modified Delete Endpoints

Current delete endpoints perform hard deletes. These will be converted to soft deletes:

**Before:**
```typescript
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await pool.query('DELETE FROM articles WHERE id = $1', [id]);
  res.status(204).send();
});
```

**After:**
```typescript
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  // Check protection status
  const item = await pool.query(
    'SELECT protected FROM articles WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  
  if (item.rows.length === 0) {
    return res.status(404).json({ error: { message: 'Article not found', code: 'NOT_FOUND' } });
  }
  
  // Check if protected and user is not super admin
  if (item.rows[0].protected && req.user?.role !== 'administrator') {
    return res.status(403).json({ 
      error: { message: 'Cannot delete protected content', code: 'PROTECTED_CONTENT' } 
    });
  }
  
  // Soft delete
  await pool.query(
    'UPDATE articles SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW() WHERE id = $2',
    [req.user?.id, id]
  );
  
  // Audit log
  logger.info('Content soft deleted', {
    contentType: 'article',
    contentId: id,
    userId: req.user?.id,
    userEmail: req.user?.email
  });
  
  res.status(204).send();
});
```

#### New API Endpoints

##### 1. GET /api/admin/trash

Returns soft-deleted items across all content types, limited to 5 most recent per type.

**Request:**
```
GET /api/admin/trash
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "articles": [
    {
      "id": 123,
      "title": "Deleted Article",
      "deleted_at": "2024-01-15T10:30:00Z",
      "deleted_by": 5,
      "deleted_by_email": "admin@example.com",
      "protected": false
    }
  ],
  "shows": [],
  "episodes": [],
  "events": [],
  "resources": []
}
```

**Implementation:**
```typescript
router.get('/trash', authMiddleware, requireRole('content_manager', 'administrator'), 
  async (req: AuthRequest, res: Response) => {
    const contentTypes = ['articles', 'shows', 'episodes', 'events', 'resources'];
    const trash: any = {};
    
    for (const type of contentTypes) {
      const result = await pool.query(`
        SELECT t.*, u.email as deleted_by_email
        FROM ${type} t
        LEFT JOIN users u ON t.deleted_by = u.id
        WHERE t.deleted_at IS NOT NULL
        ORDER BY t.deleted_at DESC
        LIMIT 5
      `);
      trash[type] = result.rows;
    }
    
    res.json(trash);
  }
);
```

##### 2. POST /api/admin/:contentType/:id/restore

Restores a soft-deleted item.

**Request:**
```
POST /api/admin/articles/123/restore
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 123,
  "title": "Restored Article",
  "deleted_at": null,
  "deleted_by": null
}
```

**Implementation:**
```typescript
router.post('/:contentType/:id/restore', authMiddleware, requireRole('content_manager', 'administrator'),
  async (req: AuthRequest, res: Response) => {
    const { contentType, id } = req.params;
    
    // Validate content type
    const validTypes = ['articles', 'shows', 'episodes', 'events', 'resources'];
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({ error: { message: 'Invalid content type', code: 'INVALID_TYPE' } });
    }
    
    // Check if item exists and is deleted
    const item = await pool.query(
      `SELECT * FROM ${contentType} WHERE id = $1 AND deleted_at IS NOT NULL`,
      [id]
    );
    
    if (item.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Deleted item not found', code: 'NOT_FOUND' } });
    }
    
    // Restore
    const result = await pool.query(
      `UPDATE ${contentType} SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    
    // Audit log
    logger.info('Content restored', {
      contentType,
      contentId: id,
      userId: req.user?.id,
      userEmail: req.user?.email
    });
    
    res.json(result.rows[0]);
  }
);
```

##### 3. PATCH /api/admin/:contentType/:id/protect

Marks content as protected (super admin only).

**Request:**
```
PATCH /api/admin/articles/123/protect
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 123,
  "title": "Protected Article",
  "protected": true
}
```

**Implementation:**
```typescript
router.patch('/:contentType/:id/protect', authMiddleware, requireRole('administrator'),
  async (req: AuthRequest, res: Response) => {
    const { contentType, id } = req.params;
    
    // Validate content type
    const validTypes = ['articles', 'shows', 'episodes', 'events', 'resources'];
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({ error: { message: 'Invalid content type', code: 'INVALID_TYPE' } });
    }
    
    // Check if item exists
    const item = await pool.query(
      `SELECT * FROM ${contentType} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    
    if (item.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Content not found', code: 'NOT_FOUND' } });
    }
    
    // Mark as protected
    const result = await pool.query(
      `UPDATE ${contentType} SET protected = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    
    // Audit log
    logger.info('Content protected', {
      contentType,
      contentId: id,
      userId: req.user?.id,
      userEmail: req.user?.email
    });
    
    res.json(result.rows[0]);
  }
);
```

##### 4. PATCH /api/admin/:contentType/:id/unprotect

Removes protection from content (super admin only).

**Request:**
```
PATCH /api/admin/articles/123/unprotect
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 123,
  "title": "Unprotected Article",
  "protected": false
}
```

**Implementation:**
```typescript
router.patch('/:contentType/:id/unprotect', authMiddleware, requireRole('administrator'),
  async (req: AuthRequest, res: Response) => {
    const { contentType, id } = req.params;
    
    // Validate content type
    const validTypes = ['articles', 'shows', 'episodes', 'events', 'resources'];
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({ error: { message: 'Invalid content type', code: 'INVALID_TYPE' } });
    }
    
    // Check if item exists
    const item = await pool.query(
      `SELECT * FROM ${contentType} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    
    if (item.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Content not found', code: 'NOT_FOUND' } });
    }
    
    // Remove protection
    const result = await pool.query(
      `UPDATE ${contentType} SET protected = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    
    // Audit log
    logger.info('Content unprotected', {
      contentType,
      contentId: id,
      userId: req.user?.id,
      userEmail: req.user?.email
    });
    
    res.json(result.rows[0]);
  }
);
```

#### Cleanup Job Implementation

A scheduled job will run daily to permanently delete expired trash items.

**File:** `backend/src/jobs/cleanup-trash.ts`

```typescript
import pool from '../db/connection';
import logger from '../utils/logger';
import { deleteFromS3 } from '../services/upload';

export async function cleanupTrash() {
  logger.info('Starting trash cleanup job');
  
  const contentTypes = ['articles', 'shows', 'episodes', 'events', 'resources'];
  let totalDeleted = 0;
  
  for (const type of contentTypes) {
    try {
      // Find expired items (30 days for regular, 60 days for protected)
      const expiredItems = await pool.query(`
        SELECT id, protected, 
               CASE 
                 WHEN ${type} = 'episodes' THEN audio_url
                 WHEN ${type} = 'articles' THEN featured_image_url
                 WHEN ${type} = 'shows' THEN cover_image_url
                 WHEN ${type} = 'resources' THEN file_url
                 ELSE NULL
               END as file_url
        FROM ${type}
        WHERE deleted_at IS NOT NULL
          AND (
            (protected = false AND deleted_at < NOW() - INTERVAL '30 days')
            OR
            (protected = true AND deleted_at < NOW() - INTERVAL '60 days')
          )
      `);
      
      for (const item of expiredItems.rows) {
        // Delete associated S3 files
        if (item.file_url) {
          try {
            await deleteFromS3(item.file_url);
            logger.info('Deleted S3 file', { url: item.file_url });
          } catch (error) {
            logger.error('Failed to delete S3 file', { url: item.file_url, error });
          }
        }
        
        // Permanently delete from database
        await pool.query(`DELETE FROM ${type} WHERE id = $1`, [item.id]);
        
        logger.info('Permanently deleted content', {
          contentType: type,
          contentId: item.id,
          protected: item.protected
        });
        
        totalDeleted++;
      }
    } catch (error) {
      logger.error('Error cleaning up trash for content type', { type, error });
    }
  }
  
  logger.info('Trash cleanup job completed', { totalDeleted });
}

// Schedule to run daily at 2 AM
import cron from 'node-cron';
cron.schedule('0 2 * * *', cleanupTrash);
```

### Frontend Components

#### 1. TrashView Component

**File:** `admin-frontend/src/pages/AdminTrashPage.tsx`

Displays soft-deleted items with restore functionality.

**Key Features:**
- Tabs for each content type (Articles, Shows, Episodes, Events, Resources)
- Shows last 5 deleted items per type
- Displays deletion date, deleting admin, and protected status
- Restore button with confirmation dialog
- Lock icon for protected items

**Component Structure:**
```typescript
interface TrashItem {
  id: number;
  title: string;
  deleted_at: string;
  deleted_by: number;
  deleted_by_email: string;
  protected: boolean;
  // Content-specific fields
}

interface TrashData {
  articles: TrashItem[];
  shows: TrashItem[];
  episodes: TrashItem[];
  events: TrashItem[];
  resources: TrashItem[];
}

const AdminTrashPage: React.FC = () => {
  const [trashData, setTrashData] = useState<TrashData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('articles');
  const [loading, setLoading] = useState(true);
  
  // Fetch trash data
  // Handle restore with confirmation
  // Display items in table format
  
  return (
    <AdminLayout>
      <div className="trash-page">
        <h1>Trash</h1>
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        <TrashTable 
          items={trashData?.[activeTab] || []} 
          contentType={activeTab}
          onRestore={handleRestore}
        />
      </div>
    </AdminLayout>
  );
};
```

#### 2. ProtectionToggle Component

**File:** `admin-frontend/src/components/ProtectionToggle.tsx`

Toggle button for marking/unmarking content as protected (super admin only).

**Key Features:**
- Only visible to super admins
- Lock icon with toggle state
- Immediate API call on toggle
- Success/error notifications
- Optimistic UI updates with rollback on error

**Component Structure:**
```typescript
interface ProtectionToggleProps {
  contentType: string;
  contentId: number;
  protected: boolean;
  onToggle: (newState: boolean) => void;
}

const ProtectionToggle: React.FC<ProtectionToggleProps> = ({
  contentType,
  contentId,
  protected: isProtected,
  onToggle
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Only show to super admins
  if (user?.role !== 'administrator') {
    return null;
  }
  
  const handleToggle = async () => {
    setLoading(true);
    try {
      const endpoint = isProtected ? 'unprotect' : 'protect';
      await api.patch(`/admin/${contentType}/${contentId}/${endpoint}`);
      onToggle(!isProtected);
      toast.success(`Content ${isProtected ? 'unprotected' : 'protected'}`);
    } catch (error) {
      toast.error('Failed to update protection status');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      className={`protection-toggle ${isProtected ? 'protected' : ''}`}
      title={isProtected ? 'Remove protection' : 'Mark as protected'}
    >
      <LockIcon locked={isProtected} />
      {isProtected ? 'Protected' : 'Unprotected'}
    </button>
  );
};
```

#### 3. ContentTable Modifications

Existing content tables in admin pages need updates:

**Changes:**
- Add lock icon column for protected items
- Disable delete button for protected items (regular admins only)
- Add tooltip explaining protection status
- Include ProtectionToggle component in action column

**Example modification for AdminArticlesPage:**
```typescript
// In the table row rendering
<tr key={article.id}>
  <td>
    {article.protected && (
      <LockIcon title="This content is protected from deletion" />
    )}
    {article.title}
  </td>
  {/* ... other columns ... */}
  <td className="actions">
    <ProtectionToggle 
      contentType="articles"
      contentId={article.id}
      protected={article.protected}
      onToggle={(newState) => updateArticleProtection(article.id, newState)}
    />
    <button 
      onClick={() => handleDelete(article.id)}
      disabled={article.protected && user?.role !== 'administrator'}
      title={article.protected && user?.role !== 'administrator' 
        ? 'Cannot delete protected content' 
        : 'Delete article'}
    >
      Delete
    </button>
  </td>
</tr>
```

#### 4. Navigation Updates

Add "Trash" link to admin navigation menu.

**File:** `admin-frontend/src/components/AdminLayout.tsx`

```typescript
<nav className="admin-nav">
  <Link to="/admin/dashboard">Dashboard</Link>
  <Link to="/admin/articles">Articles</Link>
  <Link to="/admin/shows">Shows</Link>
  <Link to="/admin/episodes">Episodes</Link>
  <Link to="/admin/events">Events</Link>
  <Link to="/admin/resources">Resources</Link>
  <Link to="/admin/trash">Trash</Link> {/* New */}
  <Link to="/admin/submissions">Submissions</Link>
</nav>
```

## Data Models

### Extended Content Models

All content models (Article, Show, Episode, Event, Resource) are extended with three new fields:

```typescript
interface BaseContent {
  id: number;
  // ... existing fields ...
  deleted_at: string | null;  // ISO 8601 timestamp or null
  deleted_by: number | null;  // User ID or null
  protected: boolean;         // Protection flag
}

interface Article extends BaseContent {
  title: string;
  slug: string;
  content: string;
  author_name: string;
  featured_image_url: string | null;
  status: 'draft' | 'published';
  // ... other article fields ...
}

// Similar extensions for Show, Episode, Event, Resource
```

### Trash Item Model

Used in trash view to display deleted items with admin information:

```typescript
interface TrashItem {
  id: number;
  title: string;
  content_type: 'article' | 'show' | 'episode' | 'event' | 'resource';
  deleted_at: string;         // ISO 8601 timestamp
  deleted_by: number;         // User ID
  deleted_by_email: string;   // Admin email (joined from users table)
  protected: boolean;
  // Content-specific preview fields
  excerpt?: string;           // For articles
  host_name?: string;         // For shows
  show_title?: string;        // For episodes
  event_type?: string;        // For events
  resource_type?: string;     // For resources
}
```

### API Response Models

#### Trash Response

```typescript
interface TrashResponse {
  articles: TrashItem[];
  shows: TrashItem[];
  episodes: TrashItem[];
  events: TrashItem[];
  resources: TrashItem[];
}
```

#### Protection Update Response

```typescript
interface ProtectionResponse {
  id: number;
  protected: boolean;
  updated_at: string;
}
```

#### Restore Response

```typescript
interface RestoreResponse {
  id: number;
  deleted_at: null;
  deleted_by: null;
  // ... full content object ...
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Properties 1.2 and 1.3 are subsumed by Property 1.1 (soft delete sets both timestamp and user ID)
- Property 2.6 is identical to Property 2.2 (5 item limit per content type)
- Property 3.4 is identical to Property 3.3 (restore clears deletion metadata)
- Property 5.6 is identical to Property 5.5 (regular admin protection access control)
- Property 10.6 is identical to Property 5.5 (protection endpoint authorization)
- Property 11.4 is identical to Property 4.4 (cleanup logging)

These redundant properties have been consolidated into single, comprehensive properties below.

### Property 1: Soft Delete Preserves Data

*For any* content item (article, show, episode, event, or resource) and any authenticated admin, when the delete endpoint is called, the item should remain in the database with `deleted_at` set to the current timestamp and `deleted_by` set to the admin's user ID.

**Validates: Requirements 1.1, 1.2, 1.3, 1.6**

### Property 2: Soft-Deleted Items Excluded from Public Queries

*For any* content item that has been soft-deleted (deleted_at IS NOT NULL), querying the public API endpoints should not return that item in the results.

**Validates: Requirements 1.4**

### Property 3: Soft-Deleted Items Excluded from Admin List Queries

*For any* content item that has been soft-deleted (deleted_at IS NOT NULL), querying the admin list endpoints should not return that item in the standard results (only in trash endpoint).

**Validates: Requirements 1.5**

### Property 4: Trash View Limits Results

*For any* content type with more than 5 soft-deleted items, the trash endpoint should return only the 5 most recently deleted items (ordered by deleted_at DESC).

**Validates: Requirements 2.2, 2.6**

### Property 5: Trash Items Include Required Metadata

*For any* soft-deleted content item returned by the trash endpoint, the response should include title, content type, deleted_at timestamp, deleted_by user ID, deleted_by_email, and protected flag.

**Validates: Requirements 2.3**

### Property 6: Trash Items Sorted by Deletion Date

*For any* list of trash items of the same content type, the items should be ordered by deleted_at in descending order (most recent first).

**Validates: Requirements 2.4**

### Property 7: Trash Endpoint Groups by Content Type

*For any* trash query, the response should contain separate arrays for each content type (articles, shows, episodes, events, resources).

**Validates: Requirements 2.5**

### Property 8: Restore Clears Deletion Metadata

*For any* soft-deleted content item, calling the restore endpoint should set both deleted_at and deleted_by to NULL.

**Validates: Requirements 3.3, 3.4**

### Property 9: Restored Items Visible in Queries

*For any* content item, the sequence of operations (create → soft delete → restore) should result in the item being visible in standard admin list queries.

**Validates: Requirements 3.5**

### Property 10: Cleanup Deletes Expired Regular Items

*For any* non-protected content item with deleted_at older than 30 days, running the cleanup job should permanently delete the item from the database.

**Validates: Requirements 4.1**

### Property 11: Cleanup Deletes Expired Protected Items

*For any* protected content item with deleted_at older than 60 days, running the cleanup job should permanently delete the item from the database.

**Validates: Requirements 4.2**

### Property 12: Cleanup Logs Permanent Deletions

*For any* content item permanently deleted during cleanup, an audit log entry should be created containing content type, content ID, and original deletion timestamp.

**Validates: Requirements 4.4, 11.4**

### Property 13: Cleanup Deletes Associated S3 Files

*For any* content item with an associated file URL (audio_url, featured_image_url, cover_image_url, file_url) that is permanently deleted during cleanup, the S3 delete function should be called with that file URL.

**Validates: Requirements 4.5**

### Property 14: New Content Defaults to Unprotected

*For any* newly created content item (via POST /api/admin/:contentType), the protected flag should default to false.

**Validates: Requirements 5.2**

### Property 15: Protect Endpoint Sets Flag

*For any* unprotected content item, calling the protect endpoint as a super admin should set the protected flag to true.

**Validates: Requirements 5.3**

### Property 16: Unprotect Endpoint Clears Flag

*For any* protected content item, calling the unprotect endpoint as a super admin should set the protected flag to false.

**Validates: Requirements 5.4**

### Property 17: Protection Round Trip

*For any* content item, the sequence of operations (protect → unprotect) should return the protected flag to false, and (unprotect → protect) should set it to true.

**Validates: Requirements 5.3, 5.4**

### Property 18: Regular Admins Cannot Modify Protection

*For any* content item and any regular admin (role = 'content_manager'), calling the protect or unprotect endpoints should return a 403 Forbidden error.

**Validates: Requirements 5.5, 5.6, 10.6**

### Property 19: Regular Admins Cannot Delete Protected Content

*For any* protected content item and any regular admin (role = 'content_manager'), calling the delete endpoint should return a 403 Forbidden error without modifying the item.

**Validates: Requirements 6.3**

### Property 20: Super Admins Can Delete Protected Content

*For any* protected content item and any super admin (role = 'administrator'), calling the delete endpoint should successfully soft-delete the item (set deleted_at and deleted_by).

**Validates: Requirements 6.5**

### Property 21: All Admins Can Edit Protected Content

*For any* protected content item and any authenticated admin (regardless of role), calling the update endpoint with valid data should successfully update the item.

**Validates: Requirements 6.6**

### Property 22: All Admins Can Publish Protected Content

*For any* protected content item with publish/unpublish endpoints and any authenticated admin (regardless of role), calling the publish or unpublish endpoint should successfully update the item's status.

**Validates: Requirements 6.7**

### Property 23: Unauthenticated Requests Rejected

*For any* trash or protection endpoint, calling the endpoint without a valid JWT token should return a 401 Unauthorized error.

**Validates: Requirements 10.5**

### Property 24: Error Responses Include Correct Status Codes

*For any* API operation that fails due to not found (404), forbidden (403), or server error (500), the response should include the appropriate HTTP status code and an error object with message and code fields.

**Validates: Requirements 10.7**

### Property 25: Soft Delete Operations Logged

*For any* content item that is soft-deleted, an audit log entry should be created containing the admin ID, content type, content ID, and timestamp.

**Validates: Requirements 11.1**

### Property 26: Restore Operations Logged

*For any* content item that is restored from trash, an audit log entry should be created containing the admin ID, content type, content ID, and timestamp.

**Validates: Requirements 11.2**

### Property 27: Protection Operations Logged

*For any* content item that is marked as protected or unprotected, an audit log entry should be created containing the admin ID, content type, content ID, and timestamp.

**Validates: Requirements 11.3**

### Property 28: Migration Preserves Existing Data

*For any* content item existing before the migration, running the schema migration should preserve all existing fields and not delete any rows.

**Validates: Requirements 12.1**

### Property 29: Migration Sets Default Values

*For any* content item existing before the migration, after running the schema migration, the item should have deleted_at = NULL and protected = false.

**Validates: Requirements 12.2, 12.3**

### Property 30: API Response Format Compatibility

*For any* non-trash admin endpoint response, the response should include all fields that existed before the feature implementation, ensuring backward compatibility.

**Validates: Requirements 12.5**

## Error Handling

### Database Errors

**Connection Failures:**
- All database queries wrapped in try-catch blocks
- Connection pool errors logged with Winston
- Return 500 Internal Server Error with generic message to client
- Detailed error logged server-side for debugging

**Query Failures:**
- Invalid SQL syntax caught during development via TypeScript types
- Constraint violations (foreign key, unique) return 409 Conflict
- Not found results return 404 Not Found
- Transaction rollback on multi-step operation failures

**Example:**
```typescript
try {
  const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ 
      error: { message: 'Article not found', code: 'NOT_FOUND' } 
    });
  }
  res.json(result.rows[0]);
} catch (error) {
  logger.error('Database query failed', { error, query: 'SELECT article', id });
  res.status(500).json({ 
    error: { message: 'Failed to fetch article', code: 'DATABASE_ERROR' } 
  });
}
```

### Authorization Errors

**Unauthenticated Requests:**
- JWT middleware validates token before route handler
- Missing or invalid token returns 401 Unauthorized
- Expired token returns 401 with specific error code

**Insufficient Permissions:**
- Role-based middleware checks user role
- Regular admin attempting super admin action returns 403 Forbidden
- Protected content deletion by regular admin returns 403 with specific error code

**Example:**
```typescript
// In delete endpoint
if (item.rows[0].protected && req.user?.role !== 'administrator') {
  logger.warn('Regular admin attempted to delete protected content', {
    userId: req.user?.id,
    contentType,
    contentId: id
  });
  return res.status(403).json({ 
    error: { 
      message: 'Cannot delete protected content. Only super admins can delete protected items.', 
      code: 'PROTECTED_CONTENT' 
    } 
  });
}
```

### Validation Errors

**Input Validation:**
- Express-validator middleware validates request body
- Invalid content type in URL returns 400 Bad Request
- Missing required fields returns 400 with field-specific errors
- Invalid data types returns 400 with validation details

**Example:**
```typescript
router.post('/:contentType/:id/restore', 
  [
    param('contentType').isIn(['articles', 'shows', 'episodes', 'events', 'resources'])
      .withMessage('Invalid content type'),
    param('id').isInt().withMessage('ID must be an integer')
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... proceed with restore
  }
);
```

### S3 Errors

**File Deletion Failures:**
- S3 delete errors during cleanup logged but don't block database deletion
- Retry logic for transient S3 failures (network issues)
- Orphaned S3 files tracked in logs for manual cleanup if needed

**Example:**
```typescript
if (item.file_url) {
  try {
    await deleteFromS3(item.file_url);
    logger.info('Deleted S3 file', { url: item.file_url, contentId: item.id });
  } catch (error) {
    logger.error('Failed to delete S3 file', { 
      url: item.file_url, 
      contentId: item.id, 
      error,
      note: 'Database record deleted, S3 file may be orphaned'
    });
    // Continue with database deletion despite S3 failure
  }
}
```

### Race Conditions

**Concurrent Deletions:**
- Use database transactions for multi-step operations
- Check item existence before each operation
- Handle "already deleted" gracefully (idempotent operations)

**Concurrent Protection Changes:**
- Last write wins for protection flag updates
- No locking required as protection changes are rare
- Audit logs capture all changes for conflict resolution

### Frontend Error Handling

**API Call Failures:**
- Axios interceptors catch network errors
- Display user-friendly error messages via Toast component
- Retry logic for transient failures (network issues)
- Fallback to cached data when appropriate

**Example:**
```typescript
try {
  await api.delete(`/admin/articles/${id}`);
  toast.success('Article deleted successfully');
  refreshList();
} catch (error) {
  if (error.response?.status === 403) {
    toast.error('Cannot delete protected content');
  } else if (error.response?.status === 404) {
    toast.error('Article not found');
  } else {
    toast.error('Failed to delete article. Please try again.');
  }
  logger.error('Delete failed', { error, articleId: id });
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests:** Verify specific examples, edge cases, and error conditions
- Specific API endpoint responses
- UI component rendering
- Error handling scenarios
- Integration between components

**Property-Based Tests:** Verify universal properties across all inputs
- Soft delete behavior across all content types
- Authorization rules for all admin roles
- Data integrity during operations
- Round-trip properties (delete → restore, protect → unprotect)

Together, these approaches provide comprehensive coverage: unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library:** fast-check (already in use for backend and frontend)

**Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each property test references its design document property
- Tag format: `Feature: content-protection-recovery, Property {number}: {property_text}`

**Example:**
```typescript
import fc from 'fast-check';

describe('Content Protection and Recovery', () => {
  // Feature: content-protection-recovery, Property 1: Soft Delete Preserves Data
  it('should preserve data when soft deleting any content item', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          contentType: fc.constantFrom('articles', 'shows', 'episodes', 'events', 'resources'),
          contentId: fc.integer({ min: 1, max: 1000 }),
          adminId: fc.integer({ min: 1, max: 100 })
        }),
        async ({ contentType, contentId, adminId }) => {
          // Create test content
          const content = await createTestContent(contentType, contentId);
          
          // Soft delete
          await softDelete(contentType, contentId, adminId);
          
          // Verify item still exists in database
          const item = await queryDatabase(contentType, contentId);
          expect(item).toBeDefined();
          expect(item.deleted_at).not.toBeNull();
          expect(item.deleted_by).toBe(adminId);
          
          // Cleanup
          await hardDelete(contentType, contentId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Backend Unit Tests

**File:** `backend/src/routes/admin/trash.test.ts`

Test cases:
- GET /api/admin/trash returns correct structure
- GET /api/admin/trash requires authentication
- GET /api/admin/trash limits to 5 items per type
- POST /api/admin/:contentType/:id/restore restores deleted item
- POST /api/admin/:contentType/:id/restore returns 404 for non-existent item
- PATCH /api/admin/:contentType/:id/protect requires super admin role
- PATCH /api/admin/:contentType/:id/protect returns 403 for regular admin
- DELETE with protected content returns 403 for regular admin
- DELETE with protected content succeeds for super admin

**File:** `backend/src/routes/admin/articles.test.ts` (and similar for other content types)

Test cases:
- DELETE endpoint performs soft delete instead of hard delete
- GET endpoint excludes soft-deleted items
- Soft delete records admin ID and timestamp
- Protected content cannot be deleted by regular admin

**File:** `backend/src/jobs/cleanup-trash.test.ts`

Test cases:
- Cleanup deletes items older than 30 days (regular)
- Cleanup deletes items older than 60 days (protected)
- Cleanup preserves items within retention period
- Cleanup logs permanent deletions
- Cleanup calls S3 delete for items with files
- Cleanup handles S3 errors gracefully

### Backend Property-Based Tests

**File:** `backend/src/routes/admin/trash.property.test.ts`

Property tests for:
- Property 1: Soft Delete Preserves Data
- Property 2: Soft-Deleted Items Excluded from Public Queries
- Property 3: Soft-Deleted Items Excluded from Admin List Queries
- Property 8: Restore Clears Deletion Metadata
- Property 9: Restored Items Visible in Queries
- Property 17: Protection Round Trip
- Property 18: Regular Admins Cannot Modify Protection
- Property 19: Regular Admins Cannot Delete Protected Content
- Property 20: Super Admins Can Delete Protected Content

**Generators:**
```typescript
// Content type generator
const contentTypeArb = fc.constantFrom('articles', 'shows', 'episodes', 'events', 'resources');

// Admin role generator
const adminRoleArb = fc.constantFrom('content_manager', 'administrator');

// Content item generator
const contentItemArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  title: fc.string({ minLength: 1, maxLength: 255 }),
  protected: fc.boolean(),
  deleted_at: fc.option(fc.date(), { nil: null })
});

// Admin user generator
const adminUserArb = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  email: fc.emailAddress(),
  role: adminRoleArb
});
```

### Frontend Unit Tests

**File:** `admin-frontend/src/pages/AdminTrashPage.test.tsx`

Test cases:
- Renders trash view with tabs
- Fetches trash data on mount
- Displays trash items in table
- Shows restore button for each item
- Restore button triggers confirmation dialog
- Successful restore removes item from trash
- Failed restore shows error message
- Displays lock icon for protected items

**File:** `admin-frontend/src/components/ProtectionToggle.test.tsx`

Test cases:
- Only renders for super admins
- Does not render for regular admins
- Displays correct icon based on protected state
- Clicking toggle calls API endpoint
- Successful toggle updates UI state
- Failed toggle shows error and reverts state
- Disabled state during API call

**File:** `admin-frontend/src/pages/AdminArticlesPage.test.tsx` (and similar for other content types)

Test cases:
- Delete button disabled for protected content (regular admin)
- Delete button enabled for protected content (super admin)
- Lock icon displayed for protected items
- Protection toggle visible to super admins only

### Frontend Property-Based Tests

**File:** `admin-frontend/src/components/ProtectionToggle.property.test.tsx`

Property tests for:
- Property 17: Protection Round Trip (UI state)
- Toggle state consistency across multiple clicks
- Optimistic UI updates with rollback on error

**Generators:**
```typescript
// Content state generator
const contentStateArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  protected: fc.boolean(),
  contentType: fc.constantFrom('articles', 'shows', 'episodes', 'events', 'resources')
});

// User role generator
const userRoleArb = fc.constantFrom('content_manager', 'administrator');
```

### Integration Tests

**File:** `backend/src/integration/trash-workflow.test.ts`

End-to-end workflow tests:
- Create content → soft delete → view in trash → restore → verify visible
- Create content → protect → attempt delete as regular admin → verify blocked
- Create content → protect → delete as super admin → verify soft deleted
- Create content → soft delete → wait 30 days → run cleanup → verify permanently deleted

### Migration Tests

**File:** `backend/src/db/migrations/add_soft_delete_and_protection.test.ts`

Test cases:
- Migration adds all required columns
- Migration creates all required indexes
- Migration preserves existing data
- Migration sets correct default values
- Migration is reversible (rollback works)

### Manual Testing Checklist

Before deployment, manually verify:
- [ ] Trash view displays deleted items correctly
- [ ] Restore functionality works for all content types
- [ ] Protection toggle only visible to super admins
- [ ] Regular admins cannot delete protected content
- [ ] Super admins can delete protected content
- [ ] Lock icons display correctly
- [ ] Audit logs capture all operations
- [ ] Cleanup job runs successfully
- [ ] S3 files deleted during cleanup
- [ ] API error messages are user-friendly

### Performance Testing

**Load Tests:**
- Trash endpoint with 1000+ deleted items per type
- Cleanup job with 10,000+ expired items
- Concurrent delete operations (100 simultaneous requests)
- Database query performance with partial indexes

**Metrics to Monitor:**
- Trash endpoint response time (target: < 500ms)
- Cleanup job execution time (target: < 5 minutes for 10k items)
- Database query performance (target: < 100ms per query)
- S3 delete operation time (target: < 2 seconds per file)

### Test Coverage Goals

- Backend route handlers: 90%+ line coverage
- Backend business logic: 95%+ line coverage
- Frontend components: 85%+ line coverage
- Property-based tests: All 30 properties implemented
- Integration tests: All critical workflows covered
