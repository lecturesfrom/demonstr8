# Quick Reference: Cursor UX/UI Workflow

## 🚀 Quick Start Commands

### Navigation

```bash
# Open file
Cmd+P (Mac) / Ctrl+P (Windows)

# Go to symbol in file
Cmd+Shift+O

# Go to symbol in workspace
Cmd+T

# Find references
Shift+F12
```

### Testing

```bash
# Run all tests
npm test

# Run specific test
npm test QueueItem

# Run tests in watch mode
npm test -- --watch

# Run linter
npm run lint
```

### Development Server

```bash
# Start dev server
npm run dev

# Open playground
http://localhost:3000/(dev)/playground

# Open component showcase
http://localhost:3000/
```

## 📁 Key Files & Locations

### Documentation

- `UX_REVIEW_CHECKLIST.md` - Complete UX review checklist
- `COMPONENT_HIERARCHY.md` - Component structure and relationships
- `CURSOR_WORKFLOW_GUIDE.md` - Detailed Cursor IDE usage
- `TESTING_WORKFLOW.md` - Testing strategies and patterns

### Components

- `app/src/components/` - All UI components
- `app/src/components/common/` - Reusable primitives
- `app/src/app/(dev)/playground/` - Component playground

### Tests

- `app/src/__tests__/components/` - Component tests
- `app/src/__tests__/setup.ts` - Test configuration

### Types

- `app/src/lib/types.ts` - All TypeScript types

## 🎨 Design System Quick Reference

### Colors (1% Rule)

- `dw-accent` (#C8D400) - **ONLY for Play button**
- `dw-base` (#121212) - Background
- `dw-surface` (#1E1C1A) - Panels/cards
- `dw-text` (#E8E5D8) - Primary text
- `dw-success` (#4C7B47) - Success states
- `dw-alert` (#D86830) - Warning/skip actions

### Typography

- `.dw-h1` - 48px, 800 weight (Satoshi)
- `.dw-h2` - 36px, 800 weight (Satoshi)
- `.dw-h3` - 24px, 700 weight (Satoshi)
- `.dw-body` - 18px, 400 weight (Inter)
- `.dw-label` - 14px, 500 weight
- `.dw-caption` - 12px

### Spacing

- 4px/8px/16px/24px rhythm
- Use Tailwind spacing: `p-4`, `p-6`, `p-8`, `gap-4`, `gap-8`

### Border Radius

- `rounded-sm` (2px) only

## ✅ Essential Checklist Items

### Before Committing

- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Play button is ONLY element with `bg-dw-accent`
- [ ] All interactive elements have focus states
- [ ] Loading states are shown
- [ ] Error states are handled
- [ ] Mobile responsive (test on small screen)
- [ ] Keyboard accessible (Tab navigation works)

### Component Review

- [ ] Uses design tokens (no hardcoded colors)
- [ ] Follows Digital Workwear aesthetic
- [ ] All states tested (loading, error, empty, success)
- [ ] Accessibility labels present
- [ ] Real-time subscriptions cleaned up
- [ ] TypeScript types defined
- [ ] JSDoc comments added

## 🔍 Common Cursor Shortcuts

### Navigation

| Action | Mac | Windows |
|--------|-----|---------|
| Quick open | `Cmd+P` | `Ctrl+P` |
| Go to definition | `F12` | `F12` |
| Peek definition | `Alt+F12` | `Alt+F12` |
| Find references | `Shift+F12` | `Shift+F12` |
| Go back | `Cmd+-` | `Ctrl+-` |
| Go to symbol | `Cmd+Shift+O` | `Ctrl+Shift+O` |

### Editing

| Action | Mac | Windows |
|--------|-----|---------|
| Quick fix | `Cmd+.` | `Ctrl+.` |
| Rename symbol | `F2` | `F2` |
| Split editor | `Cmd+\` | `Ctrl+\` |
| Format document | `Shift+Alt+F` | `Shift+Alt+F` |

### View

| Action | Mac | Windows |
|--------|-----|---------|
| Toggle terminal | `` Ctrl+` `` | `` Ctrl+` `` |
| Toggle sidebar | `Cmd+B` | `Ctrl+B` |
| Toggle problems | `Cmd+Shift+M` | `Ctrl+Shift+M` |

## 📋 Component Patterns

### Basic Component Structure

```typescript
/**
 * ComponentName Component
 *
 * What: Brief description
 * Why: Why it exists
 * How it helps users: User benefit
 */

'use client' // if needed

import { ComponentProps } from '@/types'

interface ComponentNameProps {
  // Props defined here
}

export function ComponentName({ props }: ComponentNameProps) {
  return (
    <div className="bg-dw-surface border border-border-dw-muted rounded-sm p-6">
      {/* Component content */}
    </div>
  )
}
```

### Testing Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from '@/components/ComponentName'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName {...props} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## 🐛 Common Issues & Fixes

### Issue: Type Error

**Fix**: Check `app/src/lib/types.ts` for type definitions

### Issue: Component Not Found

**Fix**: Check import path - use `@/components/ComponentName`

### Issue: Design Token Not Working

**Fix**: Check `app/src/app/globals.css` for token definitions

### Issue: Test Failing

**Fix**: Check `app/src/__tests__/setup.ts` for mock configuration

### Issue: Real-time Not Updating

**Fix**: Check hook cleanup in `useEffect` return

## 📚 Full Documentation

For detailed information, see:

- **Workflow**: `CURSOR_WORKFLOW_GUIDE.md`
- **Testing**: `TESTING_WORKFLOW.md`
- **Components**: `COMPONENT_HIERARCHY.md`
- **UX Review**: `UX_REVIEW_CHECKLIST.md`

## 🎯 Daily Workflow

1. **Morning Setup**
   - Open project in Cursor
   - Pin `TODO.md` and `UX_REVIEW_CHECKLIST.md`
   - Open Outline view for components

2. **Working on Component**
   - `Cmd+P` → Open component file
   - `Shift+F12` → See all usages
   - Make changes
   - `Cmd+S` → Save (auto-formats)
   - `npm test ComponentName` → Run tests
   - Open playground → Visual test
   - Review checklist → Verify compliance

3. **Before Commit**
   - `npm test` → All tests pass
   - `npm run lint` → No lint errors
   - Review checklist → UX compliance
   - Document findings → Update checklist

## 💡 Pro Tips

1. **Use Split Editor**: View component + test + checklist simultaneously
2. **Watch Mode**: Run `npm test -- --watch` for instant feedback
3. **Playground**: Test components in isolation before integration
4. **Outline View**: See component structure at a glance
5. **Quick Fix**: `Cmd+.` on errors for auto-fixes
6. **Find References**: `Shift+F12` to see all usages
7. **Peek Definition**: `Alt+F12` to view without navigating
