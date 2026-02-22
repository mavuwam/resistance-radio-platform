# Admin Password Management - User Guide

## Overview

This guide explains how to use the admin password management features, including changing your password while logged in and resetting your password if you forget it.

## Features

1. **Change Password** - Update your password while logged in
2. **Forgot Password** - Request a password reset via email
3. **Reset Password** - Complete password reset using emailed link

## Password Requirements

All passwords must meet these security requirements:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one digit (0-9)
- ✅ At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- ✅ Cannot be the same as your email address

## How to Change Your Password (While Logged In)

### Step 1: Navigate to Change Password Page
1. Log in to the admin portal
2. Click the **"Change Password"** button in the top-right user section (above the Logout button)
3. You'll be taken to `/change-password`

### Step 2: Fill Out the Form
1. **Current Password**: Enter your existing password
2. **New Password**: Enter your new password
   - Watch the password strength indicator update in real-time
   - Green checkmarks appear as you meet each requirement
3. **Confirm New Password**: Re-enter your new password

### Step 3: Submit
1. Click **"Change Password"** button
2. Wait for confirmation message
3. You'll remain logged in (session persists)

### Common Errors
- **"Current password is incorrect"**: You entered the wrong current password
- **"Password does not meet requirements"**: Your new password is too weak
- **"Passwords do not match"**: New password and confirmation don't match

## How to Reset Your Password (If Forgotten)

### Step 1: Request Password Reset
1. Go to the admin login page
2. Click **"Forgot your password?"** link below the login button
3. Enter your admin email address
4. Click **"Send Reset Link"**
5. You'll see: "If an account exists with this email, a password reset link has been sent"

**Note**: You'll always see this message, even if the email doesn't exist. This prevents attackers from discovering which emails are registered.

### Step 2: Check Your Email
1. Check your inbox for an email from the system
2. Subject: "Password Reset Request"
3. Click the **"Reset Password"** link in the email
4. The link expires in **1 hour**

**Important**: If you don't receive the email:
- Check your spam/junk folder
- Verify you entered the correct email address
- Wait a few minutes and try again
- Contact your system administrator if issues persist

### Step 3: Set New Password
1. You'll be taken to the password reset page
2. The reset token is automatically extracted from the URL
3. Enter your **new password**
   - Watch the password strength indicator
   - Ensure all requirements are met (green checkmarks)
4. **Confirm new password** by entering it again
5. Click **"Reset Password"**
6. You'll be redirected to the login page with a success message

### Step 4: Log In
1. Use your email and **new password** to log in
2. Your old password no longer works

### Common Errors
- **"Invalid or expired reset token"**: The link expired (1 hour limit) or was already used
  - Request a new password reset link
- **"Password does not meet requirements"**: Your new password is too weak
- **"Passwords do not match"**: New password and confirmation don't match

## Rate Limiting

To prevent abuse, password reset requests are rate limited:
- **Limit**: 3 requests per 15 minutes per email address
- **What happens**: After 3 requests, you'll see an error with a countdown timer
- **Solution**: Wait for the specified time before trying again

Example error message:
```
Too many password reset requests. Please try again in 12 minutes.
```

## Security Features

### Email Notifications
You'll receive email notifications for:
1. **Password Changed**: Confirms successful password change
2. **Password Reset Requested**: Contains the reset link
3. **Password Reset Completed**: Confirms successful password reset

**Security Tip**: If you receive any of these emails but didn't initiate the action, contact your system administrator immediately.

### Single-Use Reset Links
- Each reset link can only be used once
- After you reset your password, the link becomes invalid
- Requesting a new reset link invalidates any previous unused links

### Token Expiration
- Reset links expire after **1 hour**
- After expiration, you must request a new link

### Session Persistence
- Changing your password does NOT log you out
- Your current session remains active
- Other sessions (on other devices) remain active
- If you want to log out all sessions, contact your administrator

## Troubleshooting

### "I can't log in with my new password"
- Verify you're using the correct email address
- Check for typos in your password
- Ensure Caps Lock is off
- Try resetting your password again

### "I'm not receiving password reset emails"
1. Check spam/junk folder
2. Verify the email address is correct
3. Wait 5 minutes (email delivery can be delayed)
4. Check with your email provider for blocking issues
5. Contact your system administrator

### "The reset link doesn't work"
- Check if the link expired (1 hour limit)
- Verify you clicked the full link (some email clients truncate long URLs)
- Try copying and pasting the entire URL into your browser
- Request a new reset link

### "I'm getting rate limited"
- You've made too many password reset requests
- Wait for the specified time (shown in the error message)
- Maximum: 3 requests per 15 minutes per email

### "The page says my password is too weak"
Ensure your password includes:
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One digit
- One special character

Example strong passwords:
- `MySecure2024!`
- `Admin@Pass123`
- `Zw!2024Strong`

## Best Practices

### Creating Strong Passwords
1. Use a mix of character types
2. Avoid common words or patterns
3. Don't reuse passwords from other sites
4. Consider using a password manager
5. Make it memorable but not guessable

### Password Security
1. Never share your password with anyone
2. Change your password if you suspect it's compromised
3. Don't write passwords down in plain text
4. Use different passwords for different accounts
5. Enable two-factor authentication if available

### Regular Maintenance
1. Change your password every 90 days (recommended)
2. Update your password if you suspect unauthorized access
3. Review login activity regularly (if available)

## Support

If you encounter issues not covered in this guide:
1. Check the system logs (if you have access)
2. Contact your system administrator
3. Provide details: error messages, timestamps, steps taken

## Technical Details

### API Endpoints
- Change Password: `POST /api/admin/password/change`
- Request Reset: `POST /api/admin/password/reset/request`
- Complete Reset: `POST /api/admin/password/reset/complete`

### Routes
- Change Password Page: `/change-password` (protected)
- Forgot Password Page: `/forgot-password` (public)
- Reset Password Page: `/reset-password?token=...` (public)

### Security Measures
- Bcrypt password hashing (salt factor 10+)
- Cryptographically secure reset tokens (32 bytes)
- Rate limiting (3 attempts per 15 minutes)
- Email enumeration prevention
- Comprehensive audit logging
- Single-use tokens with 1-hour expiration

---

**Last Updated**: February 22, 2026
**Version**: 1.0
**Feature**: Admin Password Management
