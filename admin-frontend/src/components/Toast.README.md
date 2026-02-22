# Toast Notification System

A complete toast notification system for the admin portal with support for success, error, warning, and info messages.

## Features

- ✅ Four toast types: success, error, warning, info
- ✅ Auto-dismiss after 5 seconds (configurable)
- ✅ Stack multiple toasts vertically (max 5 visible)
- ✅ Manual dismiss with close button
- ✅ Smooth slide-in animations
- ✅ Responsive design (mobile-friendly)
- ✅ Accessible with ARIA attributes
- ✅ Type-safe with TypeScript

## Usage

### Basic Usage

```tsx
import { useToast } from '../utils/toast';

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('success', 'Show created successfully');
  };

  const handleError = () => {
    addToast('error', 'Failed to delete episode');
  };

  return (
    <button onClick={handleSuccess}>Create Show</button>
  );
}
```

### Convenience Methods

```tsx
import { useToast } from '../utils/toast';

function MyComponent() {
  const toast = useToast();

  // Success
  toast.success('Operation completed successfully');

  // Error
  toast.error('Something went wrong');

  // Warning
  toast.warning('Session expires in 5 minutes');

  // Info
  toast.info('Draft saved automatically');
}
```

### Custom Duration

```tsx
import { useToast } from '../utils/toast';

function MyComponent() {
  const { addToast } = useToast();

  // Show for 3 seconds instead of default 5
  addToast('success', 'Quick message', 3000);

  // Show for 10 seconds
  addToast('warning', 'Important warning', 10000);
}
```

### API Error Handling Pattern

```tsx
import { useToast } from '../utils/toast';
import { createShow } from 'shared/services/api';

function CreateShowForm() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: ShowFormData) => {
    setIsLoading(true);
    
    try {
      await createShow(formData);
      toast.success('Show created successfully');
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create show';
      toast.error(errorMessage);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Delete Confirmation Pattern

```tsx
import { useToast } from '../utils/toast';
import { deleteShow } from 'shared/services/api';

function ShowsList() {
  const toast = useToast();

  const handleDelete = async (showId: number) => {
    try {
      await deleteShow(showId);
      toast.success('Show deleted successfully');
      refreshData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete show');
    }
  };

  return (
    <div>
      {/* shows list */}
    </div>
  );
}
```

## Architecture

### Components

1. **Toast.tsx** - Toast UI components
   - `ToastItem`: Individual toast with auto-dismiss timer
   - `ToastContainer`: Container that manages toast stack

2. **ToastContext.tsx** - State management
   - `ToastProvider`: Context provider for toast state
   - `useToastContext`: Internal context hook

3. **toast.ts** - Utility hook
   - `useToast`: Public API for adding/removing toasts

### File Structure

```
admin-frontend/src/
├── components/
│   ├── Toast.tsx           # Toast UI components
│   └── Toast.css           # Toast styles
├── contexts/
│   └── ToastContext.tsx    # Toast state management
└── utils/
    └── toast.ts            # useToast hook
```

## Styling

The toast system uses CSS custom properties from the design system:

- Colors: `--color-success`, `--color-error`, `--color-warning`, `--color-info`
- Spacing: `--space-*` variables
- Shadows: `--shadow-lg`
- Transitions: `--transition-base`
- Border radius: `--radius-lg`

### Customization

To customize toast appearance, modify the CSS variables in `variables.css` or override styles in `Toast.css`.

## Accessibility

- Uses `role="alert"` for screen reader announcements
- Uses `aria-live="polite"` for non-intrusive notifications
- Close button has `aria-label="Dismiss notification"`
- Keyboard accessible (Tab to close button, Enter/Space to dismiss)

## Requirements Validated

This implementation validates the following requirements:

- **2.1**: Display error messages from API 4xx responses
- **2.2**: Display generic error for 5xx responses
- **2.3**: Display timeout messages
- **2.4**: Display network error messages
- **2.5**: Display errors using toast notifications
- **2.6**: Auto-dismiss after 5 seconds

## Testing

Unit tests should cover:
- Toast display and auto-dismiss
- Multiple toast stacking (max 5)
- Manual dismiss functionality
- Different toast types rendering correctly

Property tests should verify:
- Auto-dismiss timing is accurate
- Toast queue management with random operations
- Accessibility attributes are present

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires CSS custom properties support
- Requires ES6+ JavaScript features
