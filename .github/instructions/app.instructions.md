# App-Level Architecture Instructions

Use `AGENTS.md` as the primary source of truth if any guidance overlaps.

## Overview

WeTrainEducation is a Next.js App Router application with three distinct business applications sharing a unified authentication system.

## Application Structure

### Route Groups & Layouts

- **Public**: `/(landing)/*` - Marketing pages with `Header/Footer`
- **Admin**: `/dashboard/*` - Protected area with `DashboardShell`
- **Auth**: `/auth/*` - Authentication flows
- **API**: `/api/*` - Server endpoints

### Layout Hierarchy

```
Root Layout (globals.css, Toaster, HashAuthCatcher)
├── Landing Layout (Header, Footer, WhatsApp)
└── Dashboard Layout (DashboardShell with role-based content)
```

## Key Patterns

### Authentication Flow

- Middleware handles session refresh
- `getCurrentUserWithRoles()` provides unified role checking
- Route priority: Education > CRM > HRM
- Unauthorized users redirect to `/unauthorized`

### Component Organization

- Shadcn UI in `/components/ui/`
- Shared components in `/components/shared/`
- Module-specific components in module `_components/` folders
- Consistent loading/error states

### State Management

- Server components preferred
- Client components for interactivity
- Server actions for data mutations
- React Query patterns for client-side data

## Development Rules

### When Adding Routes

1. Check existing route patterns
2. Use appropriate layout (landing vs dashboard)
3. Add auth checks if protected
4. Update navigation if needed
5. Test role-based access

### When Adding Components

1. Check for existing similar components
2. Use Shadcn UI when possible
3. Follow naming conventions
4. Add proper TypeScript types
5. Include loading/error states

### When Modifying Layouts

1. Understand layout hierarchy
2. Test all affected routes
3. Verify responsive behavior
4. Check auth integration
5. Update documentation

## Common Patterns

```typescript
// Auth check in server component
const roles = await getCurrentUserWithRoles();
if (!roles) redirect('/login');

// Role-based rendering
{roles.hasEducationAccess && <EducationContent />}
{roles.hasCrmAccess && <CrmContent />}
{roles.hasHrmAccess && <HrmContent />}
```

## Testing Checklist

- [ ] Authentication works
- [ ] Role-based access correct
- [ ] Responsive on mobile/tablet
- [ ] Loading states present
- [ ] Error handling works
- [ ] Navigation updates if needed
