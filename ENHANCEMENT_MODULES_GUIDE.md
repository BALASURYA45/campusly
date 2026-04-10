# Smart Curriculum - Enhancement Modules Guide

**Version**: 2.0  
**Status**: Production Ready  
**Last Updated**: February 2026

---

## Overview

This document covers the advanced enhancement modules added to the Smart Curriculum application to meet enterprise-grade standards:

1. **Skeleton Loaders** - Professional loading states
2. **Theme Customization** - Dynamic brand theming
3. **Accessibility System** - WCAG AA+ compliance
4. **Animation Utilities** - Smooth transitions
5. **Typography System** - Professional text hierarchy

---

## 1. Skeleton Loaders

### Purpose
Provides professional loading skeletons while data is being fetched, improving perceived performance and user experience.

### Components Location
`frontend-web/src/components/SkeletonLoaders.js`

### Available Skeletons

#### **TableSkeleton**
```javascript
import { TableSkeleton } from '../components/SkeletonLoaders';

<TableSkeleton rows={10} columns={6} />
```

**Props:**
- `rows` (number): Number of table rows to display
- `columns` (number): Number of columns

**Use Case**: Data tables, lists with multiple columns

---

#### **CardSkeleton**
```javascript
import { CardSkeleton } from '../components/SkeletonLoaders';

<CardSkeleton count={3} />
```

**Props:**
- `count` (number): Number of skeleton cards to display

**Use Case**: Dashboard cards, product grids, gallery layouts

---

#### **DashboardSkeleton**
```javascript
import { DashboardSkeleton } from '../components/SkeletonLoaders';

<DashboardSkeleton />
```

**Use Case**: Full dashboard layout with header and metrics cards

---

#### **FormSkeleton**
```javascript
import { FormSkeleton } from '../components/SkeletonLoaders';

<FormSkeleton />
```

**Use Case**: Form pages, registration, login forms

---

#### **ListSkeleton**
```javascript
import { ListSkeleton } from '../components/SkeletonLoaders';

<ListSkeleton items={8} />
```

**Props:**
- `items` (number): Number of list items

**Use Case**: Simple lists, activity feeds, comment sections

---

#### **DetailSkeleton**
```javascript
import { DetailSkeleton } from '../components/SkeletonLoaders';

<DetailSkeleton />
```

**Use Case**: Detail pages, user profiles, report views

---

### Usage Example

```javascript
import { useState, useEffect } from 'react';
import { TableSkeleton } from '../components/SkeletonLoaders';
import API from '../utils/api';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/users?role=student');
        setStudents(data.data);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  return (
    <>
      {loading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <StudentTable data={students} />
      )}
    </>
  );
};
```

---

## 2. Theme Customization System

### Purpose
Allows administrators to customize the application's color scheme and appearance without code changes.

### Backend

#### Theme Model
**Location**: `backend/src/models/Theme.js`

**Fields:**
```javascript
{
  name: String,
  description: String,
  primaryColor: String (hex),
  secondaryColor: String (hex),
  backgroundColor: String (hex),
  textColor: String (hex),
  successColor: String (hex),
  errorColor: String (hex),
  warningColor: String (hex),
  infoColor: String (hex),
  darkMode: {
    enabled: Boolean,
    primaryColor: String,
    secondaryColor: String,
    backgroundColor: String,
    textColor: String
  },
  settings: {
    roundedCorners: Boolean,
    shadowDepth: String,
    animationDuration: Number,
    fontFamily: String
  },
  isActive: Boolean,
  isSystem: Boolean,
  createdBy: ObjectId
}
```

#### API Endpoints
**Base URL**: `/api/v1/admin/theme`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/active` | Public | Get current active theme |
| GET | `/presets` | Public | Get available theme presets |
| GET | `/` | Admin | Get all themes |
| GET | `/:id` | Admin | Get single theme |
| POST | `/` | Admin | Create new theme |
| PUT | `/:id` | Admin | Update theme |
| PUT | `/:id/activate` | Admin | Activate theme |
| POST | `/:id/duplicate` | Admin | Duplicate theme |
| DELETE | `/:id` | Admin | Delete theme |
| PUT | `/reset` | SuperAdmin | Reset to default |

### Frontend

#### Theme Customization Page
**Location**: `frontend-web/src/pages/ThemeCustomization.js`

**Features:**
- Quick preset themes
- Custom color picker for each element
- Live preview
- Save and reset functionality

#### Usage
```javascript
// Access from admin dashboard
// Path: /theme
// Available for: admin, superadmin roles
```

### Creating Custom Themes

#### Via API
```javascript
const customTheme = {
  name: 'Corporate Blue',
  primaryColor: '#003d82',
  secondaryColor: '#0066cc',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  successColor: '#2d8659',
  errorColor: '#c41e3a',
  warningColor: '#ff9800',
  infoColor: '#0099ff',
};

