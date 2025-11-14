# Design Guidelines: Word Puzzle Game

## Design Approach

**Selected Approach**: Design System + Game-Focused Reference  
Drawing inspiration from successful word games (Wordle, NYT Games, Spelling Bee) combined with Material Design's component patterns for tabs and lists. Focus on typography-driven, distraction-free gameplay with clear interactive feedback.

**Key Principles**:
- Clean, focused gameplay without visual clutter
- Clear typographic hierarchy emphasizing words over UI chrome
- Intuitive touch/click interactions for letter manipulation
- Instant visual feedback for valid/invalid word attempts

## Typography System

**Font Stack**: 
- Primary: Inter or DM Sans (via Google Fonts CDN)
- Monospace: JetBrains Mono for letter tiles

**Hierarchy**:
- Screen Titles: text-3xl font-bold
- Source Words (List): text-xl font-semibold
- Found Words: text-base font-medium
- Letter Tiles: text-2xl font-bold (monospace)
- Tab Labels: text-sm font-medium uppercase tracking-wide
- Input Field: text-lg
- Helper Text/Counts: text-sm text-opacity-70

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, py-8)

**Screen Structure**:
- Max container width: max-w-4xl mx-auto
- Screen padding: px-4 py-6
- Component spacing: space-y-6
- Card/Section padding: p-6

## Component Library

### Source Words List Screen
- **Header Bar**: Fixed top, contains app title and "Add New" button (top-right)
- **Word Cards**: Grid layout (grid-cols-1 gap-4), each card displays source word prominently with word count indicator, clickable entire card
- **Add Word Modal**: Centered overlay with input field, character counter, save/cancel buttons

### Game Screen
- **Top Bar**: Source word displayed large and centered, back button (top-left)
- **Letter Manipulation Bar**: Horizontal scrollable strip of individual letter tiles (draggable), shuffle button at end, each tile is rounded square with monospace letter
- **Tab Navigation**: Horizontal tabs showing each letter of alphabet present in found words, sticky below letter bar, active tab indicated with underline accent
- **Word Input Section**: Large text input with "Check Word" button, displays validation feedback (success/error) below
- **Found Words List**: Within active tab, alphabetically sorted, simple list items with subtle separators, word count badge for each tab
- **Stats Footer**: Total words found counter, progress indicator

### Interactive Elements
- **Letter Tiles**: Rounded squares (aspect-square), draggable with grab cursor, slight elevation on drag, snap back animation if invalid drop
- **Buttons**: Rounded (rounded-lg), medium size (px-6 py-3), primary action stands out, secondary outlined style
- **Tabs**: Equal width distribution, smooth underline transition, tap target minimum 44px height
- **Input Field**: Large touch target (h-14), rounded (rounded-lg), clear focus state with border accent

### Icons
Use Heroicons (outline style) via CDN:
- Plus icon for "Add New"
- Arrow-left for back navigation  
- Shuffle icon for letter randomization
- Check icon for word validation success
- X icon for validation errors

### Feedback & States
- **Success State**: Subtle background flash, checkmark animation
- **Error State**: Gentle shake animation on input, error message below
- **Loading State**: Subtle spinner during API validation
- **Empty States**: Centered message with icon for no words found yet

### Mobile Optimization
- All touch targets minimum 44px
- Letter tiles sized for comfortable dragging (min 48px square)
- Horizontal scroll for letter bar (no wrapping)
- Tabs scroll horizontally on narrow screens
- Bottom padding for keyboard overlap (pb-20 on input focus)

## Animations

Use sparingly and purposefully:
- Tab underline transition (300ms ease)
- Letter tile drag/drop with spring physics
- Success/error shake (200ms)
- Modal fade in/out (200ms)

## Accessibility

- Focus visible states on all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation for letter tiles (arrow keys to reorder)
- Screen reader announcements for word validation results
- High contrast ratios for text (WCAG AA minimum)

## PWA Considerations

- Full viewport height usage (h-screen) for app-like feel
- Fixed header/navigation bars
- Pull-to-refresh disabled
- Offline state messaging when API unavailable
- Install prompt for returning users

---

**No Images Required**: This game is purely typography and UI-driven. No hero image or decorative imagery needed - focus remains entirely on the word puzzle mechanics.