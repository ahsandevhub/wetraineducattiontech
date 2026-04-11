# Routing Map

## Overview

This document maps all routes in the WeTrainEducation platform, organized by module and access level.

## Route Structure

### Public Routes (No Authentication Required)

```
/
├── (landing)/                    # Public marketing pages
│   ├── /                         # Homepage
│   ├── /about                    # About page
│   ├── /courses                  # Course catalog
│   │   ├── /[slug]               # Individual course pages
│   ├── /services                 # Service offerings
│   ├── /software                 # Software products
│   ├── /contact                  # Contact form
│   ├── /checkout                 # Course purchase flow
│   ├── /login                    # Authentication entry
│   ├── /register                 # User registration
│   ├── /verify                   # Email verification
│   ├── /privacy                  # Privacy policy
│   ├── /terms                    # Terms of service
│   ├── /refund                   # Refund policy
│   └── /marketing                # Marketing service pages
│
├── auth/                         # Authentication callbacks
│   ├── /accept-invite            # Invitation acceptance
│   ├── /callback                 # Auth provider callbacks
│   ├── /error                    # Auth error handling
│   ├── /magic-link               # Magic link verification
│   └── /verify-email-change      # Email change verification
│
└── api/                          # Public API endpoints
    ├── /auth/*                   # Authentication APIs
    └── /checkout/*               # Payment processing
```

### Protected Routes (Authentication Required)

```
/
└── dashboard/                    # Admin dashboard area
    ├── /                         # Dashboard router (redirects based on role)
    │
    ├── customer/                 # Education module
    │   ├── /                     # Customer dashboard
    │   ├── /packages             # Course packages
    │   ├── /payments             # Payment history
    │   ├── /profile              # Customer profile
    │   ├── /services             # Additional services
    │   └── /courses              # Course access (if applicable)
    │
    ├── crm/                      # CRM module
    │   ├── /                     # CRM dashboard
    │   ├── /leads                # Lead management
    │   ├── /requests             # Customer requests
    │   ├── /logs                 # Activity logs
    │   └── /admin                # Administrative functions
    │
    ├── hrm/                      # HRM module
    │   ├── /                     # HRM dashboard router
    │   ├── /admin                # Admin dashboard
    │   ├── /employee             # Employee self-service
    │   └── /super                # Super admin functions
    │
    └── store/                    # Store module
        ├── /                     # Store dashboard
        ├── /invoices/new         # New invoice flow
        ├── /purchases            # Personal purchase history
        ├── /accounts             # Personal account ledger
        └── /admin                # Store administrative functions
```

## Route Protection Logic

### Authentication Checks

```typescript
// Applied to all /dashboard/* routes
const roles = await getCurrentUserWithRoles();
if (!roles) redirect("/login");
```

### Module Access Control

```typescript
// Dashboard router logic
if (roles.hasEducationAccess) {
  redirect("/dashboard/customer");
} else if (roles.hasCrmAccess) {
  redirect("/dashboard/crm");
} else if (roles.hasHrmAccess) {
  // Route based on HRM role
  switch (roles.hrmRole) {
    case "SUPER_ADMIN":
      redirect("/dashboard/hrm/super");
    case "ADMIN":
      redirect("/dashboard/hrm/admin");
    default:
      redirect("/dashboard/hrm/employee");
  }
} else if (roles.hasStoreAccess) {
  redirect("/dashboard/store");
} else {
  redirect("/unauthorized");
}
```

### Role-Based Route Access

- **Education**: Requires `hasEducationAccess: true`
- **CRM**: Requires `hasCrmAccess: true`
- **HRM**: Requires `hasHrmAccess: true` + specific `hrmRole`
- **Store**: Requires `hasStoreAccess: true`, with admin routes also requiring store admin access

## API Route Map

### Authentication APIs

```
api/auth/
├── /check-email              # Email availability check
├── /login                    # User login
├── /logout                   # User logout
├── /register                 # User registration
└── /users                    # User management
```

### Business APIs

```
api/
├── /checkout/                # Payment processing
│   ├── /create-session       # Stripe session creation
│   └── /webhook              # Payment webhooks
├── /debug/                   # Development debugging
├── /hrm/                     # HRM-specific APIs
├── /newsletter/              # Newsletter management
├── /profile/                 # Profile management
├── /store/                   # Store-specific APIs
└── /upload/                  # File upload handling
```

## Layout Hierarchy

### Root Layout (`app/layout.tsx`)

- Global styles and theme
- Environment sticker
- Toaster notifications
- Next.js top loader
- Hash auth catcher

### Landing Layout (`app/(landing)/layout.tsx`)

- Marketing header
- Footer
- WhatsApp button
- Disclaimer banner

### Dashboard Layout (`app/dashboard/layout.tsx`)

- Role-based access control
- Dashboard shell component
- Module-specific navigation

## Dynamic Routing

### Parameterized Routes

- **Courses**: `/courses/[slug]` - Dynamic course pages
- **User Profiles**: `/dashboard/customer/profile` - Current user only
- **Lead Details**: `/dashboard/crm/leads/[id]` - Role-based access

### Role-Based Routing

```typescript
// HRM role routing
/dashboard/hrm/
├── employee/                 # EMPLOYEE role
├── admin/                    # ADMIN role
└── super/                    # SUPER_ADMIN role

// Store routing
/dashboard/store/
├── /                         # Any store user
├── purchases                 # Any store user
├── accounts                  # Any store user
├── invoices/new              # Any store user
└── admin/*                   # Store admin
```

## Navigation Patterns

### Public Navigation

- Header with service links
- Footer with policy links
- Breadcrumb navigation on content pages

### Dashboard Navigation

- Module-specific sidebar navigation
- Role-based menu items
- Breadcrumb navigation
- Quick action buttons

## Route Guards

### Proxy Protection

```typescript
// proxy.ts
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
```

### Component-Level Guards

```typescript
// Role checking in components
const roles = await getCurrentUserWithRoles();
if (!roles?.hasCrmAccess) {
  return <Unauthorized />;
}
```

## SEO Considerations

### Public Routes

- Meta tags for marketing pages
- Structured data for courses
- Open Graph for social sharing
- Sitemap generation

### Protected Routes

- No-index for admin pages
- Role-based content rendering
- Secure headers

## Performance Optimization

### Route-Level Optimization

- Static generation for public pages
- Server-side rendering for dynamic content
- Streaming for large datasets
- Caching strategies per route type

### Loading States

- Skeleton components for initial loads
- Progressive loading for data-heavy pages
- Error boundaries for failed routes

## Testing Routes

### Route Testing Checklist

- [ ] Authentication requirements met
- [ ] Role-based access enforced
- [ ] Layout renders correctly
- [ ] Navigation works
- [ ] SEO meta tags present
- [ ] Mobile responsive
- [ ] Loading states handled
- [ ] Error states handled

### Integration Testing

- [ ] Cross-module navigation
- [ ] Authentication flows
- [ ] Role transitions
- [ ] API route responses
- [ ] Webhook handling
