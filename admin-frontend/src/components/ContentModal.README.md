# ContentModal Component

A fully-featured modal dialog component with improved styling, animations, focus management, and accessibility.

## Features

### 1. Smooth Animations
- **Enter animation**: Fade in backdrop with slide-up and scale effect
- **Exit animation**: Smooth fade out
- **Mobile-specific**: Slide up from bottom on mobile devices
- **Timing**: Uses cubic-bezier easing for natural motion

### 2. Focus Management
- **Focus trap**: Keeps keyboard focus within modal when open
- **Tab cycling**: Tab key cycles through focusable elements
- **Return focus**: Returns focus to trigger element when modal closes
- **Auto-focus**: Automatically focuses first interactive element on open

### 3. Loading State
- **Built-in loading UI**: Shows spinner and message when `loading={true}`
- **Prevents closing**: Disables close button and backdrop click during loading
- **Accessible**: Includes proper ARIA attributes

### 4. Scrollable Body
- **Fixed header/footer**: Header and footer remain visible while scrolling
- **Custom scrollbar**: Styled scrollbar for better aesthetics
- **Flexible height**: Body expands to fill available space

### 5. Mobile Responsive
- **Adaptive sizing**: Full-width on mobile, centered on desktop
- **Touch-friendly**: Larger touch targets on mobile
- **Bottom sheet**: Slides up from bottom on mobile devices
- **Breakpoints**: 
  - 768px: Reduced padding, bottom-aligned
  - 480px: Full-screen modal

### 6. Accessibility
- **ARIA attributes**: Proper `role`, `aria-modal`, `aria-labelledby`
- **Keyboard support**: 
  - Escape key closes modal (unless prevented)
  - Tab key navigation with focus trap
  - Enter key on buttons
- **Focus indicators**: Visible focus states on all interactive elements
- **Screen reader support**: Proper labeling and announcements

## Props

```typescript
interface ContentModalProps {
  isOpen: boolean;           // Controls modal visibility
  onClose: () => void;       // Called when modal should close
  title: string;             // Modal title (displayed in header)
  children: ReactNode;       // Modal body content
  size?: 'small' | 'medium' | 'large';  // Modal width (default: 'medium')
  footer?: ReactNode;        // Optional footer content (buttons, etc.)
  loading?: boolean;         // Shows loading state (default: false)
  maxHeight?: string;        // Custom max-height (default: '90vh')
  preventClose?: boolean;    // Prevents closing via backdrop/escape (default: false)
}
```

## Usage Examples

### Basic Modal

```tsx
import ContentModal from '../components/ContentModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <ContentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
      >
        <p>Modal content goes here</p>
      </ContentModal>
    </>
  );
}
```

### Modal with Footer

```tsx
<ContentModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Item"
  footer={
    <>
      <button onClick={() => setIsOpen(false)}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </>
  }
>
  <form>
    {/* Form fields */}
  </form>
</ContentModal>
```

### Modal with Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await api.saveData();
    setIsOpen(false);
  } finally {
    setIsLoading(false);
  }
};

<ContentModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Saving..."
  loading={isLoading}
  preventClose={isLoading}
>
  <form onSubmit={handleSave}>
    {/* Form fields */}
  </form>
</ContentModal>
```

### Large Modal with Custom Height

```tsx
<ContentModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Large Content"
  size="large"
  maxHeight="80vh"
>
  <div>
    {/* Large content that will scroll */}
  </div>
</ContentModal>
```

### Prevent Accidental Closing

```tsx
<ContentModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Important Form"
  preventClose={hasUnsavedChanges}
>
  <form>
    {/* Form with unsaved changes */}
  </form>
</ContentModal>
```

## Size Options

- **small**: 400px max-width (good for confirmations, simple forms)
- **medium**: 600px max-width (default, good for most forms)
- **large**: 900px max-width (good for complex forms, content editors)

All sizes are responsive and become full-width on mobile devices.

## Styling

The modal uses CSS custom properties from the design system:

- Colors: `--color-gray-*` for borders and backgrounds
- Shadows: `--shadow-xl` for elevation
- Transitions: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth animations
- Border radius: 12px for modern look

### Custom Styling

You can add custom classes to modal content:

```tsx
<ContentModal {...props}>
  <div className="custom-modal-content">
    {/* Your content */}
  </div>
</ContentModal>
```

## Accessibility Checklist

- ✅ Focus trap keeps keyboard users within modal
- ✅ Escape key closes modal (unless prevented)
- ✅ Focus returns to trigger element on close
- ✅ First interactive element receives focus on open
- ✅ Proper ARIA attributes for screen readers
- ✅ Visible focus indicators on all interactive elements
- ✅ Backdrop click closes modal (unless prevented)
- ✅ Close button has accessible label
- ✅ Modal title is properly associated with dialog

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch-optimized UI

## Performance

- Animations use CSS transforms for GPU acceleration
- Focus management uses efficient DOM queries
- Event listeners are properly cleaned up
- No unnecessary re-renders

## Related Components

- **ConfirmDialog**: Specialized modal for confirmations
- **Loading**: Spinner component used in loading state
- **Toast**: For non-blocking notifications
