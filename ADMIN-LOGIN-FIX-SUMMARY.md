# Admin Login Fix Summary

## Issue
Admin portal login was not working - users could not authenticate with valid credentials (admin@resistanceradio.org / admin123).

## Root Causes Identified
1. **localStorage Key Mismatch**: AuthContext stored tokens with key `auth_token` but api.ts retrieved with key `token`
2. **Inconsistent Axios Instances**: AuthContext used direct axios calls while api.ts used a configured instance
3. **Missing Authorization Interceptor**: No automatic token injection in request headers
4. **Manual Header Management**: Every admin API function manually added Authorization headers
5. **Admin User Not Created**: The admin user didn't exist in the Lambda database

## Fixes Implemented

### 1. Standardized localStorage Key (`frontend/src/services/api.ts`)
- Added Authorization header interceptor that reads from `auth_token`
- Fixed 401 interceptor to clear `auth_token` and `auth_user` (not `token`)
- All authentication now uses consistent `auth_token` key

### 2. Consolidated Axios Instance (`frontend/src/contexts/AuthContext.tsx`)
- Removed direct axios imports and API_URL constant
- Imported centralized `api` instance from `services/api.ts`
- Login and register now use `api.post()` instead of `axios.post()`
- Removed manual `axios.defaults.headers.common['Authorization']` management

### 3. Automatic Authorization Headers (`frontend/src/services/api.ts`)
- Added request interceptor that automatically injects `Bearer ${token}` header
- Removed manual token retrieval from ALL admin API functions:
  - Articles (9 functions)
  - Events (5 functions)
  - Resources (5 functions)
  - Episodes (5 functions)
  - Shows (5 functions)
  - File Upload (1 function)
- Total: 30 functions simplified, ~90 lines of code removed

### 4. Environment Configuration
- Verified `frontend/.env.production` has correct Lambda API endpoint
- VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api

## Deployment Status

### Code Changes
✅ Committed and pushed to GitHub (commit: 85e17bf)
✅ CI/CD pipeline automatically triggered
✅ Changes will deploy to:
  - Backend: Lambda function via SAM
  - Frontend: S3 + CloudFront

### Manual Step Required
⚠️ **Admin user needs to be created in the database**

Run this command to create the admin user:
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

## Testing After Deployment

1. **Wait for CI/CD pipeline to complete** (~5-10 minutes)
   - Check CodePipeline: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view

2. **Create admin user** (run the script above)

3. **Test login**:
   - Navigate to: https://resistanceradiostation.org/admin/login
   - Email: admin@resistanceradio.org
   - Password: admin123
   - Should successfully log in and redirect to /admin/dashboard

4. **Test authenticated requests**:
   - Try accessing admin pages (Articles, Events, Resources, etc.)
   - All should load without 401 errors

## Expected Behavior After Fix

✅ Login form submits credentials
✅ Backend validates and returns JWT token + user data
✅ Token stored in localStorage with key `auth_token`
✅ User data stored in localStorage with key `auth_user`
✅ All subsequent API requests automatically include `Authorization: Bearer ${token}` header
✅ Admin pages load successfully
✅ Logout clears all authentication data
✅ 401 responses trigger automatic logout and redirect to login

## Rollback Plan

If issues occur, rollback to previous commit:
```bash
git revert 85e17bf
git push origin main
```

The CI/CD pipeline will automatically deploy the previous version.

## Files Changed
- `frontend/src/services/api.ts` - Added interceptor, removed manual headers
- `frontend/src/contexts/AuthContext.tsx` - Consolidated axios instance usage

## Lines of Code
- Added: ~10 lines (interceptor logic)
- Removed: ~100 lines (manual header management)
- Net: -90 lines (cleaner, more maintainable code)

## Security Improvements
- Centralized token management (single source of truth)
- Automatic token injection (no manual errors)
- Consistent error handling (401 responses)
- Proper cleanup on logout

## Next Steps
1. Monitor CI/CD pipeline completion
2. Run admin user creation script
3. Test login functionality
4. Verify all admin pages work correctly
5. Consider adding automated admin user creation to deployment process
