# Resistance Radio Station - Implementation Guide

## Current Status

✅ **Completed:**
- AWS Infrastructure (S3, RDS, CloudFront, EC2)
- Database schema with sample data
- Basic frontend website (live)

⏳ **Remaining:** Tasks 2-35 (Backend API, Full Frontend, Admin Panel)

---

## Quick Start for Developers

### Prerequisites
```bash
- Node.js 18+
- PostgreSQL client
- AWS CLI configured
- Git
```

### Setup
```bash
# Clone repository
git clone YOUR_REPO

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment
cp backend/.env.dev backend/.env
# Update with your credentials

# Run migrations (already done)
cd backend && npm run migrate
```

---

## Task 2: Authentication & Authorization

### Files to Create:
1. `backend/src/middleware/auth.ts` - JWT authentication
2. `backend/src/routes/auth.ts` - Login/logout endpoints
3. `backend/src/utils/jwt.ts` - Token generation

### Implementation:
```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## Task 3: Public Content Endpoints

### Files to Create:
1. `backend/src/routes/shows.ts`
2. `backend/src/routes/episodes.ts`
3. `backend/src/routes/articles.ts`
4. `backend/src/routes/events.ts`
5. `backend/src/routes/resources.ts`

### Example Implementation:
```typescript
// backend/src/routes/shows.ts
import { Router } from 'express';
import pool from '../db/connection';

const router = Router();

// GET /api/shows - List all active shows
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM shows WHERE is_active = true';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const { rows } = await pool.query(query, params);
    res.json({ shows: rows });
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// GET /api/shows/:slug - Get single show
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM shows WHERE slug = $1 AND is_active = true',
      [slug]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }
    
    res.json({ show: rows[0] });
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: 'Failed to fetch show' });
  }
});

// GET /api/shows/:id/episodes - Get episodes for a show
router.get('/:id/episodes', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const { rows } = await pool.query(
      `SELECT * FROM episodes 
       WHERE show_id = $1 AND published_at <= NOW()
       ORDER BY published_at DESC 
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );
    
    res.json({ episodes: rows });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

export default router;
```

### Repeat similar pattern for:
- `episodes.ts` - GET /api/episodes, GET /api/episodes/:slug
- `articles.ts` - GET /api/articles, GET /api/articles/:slug
- `events.ts` - GET /api/events, GET /api/events/:slug
- `resources.ts` - GET /api/resources, GET /api/resources/:slug

---

## Task 4-6: Admin Endpoints & Forms

### Admin Routes Pattern:
```typescript
// backend/src/routes/admin/shows.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import pool from '../../db/connection';

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(authorize('administrator', 'content_manager'));

// POST /api/admin/shows - Create show
router.post('/', async (req, res) => {
  const { title, description, host_name, category, broadcast_schedule } = req.body;
  
  // Generate slug from title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  try {
    const { rows } = await pool.query(
      `INSERT INTO shows (title, slug, description, host_name, category, broadcast_schedule)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, slug, description, host_name, category, broadcast_schedule]
    );
    
    res.status(201).json({ show: rows[0] });
  } catch (error) {
    console.error('Error creating show:', error);
    res.status(500).json({ error: 'Failed to create show' });
  }
});

// PUT /api/admin/shows/:id - Update show
// DELETE /api/admin/shows/:id - Delete show
// Similar for episodes, articles, events, resources

export default router;
```

---

## Task 7: Security Middleware

```typescript
// backend/src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