await API.post('/admin/theme', customTheme);
```

#### Built-in Presets

**1. Default Blue** (OOTB)
- Professional, enterprise-ready
- High contrast, accessible

**2. Dark Mode**
- Eye-friendly, low-light environments
- Modern aesthetic

**3. Green Nature**
- Educational, eco-friendly
- Calm, growth-oriented

**4. Purple Elite**
- Premium, sophisticated
- Modern, trendy

### Theme Persistence

- Themes are stored in MongoDB
- One theme active at a time
- Theme applied globally via Socket.io broadcast
- User preference remembered in localStorage

---

## 3. Accessibility System

### Purpose
Ensures compliance with WCAG 2.1 AA standards for inclusive user experience.

### Location
`frontend-web/src/utils/accessibility.js`

### Key Features

#### A11y Helper Object
```javascript
import { A11Y } from '../utils/accessibility';

// Color contrast ratios
A11Y.contrast.AA        // 4.5:1
A11Y.contrast.AAA       // 7:1

// Focus styles
A11Y.focusStyles        // { outline: '2px solid #0000FF', outlineOffset: '2px' }

// Keyboard mappings
A11Y.keyboardMap.Enter  // 13
A11Y.keyboardMap.Escape // 27
A11Y.keyboardMap.Tab    // 9

// ARIA labels
A11Y.ariaLabels.closeButton  // 'Close dialog'
A11Y.ariaLabels.searchButton // 'Search'
```

---

#### Accessible Props Generator
```javascript
import { createA11yProps } from '../utils/accessibility';

const props = createA11yProps({
  label: 'Submit Form',
  role: 'button',
  disabled: false,
  required: true,
});

<button {...props}>Submit</button>
```

**Parameters:**
- `label`: ARIA label
- `role`: Semantic role
- `expanded`: For expandable elements
- `disabled`: Disabled state
- `required`: Required field
- `invalid`: Invalid state
- `describedBy`: Error/help text ID

---

#### Screen Reader Announcements
```javascript
import { announceScreenReader } from '../utils/accessibility';

announceScreenReader('Form submitted successfully', 'polite');
announceScreenReader('Error: Invalid email format', 'assertive');
```

**Priorities:**
- `polite` - Wait for pause, non-intrusive
- `assertive` - Interrupt, important alerts

---

#### Focus Management
```javascript
import { focusManager } from '../utils/accessibility';

// Set focus to element
focusManager.setFocus('#submit-button');
focusManager.setFocus(elementRef);

// Trap focus within modal
focusManager.trapFocus(modalElement);
```

---

#### Accessible Forms
```javascript
import { createAccessibleForm } from '../utils/accessibility';

const formFields = [
  { name: 'email', label: 'Email Address', required: true },
  { name: 'password', label: 'Password', required: true, error: null },
];

const accessibleFields = createAccessibleForm(formFields);
```

---

#### Accessible Buttons
```javascript
import { createAccessibleButton } from '../utils/accessibility';

const buttonProps = createAccessibleButton({
  label: 'Delete User',
  onClick: handleDelete,
  disabled: false,
  ariaLabel: 'Delete selected user',
});

<button {...buttonProps}>Delete</button>
```

---

#### Keyboard Shortcuts
```javascript
import { keyboardShortcuts } from '../utils/accessibility';

// Register keyboard shortcuts
keyboardShortcuts.register('S', 'ctrl', () => {
  // Save functionality
});

keyboardShortcuts.register('D', 'alt', () => {
  // Delete functionality
});

// Display help with available shortcuts
// Accessible via '?' key
```

---

### WCAG Compliance Checklist

✅ **Color Contrast**: 4.5:1 minimum (AA standard)
✅ **Focus Indicators**: 2px solid outline
✅ **Keyboard Navigation**: Full keyboard support
✅ **Screen Reader**: Proper ARIA labels
✅ **Forms**: Associated labels, error messages
✅ **Images**: Alt text required
✅ **Motion**: Respects prefers-reduced-motion
✅ **Timing**: No auto-playing content
✅ **Semantics**: Proper HTML structure

---

## 4. Animation Utilities

### Purpose
Provides smooth, performant animations for enhanced UX without overwhelming users.

### Location
`frontend-web/src/utils/animations.js`

### Animation Types

#### Built-in Keyframes

**Fade In**
```javascript
import { fadeIn, animationStyles } from '../utils/animations';

