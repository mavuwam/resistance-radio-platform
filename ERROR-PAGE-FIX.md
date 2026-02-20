# Error Page Fix - Double /api Issue

## Problem
After deploying the admin login fixes, the production website showed "Something went wrong" error page.

## Root Cause
The `VITE_API_URL` environment variable in `frontend/.env.production` included the `/api` suffix:
```
VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api
```

This caused API requests to have double `/api` in the path:
- Expected: `https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/shows`
- Actual: `https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/api/shows`

## Why This Happened
In `frontend/src/services/api.ts`, the axios instance uses `API_BASE_URL` as the `baseURL`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // ...
});
```

Then API functions append paths like `/shows`, `/admin/articles`, etc.:
```typescript
export const getShows = async () => {
  const response = await api.get('/shows'); // Appends to baseURL
  return response.data.shows || [];
};
```

## Solution
Removed the `/api` suffix from `VITE_API_URL` in `frontend/.env.production`:
```diff
- VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api
+ VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev
```

Now requests correctly go to:
- `https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/shows` ✅
- `https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/admin/articles` ✅

## Verification
Tested the Lambda API endpoints:
```bash
# Health check
curl https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/health
# Response: {"status":"ok","timestamp":"2026-02-20T08:00:02.460Z"}

# Shows endpoint
curl https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/shows
# Response: {"shows":[...]} ✅
```

## Deployment
- **Commit**: b550ee9
- **Message**: "fix: Remove /api suffix from VITE_API_URL to prevent double /api in requests"
- **Status**: Pushed to GitHub, CI/CD pipeline will deploy automatically
- **Pipeline**: ResistanceRadio-Pipeline

## Next Steps

### 1. Wait for Pipeline (5-10 minutes)
Check pipeline status:
```bash
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1 \
  --query 'stageStates[*].[stageName,latestExecution.status]' \
  --output table
```

### 2. Invalidate CloudFront Cache
Clear the cached files:
```bash
aws cloudfront create-invalidation \
  --distribution-id EYKP4STY3RIHX \
  --paths "/*" \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

Or use the script:
```bash
./invalidate-cloudfront.sh
```

### 3. Create Admin User
Run the admin user creation script:
```bash
./create-admin-user.sh
```

Or manually:
```bash
cd backend
export DB_HOST=resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=resistance_radio_dev
export DB_USER=radio_admin
export DB_PASSWORD=ZiPXyCrvsnZwKZV4q80QyWkiA
npm run create-admin
```

### 4. Test the Website
1. Wait 2-3 minutes after CloudFront invalidation
2. Open in incognito/private window: https://resistanceradiostation.org
3. Navigate to different pages (Home, Shows, Articles, Events)
4. Test admin login: https://resistanceradiostation.org/admin/login
   - Email: admin@resistanceradio.org
   - Password: admin123
5. Verify admin pages load without errors

## Timeline
- **Issue reported**: User saw "Something went wrong" error
- **Pipeline check**: Completed successfully (Source + Build stages)
- **Root cause identified**: Double `/api` in API requests
- **Fix applied**: Removed `/api` suffix from VITE_API_URL
- **Fix committed**: b550ee9
- **Fix pushed**: Successfully pushed to GitHub
- **Expected resolution**: 10-15 minutes after push

## Related Files
- `frontend/.env.production` - Fixed environment variable
- `frontend/src/services/api.ts` - Axios instance configuration
- `TROUBLESHOOT-ERROR-PAGE.md` - General troubleshooting guide
- `ADMIN-LOGIN-FIX-SUMMARY.md` - Original login fix summary

## Lessons Learned
1. Environment variables should not include path suffixes when using axios baseURL
2. Always test production builds with actual environment variables
3. CloudFront caching can mask deployment issues - always invalidate after fixes
4. Browser caching can also mask issues - test in incognito mode
