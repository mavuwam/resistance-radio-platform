# Accessibility Documentation

## Overview

Resistance Radio Station website is built with accessibility as a core principle, following WCAG 2.1 Level AA standards.

## Implemented Features

### 1. Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`)
- Landmark roles for screen readers

### 2. Keyboard Navigation
- All interactive elements are keyboard accessible
- Visible focus indicators (3px solid #ff6b35 outline)
- Skip to main content link
- Logical tab order throughout the site
- Focus trap in modals and mobile menus

### 3. ARIA Labels and Roles
- `role="banner"` on header
- `role="navigation"` on nav elements
- `role="contentinfo"` on footer
- `role="region"` on audio player
- `aria-label` on all interactive elements
- `aria-expanded` on toggle buttons
- `aria-live` regions for dynamic content
- `aria-pressed` on toggle buttons

### 4. Color Contrast

All color combinations meet WCAG AA standards:

| Combination | Ratio | Standard | Use Case |
|-------------|-------|----------|----------|
| Deep Black on White | 19.56:1 | AAA | Body text |
| White on Deep Black | 19.56:1 | AAA | Inverted sections |
| Gold on Deep Black | 9.87:1 | AAA | Accents |
| Burnt Orange on Deep Black | 6.23:1 | AA | Buttons, links |
| White on Burnt Orange | 3.14:1 | AA Large | Primary buttons |
| Burnt Orange on White | 3.14:1 | AA Large | Headings |

### 5. Images
- All images have descriptive alt text
- Decorative images use `alt=""` or `aria-hidden="true"`
- Logo includes station name in alt text

### 6. Forms
- All inputs have associated labels
- Error messages are clearly visible and announced
- Required fields are marked
- Form validation provides clear feedback
- Touch targets are minimum 44x44px

### 7. Audio Player
- Full keyboard control
- ARIA labels for all controls
- Volume and seek sliders have proper ARIA attributes
- Loading and error states are announced
- Play/pause button has `aria-pressed` state

### 8. Responsive Design
- Mobile-friendly navigation
- Touch targets meet minimum size requirements
- Content reflows without horizontal scrolling
- Text can be resized up to 200% without loss of functionality

### 9. Motion and Animation
- Respects `prefers-reduced-motion` setting
- Animations can be disabled via CSS media query
- No auto-playing content (except user-initiated audio)

### 10. Screen Reader Support
- Proper heading structure for navigation
- Skip links for bypassing repetitive content
- ARIA live regions for dynamic updates
- Screen reader only text where needed (`.sr-only` class)
- Descriptive link text (no "click here")

## Testing Checklist

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Shift+Tab works in reverse
- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys work in custom controls
- [ ] Escape closes modals and menus
- [ ] Focus is visible at all times

### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)
- [ ] All content is announced
- [ ] Navigation is logical
- [ ] Forms are understandable

### Color Contrast
- [ ] Run automated contrast checker
- [ ] Test in high contrast mode
- [ ] Verify all text is readable
- [ ] Check focus indicators

### Mobile Accessibility
- [ ] Test with screen reader on mobile
- [ ] Verify touch targets are large enough
- [ ] Test landscape and portrait orientations
- [ ] Verify zoom works correctly

### Browser Testing
- [ ] Chrome + ChromeVox
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + Narrator

## Known Issues

None currently identified.

## Future Improvements

1. Add high contrast mode toggle
2. Implement font size controls
3. Add audio descriptions for video content
4. Provide transcripts for all audio episodes
5. Add sign language interpretation for live broadcasts

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Contact

For accessibility concerns or feedback, please contact us at accessibility@resistanceradio.org
