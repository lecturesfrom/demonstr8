# Testing Workflow for UI Components

This guide explains how to test UI components effectively using Vitest and the testing infrastructure in the demonstr8 project.

## Quick Start

### Run All Tests
```bash
cd app
npm test
```

### Run Specific Test File
```bash
npm test QueueItem
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Structure

### Test File Locations

```
app/src/__tests__/
├── setup.ts                    # Test configuration and mocks
├── components/
│   └── QueueItem.test.tsx      # Component unit tests
├── api/
│   ├── auth-middleware.test.ts
│   └── queue-approve.test.ts
└── integration/
    └── submission-flow.test.ts # E2E flow tests
```

### Test Setup

**File**: `app/src/__tests__/setup.ts`

This file configures:
- jsdom environment (browser simulation)
- React Testing Library setup
- Supabase client mocks
- Global test utilities

## Writing Component Tests

### Basic Component Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueueItem } from '@/components/QueueItem'

describe('QueueItem', () => {
  it('renders track information', () => {
    const submission = {
      id: '1',
      track_title: 'Test Track',
      artist_name: 'Test Artist',
      file_url: 'https://example.com/track.mp3',
      status: 'pending' as const,
    }

    render(
      <QueueItem
        submission={submission}
        isHost={false}
      />
    )

    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })
})
```

### Testing Different States

**Example**: Testing QueueItem with different status values

```typescript
describe('QueueItem status states', () => {
  const baseSubmission = {
    id: '1',
    track_title: 'Test Track',
    artist_name: 'Test Artist',
    file_url: 'https://example.com/track.mp3',
  }

  it('renders pending state', () => {
    render(
      <QueueItem
        submission={{ ...baseSubmission, status: 'pending' }}
        isHost={true}
      />
    )
    expect(screen.getByText('Approve')).toBeInTheDocument()
  })

  it('renders approved state', () => {
    render(
      <QueueItem
        submission={{ ...baseSubmission, status: 'approved' }}
        isHost={true}
      />
    )
    expect(screen.getByText('Play')).toBeInTheDocument()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('renders playing state', () => {
    render(
      <QueueItem
        submission={{ ...baseSubmission, status: 'playing' }}
        isHost={true}
      />
    )
    // Play button should not be visible when playing
    expect(screen.queryByText('Play')).not.toBeInTheDocument()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

**Example**: Testing button clicks

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('QueueItem interactions', () => {
  it('calls onApprove when approve button is clicked', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()

    render(
      <QueueItem
        submission={{
          id: '1',
          track_title: 'Test Track',
          artist_name: 'Test Artist',
          file_url: null,
          status: 'pending',
        }}
        isHost={true}
        onApprove={onApprove}
      />
    )

    const approveButton = screen.getByText('Approve')
    await user.click(approveButton)

    expect(onApprove).toHaveBeenCalledWith('1')
  })
})
```

### Testing Loading States

```typescript
it('shows loading state', () => {
  render(
    <QueueItem
      submission={submission}
      isHost={true}
      isLoading={true}
      onApprove={vi.fn()}
    />
  )

  expect(screen.getByText('Approving...')).toBeInTheDocument()
})
```

### Testing Conditional Rendering

```typescript
it('hides host actions when isHost is false', () => {
  render(
    <QueueItem
      submission={{ ...submission, status: 'approved' }}
      isHost={false}
    />
  )

  expect(screen.queryByText('Play')).not.toBeInTheDocument()
  expect(screen.queryByText('Skip')).not.toBeInTheDocument()
})
```

## Testing Hooks

### Testing Real-time Hooks

**Example**: Testing `useRealtimeQueue`

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useRealtimeQueue } from '@/lib/hooks/useRealtimeQueue'