<Box sx={animationStyles.fadeIn}>Content</Box>
```
- Duration: 0.3s
- Timing: ease-in-out

**Slide In (All Directions)**
```javascript
// Slide from left
<Box sx={animationStyles.slideInLeft}>

// Slide from right
<Box sx={animationStyles.slideInRight}>

// Slide from up
<Box sx={animationStyles.slideInUp}>

// Slide from down
<Box sx={animationStyles.slideInDown}>
```

**Scale In**
```javascript
<Box sx={animationStyles.scaleIn}>Content</Box>
```
- Duration: 0.3s
- Perfect for expanding elements

**Bounce**
```javascript
<Box sx={animationStyles.bounce}>Content</Box>
```
- Duration: 0.6s, infinite
- Use for loading indicators

**Pulse**
```javascript
<Box sx={animationStyles.pulse}>Content</Box>
```
- Duration: 2s, infinite
- Use for attention-grabbing, breathing effects

**Rotate**
```javascript
<Box sx={animationStyles.rotate}>Content</Box>
```
- Duration: 1s, infinite
- Use for spinners, loading

**Shake**
```javascript
<Box sx={animationStyles.shake}>Content</Box>
```
- Duration: 0.5s
- Use for error states, attention

---

### Transition Styles

```javascript
import { transitionStyles } from '../utils/animations';

// Smooth transition (0.3s)
<Box sx={transitionStyles.smooth}>

// Fast transition (0.15s)
<Box sx={transitionStyles.smoothFast}>

// Slow transition (0.5s)
<Box sx={transitionStyles.smoothSlow}>
```

---

### Hover Effects

```javascript
import { hoverEffects } from '../utils/animations';

// Elevate on hover with shadow
<Card sx={hoverEffects.elevateOnHover}>

// Scale up on hover
<Paper sx={hoverEffects.scaleOnHover}>

// Brighten on hover
<Button sx={hoverEffects.brightenOnHover}>
```

---

### Usage Example

```javascript
import { slideInUp, transitionStyles, hoverEffects } from '../utils/animations';

const Page = () => {
  return (
    <Box sx={{ ...slideInUp, ...transitionStyles.smooth }}>
      <Card sx={hoverEffects.elevateOnHover}>
        <Typography>Interactive content</Typography>
      </Card>
    </Box>
  );
};
```

---

### Performance Best Practices

✅ Use `transform` and `opacity` for better performance
✅ Keep animations under 0.5s for UI interactions
✅ Use `will-change` for frequently animated elements
✅ Avoid animating on low-end devices
✅ Respect `prefers-reduced-motion` preference

---

## 5. Typography System

### Purpose
Provides a consistent, professional text hierarchy throughout the application.

### Location
`frontend-web/src/utils/typography.js`

### Font Stack

```javascript
Primary: Inter, Roboto, Helvetica, Arial, sans-serif
Secondary: Poppins, Roboto, Helvetica, Arial, sans-serif
Monospace: Roboto Mono, Courier New, monospace
```

### Font Sizes

| Size | Rem | Px | Usage |
|------|-----|-----|-------|
| xs | 0.75rem | 12px | Captions, helper text |
| sm | 0.875rem | 14px | Small body text |
| base | 1rem | 16px | Default body text |
| lg | 1.125rem | 18px | Large body text |
| xl | 1.25rem | 20px | Subheadings |
| 2xl | 1.5rem | 24px | Section headings |
| 3xl | 1.875rem | 30px | Page titles |
| 4xl | 2.25rem | 36px | Display headers |
| 5xl | 3rem | 48px | Hero text |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Subtle, secondary text |
| Normal | 400 | Body text |
| Medium | 500 | Labels, emphasis |
| Semibold | 600 | Headings, strong |
| Bold | 700 | Major headings |
| Extrabold | 800 | Display text |
| Black | 900 | Heavy emphasis |

### Text Styles

#### Display Styles (Heroes, Large Text)

```javascript
import { textStyles } from '../utils/typography';

// Large display
<Typography sx={textStyles.displayLarge}>
  2.25rem, Bold, 1.2 line height
</Typography>

// Medium display
<Typography sx={textStyles.displayMedium}>
  1.875rem, Bold, 1.3 line height
</Typography>

// Small display
<Typography sx={textStyles.displaySmall}>
  1.5rem, Semibold, 1.3 line height
