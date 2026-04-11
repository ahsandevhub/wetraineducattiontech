# UI Architecture Instructions

Use `AGENTS.md` as the primary source of truth if any guidance overlaps.

## Overview

The UI uses Tailwind CSS with Shadcn UI components and a custom yellow-based theme system.

## Design System

### Color Palette

- **Primary**: `#facc15` (yellow-400) - CTAs and branding
- **Theme**: Configured in `/config/theme.ts`
- **CSS Variables**: Auto-synced from theme config
- **OkLCh Colors**: Perceptually uniform color space

### Typography

- **Font**: System font stack (sans-serif)
- **Sizes**: Tailwind scale (text-sm, text-base, etc.)
- **Weights**: Standard web font weights

## Component Patterns

### Shadcn UI Usage

- All components in `/components/ui/`
- Consistent API across components
- Theme-aware with CSS variables
- Accessible by default

### Layout Patterns

```tsx
// Card layout
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Form layout
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="field"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Table Patterns

- TanStack Table for data tables
- Shadcn Table components
- Consistent column definitions
- Sorting, filtering, pagination

## Responsive Design

### Breakpoints

- Mobile-first approach
- Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Test on mobile/tablet/desktop

### Grid Layouts

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

## State Management

### Loading States

- Skeleton components for loading
- Consistent loading UI patterns
- `loading.tsx` files for route-level loading

### Error States

- Error boundaries for client components
- Consistent error messaging
- Retry mechanisms where appropriate

## Development Rules

### When Adding Components

1. Check existing Shadcn components first
2. Follow established patterns
3. Use theme colors via CSS variables
4. Include proper TypeScript types
5. Test responsive behavior

### When Styling

1. Use Tailwind utility classes
2. Leverage theme CSS variables
3. Maintain design consistency
4. Test in dark/light modes if applicable
5. Verify accessibility

### When Adding Forms

1. Use React Hook Form + Zod
2. Shadcn Form components
3. Proper validation messages
4. Loading states during submission
5. Error handling

## Common Patterns

```tsx
// Button variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Input with validation
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="email@example.com" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Data table
<DataTable
  columns={columns}
  data={data}
  searchKey="name"
/>
```

## Testing Checklist

- [ ] Responsive on all screen sizes
- [ ] Theme colors applied correctly
- [ ] Loading states present
- [ ] Error states handled
- [ ] Accessibility considerations
- [ ] Form validation works
- [ ] Shadcn components used appropriately
