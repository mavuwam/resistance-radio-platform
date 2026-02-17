# Frontend Security Implementation Guide

This document outlines the security measures implemented in the frontend application.

## 🔒 Security Features Implemented

### 1. Content Security Policy (CSP)

**Location**: `frontend/index.html`

Implemented strict CSP headers to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  connect-src 'self' https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com;
  ...
" />
```

**What it does**:
- Restricts resource loading to trusted sources
- Prevents inline script execution (except where explicitly allowed)
- Blocks unauthorized API connections
- Prevents clickjacking with `frame-ancestors 'none'`

### 2. Security Headers

**Location**: `frontend/index.html`

```html
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="DENY" />
<meta http-equiv="X-XSS-Protection" content="1; mode=block" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
```

**What they do**:
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: Enables browser XSS filter
- `Referrer-Policy`: Controls referrer information

### 3. Input Sanitization

**Location**: `frontend/src/utils/security.ts`

Comprehensive input sanitization utilities:

```typescript
// HTML sanitization
sanitizeHtml(html: string): string

// URL validation
sanitizeUrl(url: string): string

// Search query sanitization
sanitizeSearchQuery(query: string): string

// Email validation
isValidEmail(email: string): boolean

// Password strength validation
validatePasswordStrength(password: string)
```

**Usage Example**:
```typescript
import { sanitizeHtml, sanitizeUrl } from '../utils/security';

const cleanHtml = sanitizeHtml(userInput);
const safeUrl = sanitizeUrl(externalLink);
```

### 4. API Security

**Location**: `frontend/src/services/api.ts`

Enhanced API client with security features:

- **CSRF Token Management**: Automatic token handling
- **Request Timeout**: 30-second timeout to prevent hanging requests
- **Credentials**: `withCredentials: true` for secure cookie handling
- **Request ID**: Unique ID for request tracking
- **Auto-logout**: Clears auth data on 401 responses
- **Rate Limit Handling**: Warns on 429 responses

```typescript
// Request interceptor adds security headers
api.interceptors.request.use((config) => {
  config.headers['X-CSRF-Token'] = sessionStorage.getItem('csrf-token');
  config.headers['X-Request-ID'] = generateSecureToken();
  return config;
});
```

### 5. Security Context

**Location**: `frontend/src/contexts/SecurityContext.tsx`

App-wide security features:

- **Clickjacking Prevention**: Detects and prevents iframe embedding
- **Secure Unload**: Clears sensitive data on page unload
- **Rate Limiting**: Client-side rate limiting (5 attempts/minute)
- **HTTPS Enforcement**: Warns if not using HTTPS in production

**Usage Example**:
```typescript
import { useSecurity } from '../contexts/SecurityContext';

const { checkRateLimit } = useSecurity();

if (!checkRateLimit('login-attempt')) {
  alert('Too many attempts. Please try again later.');
  return;
}
```

### 6. Secure Storage

**Location**: `frontend/src/utils/security.ts`

Wrapper for localStorage with error handling:

```typescript
import { secureStorage } from '../utils/security';

// Safe storage operations
secureStorage.setItem('key', 'value');
const value = secureStorage.getItem('key');
secureStorage.removeItem('key');
```

### 7. File Upload Validation

**Location**: `frontend/src/utils/security.ts`

Validates file uploads before sending to server:

```typescript
import { validateFileUpload } from '../utils/security';

const result = validateFileUpload(
  file,
  ['image/jpeg', 'image/png'],
  5 // 5MB max
);

if (!result.valid) {
  alert(result.error);
  return;
}
```

## 🛡️ Security Best Practices

### For Developers

1. **Always Sanitize User Input**
   ```typescript
   import { sanitizeHtml, escapeHtml } from '../utils/security';
   
   // For HTML content
   const clean = sanitizeHtml(userInput);
   
   // For text display
   const escaped = escapeHtml(userText);
   ```

2. **Validate URLs Before Use**
   ```typescript
   import { sanitizeUrl } from '../utils/security';
   
   const safeUrl = sanitizeUrl(externalLink);
   <a href={safeUrl}>Link</a>
   ```

3. **Use Rate Limiting for Sensitive Actions**
   ```typescript
   const { checkRateLimit } = useSecurity();
   
   const handleLogin = () => {
     if (!checkRateLimit('login')) {
       return; // Too many attempts
     }
     // Proceed with login
   };
   ```

4. **Validate Passwords**
   ```typescript
   import { validatePasswordStrength } from '../utils/security';
   
   const result = validatePasswordStrength(password);
   if (!result.valid) {
     setErrors(result.errors);
     return;
   }
   ```

5. **Mark Sensitive Content**
   ```tsx
   <div className="sensitive-content">
     {/* This content is protected from right-click and drag */}
   </div>
   ```

## 🚨 Security Checklist

### Before Deployment

- [ ] CSP headers configured correctly
- [ ] All external URLs whitelisted in CSP
- [ ] HTTPS enforced in production
- [ ] Sensitive data cleared on logout
- [ ] File upload validation in place
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info
- [ ] Authentication tokens stored securely
- [ ] CORS configured properly on backend

### Regular Maintenance

- [ ] Review and update CSP policy
- [ ] Audit third-party dependencies
- [ ] Check for security vulnerabilities (`npm audit`)
- [ ] Review authentication flows
- [ ] Test rate limiting effectiveness
- [ ] Verify HTTPS certificate validity
- [ ] Review error logs for security issues

## 🔍 Testing Security

### Manual Testing

1. **Test CSP**:
   - Open browser console
   - Look for CSP violation warnings
   - Verify blocked resources are intentional

2. **Test XSS Prevention**:
   ```javascript
   // Try injecting script in search
   <script>alert('XSS')</script>
   // Should be sanitized
   ```

3. **Test Clickjacking Protection**:
   - Try embedding site in iframe
   - Should be blocked or redirected

4. **Test Rate Limiting**:
   - Attempt rapid login attempts
   - Should be blocked after limit

### Automated Testing

```bash
# Security audit
npm audit

# Check for vulnerabilities
npm audit fix

# Run security-focused tests
npm test -- --testPathPattern=security
```

## 📊 Security Monitoring

### What to Monitor

1. **Failed Authentication Attempts**
   - Track in analytics
   - Alert on unusual patterns

2. **CSP Violations**
   - Monitor browser console
   - Set up CSP reporting endpoint

3. **Rate Limit Triggers**
   - Log rate limit hits
   - Investigate patterns

4. **Suspicious Activity**
   - Multiple failed logins
   - Unusual API patterns
   - Unexpected error rates

## 🆘 Incident Response

### If Security Issue Detected

1. **Immediate Actions**:
   - Document the issue
   - Assess impact
   - Notify team

2. **Containment**:
   - Disable affected features if needed
   - Rotate compromised credentials
   - Clear affected sessions

3. **Investigation**:
   - Review logs
   - Identify attack vector
   - Assess data exposure

4. **Resolution**:
   - Deploy security patch
   - Update security measures
   - Document lessons learned

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Security Checklist](https://github.com/virajkulkarni14/WebDeveloperSecurityChecklist)

## 📝 Security Updates Log

| Date | Update | Impact |
|------|--------|--------|
| 2026-02-17 | Initial security implementation | High |
| - | CSP headers added | High |
| - | Input sanitization utilities | High |
| - | API security enhancements | Medium |
| - | Security context provider | Medium |

---

**Last Updated**: February 17, 2026  
**Security Contact**: [Your Security Team Email]  
**Report Vulnerabilities**: [Security Report Email]
