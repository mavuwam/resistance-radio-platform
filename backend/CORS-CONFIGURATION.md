# CORS Configuration

## Overview

The backend API supports Cross-Origin Resource Sharing (CORS) to allow requests from both the public frontend and admin frontend applications.

## Allowed Origins

The following origins are configured to access the API:

### Development
- `http://localhost:5173` - Public frontend (Vite dev server)
- `http://localhost:5174` - Admin frontend (Vite dev server)

### Production
- `https://resistanceradiostation.org` - Public website
- `https://admin.resistanceradiostation.org` - Admin portal
- CloudFront distribution URLs (as configured)

## Environment Variables

Configure the following environment variables in your `.env` file:

```bash
# Public frontend URL
FRONTEND_URL=http://localhost:5173

# Admin frontend URL
ADMIN_FRONTEND_URL=http://localhost:5174
```

### Production Values

```bash
FRONTEND_URL=https://resistanceradiostation.org
ADMIN_FRONTEND_URL=https://admin.resistanceradiostation.org
```

## CORS Settings

The API is configured with the following CORS settings:

- **Credentials**: Enabled (`credentials: true`)
- **Methods**: All standard HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- **Headers**: All standard headers plus custom headers for authentication

## Security

- CORS origin validation is enforced in production
- Requests from unauthorized origins are logged and blocked
- CSRF tokens are used for additional security on state-changing operations

## Testing CORS

To test CORS configuration:

```bash
# Test from public frontend
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:3000/api/shows

# Test from admin frontend
curl -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  http://localhost:3000/api/admin/articles
```

## Troubleshooting

If you encounter CORS errors:

1. Verify the origin is in the allowed origins list
2. Check that environment variables are set correctly
3. Ensure credentials are included in requests
4. Check browser console for specific CORS error messages
5. Review backend logs for blocked origin warnings

## Adding New Origins

To add a new origin:

1. Add the origin to the `allowedOrigins` array in `backend/src/index.ts`
2. Update this documentation
3. Test the new origin thoroughly
4. Deploy changes to all environments
