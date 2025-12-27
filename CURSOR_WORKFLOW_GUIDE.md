# Cursor IDE Workflow Guide for UX/UI Development

This guide explains how to leverage Cursor's features for efficient UX/UI component development in the demonstr8 project.

## Navigation & Discovery

### Quick File Navigation

**Open File by Name**:
- `Cmd+P` (Mac) or `Ctrl+P` (Windows)
- Type filename (e.g., `QueueItem.tsx`)
- Use fuzzy matching for partial names

**Go to Symbol in File**:
- `Cmd+Shift+O` (Mac) or `Ctrl+Shift+O` (Windows)
- See all exports, functions, and components in current file
- Jump directly to specific symbol

**Go to Symbol in Workspace**:
- `Cmd+T` (Mac) or `Ctrl+T` (Windows)
- Search for components/functions across entire codebase
- Type `@QueueItem` to find component

### Understanding Code Relationships

**Peek Definition** (View without navigating):
- `Alt+F12` (Mac/Windows)
- Hover over component name, see definition in popup
- Press `Escape` to close without leaving current file

**Go to Definition**:
- `F12` or `Cmd+Click` (Mac) / `Ctrl+Click` (Windows)
- Navigate to component/function definition
- `Cmd+-` (Mac) / `Ctrl+-` (Windows) to go back

**Find All References**:
- `Shift+F12`
- See everywhere a component/function is used
- Click reference to jump to that location

**Go to Type Definition**:
- `Cmd+Click` (Mac) / `Ctrl+Click` (Windows) on type name
- See type definitions in `app/src/lib/types.ts`

### Code Structure View

**Outline View**:
- Open in sidebar (View → Outline)
- See file structure: exports, functions, components
- Click to jump to that section
- Expandable tree view

**Breadcrumbs**:
- Enabled at top of editor
- Shows file path: `app/src/components/QueueItem.tsx`
- Click any segment to navigate up the hierarchy

## Multi-File Context

### Split Editor