describe('useRealtimeQueue', () => {
  it('returns submissions for event', async () => {
    const { result } = renderHook(() => useRealtimeQueue('test-event-id'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.submissions).toBeDefined()
  })
})
```

**Note**: Real-time hooks require Supabase client mocking (see `setup.ts`)

## Testing API Routes

### Basic API Route Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/queue/approve/route'
import { NextRequest } from 'next/server'

describe('POST /api/queue/approve', () => {
  it('approves a submission', async () => {
    const request = new NextRequest('http://localhost/api/queue/approve', {
      method: 'POST',
      body: JSON.stringify({ submissionId: 'test-id' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

## Testing Best Practices

### 1. Test User Behavior, Not Implementation

**Good**:
```typescript
it('shows track title to user', () => {
  render(<QueueItem submission={submission} />)
  expect(screen.getByText('Test Track')).toBeInTheDocument()
})
```

**Avoid**:
```typescript
it('renders track_title prop', () => {
  // Testing implementation details, not user-visible behavior
})
```

### 2. Test Edge Cases

**Examples**:
- Null/undefined props
- Empty strings
- Missing file URLs
- Loading states
- Error states
- Disabled buttons

### 3. Use Descriptive Test Names

**Good**:
```typescript
it('displays loading spinner when isLoading is true', () => {})
it('calls onPlay callback when play button is clicked', () => {})
it('hides approve button when status is not pending', () => {})
```

**Avoid**:
```typescript
it('works', () => {})
it('test 1', () => {})
```

### 4. Group Related Tests

Use `describe` blocks to organize tests:

```typescript
describe('QueueItem', () => {
  describe('rendering', () => {
    it('renders track title', () => {})
    it('renders artist name', () => {})
  })

  describe('host actions', () => {
    it('shows approve button for pending submissions', () => {})
    it('shows play button for approved submissions', () => {})
  })

  describe('interactions', () => {
    it('calls onApprove when approve is clicked', () => {})
    it('calls onPlay when play is clicked', () => {})
  })
})
```

### 5. Mock External Dependencies

**Supabase Client**:
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            subscribe: vi.fn(() => ({
              unsubscribe: vi.fn(),
            })),
          })),
        })),
      })),
    })),
  })),
}))
```

**API Calls**:
```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
)
```

## Pre-commit Testing Workflow

### Before Making Changes

1. **Run existing tests** to ensure baseline:
   ```bash
   npm test
   ```

2. **Check linting**:
   ```bash
   npm run lint
   ```

### While Making Changes

1. **Run tests in watch mode**:
   ```bash
   npm test -- --watch
   ```

2. **Tests run automatically** on file save
3. **Fix failing tests** as you go

### After Making Changes

1. **Run full test suite**:
   ```bash
   npm test
   ```

2. **Run linter**:
   ```bash
   npm run lint
   ```

3. **Check test coverage** (if configured):
   ```bash
   npm run test:coverage
   ```

4. **Visual testing** in playground:
   - Open `http://localhost:3000/(dev)/playground`
   - Test component with different props/states

5. **Manual browser testing**:
   - Open dev server: `npm run dev`
   - Test in actual browser
   - Check responsive breakpoints

## Common Testing Patterns

### Testing Design System Compliance

```typescript
it('uses dw-accent for play button', () => {
  const { container } = render(
    <QueueItem
      submission={{ ...submission, status: 'approved' }}
      isHost={true}
    />
  )

  const playButton = screen.getByText('Play')
  expect(playButton).toHaveClass('bg-dw-accent')
})
```

### Testing Accessibility

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<QueueItem submission={submission} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Testing Responsive Behavior

```typescript
it('adapts layout for mobile', () => {
  // Mock window width
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  })

  render(<QueueItem submission={submission} />)
  // Test mobile-specific behavior
})
```

## Debugging Tests

### View Test Output

**Verbose Output**:
```bash
npm test -- --reporter=verbose
```

**Watch Mode**:
```bash
npm test -- --watch
```

### Debug Failing Tests

1. **Add console.log** statements
2. **Use screen.debug()** to see rendered output:
   ```typescript
   render(<QueueItem submission={submission} />)
   screen.debug() // Prints DOM structure
   ```
3. **Use screen.getByRole** queries for better debugging:
   ```typescript
   screen.getByRole('button', { name: 'Play' })
   ```

### Common Issues

**Test Times Out**:
- Check for unclosed subscriptions
- Ensure async operations complete
- Use `waitFor` for async updates

**Cannot Find Element**:
- Use `screen.debug()` to see rendered output
- Check if element is conditionally rendered
- Verify query is correct (use `getByRole` when possible)

**Mock Not Working**:
- Ensure mock is defined before import
- Check mock path matches import path
- Use `vi.mock` correctly

## Test Coverage Goals

### Component Coverage
- **Minimum**: 80% line coverage
- **Target**: 90%+ line coverage
- **Focus**: User-visible behavior, edge cases

### What to Test
- ✅ All component props variations
- ✅ All status/state combinations
- ✅ User interactions (clicks, inputs)
- ✅ Loading states
- ✅ Error states
- ✅ Conditional rendering
- ✅ Design system compliance

### What Not to Test
- ❌ Internal implementation details
- ❌ Third-party library behavior
- ❌ CSS styling (use visual tests)
- ❌ Type definitions (TypeScript handles this)

## Continuous Integration

### Pre-commit Hooks (Recommended)

Add to `package.json`:
```json
{
  "scripts": {
    "pre-commit": "npm run lint && npm test"
  }
}
```

### CI Pipeline

Recommended checks:
1. Lint: `npm run lint`
2. Type check: `npx tsc --noEmit`
3. Tests: `npm test`
4. Build: `npm run build`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Accessibility Testing](https://www.npmjs.com/package/@axe-core/react)