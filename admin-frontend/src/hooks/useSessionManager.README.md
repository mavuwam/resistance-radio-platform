# useSessionManager Hook

## Purpose

Manages JWT session expiry detection, warning display, and session extension for the admin portal.

## Features

- Automatically decodes JWT token to extract expiry time
- Shows warning modal 5 minutes before session expires
- Displays countdown timer in warning modal
- Provides "Stay Logged In" button to extend session
- Automatically logs out user when session expires
- Stores return URL before logout for post-login redirect

## Usage

```typescript
import { useSessionManager } from '../hooks/useSessionManager';

function MyComponent() {
  const { 
    showWarning,        // Boolean: whether to show warning modal
    timeUntilExpiry,    // Number: milliseconds until expiry
    extendSession,      // Function: extend the session
    dismissWarning,     // Function: dismiss warning without extending
    getAndClearReturnUrl // Function: get stored return URL
  } = useSessionManager();

  return (
    <>
      {/* Your component content */}
      
      <SessionExpiryWarning
        isOpen={showWarning}
        timeUntilExpiry={timeUntilExpiry}
        onExtendSession={extendSession}
        onLogoutNow={handleLogout}
      />
    </>
  );
}
```

## Implementation Details

### Token Decoding

The hook decodes the JWT token to extract the `exp` (expiry) field:
- Splits token into parts
- Base64 decodes the payload
- Parses JSON to get expiry timestamp
- Converts Unix timestamp to milliseconds

### Timer Management

The hook manages three timers:
1. **Warning Timer**: Triggers 5 minutes before expiry
2. **Expiry Timer**: Triggers at exact expiry time
3. **Update Interval**: Updates countdown every second when warning is shown

### Return URL Storage

Before logout, the current URL is stored in localStorage with key `admin_return_url`. This allows redirecting back to the original page after re-login.

### Session Extension

Currently, the `extendSession` function dismisses the warning. When a backend refresh endpoint is available at `/api/auth/refresh`, it should:
1. Call the endpoint to get a new token
2. Update token in localStorage and axios headers
3. Reset timers with new expiry time

## Backend Integration

### Required Backend Endpoint

```typescript
POST /api/auth/refresh
Authorization: Bearer <current-token>

Response:
{
  token: string,      // New JWT with extended expiry
  user: User          // User object
}
```

### Implementation Notes

- The refresh endpoint should validate the current token
- Issue a new token with extended expiry (e.g., +30 minutes)
- Return the same user object
- Handle cases where token is already expired (return 401)

## Accessibility

- Warning modal has proper ARIA attributes
- Focus is automatically set to "Stay Logged In" button
- Keyboard navigation works (Tab, Enter, Escape)
- Screen reader announces warning message

## Security Considerations

- Token is decoded client-side only for expiry time
- No sensitive data is exposed in the token payload
- Automatic logout ensures expired sessions cannot be used
- Return URL is validated to prevent open redirects
