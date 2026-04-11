# Authentication Stack Documentation

## Overview

The platform uses Supabase Authentication with custom role-based access control, providing secure user management across four distinct business modules.

## Authentication Architecture

### Core Components

- **Supabase Auth**: Primary authentication service
- **Custom Middleware**: Route protection and session management
- **Role System**: Module-specific user roles and permissions
- **Session Management**: JWT-based session handling

### Authentication Flow

```
1. User Registration/Login → Supabase Auth
2. Token Generation → JWT Session
3. Middleware Validation → Route Access
4. Role Resolution → Module Permissions
5. UI Rendering → Role-Based Content
```

## Supabase Auth Configuration

### Auth Settings

```typescript
// Supabase Dashboard Configuration
{
  "site_url": "https://wetraineducation.com",
  "additional_redirect_urls": ["http://localhost:3000"],
  "jwt_expiry": 3600,
  "jwt_secret": "auto-generated",
  "enable_signup": true,
  "enable_confirmations": true,
  "mail_service": "supabase"
}
```

### Email Templates

- **Confirmation**: Account verification emails
- **Magic Link**: Passwordless login
- **Recovery**: Password reset emails
- **Invite**: Team member invitations

## Role-Based Access Control

### Unified Role Resolution

```typescript
// utils/auth/roles.ts
export interface UserRoles {
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

export async function getCurrentUserWithRoles(): Promise<UserRoles | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check module access across all tables
  const [educationProfile, crmProfile, hrmProfile, storeProfile] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("crm_users").select("role").eq("id", user.id).single(),
    supabase.from("hrm_users").select("role").eq("id", user.id).single(),
    supabase.from("store_users").select("store_role").eq("id", user.id).single(),
  ]);

  return {
    userId: user.id,
    hasEducationAccess: !!educationProfile.data,
    hasCrmAccess: !!crmProfile.data,
    crmRole: crmProfile.data?.role,
    hasHrmAccess: !!hrmProfile.data,
    hrmRole: hrmProfile.data?.role,
    hasStoreAccess: !!storeProfile.data,
    storeRole: storeProfile.data?.store_role,
    profileRole: educationProfile.data?.role,
  };
}
```

### Role Hierarchy

```
Education Module:
├── customer (basic access)
└── admin (full access)

CRM Module:
├── sales_user (assigned leads only)
└── admin (all leads + management)

HRM Module:
├── EMPLOYEE (self-service)
├── ADMIN (department management)
└── SUPER_ADMIN (company-wide access)

Store Module:
├── USER (self-service purchasing)
└── ADMIN (store operations + self-service purchasing)
```

## Authentication Implementation

### Client-Side Auth

```typescript
// components/AuthProvider.tsx
'use client';
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle route redirects based on auth state
        if (event === 'SIGNED_IN') {
          // Redirect to appropriate dashboard
        } else if (event === 'SIGNED_OUT') {
          // Redirect to login
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
```

### Server-Side Auth

```typescript
// Server component auth check
export default async function ProtectedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Continue with protected content
  return <div>Protected content</div>;
}
```

## Middleware Protection

### Route Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient({ req, res: response });

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/about", "/courses", "/login", "/register"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!session && !isPublicRoute) {
    // Redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    // Redirect authenticated users away from auth pages
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
```

### Role-Based Route Access

```typescript
// app/dashboard/layout.tsx
export default async function DashboardLayout() {
  const roles = await getCurrentUserWithRoles();

  if (!roles) {
    redirect('/login');
  }

  // Ensure user has access to at least one module
  if (!roles.hasEducationAccess && !roles.hasCrmAccess && !roles.hasHrmAccess && !roles.hasStoreAccess) {
    redirect('/unauthorized');
  }

  return (
    <DashboardShell
      educationRole={roles.profileRole}
      crmRole={roles.crmRole}
      hrmRole={roles.hrmRole}
      storeRole={roles.storeRole}
    >
      {children}
    </DashboardShell>
  );
}
```

## User Registration & Onboarding

### Registration Flow

```typescript
// pages/register.tsx
export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function handleRegister(formData: FormData) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.get('email'),
        password: formData.get('password'),
        options: {
          data: {
            full_name: formData.get('fullName'),
          }
        }
      });

      if (error) throw error;

      // Redirect to email verification
      router.push('/verify');
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleRegister}>
      {/* Form fields */}
    </form>
  );
}
```

### Email Verification

```typescript
// pages/auth/verify-email.tsx
export default async function VerifyEmailPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if email is verified
  if (user.email_confirmed_at) {
    // Create user profile and redirect to onboarding
    await createUserProfile(user);
    redirect('/onboarding');
  }

  return (
    <div>
      <h1>Check your email</h1>
      <p>We've sent a verification link to {user.email}</p>
    </div>
  );
}
```

## Password Management

### Password Reset

```typescript
// Password reset request
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

