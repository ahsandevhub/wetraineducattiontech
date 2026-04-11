# Technical Architecture Document

## Implementation Overview

This document describes the actual technical implementation of the WeTrainEducation platform, built with Next.js 16 App Router and Supabase.

## Application Structure

### Directory Structure

```
app/
├── (landing)/           # Public marketing routes
│   ├── layout.tsx       # Landing layout with Header/Footer
│   ├── page.tsx         # Homepage
│   └── courses/         # Course catalog pages
├── dashboard/           # Protected admin routes
│   ├── layout.tsx       # Dashboard layout with role checking
│   ├── page.tsx         # Dashboard router by role
│   ├── customer/        # Education module
│   ├── crm/            # CRM module
│   ├── hrm/            # HRM module
│   └── store/          # Store module
├── api/                # Server API routes
│   ├── auth/           # Authentication endpoints
│   ├── checkout/       # Payment processing
│   └── profile/        # Profile management
└── utils/              # Shared utilities
    ├── auth/           # Authentication helpers
    └── supabase/       # Database client

components/
├── ui/                # Shadcn UI components
├── shared/            # Cross-module components
├── hrm/               # HRM-specific components
├── store/             # Store-specific components
└── skeletons/         # Loading state components

lib/
├── supabase/          # Database client configuration
└── utils.ts           # Utility functions
```

## Route Architecture

### App Router Implementation

- **Route Groups**: `(landing)` for public, `dashboard` for protected
- **Nested Layouts**: Hierarchical layout composition
- **Server Components**: Default rendering strategy
- **Client Components**: Interactive features only

### Route Protection

```typescript
// app/dashboard/layout.tsx
export default async function DashboardLayout() {
  const roles = await getCurrentUserWithRoles();
  if (!roles) redirect('/login');

  // Role-based access control
  if (!roles.hasEducationAccess && !roles.hasCrmAccess && !roles.hasHrmAccess && !roles.hasStoreAccess) {
    redirect('/unauthorized');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
```

## Authentication Implementation

### Supabase Auth Integration

- **Client**: `createServerClient` for server-side auth
- **Proxy**: Session refresh and route protection through `proxy.ts`
- **Helpers**: `getCurrentUserWithRoles()` for unified role checking

### Role System

```typescript
interface UserRoles {
  userId: string;
  hasEducationAccess: boolean;
  hasCrmAccess: boolean;
  hasHrmAccess: boolean;
  hasStoreAccess: boolean;
  profileRole?: "customer" | "admin";
  crmRole?: string;
  hrmRole?: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
  storeRole?: "USER" | "ADMIN";
}
```

## Database Architecture

### Schema Design

- **Auth**: `auth.users` (Supabase managed)
- **Education**: `profiles`, `orders`, `payments`, `certificates`
- **CRM**: `crm_users`, `crm_leads`, `crm_requests`
- **HRM**: `hrm_users`, `hrm_kpis`, `hrm_notifications`
- **Store**: `store_users`, `store_products`, `store_stock_movements`, `store_invoices`, `store_account_entries`

### RLS Policies

```sql
-- Example: Users can only see their own leads
CREATE POLICY "Users can view own leads" ON crm_leads
  FOR SELECT USING (auth.uid() = assigned_to);
```

### Migration Strategy

- **Versioned**: Sequential migration files
- **Transactional**: All-or-nothing changes
- **Reversible**: Rollback capabilities
- **Tested**: Validation before production

## Component Architecture

### UI Component Library

- **Base**: Shadcn UI on Radix primitives
- **Styling**: Tailwind CSS with CSS variables
- **Theme**: Custom yellow-based color system
- **Responsive**: Mobile-first design

### Component Patterns

```tsx
// Server Component with data fetching
export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={leads} />
    </div>
  );
}

// Client Component for interactivity
("use client");
export function LeadForm() {
  const form = useForm<LeadFormData>();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
    </Form>
  );
}
```

## Data Fetching Patterns

### Server Actions

```typescript
// app/dashboard/crm/_actions/createLead.ts
'use server';
export async function createLead(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Business logic here
  const lead = await supabase
    .from('crm_leads')
    .insert({ ... })
    .select()
    .single();

  revalidatePath('/dashboard/crm');
  return lead;
}
```

### Client-Side Queries

```typescript
// Client component data fetching
function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      return response.json();
    },
  });
}
```

## State Management

### Server State

- **Default**: Server components for initial state
- **Actions**: Server actions for mutations
- **Cache**: Next.js automatic caching

### Client State

- **Forms**: React Hook Form with Zod validation
- **UI State**: React state for local interactions
- **Global**: Context for theme and user preferences

## Error Handling

### Server Errors

```typescript
// Server action error handling
export async function updateProfile(data: ProfileData) {
  try {
    const result = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);

    if (result.error) throw result.error;
    return { success: true };
  } catch (error) {
    console.error("Profile update failed:", error);
    return { success: false, error: error.message };
  }
}
```

### Client Errors

```typescript
// Client component error boundary
function ErrorFallback({ error }) {
  return (
    <div className="text-center p-4">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <Button onClick={() => window.location.reload()}>
        Try again
      </Button>
    </div>
  );
}
```

## Performance Optimizations

### Next.js Features

- **App Router**: Automatic code splitting
- **Server Components**: Reduced bundle size
- **Streaming**: Progressive loading
- **Caching**: Smart revalidation

### Database Optimizations

- **Indexes**: Strategic indexing on query fields
- **RLS**: Efficient policy enforcement
- **Connection Pooling**: Supabase managed
- **Query Optimization**: Efficient SQL patterns

## Security Implementation

### Authentication Security

- **JWT**: Secure token handling
- **Refresh**: Automatic token refresh
- **Middleware**: Route-level protection
- **CORS**: Proper cross-origin policies

### Data Security

- **RLS**: Database-level access control
- **Validation**: Input sanitization and validation
- **Encryption**: Sensitive data encryption
- **Audit**: Comprehensive activity logging

## Testing Strategy

### Unit Tests

- **Components**: React Testing Library
- **Utilities**: Jest for pure functions
- **Server Actions**: API testing

### Integration Tests

- **Database**: Supabase local testing
- **API**: End-to-end request testing
- **UI**: Playwright for user flows

### E2E Tests

- **Critical Paths**: Login, purchase, lead creation
- **Cross-Module**: Shared functionality testing
- **Performance**: Load and stress testing

## Deployment Pipeline

### Build Process

- **TypeScript**: Type checking
- **ESLint**: Code quality
- **Build**: Next.js production build
- **Testing**: Automated test suite

### Deployment

- **Platform**: Vercel
- **Database**: Supabase
- **Environment**: Environment-specific configs
- **Monitoring**: Error tracking and analytics

### Rollback Strategy

- **Versioning**: Git-based versioning
- **Database**: Migration rollback
- **Application**: Quick rollback to previous version
- **Data**: Backup and recovery procedures