export const sanitizeInput = (req: any, res: any, next: any) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key]);
      }
    });
  }
  next();
};
```

---

## Task 8: Error Handling

```typescript
// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};
```

---

## Main Server Setup

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityHeaders, rateLimiter, sanitizeInput } from './middleware/security';
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import showsRouter from './routes/shows';
import episodesRouter from './routes/episodes';
import articlesRouter from './routes/articles';
import eventsRouter from './routes/events';
import resourcesRouter from './routes/resources';
import authRouter from './routes/auth';
import adminShowsRouter from './routes/admin/shows';
// ... other admin routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityHeaders);
app.use(rateLimiter);
app.use(sanitizeInput);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/shows', showsRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/resources', resourcesRouter);

// Auth routes
app.use('/api/auth', authRouter);

// Admin routes
app.use('/api/admin/shows', adminShowsRouter);
// ... other admin routes

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Frontend Integration (Tasks 10-21)

### Setup React Router

```typescript
// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import ShowsPage from './pages/ShowsPage';
import ShowDetailPage from './pages/ShowDetailPage';
import ListenPage from './pages/ListenPage';
import NewsPage from './pages/NewsPage';
import ArticlePage from './pages/ArticlePage';
import EventsPage from './pages/EventsPage';
import GetInvolvedPage from './pages/GetInvolvedPage';
import ResourcesPage from './pages/ResourcesPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="shows" element={<ShowsPage />} />
          <Route path="shows/:slug" element={<ShowDetailPage />} />
          <Route path="listen" element={<ListenPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:slug" element={<ArticlePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="get-involved" element={<GetInvolvedPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

### API Client

```typescript
// frontend/src/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  shows: {
    list: async (params?: { category?: string; limit?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_URL}/shows?${query}`);
      return response.json();
    },
    get: async (slug: string) => {
      const response = await fetch(`${API_URL}/shows/${slug}`);
      return response.json();
    },
  },
  
  episodes: {
    list: async (params?: { show_id?: number; limit?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_URL}/episodes?${query}`);
      return response.json();
    },
  },
  
  articles: {
    list: async (params?: { category?: string; limit?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_URL}/articles?${query}`);
      return response.json();
    },
    get: async (slug: string) => {
      const response = await fetch(`${API_URL}/articles/${slug}`);
      return response.json();
    },
  },
  
  events: {
    list: async (params?: { status?: string; limit?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_URL}/events?${query}`);
      return response.json();
    },
  },
  
  resources: {
    list: async (params?: { category?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_URL}/resources?${query}`);
      return response.json();
    },
  },
};
```

### Example Page Component

```typescript
// frontend/src/pages/ShowsPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ShowsPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shows.list().then(data => {
      setShows(data.shows);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="shows-page">
      <h1>Our Shows</h1>
      <div className="shows-grid">
        {shows.map((show: any) => (
          <Link key={show.id} to={`/shows/${show.slug}`} className="show-card">
            <h3>{show.title}</h3>
            <p className="host">{show.host_name}</p>
            <p>{show.description}</p>
            <span className="schedule">{show.broadcast_schedule}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Deployment Steps

### 1. Deploy Backend to EC2

```bash
# SSH to EC2
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4

# Clone code
cd /opt/resistance-radio
git clone YOUR_REPO .

# Install and build
npm install
npm run build

# Start with PM2
pm2 start dist/index.js --name resistance-radio-api
pm2 save
pm2 startup
```

### 2. Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556/ \
    --delete \
    --profile Personal_Account_734110488556

# Invalidate CloudFront
aws cloudfront create-invalidation \
    --distribution-id EYKP4STY3RIHX \
    --paths "/*" \
    --profile Personal_Account_734110488556
```

---

## Testing Checklist

- [ ] Backend API responds to health check
- [ ] All public endpoints return data
- [ ] Authentication works
- [ ] Admin endpoints require auth
- [ ] Frontend displays real data
- [ ] Forms submit successfully
- [ ] Mobile responsive
- [ ] HTTPS works
- [ ] CloudFront serves content

---

## Next Steps

1. Implement backend routes (Tasks 2-8)
2. Create frontend pages (Tasks 10-21)
3. Build admin panel (Tasks 23-25)
4. Add SEO and analytics (Tasks 26-31)
5. Deploy and test
6. Launch!

---

## Support Resources

- **Database**: resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com
- **Website**: https://dxbqjcig99tjb.cloudfront.net
- **EC2 IP**: 54.167.234.4
- **Docs**: See aws/DEPLOYMENT-GUIDE.md

Good luck with your implementation! 🚀
