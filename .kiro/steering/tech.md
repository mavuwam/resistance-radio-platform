# Technology Stack

## Architecture

Monorepo with npm workspaces containing separate backend and frontend applications.

## Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: AWS S3 (via @aws-sdk/client-s3)
- **Email**: Nodemailer
- **Logging**: Winston
- **Error Tracking**: Sentry
- **Testing**: Jest with fast-check for property-based testing

### Backend Security

- Helmet for security headers
- CORS with credentials support
- Rate limiting (express-rate-limit)
- Input sanitization (sanitize-html)
- CSRF protection (csurf)
- Compression middleware

## Frontend

- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Video Streaming**: HLS.js
- **SEO**: React Helmet Async
- **Error Tracking**: Sentry
- **Testing**: Jest + React Testing Library + fast-check

### Frontend Features

- Lazy loading for code splitting
- Context API for state management (Auth, AudioPlayer)
- Accessibility-first design with WCAG compliance
- Responsive mobile-friendly UI

## Development Tools

- **Linting**: ESLint with TypeScript plugin
- **Type Checking**: TypeScript 5.3+
- **Dev Server**: ts-node-dev (backend), Vite (frontend)

## Common Commands

### Installation
```bash
npm install                    # Install all workspace dependencies
npm run install:all           # Alternative install command
```

### Development
```bash
npm run dev:backend           # Start backend on port 3000
npm run dev:frontend          # Start frontend on port 5173
```

### Database
```bash
npm run migrate --workspace=backend    # Run database migrations
npm run seed --workspace=backend       # Seed sample data
```

### Testing
```bash
npm test                      # Run all tests
npm run test:backend          # Backend tests only
npm run test:frontend         # Frontend tests only
```

### Building
```bash
npm run build                 # Build all workspaces
npm run build --workspace=backend   # Build backend only
npm run build --workspace=frontend  # Build frontend only
```

### Linting
```bash
npm run lint                  # Lint all workspaces
```

### Production
```bash
npm start --workspace=backend # Start production backend server
```

## Environment Variables

### Backend (.env)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `PORT` (default: 3000)
- `FRONTEND_URL` (for CORS)
- `AWS_*` variables for S3
- `SMTP_*` variables for email
- `SENTRY_DSN` for error tracking

### Frontend (.env)
- `VITE_API_URL` (backend API endpoint)
- `VITE_SENTRY_DSN` (error tracking)

## Deployment

- Backend: Railway, Heroku, or AWS EC2
- Frontend: Vercel, Netlify, or AWS CloudFront + S3
- Database: Railway PostgreSQL, AWS RDS, or managed PostgreSQL
- File Storage: AWS S3
