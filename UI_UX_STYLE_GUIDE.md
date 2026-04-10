# Smart Curriculum - UI/UX Style Guide

## Table of Contents
1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Accessibility](#accessibility)
8. [Dark Mode](#dark-mode)
9. [Responsive Design](#responsive-design)
10. [Usage Examples](#usage-examples)

---

## Design Principles

### 1. **Clarity**
- Clear information hierarchy
- Intuitive navigation
- Consistent visual language
- Meaningful icons and labels

### 2. **Consistency**
- Unified design system
- Reusable components
- Predictable interactions
- Standard patterns for similar tasks

### 3. **Accessibility**
- WCAG AA compliance
- Keyboard navigation support
- Proper color contrast
- Screen reader optimization

### 4. **Responsiveness**
- Mobile-first design
- Flexible layouts
- Touch-friendly interactions
- Adaptive typography

### 5. **User Empathy**
- Minimize cognitive load
- Provide helpful feedback
- Error prevention
- Clear call-to-actions

---

## Color System

### Light Mode Palette

| Component | Color | Hex |
|-----------|-------|-----|
| Primary | Blue | `#1976d2` |
| Primary Light | Light Blue | `#42a5f5` |
| Primary Dark | Dark Blue | `#1565c0` |
| Secondary | Pink | `#dc004e` |
| Success | Green | `#4caf50` |
| Error | Red | `#f44336` |
| Warning | Orange | `#ff9800` |
| Info | Light Blue | `#2196f3` |
| Background | White | `#ffffff` |
| Surface | Light Gray | `#f5f5f5` |
| Text Primary | Black | `#000000` |
| Text Secondary | Gray | `#666666` |

### Dark Mode Palette

| Component | Color | Hex |
|-----------|-------|-----|
| Primary | Light Blue | `#90caf9` |
| Secondary | Light Pink | `#f48fb1` |
| Success | Light Green | `#66bb6a` |
| Error | Light Red | `#ef5350` |
| Warning | Light Orange | `#ffa726` |
| Background | Very Dark | `#121212` |
| Surface | Dark Gray | `#1e1e1e` |
| Text Primary | White | `#ffffff` |
| Text Secondary | Light Gray | `#b0b0b0` |

### Color Usage Guidelines

**Primary Color** - Use for:
- Call-to-action buttons
- Primary navigation
- Active states
- Links

**Secondary Color** - Use for:
- Secondary actions
- Accents
- Highlights
- Supporting elements

**Semantic Colors** - Use for:
- Success: Positive actions, confirmations
- Error: Errors, destructive actions
- Warning: Warnings, alerts
- Info: Informational messages

---

## Typography

### Font Families

```javascript
Primary: "Inter", "Roboto", "Helvetica", "Arial", sans-serif
Secondary: "Poppins", "Roboto", "Helvetica", "Arial", sans-serif
Mono: "Roboto Mono", "Courier New", monospace
```

### Font Sizes

| Size | Value | Rem | Px |
|------|-------|-----|-----|
| xs | 0.75rem | - | 12px |
| sm | 0.875rem | - | 14px |
| base | 1rem | - | 16px |
| lg | 1.125rem | - | 18px |
| xl | 1.25rem | - | 20px |
| 2xl | 1.5rem | - | 24px |
| 3xl | 1.875rem | - | 30px |
| 4xl | 2.25rem | - | 36px |
| 5xl | 3rem | - | 48px |

### Font Weights

| Weight | Value |
|--------|-------|
| Light | 300 |
| Normal | 400 |
| Medium | 500 |
| Semibold | 600 |
| Bold | 700 |
| Extrabold | 800 |
| Black | 900 |

### Text Styles

#### Heading 1 (Display Large)
- Size: 2.25rem (36px)
- Weight: 700 (Bold)
- Line Height: 1.2
- Letter Spacing: -0.02em
- Use for: Page titles, major section headers

#### Heading 2 (Display Medium)
- Size: 1.875rem (30px)
- Weight: 700 (Bold)
- Line Height: 1.3
- Use for: Section headers, module titles

#### Heading 3 (Display Small)
- Size: 1.5rem (24px)
- Weight: 600 (Semibold)
- Line Height: 1.3
- Use for: Subsection headers

#### Heading 4 (Title Large)
- Size: 1.25rem (20px)
- Weight: 600 (Semibold)
- Use for: Card titles, form section headers

#### Heading 5 (Title Medium)
- Size: 1rem (16px)
- Weight: 600 (Semibold)
- Use for: Field labels, input titles

#### Body 1 (Large)
- Size: 1rem (16px)
- Weight: 400 (Normal)
- Line Height: 1.625
- Use for: Main content, paragraphs

#### Body 2 (Medium)
- Size: 0.875rem (14px)
- Weight: 400 (Normal)
- Line Height: 1.5
- Use for: Secondary content, descriptions

#### Caption/Small
- Size: 0.75rem (12px)
- Weight: 400 (Normal)
- Use for: Help text, secondary labels

---

## Spacing & Layout

### Spacing Scale

```
0px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 56px, 64px
```

### Margin/Padding Guidelines

| Component | Top | Right | Bottom | Left |
|-----------|-----|-------|--------|------|
| Page | 32px | 24px | 32px | 24px |
| Container | 24px | 24px | 24px | 24px |
| Card | 24px | 24px | 24px | 24px |
| Form Input | - | - | 16px | - |
| Button | 12px (V) | 24px (H) | 12px (V) | 24px (H) |

### Layout Grid

- Use 12-column grid system
- Gutter width: 16px
- Breakpoints:
  - xs: 0px - 600px
  - sm: 600px - 900px
  - md: 900px - 1200px
  - lg: 1200px - 1536px
  - xl: 1536px+

---

## Components

### Buttons

#### Button Sizes

```javascript
// Small
padding: 6px 16px;
fontSize: 0.75rem;

// Medium (Default)
padding: 8px 24px;
fontSize: 0.875rem;

// Large
padding: 12px 32px;
fontSize: 1rem;
```

#### Button Variants

**Contained (Filled)**
- Background: Primary color
- Text: White
- Use for: Primary actions

**Outlined**
- Background: Transparent
- Border: 2px solid
- Use for: Secondary actions

**Text**
- Background: Transparent
- Text: Primary color
- Use for: Tertiary actions

#### Button States

| State | Opacity | Transform |
|-------|---------|-----------|
| Default | 1 | translateY(0) |
| Hover | 1 | translateY(-2px) |
| Active | 0.9 | translateY(0) |
| Disabled | 0.5 | translateY(0) |

### Cards

- Border Radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Hover Shadow: 0 8px 24px rgba(0,0,0,0.12)
- Padding: 24px
- Transition: all 0.3s ease

### Input Fields

- Border Radius: 8px
- Height: 40px - 56px
- Padding: 12px 16px
- Border: 1px solid #e0e0e0
- Focus: Outline + shadow
- Error: Border color #f44336

### Chips

- Border Radius: 6px
- Padding: 6px 12px
- Font Weight: 600
- Variants: Filled, Outlined, Default

### Tables

- Row Height: 48px - 56px
- Cell Padding: 16px
- Header Background: #f5f5f5 (light) / #2a2a2a (dark)
- Hover Row: Highlight with 5% primary color

### Navigation

**Header**
- Height: 64px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- z-index: 1100

**Drawer**
- Width: 280px
- Elevation: 16

**Breadcrumb**
- Separator: /
- Active link: Bold

---

## Animations

### Transition Times

| Duration | Use Case |
|----------|----------|
| 0.15s | Fast interactions (hover, focus) |
| 0.3s | Standard transitions |
| 0.5s | Deliberate animations |
| 2s+ | Loading states, long animations |

### Animation Types

#### Fade In
```css
animation: fadeIn 0.3s ease-in-out;
```
Use for: Page transitions, modal opens

#### Slide In
```css
animation: slideInUp 0.4s ease-out;
```
Use for: Cards appearing, notifications

#### Scale
```css
animation: scaleIn 0.3s ease-out;
```
Use for: Component expansion, growth

#### Bounce
```css
animation: bounce 0.6s infinite;
```
Use for: Loading indicators, attention

#### Pulse
```css
animation: pulse 2s ease-in-out infinite;
```
Use for: Breathing effect, subtle alerts

### Hover Effects

- **Elevate**: Transform Y + Shadow increase
- **Scale**: Scale 1.05
- **Brighten**: Filter brightness 1.1
- Transition time: 0.3s ease

---

## Accessibility

### WCAG Compliance

- **AA Level**: Minimum requirement
- **Contrast Ratio**: 4.5:1 for normal text, 3:1 for large text
- **Focus Indicator**: 2px solid outline
- **Keyboard Navigation**: All interactive elements

### Screen Reader Support

- Proper ARIA labels on all buttons
- Form labels associated with inputs
- Semantic HTML structure
- Live regions for dynamic content
- Alt text for images

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter | Activate button |
| Space | Toggle checkbox/radio |
| Escape | Close dialog/menu |
| Arrow Keys | Navigate lists/menus |

### Color Accessibility

- Don't rely on color alone
- Maintain adequate contrast
- Use patterns/icons with colors
- Test with color blindness tools

---

## Dark Mode

### Implementation

1. **CSS Variables**: Theme colors as CSS variables
2. **Automatic Preference**: Detect system preference
3. **Manual Toggle**: User-controlled dark/light mode
4. **Persistence**: Remember user choice in localStorage

### Dark Mode Considerations

- Reduce brightness of light colors
- Avoid pure white text (use #e0e0e0)
- Maintain contrast ratios
- Adjust shadows for visibility
- Use muted colors for better eye comfort

---

## Responsive Design

### Mobile (xs: 0-600px)
- Single column layout
- Full-width elements
- Hamburger navigation
- Larger touch targets (44px minimum)
- Bottom sheets instead of menus

### Tablet (sm: 600-900px)
- Two column layout where appropriate
- Drawer navigation
- Responsive images
- Optimized spacing

### Desktop (md: 900px+)
- Multi-column layouts
- Side navigation
- Full menu bar
- Desktop-optimized spacing

### Responsive Images

```javascript
// Use srcset for responsive images
<img
  src="image-small.jpg"
  srcSet="image-small.jpg 600w, image-medium.jpg 900w, image-large.jpg 1200w"
  alt="Description"
/>

// Or CSS media queries
@media (max-width: 600px) {
  .image { width: 100%; }
}
```

### Responsive Typography

```javascript
// Size adjusts based on breakpoint
h1 {
  fontSize: 2.25rem; // Desktop
}

@media (max-width: 900px) {
  h1 { fontSize: 1.875rem; }
}

@media (max-width: 600px) {
  h1 { fontSize: 1.5rem; }
}
```

---

## Usage Examples

### Creating a New Page

```javascript
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { slideInUp, transitionStyles } from '../utils/animations';

const MyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ ...slideInUp, ...transitionStyles.smooth }}>
        <Typography variant="h1" gutterBottom>
          Page Title
        </Typography>
        <Grid container spacing={3}>
          {/* Content */}
        </Grid>
      </Box>
    </Container>
  );
};
```

### Creating a Custom Button

```javascript
import { Button } from '@mui/material';
import { hoverEffects } from '../utils/animations';

<Button
  variant="contained"
  sx={{
    ...hoverEffects.elevateOnHover,
    px: 3,
    py: 1.5,
  }}
>
  Click Me
</Button>
```

### Form Accessibility

```javascript
import { TextField, Box } from '@mui/material';
import { createAccessibleForm } from '../utils/accessibility';

const FormField = ({ label, name, error }) => {
  return (
    <TextField
      label={label}
      name={name}
      aria-label={label}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      error={!!error}
      helperText={error}
      fullWidth
    />
  );
};
```

### Dark Mode Toggle

```javascript
import { useTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ThemeToggle = ({ toggleColorMode, mode }) => {
  return (
    <IconButton onClick={toggleColorMode} color="inherit">
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
```

---

## Best Practices

✅ **DO**
- Use the color system consistently
- Follow spacing guidelines
- Maintain accessibility standards
- Test on multiple devices
- Use semantic HTML
- Provide clear feedback for actions
- Keep animations subtle
- Use proper ARIA labels

❌ **DON'T**
- Mix design systems
- Use excessive animations
- Rely on color alone for information
- Use non-semantic HTML
- Create ambiguous UI states
- Ignore accessibility
- Use very light or very dark colors in dark/light mode
- Create lengthy pages without progressive loading

---

## Resources

- [Material-UI Documentation](https://mui.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility by WebAIM](https://webaim.org/)
- [Typography Scale](https://type-scale.com/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated**: February 2026
**Version**: 1.0
**Status**: Production Ready
