# Tailwind CSS Stack Documentation

## Overview

The platform uses Tailwind CSS 4.0 with a custom theme system and Shadcn UI components for consistent styling and responsive design.

## Version & Configuration

### Current Version

- **Tailwind CSS**: 4.0
- **PostCSS**: 8.x
- **Autoprefixer**: Latest

### Configuration (`tailwind.config.ts`)

```typescript
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom theme extensions
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ... custom color variables
      },
    },
  },
};
```

## Theme System

### CSS Variables Approach

- **Design Tokens**: Colors, spacing, typography defined as CSS variables
- **Theme File**: `/config/theme.ts` contains all design tokens
- **OkLCh Colors**: Perceptually uniform color space for better color consistency

### Theme Configuration

```typescript
// config/theme.ts
export const theme = {
  colors: {
    primary: "oklch(0.782 0.281 98.3)", // #facc15 - yellow
    primaryForeground: "oklch(0.145 0 0)", // dark text
    secondary: "oklch(0.97 0 0)", // light gray
    // ... more colors
  },
  radius: "0.5rem",
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    // ... more spacing
  },
};
```

## Utility Classes

### Common Patterns

```tsx
// Layout utilities
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>

// Typography utilities
<h1 className="text-3xl font-bold text-foreground">
  Heading
</h1>
<p className="text-muted-foreground leading-relaxed">
  Body text
</p>

// Interactive utilities
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors">
  Button
</button>
```

### Responsive Design

```tsx
// Mobile-first responsive classes
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">{/* Content */}</div>
  <div className="w-full md:w-1/2">{/* Content */}</div>
</div>
```

## Shadcn UI Integration

### Component Library

- **Base Components**: Built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **Accessibility**: WCAG compliant components
- **Theme Support**: Automatic theme integration

### Usage Patterns

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Custom Components

### Component Variants

```tsx
// components/ui/button.tsx
const variants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

## Responsive Design System

### Breakpoint System

- **Mobile**: Default (no prefix)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

### Responsive Patterns

```tsx
// Responsive navigation
<nav className="flex flex-col md:flex-row gap-4">
  {/* Navigation items */}
</nav>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

## Dark Mode Support

### Implementation

```tsx
// Theme provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
```

### Dark Mode Classes

```tsx
// Automatic dark mode support
<div className="bg-background text-foreground border border-border">
  Content that adapts to theme
</div>
```

## Performance Optimization

### CSS Optimization

- **Purge Unused CSS**: Automatic unused class removal
- **CSS Variables**: Efficient theme switching
- **Critical CSS**: Above-the-fold CSS inlining

### Bundle Optimization

- **Component Splitting**: Lazy loading of components
- **CSS Code Splitting**: Route-based CSS loading
- **Font Optimization**: Next.js automatic font optimization

## Development Workflow

### Adding Custom Styles

1. Define design tokens in `/config/theme.ts`
2. Update CSS variables in `globals.css`
3. Use Tailwind utilities in components
4. Test across all breakpoints

### Component Development

1. Use Shadcn UI components when possible
2. Follow established variant patterns
3. Implement responsive design
4. Test accessibility features

### Theme Customization

1. Modify values in `/config/theme.ts`
2. Update CSS variable definitions
3. Test component appearance
4. Update design system documentation

## Best Practices

### Class Organization

- Use logical class groupings
- Prefer utility classes over custom CSS
- Maintain consistent spacing scale
- Use semantic color names

### Responsive Design

- Mobile-first approach
- Test on actual devices
- Use relative units (rem, em)
- Consider touch targets

### Performance

- Minimize custom CSS
- Use CSS variables for theming
- Optimize images and assets
- Monitor bundle size

### Accessibility

- Use proper color contrast
- Support keyboard navigation
- Include focus indicators
- Test with screen readers

## Migration Notes

### From Tailwind CSS 3.x

- CSS variables for theming
- Improved performance
- Better dark mode support
- Enhanced responsive utilities

### Customization Guidelines

- Prefer CSS variables over hardcoded values
- Use design tokens consistently
- Maintain component library standards
- Document customizations
