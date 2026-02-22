/**
 * Validation utilities for form inputs in the admin portal
 * 
 * All validation functions return an object with:
 * - valid: boolean indicating if the value passes validation
 * - error: optional string with error message if validation fails
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an email address using standard RFC 5322 pattern
 * 
 * @param email - The email address to validate
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * validateEmail('user@example.com') // { valid: true }
 * validateEmail('invalid-email') // { valid: false, error: 'Invalid email address' }
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  // Standard email regex pattern (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Invalid email address' };
  }

  return { valid: true };
}

/**
 * Validates a URL to ensure it starts with http:// or https://
 * 
 * @param url - The URL to validate
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * validateUrl('https://example.com') // { valid: true }
 * validateUrl('ftp://example.com') // { valid: false, error: 'URL must start with http:// or https://' }
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return { valid: false, error: 'URL must start with http:// or https://' };
  }

  // Additional validation to ensure it's a valid URL structure
  try {
    new URL(trimmedUrl);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validates a file based on allowed types and maximum size
 * 
 * @param file - The File object to validate
 * @param allowedTypes - Array of allowed MIME types (e.g., ['image/jpeg', 'image/png'])
 * @param maxSizeMB - Maximum file size in megabytes
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * validateFile(file, ['image/jpeg', 'image/png'], 5)
 * // { valid: true } or { valid: false, error: 'File size exceeds 5 MB' }
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map(type => type.split('/')[1])
      .join(', ');
    return { 
      valid: false, 
      error: `File type must be one of: ${allowedExtensions}` 
    };
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File size exceeds ${maxSizeMB} MB` 
    };
  }

  return { valid: true };
}

/**
 * Validates that a required field has a value
 * 
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * validateRequired('some value', 'Title') // { valid: true }
 * validateRequired('', 'Title') // { valid: false, error: 'Title is required' }
 * validateRequired('   ', 'Title') // { valid: false, error: 'Title is required' }
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  // Check for null, undefined, or empty string
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }

  // For strings, check if it's empty or only whitespace
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  // For arrays, check if empty
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Validates that a string length is within specified bounds
 * 
 * @param value - The string to validate
 * @param min - Minimum length (inclusive)
 * @param max - Maximum length (inclusive)
 * @param fieldName - The name of the field for error messages
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * validateLength('hello', 3, 10, 'Title') // { valid: true }
 * validateLength('hi', 3, 10, 'Title') // { valid: false, error: 'Title must be at least 3 characters' }
 * validateLength('very long text', 3, 10, 'Title') // { valid: false, error: 'Title must be at most 10 characters' }
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const length = value.length;

  if (length < min) {
    return { 
      valid: false, 
      error: `${fieldName} must be at least ${min} character${min !== 1 ? 's' : ''}` 
    };
  }

  if (length > max) {
    return { 
      valid: false, 
      error: `${fieldName} must be at most ${max} character${max !== 1 ? 's' : ''}` 
    };
  }

  return { valid: true };
}

/**
 * Validates multiple fields and returns all errors
 * 
 * @param validations - Array of validation results
 * @returns Object with isValid flag and errors object
 * 
 * @example
 * const results = validateAll([
 *   { field: 'email', result: validateEmail(email) },
 *   { field: 'title', result: validateRequired(title, 'Title') }
 * ]);
 * // { isValid: false, errors: { email: 'Invalid email address' } }
 */
export function validateAll(
  validations: Array<{ field: string; result: ValidationResult }>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  validations.forEach(({ field, result }) => {
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Extracts a user-friendly error message from various error formats
 * Handles Axios errors, API error objects, and plain Error objects
 * 
 * @param error - The error object (can be Axios error, API error, or plain Error)
 * @param fallbackMessage - Default message if no error message can be extracted
 * @returns A string error message suitable for display to users
 * 
 * @example
 * // Axios error with API response
 * extractErrorMessage(axiosError, 'Operation failed')
 * // Returns: 'Failed to create show' (from err.response.data.error.message)
 * 
 * // API error object
 * extractErrorMessage({ message: 'Not found', code: 'NOT_FOUND' }, 'Operation failed')
 * // Returns: 'Not found'
 * 
 * // Plain Error
 * extractErrorMessage(new Error('Network error'), 'Operation failed')
 * // Returns: 'Network error'
 * 
 * // Unknown error
 * extractErrorMessage(null, 'Operation failed')
 * // Returns: 'Operation failed'
 */
export function extractErrorMessage(error: any, fallbackMessage: string): string {
  // Handle null/undefined
  if (!error) {
    return fallbackMessage;
  }

  // Handle Axios errors with response data
  if (error.response?.data) {
    const data = error.response.data;
    
    // Check for error.message (API format: { error: { message: '...', code: '...' } })
    if (data.error?.message && typeof data.error.message === 'string') {
      return data.error.message;
    }
    
    // Check for direct error object (fallback case)
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
    
    // Check for direct message property
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
  }

  // Handle plain Error objects
  if (error instanceof Error && error.message) {
    return error.message;
  }

  // Handle error objects with message property
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return fallbackMessage;
}
