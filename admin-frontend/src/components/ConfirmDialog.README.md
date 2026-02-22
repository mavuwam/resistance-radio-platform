# ConfirmDialog Component

A modal confirmation dialog component for critical user actions with accessibility features and keyboard navigation support.

## Features

- **Three Variants**: `danger`, `warning`, and `info` with distinct visual styling
- **Focus Trap**: Keyboard navigation is trapped within the dialog when open
- **Keyboard Navigation**: 
  - `Escape` key closes the dialog (unless loading)
  - `Tab` cycles through focusable elements
  - `Shift+Tab` cycles backwards
- **Loading State**: Prevents closing and shows loading indicator during async operations
- **Accessibility**: 
  - Proper ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`)
  - Focus management (auto-focuses cancel button on open)
  - Screen reader announcements
- **Responsive**: Mobile-friendly with stacked buttons on small screens
- **Prevents Accidental Dismissal**: Cannot be closed by clicking backdrop (requires explicit button click)

## Usage

```typescript
import { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteItem(itemId);
      setShowConfirm(false);
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete Item
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Item?"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Controls dialog visibility |
| `onClose` | `() => void` | Yes | - | Called when dialog should close (cancel button or escape key) |
| `onConfirm` | `() => void` | Yes | - | Called when user confirms the action |
| `title` | `string` | Yes | - | Dialog title (used for `aria-labelledby`) |
| `message` | `string` | Yes | - | Dialog message/description (used for `aria-describedby`) |
| `confirmText` | `string` | No | `"Confirm"` | Text for confirm button |
| `cancelText` | `string` | No | `"Cancel"` | Text for cancel button |
| `variant` | `'danger' \| 'warning' \| 'info'` | No | `'danger'` | Visual variant of the dialog |
| `isLoading` | `boolean` | No | `false` | Shows loading state and disables buttons |

## Variants

### Danger (Red)
Use for destructive actions like deleting content.

```typescript
<ConfirmDialog
  variant="danger"
  title="Delete Show?"
  message="This will permanently delete the show and all its episodes."
  confirmText="Delete"
/>
```

### Warning (Yellow/Amber)
Use for actions that require caution but aren't destructive.

```typescript
<ConfirmDialog
  variant="warning"
  title="Unpublish Article?"
  message="This article will no longer be visible to the public."
  confirmText="Unpublish"
/>
```

### Info (Blue)
Use for informational confirmations.

```typescript
<ConfirmDialog
  variant="info"
  title="Save Draft?"
  message="Do you want to save your changes as a draft?"
  confirmText="Save"
/>
```

## Accessibility Features

1. **Focus Management**
   - Auto-focuses cancel button when dialog opens
   - Returns focus to trigger element when closed (handled by parent)
   - Focus trap prevents tabbing outside dialog

2. **Keyboard Navigation**
   - `Tab` / `Shift+Tab`: Navigate between buttons
   - `Escape`: Close dialog (unless loading)
   - `Enter`: Activates focused button

3. **Screen Readers**
   - `role="dialog"` and `aria-modal="true"` announce modal context
   - `aria-labelledby` links to title
   - `aria-describedby` links to message
   - Button labels with `aria-label`

4. **Visual Indicators**
   - Clear focus indicators on all interactive elements
   - Loading spinner with "Processing..." text
   - Disabled state styling during loading

## Requirements Satisfied

- **Requirement 7.1**: Displays confirmation dialog on delete button click
- **Requirement 7.2**: Clearly states what will be deleted in the message
- **Requirement 7.3**: Requires explicit confirmation (backdrop click doesn't close)
- **Requirement 7.4**: Distinct Cancel and Confirm buttons with different colors

## Best Practices

1. **Always provide clear, specific messages**
   ```typescript
   // Good
   message="This will permanently delete 'Episode 5: Democracy' and cannot be undone."
   
   // Bad
   message="Are you sure?"
   ```

2. **Use appropriate variants**
   - `danger`: Permanent deletions, data loss
   - `warning`: Reversible but significant actions
   - `info`: Non-destructive confirmations

3. **Handle loading states**
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   
   const handleConfirm = async () => {
     setIsLoading(true);
     try {
       await performAction();
     } finally {
       setIsLoading(false);
     }
   };
   ```

4. **Provide context in titles**
   ```typescript
   // Good
   title="Delete Show 'Resistance Radio'?"
   
   // Bad
   title="Confirm"
   ```

## Styling

The component uses CSS custom properties from the design system:

- Colors: `--color-error`, `--color-warning`, `--color-info`
- Spacing: `--space-*` variables
- Shadows: `--shadow-xl`
- Transitions: `--transition-base`, `--transition-slow`
- Z-index: `--z-modal-backdrop`, `--z-modal`

Custom styling can be applied by overriding these variables or adding custom classes.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Supports `prefers-reduced-motion` for accessibility
- Supports `prefers-contrast: high` for better visibility
- Mobile responsive (iOS Safari, Chrome Mobile)

## Known Limitations

1. **No nested dialogs**: Only one ConfirmDialog should be open at a time
2. **No custom content**: Message is plain text only (no HTML/React nodes)
3. **Fixed button order**: Cancel is always on the left, Confirm on the right

## Future Enhancements

- Support for custom icons
- Support for rich content in message (React nodes)
- Support for additional action buttons
- Animation customization options
