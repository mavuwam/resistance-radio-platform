import sanitizeHtml = require('sanitize-html');

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe HTML tags and attributes for email display
 */
export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'pre', 'code'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      'span': ['style'],
      'div': ['style']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedStyles: {
      '*': {
        'color': [/^#[0-9a-fA-F]{3,6}$/],
        'background-color': [/^#[0-9a-fA-F]{3,6}$/],
        'font-weight': [/^bold$/],
        'font-style': [/^italic$/],
        'text-decoration': [/^underline$/]
      }
    }
  });
}