// Password update
const { error } = await supabase.auth.updateUser({
  password: newPassword,
});
```

### Password Policies

- **Minimum Length**: 8 characters
- **Complexity**: Mixed case, numbers, symbols recommended
- **Reuse Prevention**: No recent password reuse
- **Expiration**: No forced expiration (user choice)

## Security Features

### Session Security

- **JWT Tokens**: Secure token-based authentication
- **Automatic Refresh**: Seamless token renewal
- **Secure Storage**: HttpOnly cookies for server tokens
- **Session Timeout**: Configurable session duration

### Multi-Factor Authentication

```typescript
// Enable MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: "totp",
});

// Verify MFA
const { data, error } = await supabase.auth.mfa.verify({
  factorId: factorId,
  code: code,
});
```

### Account Security

- **Email Verification**: Required for account activation
- **Password Reset**: Secure password recovery
- **Account Lockout**: Protection against brute force
- **Audit Logging**: Authentication event logging

## User Profile Management

### Profile Creation

```typescript
// Create education profile
const { data, error } = await supabase.from("profiles").insert({
  id: user.id,
  email: user.email,
  full_name: user.user_metadata.full_name,
  role: "customer",
});

// Create CRM profile (if applicable)
const { data, error } = await supabase.from("crm_users").insert({
  id: user.id,
  email: user.email,
  role: "sales_user",
});
```

### Profile Updates

```typescript
// Update user profile
const { error } = await supabase
  .from("profiles")
  .update({
    full_name: newName,
    avatar_url: newAvatarUrl,
  })
  .eq("id", user.id);
```

## Error Handling

### Authentication Errors

```typescript
// Handle auth errors
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.message) {
      case "Invalid login credentials":
        setError("Invalid email or password");
        break;
      case "Email not confirmed":
        setError("Please check your email and click the verification link");
        break;
      default:
        setError("An error occurred. Please try again.");
    }
  }
} catch (error) {
  console.error("Auth error:", error);
}
```

### Network Error Handling

```typescript
// Retry logic for network errors
async function signInWithRetry(email: string, password: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) return { data, error: null };
      if (error.message !== "Network request failed") throw error;

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === retries - 1) return { data: null, error };
    }
  }
}
```

## Testing Authentication

### Unit Tests

```typescript
// Test role resolution
describe("getCurrentUserWithRoles", () => {
  it("should return correct roles for education user", async () => {
    // Mock Supabase client
    const mockUser = { id: "user-123" };
    const mockProfile = { role: "customer" };

    // Test implementation
    const roles = await getCurrentUserWithRoles();
    expect(roles.hasEducationAccess).toBe(true);
    expect(roles.profileRole).toBe("customer");
  });
});
```

### Integration Tests

```typescript
// Test complete auth flow
describe("Authentication Flow", () => {
  it("should allow user registration and login", async () => {
    // Register user
    await page.goto("/register");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('[type="submit"]');

    // Verify email
    // Login
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('[type="submit"]');

    // Check dashboard access
    await expect(page).toHaveURL("/dashboard");
  });
});
```

## Monitoring & Analytics

### Authentication Metrics

- **Sign-up Rate**: Track user registration
- **Login Success Rate**: Monitor authentication success
- **Session Duration**: Track user session length
- **Failed Login Attempts**: Monitor security threats

### Security Monitoring

- **Suspicious Activity**: Flag unusual login patterns
- **Geographic Anomalies**: Detect login from unusual locations
- **Device Changes**: Monitor device fingerprinting
- **Password Reset Frequency**: Track reset patterns

## Compliance Considerations

### GDPR Compliance

- **Data Minimization**: Collect only necessary data
- **Consent Management**: Clear consent for data processing
- **Right to Deletion**: User data deletion capability
- **Data Portability**: Export user data functionality

### Security Standards

- **Password Policies**: Enforce strong password requirements
- **Session Management**: Secure session handling
- **Audit Logging**: Comprehensive activity logging
- **Incident Response**: Security breach procedures

## Troubleshooting

### Common Issues

- **Session Not Persisting**: Check middleware configuration
- **Role Not Loading**: Verify database permissions
- **Redirect Loops**: Check middleware matcher patterns
- **CORS Errors**: Verify Supabase URL configuration

### Debug Tools

```typescript
// Debug auth state
const {
  data: { session },
  error,
} = await supabase.auth.getSession();
console.log("Session:", session);
console.log("Error:", error);

// Debug user roles
const roles = await getCurrentUserWithRoles();
console.log("User roles:", roles);
```

## Performance Optimization

### Authentication Performance

- **Token Caching**: Cache JWT validation results
- **Database Indexing**: Index on user lookup fields
- **Connection Pooling**: Efficient database connections
- **CDN**: Global authentication endpoints

### Session Optimization

- **Lazy Loading**: Load user data as needed
- **Background Refresh**: Refresh tokens in background
- **Minimal Payloads**: Include only necessary user data
- **Caching Strategy**: Cache user roles and permissions
