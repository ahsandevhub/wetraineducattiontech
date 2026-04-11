# Module Architecture Instructions

Use `AGENTS.md` as the primary source of truth if any guidance overlaps.

## Overview

The platform consists of three distinct business modules with separate user profiles, workflows, and permissions.

## Module Boundaries

### Education Module

- **Users**: Customers purchasing courses
- **Routes**: `/dashboard/customer/*`
- **Tables**: `profiles`, `orders`, `payments`, `certificates`
- **Workflow**: Course purchase → Delivery → Certification
- **Permissions**: Customer/Admin roles

### CRM Module

- **Users**: Sales team managing leads
- **Routes**: `/dashboard/crm/*`
- **Tables**: `crm_users`, `crm_leads`, `crm_requests`
- **Workflow**: Lead → Qualification → Negotiation → Close
- **Permissions**: Role-based lead ownership

### HRM Module

- **Users**: Employees and managers
- **Routes**: `/dashboard/hrm/*`
- **Tables**: `hrm_users`, `hrm_kpis`, `hrm_notifications`
- **Workflow**: Hire → Performance Tracking → Evaluation
- **Permissions**: Super Admin, Admin, Employee hierarchy

## Shared Infrastructure

### Authentication

- Single Supabase auth for all modules
- `getCurrentUserWithRoles()` provides unified access checking
- Separate profile tables per module
- Role-based dashboard routing

### UI Components

- Shared Shadcn UI library
- Module-specific components in `_components/` folders
- Consistent theming and patterns
- Cross-module component reuse when appropriate

### Database

- RLS policies isolate module data
- Shared utility functions
- Migration coordination across modules
- Backup and seeding scripts

## Development Rules

### When Adding Module Features

1. Identify target module (Education/CRM/HRM)
2. Check existing patterns in that module
3. Use appropriate table/profile structure
4. Update RLS policies if needed
5. Test with correct user roles

### When Modifying Shared Code

1. Ensure changes don't break other modules
2. Test across all affected modules
3. Update documentation
4. Consider backward compatibility
5. Coordinate with other module owners

### When Adding Cross-Module Features

1. Justify the integration need
2. Maintain module boundaries
3. Use shared utilities appropriately
4. Document dependencies
5. Test all affected workflows

## Module-Specific Patterns

### Education Patterns

```typescript
// Customer profile access
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

// Course enrollment
const { data: enrollment } = await supabase.from("enrollments").insert({
  user_id: user.id,
  course_id: courseId,
  status: "active",
});
```

### CRM Patterns

```typescript
// Lead ownership check
const { data: lead } = await supabase
  .from("crm_leads")
  .select("*")
  .eq("id", leadId)
  .eq("assigned_to", user.id); // RLS handles this

// Lead reassignment
await supabase.rpc("reassign_lead", {
  lead_id: leadId,
  new_owner_id: newOwnerId,
});
```

### HRM Patterns

```typescript
// KPI tracking
const { data: kpi } = await supabase.from("hrm_kpis").insert({
  employee_id: employeeId,
  metric: "sales_target",
  value: 100000,
  period: "monthly",
});

// Hierarchical permissions
const roles = await getCurrentUserWithRoles();
if (roles.hrmRole === "SUPER_ADMIN") {
  // Full access
} else if (roles.hrmRole === "ADMIN") {
  // Department access
}
```

## Testing Checklist

- [ ] Correct module routing
- [ ] Role-based access enforced
- [ ] RLS policies working
- [ ] Cross-module isolation maintained
- [ ] Shared components unaffected
- [ ] Documentation updated
- [ ] Migration scripts work
