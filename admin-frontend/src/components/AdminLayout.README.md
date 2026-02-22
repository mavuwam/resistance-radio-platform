# AdminLayout Component - Responsive Behavior

## Overview

The AdminLayout component provides the main layout structure for the admin portal with a responsive sidebar navigation that adapts to different screen sizes.

## Responsive Breakpoints

### Desktop (> 768px)
- Sidebar is always visible at 280px width
- Fixed position on the left side
- Main content area has left margin to accommodate sidebar

### Tablet (≤ 1024px)
- Sidebar width reduces to 240px
- Main content adjusts accordingly

### Mobile (≤ 768px)
- Sidebar collapses off-screen by default
- Hamburger menu button appears in top-left corner (44x44px touch target)
- Sidebar slides in from left when hamburger is clicked
- Semi-transparent overlay appears behind sidebar
- Clicking overlay or navigation link closes sidebar
- Main content takes full width with padding for hamburger button

## Touch Target Compliance

All interactive elements meet WCAG 2.1 AA requirements:
- Hamburger menu: 44x44px
- Navigation links: minimum 44px height
- Buttons: minimum 44x44px

## Accessibility Features

- Hamburger button has `aria-label` for screen readers
- Hamburger button has `aria-expanded` state
- Overlay has `aria-hidden="true"`
- Keyboard navigation supported
- Focus management when sidebar opens/closes

## Usage

```tsx
import AdminLayout from './components/AdminLayout';

function MyAdminPage() {
  return (
    <AdminLayout>
      <h1>Page Content</h1>
      {/* Your page content here */}
    </AdminLayout>
  );
}
```

## State Management

The component uses local state to manage:
- `sidebarOpen`: Boolean controlling sidebar visibility on mobile
- Automatically closes sidebar when navigation links are clicked
- Closes sidebar when overlay is clicked

## CSS Classes

- `.admin-layout`: Main container
- `.hamburger-menu`: Mobile menu button (hidden on desktop)
- `.sidebar-overlay`: Semi-transparent backdrop (mobile only)
- `.admin-sidebar`: Sidebar navigation
- `.admin-sidebar.open`: Sidebar visible state (mobile)
- `.admin-main`: Main content area

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Smooth transitions using CSS transforms
- Touch-friendly on mobile devices
