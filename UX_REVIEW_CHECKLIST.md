# UX/UI Review Checklist

Use this checklist when reviewing or modifying any UI component in the demonstr8 project. Check off items as you verify them.

## Digital Workwear Design System Compliance

### Color Usage (1% Rule)
- [ ] **Play button is the ONLY element** with solid `dw-accent` (#C8D400) background
- [ ] All other buttons use neutral/secondary variants (border-only or transparent)
- [ ] Backgrounds use `dw-base` (90% neutral) or `dw-surface` (panels)
- [ ] Text uses `dw-text`, `dw-text-muted`, or `dw-muted` (never pure white)
- [ ] Borders use `border-border-dw-muted` or `border-border-dw-strong`
- [ ] No other hi-vis accent colors except the Play button

### Typography
- [ ] Headings use `.dw-h1`, `.dw-h2`, or `.dw-h3` classes (Satoshi font, bold weights)
- [ ] Body text uses `.dw-body` class (18px, 400 weight)
- [ ] Labels use `.dw-label` for small text
- [ ] Font sizes follow the scale (48px/36px/24px/18px/14px/12px)

### Spacing
- [ ] Uses 4px/8px/16px/24px spacing rhythm
- [ ] Consistent padding/margin using Tailwind spacing scale
- [ ] Cards/panels have appropriate padding (`p-4`, `p-6`, `p-8`)

### Border Radius
- [ ] Uses `rounded-sm` (2px) for subtle rounding
- [ ] No excessive border radius (avoids rounded-lg or rounded-full)

## Accessibility (a11y)

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible (check `focus:outline-none focus:border-dw-accent`)
- [ ] Tab order is logical and follows visual flow
- [ ] Keyboard shortcuts work where applicable (e.g., Space/Enter for buttons)

### Screen Reader Support
- [ ] Interactive elements have proper ARIA labels (`aria-label`, `aria-labelledby`)
- [ ] Form inputs have associated `<label>` elements
- [ ] Status messages use appropriate ARIA roles (`role="alert"`, `role="status"`)
- [ ] Loading states are announced to screen readers
- [ ] Error messages are properly associated with form fields

### Visual Accessibility
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Information is not conveyed by color alone (icons/labels also present)
- [ ] Focus indicators are clearly visible (2px minimum)
- [ ] Text is resizable up to 200% without breaking layout

## Component States

### Loading States
- [ ] Loading indicators are shown for async operations
- [ ] Loading text is descriptive ("Uploading...", "Approving...")
- [ ] LoadingSpinner component is used consistently
- [ ] Buttons show disabled state while loading

### Empty States
- [ ] EmptyState component used when no data
- [ ] Empty state messages are helpful and actionable
- [ ] Empty states guide users on next steps

### Error States
- [ ] Error messages are user-friendly (not technical jargon)
- [ ] Errors are displayed inline near the relevant field/action
- [ ] Error styling uses `dw-alert` color appropriately
- [ ] Errors can be dismissed or resolved

### Success States
- [ ] Success feedback is clear (e.g., "✓ Ready" for file uploads)
- [ ] Success messages don't persist unnecessarily
- [ ] Success styling uses `dw-success` color

### Disabled States
- [ ] Disabled elements have `opacity-50` and `pointer-events-none`
- [ ] Disabled buttons are clearly not interactive
- [ ] Tooltip or help text explains why something is disabled

## Responsive Design

### Mobile (< 640px)
- [ ] Layout adapts to single column where needed
- [ ] Text is readable without horizontal scrolling
- [ ] Touch targets are at least 44x44px
- [ ] Form inputs are easily tappable
- [ ] Buttons are full-width or appropriately sized for mobile

### Tablet (640px - 1024px)
- [ ] Grid layouts use `md:` breakpoint appropriately
- [ ] Side-by-side layouts work well in medium screens
- [ ] Navigation is accessible

### Desktop (> 1024px)
- [ ] Uses `lg:` breakpoint for multi-column layouts
- [ ] Max-width constraints prevent overly wide content
- [ ] Hover states work well with mouse

### Orientation
- [ ] Landscape mode works on mobile devices
- [ ] Portrait mode works on tablets

## Interaction & Feedback

### Hover States
- [ ] Interactive elements have hover effects (`hover:bg-*`, `hover:border-*`)
- [ ] Hover feedback is immediate and clear
- [ ] Buttons show hover state (not just on click)

### Click/Tap Feedback
- [ ] Buttons provide visual feedback on interaction
- [ ] Loading states trigger on action (not after delay)
- [ ] Success/error feedback appears promptly

### Transitions
- [ ] State changes use `transition-all duration-150` for smooth animations
- [ ] No jarring instant state changes
- [ ] Loading spinners animate smoothly

## Real-time Updates

### Subscriptions
- [ ] Components using real-time hooks clean up subscriptions on unmount
- [ ] Loading states shown while initial data loads
- [ ] Updates appear without full page refresh

### Optimistic Updates
- [ ] UI updates optimistically when appropriate (e.g., queue reordering)
- [ ] Errors revert optimistic updates
- [ ] Loading indicators shown during optimistic updates

## Form Validation

### Input Validation
- [ ] Required fields are marked with asterisk or "(required)"
- [ ] Validation happens on blur or submit (not on every keystroke)
- [ ] Error messages are clear and actionable
- [ ] Invalid inputs are visually distinct (red border)

### File Upload
- [ ] File type validation (audio files only)
- [ ] File size limits are enforced (50MB max shown)
- [ ] Upload progress is shown
- [ ] Upload errors are displayed clearly

## Performance

### Initial Load
- [ ] Components load quickly
- [ ] Images/media are lazy-loaded where appropriate
- [ ] No layout shift during load

### Runtime Performance
- [ ] No unnecessary re-renders (React.memo where needed)
- [ ] Large lists are virtualized or paginated
- [ ] Animations are smooth (60fps)

## Browser Compatibility

### Modern Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

### Mobile Browsers
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Component-Specific Checks

### QueueItem
- [ ] All status states render correctly (pending, approved, playing, skipped, done)
- [ ] Host actions only shown when `isHost={true}`
- [ ] Play button has accent background (1% rule)
- [ ] Drag-and-drop works in SortableQueueItem wrapper

### AudioPlayer
- [ ] Play/pause button works correctly
- [ ] Progress bar is seekable
- [ ] Time display is accurate
- [ ] Auto-play respects browser policies
- [ ] Loading states are shown

### FileUploader
- [ ] File selection works
- [ ] Upload progress is visible
- [ ] Success/error states are clear
- [ ] File validation errors are shown

### SubmissionForm
- [ ] All fields are validated
- [ ] Submit button disabled until form is valid
- [ ] Success state clears form
- [ ] Errors are shown inline

## Checklist Usage

When reviewing a component:
1. Run through this checklist item by item
2. Test on multiple screen sizes (mobile, tablet, desktop)
3. Test with keyboard navigation only (Tab, Enter, Space)
4. Test with screen reader (VoiceOver or NVDA)
5. Check browser console for errors/warnings
6. Verify design tokens are used correctly
7. Ensure 1% accent rule is maintained

## Common Issues to Watch For

- ❌ Using `bg-dw-accent` on any element except the Play button
- ❌ Missing focus states on interactive elements
- ❌ Hardcoded colors instead of design tokens
- ❌ Missing loading states for async operations
- ❌ Not cleaning up real-time subscriptions
- ❌ Missing error handling/display
- ❌ Poor mobile touch target sizes
- ❌ Inaccessible form labels
- ❌ Missing ARIA labels on icon-only buttons
- ❌ Excessive border radius breaking DW aesthetic

## Documentation

After review, document:
- Issues found (with component/file path)
- Fixes applied
- Edge cases discovered
- Improvements made