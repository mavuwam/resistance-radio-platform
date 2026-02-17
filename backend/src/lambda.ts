import serverlessHttp from 'serverless-http';
import app from './index';

// Wrap Express app for Lambda
export const handler = serverlessHttp(app, {
  // Binary media types for file uploads
  binary: ['image/*', 'audio/*', 'video/*', 'application/pdf'],
  
  // Request/response transformations
  request: (request: any) => {
    // Add custom request transformations if needed
    return request;
  },
  
  response: (response: any) => {
    // Add custom response transformations if needed
    return response;
  }
});
