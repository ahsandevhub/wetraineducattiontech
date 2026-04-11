# Shadcn UI Stack Documentation

## Overview

The platform uses Shadcn UI as the component library, built on Radix UI primitives with Tailwind CSS styling for consistent, accessible, and customizable UI components.

## Version & Installation

### Current Setup

- **Shadcn UI**: Latest version
- **Radix UI**: Various primitives (Dialog, Dropdown, etc.)
- **Tailwind CSS**: 4.0
- **Class Variance Authority**: For component variants

### Installation Structure

```
components/
├── ui/                    # Shadcn UI components
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── command.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── field.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── tooltip.tsx
│   └── ...
└── components.json       # Shadcn configuration
```

## Component Architecture

### Base Component Pattern

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## Key Components

### Form Components

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Your message" />
      </div>
      <Button type="submit">Send</Button>
    </form>
  );
}
```

### Data Display Components

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{user.bio}</p>
      </CardContent>
    </Card>
  );
}
```

### Navigation Components

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar>
        <SidebarHeader>Dashboard</SidebarHeader>
        <SidebarContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">Overview content</TabsContent>
            <TabsContent value="analytics">Analytics content</TabsContent>
          </Tabs>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1">Main content</main>
    </div>
  );
}
```

## Form Integration

### React Hook Form Integration

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
        <Button type="submit">Login</Button>
      </form>
    </Form>
  );
}
```

## Table Components

### Data Table Pattern

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable({ data, columns }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => (
              <TableCell key={column.key}>{row[column.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Theme Integration

### CSS Variables Usage

```css
/* globals.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.782 0.281 98.3);
  --primary-foreground: oklch(0.145 0 0);
  /* ... more variables */
}
```

### Component Theme Support

```tsx
// All components automatically use CSS variables
<Button variant="default">Themed Button</Button>
<Card className="bg-card text-card-foreground">Themed Card</Card>
```

## Accessibility Features

### Built-in Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant colors

### Accessibility Usage

```tsx
// Proper form accessibility
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email Address</FormLabel>
      <FormControl>
        <Input
          placeholder="Enter your email"
          aria-describedby="email-description"
          {...field}
        />
      </FormControl>
      <FormMessage id="email-description" />
    </FormItem>
  )}
/>
```

## Customization Guidelines

### Adding Component Variants

```typescript
// Extend existing component
const extendedButtonVariants = cva(buttonVariants(), {
  variants: {
    variant: {
      ...buttonVariants.variants.variant,
      success: "bg-green-600 text-white hover:bg-green-700",
    },
  },
});
```

### Creating New Components

1. Use Radix UI primitives as base
2. Implement with Tailwind CSS classes
3. Add proper TypeScript types
4. Include accessibility features
5. Support theme customization

## Performance Considerations

### Bundle Optimization

- **Tree Shaking**: Unused components not included
- **Code Splitting**: Components loaded as needed
- **Minimal Runtime**: Small runtime footprint

### Rendering Performance

- **Server Components**: Use when possible
- **Client Components**: Only for interactivity
- **Memoization**: Proper React optimization

## Development Workflow

### Adding New Components

1. Check existing Shadcn components
2. Use `npx shadcn-ui add [component]` for new components
3. Customize variants as needed
4. Test accessibility and responsiveness
5. Update component documentation

### Component Maintenance

- Keep components updated with latest Shadcn versions
- Test all variants and sizes
- Ensure theme compatibility
- Monitor accessibility compliance

## Best Practices

### Component Usage

- Use semantic component names
- Prefer composition over modification
- Maintain consistent API patterns
- Document component variants

### Styling Guidelines

- Use CSS variables for theming
- Maintain design system consistency
- Test across all themes
- Ensure responsive behavior

### Accessibility Standards

- Include proper ARIA labels
- Support keyboard navigation
- Test with screen readers
- Maintain color contrast ratios

## Migration & Updates

### Version Updates

- Regularly update Shadcn UI
- Test all components after updates
- Update customizations as needed
- Maintain backward compatibility

### Breaking Changes

- Plan component migrations
- Update usage throughout codebase
- Test all user flows
- Update documentation
