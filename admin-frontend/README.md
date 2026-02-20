# Zimbabwe Voice - Admin Portal

Admin CMS portal for managing content on the Zimbabwe Voice platform.

## Features

- Content management for shows, episodes, articles, events, and resources
- User submission moderation
- Secure authentication with JWT
- Role-based access control
- File upload management

## Development

Start the development server:
```bash
npm run dev --workspace=admin-frontend
```

The admin portal will be available at http://localhost:5174

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_API_URL` - Backend API endpoint
- `VITE_SENTRY_DSN` - Sentry error tracking DSN
- `VITE_ENVIRONMENT` - Current environment (development/staging/production)

## Building

Build for production:
```bash
npm run build --workspace=admin-frontend
```

## Testing

Run tests:
```bash
npm run test --workspace=admin-frontend
```

## Deployment

The admin portal is deployed to:
- Production: https://admin.resistanceradiostation.org
- Staging: TBD

Deployment is automated via GitHub Actions on push to main branch.
