# Backend Architecture Instructions

Use `AGENTS.md` as the primary source of truth if any guidance overlaps.

## Overview

The backend uses Supabase for database and authentication, with Next.js API routes and server actions for business logic.

## Database Architecture

### Supabase Setup

- PostgreSQL with Row Level Security (RLS)
- Authentication via `auth.users`
- Separate profile tables for each domain:
  - `profiles` (Education)
  - `crm_users` (CRM)
  - `hrm_users` (HRM)

### Migration Patterns

- Sequential migrations in `/supabase/migrations/`
- RLS policies for data access control
- Helper functions for complex queries
- RPC functions for analytics/reporting

## API Patterns

### Server Actions (Preferred)

- Located in `app/**/_actions/`
- Handle form submissions and data mutations
- Automatic request deduplication
- Server-side validation

### API Routes

- Located in `app/api/`
- Used for external integrations
- File uploads, webhooks, etc.
- RESTful endpoints

### Authentication

- Supabase client initialized in middleware
- Session tokens managed automatically
- Role checking via `getCurrentUserWithRoles()`

## Data Access Patterns

### Reading Data

```typescript
// Server component
const { data } = await supabase.from("profiles").select("*");

// Client component with React Query
const { data } = useQuery({
  queryKey: ["profiles"],
  queryFn: () => supabase.from("profiles").select("*"),
});
```

### Writing Data

```typescript
// Server action
"use server";
export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  // ... validation and update
}
```

## Security Considerations

### RLS Policies

- Enable RLS on all tables
- Policies based on user roles
- Test policies with different user types
- Avoid security definer functions when possible

### Input Validation

- Server-side validation required
- Use Zod schemas for type safety
- Sanitize user inputs
- Validate file uploads

## Development Rules

### When Adding Database Changes

1. Create migration file
2. Update RLS policies
3. Test with different roles
4. Update TypeScript types
5. Document changes

### When Adding API Endpoints

1. Use server actions when possible
2. Add proper error handling
3. Include authentication checks
4. Document endpoint purpose
5. Test with different user roles

### When Modifying Auth

1. Test all auth flows
2. Verify role checking works
3. Check middleware integration
4. Update documentation
5. Test edge cases

## Common Patterns

```typescript
// Server action with auth
'use server'
export async function createLead(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check CRM access
  const roles = await getCurrentUserWithRoles();
  if (!roles.hasCrmAccess) throw new Error('Access denied');

  // Create lead with proper RLS
  const { data, error } = await supabase
    .from('crm_leads')
    .insert({ ... })
    .select()
    .single();
}
```

## Testing Checklist

- [ ] Authentication required
- [ ] Role-based access enforced
- [ ] Input validation works
- [ ] Error handling present
- [ ] RLS policies correct
- [ ] Migration scripts work
