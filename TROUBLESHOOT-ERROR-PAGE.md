# Troubleshooting "Something went wrong" Error

## Issue
The page is showing an error boundary message: "Something went wrong. We're sorry for the inconvenience. Please try refreshing the page."

## Likely Causes

### 1. CI/CD Pipeline Still Deploying
The changes might still be deploying. Check pipeline status:
- Go to: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view
- Wait for all stages to complete (Source → Build → Deploy)
- Typical deployment time: 5-10 minutes

### 2. Browser Cache
The browser might be using old cached JavaScript files.

**Solution:**
```bash
# Hard refresh the page
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Safari: Cmd+Option+R (Mac)
```

### 3. CloudFront Cache
CloudFront might be serving old cached files.

**Solution - Invalidate CloudFront Cache:**
```bash
aws cloudfront create-invalidation \
  --distribution-id EYKP4STY3RIHX \
  --paths "/*" \
  --profile Personal_Account_734110488556
```

Or via AWS Console:
1. Go to CloudFront console
2. Select distribution EYKP4STY3RIHX
3. Go to "Invalidations" tab
4. Create invalidation for path: `/*`

### 4. Check Browser Console for Errors
Open browser developer tools (F12) and check the Console tab for specific error messages.

Common errors:
- **CORS errors**: Backend not allowing frontend origin
- **Network errors**: API endpoint not reachable
- **JavaScript errors**: Code syntax issues

## Quick Fixes Applied

### Fix 1: API Base URL (Committed: aede155)
Changed the default API_BASE_URL from hardcoded `http://localhost:5000/api` to relative `/api`

This ensures the frontend works in all environments without hardcoded URLs.

### Fix 2: Auth Token Storage (Committed: 85e17bf)
- Standardized localStorage key to `auth_token`
- Added Authorization interceptor
- Consolidated axios instances

## Step-by-Step Recovery

### Step 1: Wait for Pipeline
```bash
# Check if pipeline is complete
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --query 'stageStates[*].[stageName,latestExecution.status]' \
  --output table
```

### Step 2: Clear All Caches
1. **Browser**: Hard refresh (Ctrl+Shift+R)
2. **CloudFront**: Invalidate cache (command above)
3. **Wait**: 2-3 minutes for invalidation to complete

### Step 3: Test in Incognito/Private Window
Open the site in an incognito/private browsing window to bypass all browser caches:
- Chrome: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
- Firefox: Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
- Safari: Cmd+Shift+N (Mac)

### Step 4: Check Specific Endpoints
Test if the API is responding:
```bash
# Test health endpoint
curl https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/health

# Should return: {"status":"ok","timestamp":"..."}
```

```bash
# Test shows endpoint
curl https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/shows

# Should return: {"shows":[...]}
```

## If Error Persists

### Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for red error messages
4. Share the error message for diagnosis

### Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for failed requests (red status codes)
5. Click on failed requests to see details

### Rollback if Necessary
If the issue is critical, rollback to previous version:
```bash
git revert aede155 85e17bf
git push origin main
```

The CI/CD pipeline will automatically deploy the previous working version.

## Expected Timeline

- **Commit pushed**: ✅ Done (aede155)
- **Pipeline triggered**: ✅ Automatic
- **Build stage**: ~3-5 minutes
- **Deploy stage**: ~2-3 minutes
- **CloudFront propagation**: ~2-5 minutes
- **Total**: ~10-15 minutes from push

## Verification Steps

Once pipeline completes:

1. **Clear browser cache** (hard refresh)
2. **Open in incognito window**
3. **Navigate to**: https://resistanceradiostation.org
4. **Check**: Page should load without errors
5. **Test navigation**: Click through different pages
6. **Test admin login**: Go to /admin/login

## Contact Points

If you continue to see errors after:
- ✅ Pipeline completed
- ✅ CloudFront cache invalidated
- ✅ Browser cache cleared
- ✅ Tested in incognito mode

Then share:
1. Browser console error messages
2. Network tab failed requests
3. Which page/URL is showing the error
4. Pipeline execution status

## Quick Status Check

Run this to see current deployment status:
```bash
# Check pipeline
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556

# Check CloudFront distribution
aws cloudfront get-distribution \
  --id EYKP4STY3RIHX \
  --profile Personal_Account_734110488556 \
  --query 'Distribution.Status'
```
