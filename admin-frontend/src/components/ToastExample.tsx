/**
 * Toast System Example Component
 * 
 * This component demonstrates how to use the toast notification system.
 * It can be temporarily added to any page for testing purposes.
 * 
 * Usage:
 * import ToastExample from '../components/ToastExample';
 * 
 * Then add <ToastExample /> to your page component.
 */

import React from 'react';
import { useToast } from '../utils/toast';

const ToastExample: React.FC = () => {
  const toast = useToast();

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f3f4f6', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>Toast Notification Examples</h3>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        Click the buttons below to test different toast types:
      </p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => toast.success('Show created successfully!')}
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Success Toast
        </button>

        <button
          onClick={() => toast.error('Failed to delete episode. Please try again.')}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Error Toast
        </button>

        <button
          onClick={() => toast.warning('Session expires in 5 minutes')}
          style={{
            padding: '8px 16px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Warning Toast
        </button>

        <button
          onClick={() => toast.info('Draft saved automatically')}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Info Toast
        </button>

        <button
          onClick={() => {
            toast.success('First toast');
            setTimeout(() => toast.info('Second toast'), 200);
            setTimeout(() => toast.warning('Third toast'), 400);
            setTimeout(() => toast.error('Fourth toast'), 600);
          }}
          style={{
            padding: '8px 16px',
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Multiple Toasts
        </button>

        <button
          onClick={() => toast.success('This toast will dismiss in 3 seconds', 3000)}
          style={{
            padding: '8px 16px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Custom Duration (3s)
        </button>
      </div>

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: 'white', 
        borderRadius: '6px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>Note:</strong> This is a demo component. Remove it from production pages.
        Toasts auto-dismiss after 5 seconds by default, or you can click the × button to dismiss manually.
      </div>
    </div>
  );
};

export default ToastExample;