</Typography>
```

#### Headline Styles

```javascript
<Typography sx={textStyles.headlineLarge}>1.875rem</Typography>
<Typography sx={textStyles.headlineMedium}>1.5rem</Typography>
<Typography sx={textStyles.headlineSmall}>1.25rem</Typography>
```

#### Title Styles

```javascript
<Typography sx={textStyles.titleLarge}>1.25rem</Typography>
<Typography sx={textStyles.titleMedium}>1rem</Typography>
<Typography sx={textStyles.titleSmall}>0.875rem</Typography>
```

#### Body Styles

```javascript
<Typography sx={textStyles.bodyLarge}>1rem, 1.625 line height</Typography>
<Typography sx={textStyles.bodyMedium}>0.875rem, 1.5 line height</Typography>
<Typography sx={textStyles.bodySmall}>0.75rem, 1.5 line height</Typography>
```

#### Label Styles

```javascript
<Typography sx={textStyles.labelLarge}>0.875rem, Semibold</Typography>
<Typography sx={textStyles.labelMedium}>0.75rem, Semibold</Typography>
<Typography sx={textStyles.labelSmall}>0.625rem, Semibold</Typography>
```

### Using with Material-UI

```javascript
import { getMuiTypography } from '../utils/typography';

const theme = createTheme({
  typography: getMuiTypography(),
});

// Now use standard variants
<Typography variant="h1">Page Title</Typography>
<Typography variant="h2">Section</Typography>
<Typography variant="body1">Paragraph</Typography>
<Typography variant="button">Button Text</Typography>
```

---

## Implementation Best Practices

### 1. Skeleton Loaders

✅ Always show skeleton while loading
✅ Match actual content dimensions
✅ Use consistent skeleton height/width
✅ Fade out skeleton when content loaded

### 2. Theme Customization

✅ Test contrast ratios for accessibility
✅ Provide clear brand guidelines
✅ Use HSL color picking for better control
✅ Validate hex color format

### 3. Accessibility

✅ Include ARIA labels on all interactive elements
✅ Test with keyboard only
✅ Use semantic HTML
✅ Provide skip links
✅ Test with screen readers

### 4. Animations

✅ Keep animations subtle (< 0.5s)
✅ Respect prefers-reduced-motion
✅ Use GPU-accelerated properties
✅ Avoid animation spam
✅ Test performance impact

### 5. Typography

✅ Maintain consistent hierarchy
✅ Ensure readability (minimum 16px for body)
✅ Use appropriate line heights (1.4-1.8)
✅ Limit font families (max 2-3)
✅ Test on multiple devices

---

## Testing Guidelines

### Accessibility Testing
```bash
# Browser extensions
- WAVE Evaluation Tool
- axe DevTools
- Lighthouse (Chrome DevTools)

# Keyboard testing
- Tab through all interactive elements
- Ensure focus visible
- Test all shortcuts

# Screen reader testing
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac)
```

### Performance Testing
```bash
# Animation performance
- Check frame rate (60fps target)
- Monitor GPU usage
- Profile with DevTools

# Loading states
- Test with slow network
- Verify skeleton dimensions
- Check state transitions
```

---

## Migration Guide

### From Old Design System

```javascript
// OLD
<Box sx={{ animation: 'fadeIn 0.3s' }}>

// NEW
import { animationStyles } from '../utils/animations';
<Box sx={animationStyles.fadeIn}>
```

```javascript
// OLD
<Typography style={{ fontSize: '24px', fontWeight: 'bold' }}>

// NEW
import { textStyles } from '../utils/typography';
<Typography sx={textStyles.headlineMedium}>
```

---

## API Reference

### All Exported Functions

**animations.js**
- `fadeIn`, `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`
- `scaleIn`, `bounce`, `pulse`, `rotate`, `shake`
- `animationStyles` (object)
- `transitionStyles` (object)
- `hoverEffects` (object)

**accessibility.js**
- `A11Y` (object)
- `createA11yProps(options)`
- `announceScreenReader(message, priority)`
- `focusManager` (object)
- `createAccessibleForm(fields)`
- `createAccessibleButton(options)`
- `colorPaletteA11y` (object)
- `keyboardShortcuts` (object)

**typography.js**
- `typographySystem` (object)
- `textStyles` (object)
- `getMuiTypography()` (function)

**SkeletonLoaders.js**
- `TableSkeleton`, `CardSkeleton`, `DashboardSkeleton`
- `FormSkeleton`, `ListSkeleton`, `DetailSkeleton`

---

## Support & Resources

- [Material-UI Components](https://mui.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility by WebAIM](https://webaim.org/)
- [CSS Animations Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Typography Best Practices](https://www.smashingmagazine.com/2020/07/typography-design-system/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Feb 2026 | Initial release with all 5 enhancement modules |
| 1.0 | - | Base Smart Curriculum system |

---

**Status**: ✅ Production Ready  
**Last Reviewed**: February 2026  
**Maintainer**: Smart Curriculum Dev Team
