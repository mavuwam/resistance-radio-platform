# Project Structure

## Root Level

```
advocacy-platform/
├── backend/              # Express API server
├── frontend/             # React application
├── aws/                  # AWS deployment scripts and CloudFormation
├── images/               # Static image assets
├── .kiro/                # Kiro configuration and specs
├── package.json          # Root workspace configuration
└── [DOCS].md            # Various documentation files
```

## Backend Structure

```
backend/
├── src/
│   ├── db/              # Database migrations, schema, and seed data
│   ├── middleware/      # Express middleware (auth, security, errorHandler)
│   ├── models/          # Database models (User, Petition, Signature)
│   ├── routes/          # API route handlers
│   │   └── admin/       # Admin-only routes
│   ├── services/        # External services (email, S3, Sentry)
│   ├── utils/           # Utilities (logger, validation, errors)
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript output
├── logs/                # Application logs
└── package.json
```

### Backend Conventions

- Routes are organized by resource (petitions, shows, episodes, etc.)
- Admin routes are in `routes/admin/` subdirectory
- All routes use `/api/` prefix
- Middleware applied in order: security → CORS → parsing → sanitization → rate limiting
- Models use TypeScript interfaces matching database schema
- Services handle external integrations (AWS, email, monitoring)

## Frontend Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   ├── contexts/        # React Context providers (Auth, AudioPlayer)
│   ├── pages/           # Page components (one per route)
│   ├── services/        # API client, analytics, Sentry
│   ├── styles/          # Global styles (accessibility.css)
│   ├── utils/           # Utility functions (accessibility, schema)
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets (logo, robots.txt)
├── dist/                # Build output
└── package.json
```

### Frontend Conventions

- Pages are lazy-loaded for code splitting
- Each page has corresponding `.css` file for styles
- Components wrapped in `PageLayout` for consistent header/footer
- Admin pages wrapped in `AdminLayout` and `ProtectedRoute`
- Context providers at app root (Auth, AudioPlayer)
- API calls centralized in `services/api.ts`

## Database Schema

Core tables:
- `users` - Authentication and authorization
- `shows` - Radio show metadata
- `episodes` - Individual show episodes with audio
- `articles` - News and blog content
- `events` - Community events and activities
- `resources` - Downloadable resources
- `submissions` - User-submitted content
- `live_broadcasts` - Live streaming sessions
- `newsletter_subscribers` - Email list management

All tables include:
- `id` (SERIAL PRIMARY KEY)
- `created_at` and `updated_at` timestamps
- Appropriate indexes for performance

## Configuration Files

- `.eslintrc.js` - ESLint configuration (separate for backend/frontend)
- `tsconfig.json` - TypeScript configuration (separate for backend/frontend)
- `jest.config.js` - Jest test configuration (separate for backend/frontend)
- `.env` - Environment variables (separate for backend/frontend)
- `vite.config.ts` - Vite build configuration (frontend only)

## Testing

- Test files use `.test.ts` or `.test.tsx` extension
- Co-located with source files when possible
- Property-based tests use fast-check library
- Unit tests for business logic, integration tests for API routes
