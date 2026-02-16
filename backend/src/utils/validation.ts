/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: At least 8 characters, contains at least one letter and one number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasLetter && hasNumber;
}

/**
 * Get password validation error message
 */
export function getPasswordError(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
}