**Open Side-by-Side**:
- `Cmd+\` (Mac) / `Ctrl+\` (Windows) to split editor
- Drag file tabs between panes
- View component and its usage simultaneously

**Recommended Split Views**:
1. Component + Test file
2. Component + Page using it
3. Component + Types file
4. Component + UX checklist

### Tab Groups

**Organize Related Files**:
- Drag tabs to create groups
- Useful for viewing:
  - Component implementation
  - Component usage (parent component)
  - Component tests
  - Design system docs

## Code Intelligence

### Auto-complete & Suggestions

**Component Props**:
- Type component name, see prop suggestions
- Hover over prop to see type and description
- `Ctrl+Space` to trigger autocomplete

**Import Auto-complete**:
- Type import statement, see suggestions
- Cursor suggests correct import paths
- Auto-organizes imports

### Inline Documentation

**Hover for Info**:
- Hover over component/function name
- See JSDoc comments, prop types, return types
- Press `Ctrl+K Ctrl+I` (Mac/Windows) to pin hover info

**JSDoc Comments**:
- Each component has "What/Why/How" documentation
- Hover to see full documentation
- Use `/**` to create JSDoc blocks

## Testing Workflow

### Running Tests

**Run Single Test**:
```bash
npm test QueueItem
```

**Run All Tests**:
```bash
npm test
```

**Watch Mode**:
- Tests run automatically on file save
- Use Cursor terminal (`` Ctrl+` ``) to run tests
- See results inline in test file

### Test Navigation

**Jump Between Test and Implementation**:
- `F12` on component name in test to go to implementation
- `Cmd+K Cmd+F2` (Mac) / `Ctrl+K Ctrl+F2` (Windows) to find all references
- Quick switch between test and source

**Test Explorer**:
- View → Testing (if using test extension)
- See all tests, run individual tests
- See pass/fail status

## Linting & Formatting

### ESLint Integration

**View Errors**:
- Problems panel (View → Problems)
- Red squiggles in editor
- Hover to see error message

**Fix Errors**:
- `Cmd+.` (Mac) / `Ctrl+.` (Windows) on error
- Choose "Fix all auto-fixable problems"
- Or use individual quick fixes

**Run Linter**:
```bash
npm run lint
```

### Format on Save

**Auto-format**:
- Configured in Cursor settings
- Code formats automatically on save
- Uses Prettier/ESLint rules

## Component Development Workflow

### 1. Explore Existing Component

**Steps**:
1. `Cmd+P` → Type component name → Open file
2. `Cmd+Shift+O` → See component structure
3. `Shift+F12` → Find where it's used
4. `F12` on imports → See dependencies
5. Open test file: `QueueItem.test.tsx`
6. Open UX checklist: `UX_REVIEW_CHECKLIST.md`

**Recommended View**:
- Split editor: Component + Test file
- Outline view open in sidebar
- Problems panel visible

### 2. Modify Component

**Steps**:
1. Make changes to component
2. `Cmd+S` to save (auto-formats)
3. Check Problems panel for errors
4. Run tests: `npm test ComponentName`
5. Run linter: `npm run lint`
6. Open playground: `http://localhost:3000/(dev)/playground`
7. Review against UX checklist

**Quick Actions**:
- `Cmd+.` on error → Quick fix
- `Cmd+Click` on type → Check type definition
- `F2` on symbol → Rename (updates all references)

### 3. Test Component Visually

**Playground Page**:
- Navigate to `http://localhost:3000/(dev)/playground`
- Select component from list
- Test different states/props
- Verify styling matches design system

**Browser DevTools**:
- Open browser (Cursor can open URLs)
- Inspect element to verify classes
- Check responsive breakpoints
- Test keyboard navigation

### 4. Review Against Checklist

**UX Review Checklist**:
- Open `UX_REVIEW_CHECKLIST.md`
- Go through each section:
  - Design system compliance
  - Accessibility
  - Component states
  - Responsive design
  - Interaction & feedback
- Check off items as verified

## Debugging

### Type Errors

**View Type Errors**:
- Problems panel shows TypeScript errors
- Red squiggles in editor
- Hover to see error message

**Fix Type Errors**:
- `Cmd+.` on error → See suggested fixes
- `F12` on type → Check type definition
- Update types in `app/src/lib/types.ts` if needed

### Runtime Errors

**Browser Console**:
- Open dev server: `npm run dev`
- Open browser console
- See React errors and warnings
- Check network tab for API errors

**React DevTools**:
- Install React DevTools extension
- Inspect component props/state
- See component tree hierarchy

## Keyboard Shortcuts Cheat Sheet

### Navigation
- `Cmd+P` / `Ctrl+P` - Quick open file
- `Cmd+Shift+O` / `Ctrl+Shift+O` - Go to symbol in file
- `Cmd+T` / `Ctrl+T` - Go to symbol in workspace
- `F12` - Go to definition
- `Shift+F12` - Find all references
- `Alt+F12` - Peek definition
- `Cmd+-` / `Ctrl+-` - Go back
- `Cmd+Shift+-` / `Ctrl+Shift+-` - Go forward

### Editing
- `Cmd+\` / `Ctrl+\` - Split editor
- `Cmd+.` / `Ctrl+.` - Quick fix/refactor
- `F2` - Rename symbol
- `Cmd+D` / `Ctrl+D` - Select next occurrence
- `Cmd+Shift+L` / `Ctrl+Shift+L` - Select all occurrences

### View
- `` Ctrl+` `` - Toggle terminal
- `Cmd+B` / `Ctrl+B` - Toggle sidebar
- `Cmd+J` / `Ctrl+J` - Toggle panel
- `Cmd+Shift+E` / `Ctrl+Shift+E` - Explorer
- `Cmd+Shift+F` / `Ctrl+Shift+F` - Search in files

## Recommended Cursor Settings

**Enable**:
- Format on save
- Auto-import suggestions
- TypeScript validation
- ESLint validation
- Inline suggestions

**Configure**:
- Font size (for code review)
- Tab size (2 spaces for this project)
- Word wrap (off for code, on for markdown)
- Minimap (helpful for large files)

## Workflow Templates

### Reviewing a Component

1. Open component file (`Cmd+P` → component name)
2. Open test file (`Cmd+P` → `Component.test.tsx`)
3. Open UX checklist (`Cmd+P` → `UX_REVIEW_CHECKLIST.md`)
4. Split editor: Component | Checklist
5. Go through checklist item by item
6. Check component usage: `Shift+F12` on component name
7. Run tests: `npm test ComponentName`
8. Open playground to test visually
9. Document findings

### Creating a New Component

1. Create component file in `app/src/components/`
2. Add JSDoc comment (What/Why/How)
3. Import types from `@/types`
4. Use design tokens (check `globals.css`)
5. Add to playground page for testing
6. Write tests in `app/src/__tests__/components/`
7. Review against UX checklist
8. Update `COMPONENT_HIERARCHY.md` if needed

### Fixing a Bug

1. Reproduce bug
2. Find relevant component (`Cmd+Shift+F` search)
3. `Shift+F12` to see all usages
4. Check test file for edge cases
5. Make fix
6. Run tests: `npm test`
7. Run linter: `npm run lint`
8. Test in playground/browser
9. Review against UX checklist
10. Commit fix

## Tips & Best Practices

**Stay Context-Aware**:
- Keep related files open in tab groups
- Use split editor for comparison
- Pin frequently used files

**Use Code Intelligence**:
- Rely on autocomplete for props/types
- Hover for documentation
- Use quick fixes for common errors

**Test Frequently**:
- Run tests after each change
- Use playground for visual testing
- Check multiple screen sizes

**Document as You Go**:
- Update UX checklist as you verify
- Add comments for complex logic
- Update component hierarchy docs

**Iterate Quickly**:
- Make small changes
- Test immediately
- Fix issues as you find them
- Don't accumulate technical debt