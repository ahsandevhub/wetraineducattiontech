# Architecture Decision Record: Three-System User Model

## Document Type

Architecture Decision Record (ADR) - Users & Profile Management

## Status

✅ APPROVED & IMPLEMENTED

## Context

The WeTrain Education platform needed to support three distinct business operations:

1. **Education/E-Commerce** - Course sales and customer management
2. **CRM** - Sales pipeline and lead tracking
3. **HRM** - Employee performance management

Each has completely different:

- **Use Cases**: Students ≠ Sales Prospects ≠ Employees
- **Workflows**: Purchase → Delivery | Lead → Negotiation → Close | Hire → Evaluate → Promote
- **Permissions**: Public profiles | Private lead ownership | Hierarchical evaluation
- **Scale**: Unlimited customers | 100s of leads | ~50-100 employees
- **Metrics**: Courses completed | Won/lost ratio | Performance scores

## Decision

**Implement three separate but interconnected domain-specific user systems**, all anchored to a single Supabase Authentication layer.

### Architecture

```
┌─────────────────────────────────┐
│    Supabase Auth (auth.users)   │
│    [Single Source of Truth]     │
└──────────┬──────────────────────┘
           │
    ┌──────┼──────┐
    │      │      │
    ▼      ▼      ▼
┌────────┐┌────────┐┌────────┐
│EDUC    ││CRM     ││HRM     │
│profiles││crm_*   ││hrm_*   │
└────────┘└────────┘└────────┘
```

## Rationale

### Why NOT a Single Unified Profile Table?

**Option A: Single monolithic `users` table with all fields**

❌ **Problems:**

- Different roles per system (customer vs MARKETER vs EMPLOYEE)
- Different required fields (addresses vs lead stages vs KPI criteria)
- Different query patterns (education: simple lookup | CRM: ownership-based | HRM: hierarchical)
- Different RLS policies (self-service vs ownership vs hierarchy)
- Data bloat: Education customers don't need CRM fields, etc.
- Harder to scale one system independently
- Risk of bugs in one system affecting others
- Complex migrations to add system-specific features

**Example complications:**

```sql
-- Single table approach (BAD)
users (
  id, email, full_name,
  phone, address, city, state, postal_code, country, -- EDUCATION
  company, lead_status, lead_source, owner_id,      -- CRM
  hrm_role, marker_admin_id, criteria_weights,      -- HRM
  -- Now 20+ columns, confusion about which apply where
)
```

### Why NOT Complete Separate Systems (No Auth Alliance)?

**Option B: Three totally separate auth instances**

❌ **Problems:**

- Users can't switch between systems easily
- Email conflicts (same person in education → employee → CRM user)
- No unified session management
- Team members can't have multiple roles
- Admin confusion about user identity across systems

### Why THIS Decision Worked ✅

**Option C: Unified Auth + Separate Profiles (CHOSEN)**

✅ **Benefits:**

1. **Single Sign-On**
   - One auth.users table
   - User signs in once (Supabase)
   - Can access all systems they have permissions for
   - No separate credentials per system

2. **System Independence**
   - Each system has its own table structure
   - No cross-system schema dependency
   - Teams can modify HRM without affecting education
   - CRM can evolve separately

3. **Role Flexibility**
   - Same person can be:
     - Education: `customer` + CRM: `MARKETER` + HRM: `EMPLOYEE`
     - Education: `admin` + CRM: `ADMIN` + HRM: `SUPER_ADMIN`
   - Roles don't conflict (different namespaces)

4. **Performance**
   - Smaller, focused tables
   - Appropriate indexes per system
   - Direct queries without large JOINS
   - Example:

     ```sql
     -- Fast: Only education customers
     SELECT * FROM profiles WHERE role = 'customer'

     -- vs monolithic approach:
     SELECT * FROM users WHERE role = 'customer'
       AND system = 'education' -- Extra filter needed
     ```

5. **Data Privacy**
   - RLS policies can be specific to each system
   - No accidental leakage between systems
   - Separate audit trails possible

6. **Team Autonomy**
   - Education team owns `profiles` table
   - CRM team owns `crm_*` tables
   - HR team owns `hrm_*` tables
   - Can implement features independently

---

## Implementation Details

### Email Synchronization

**Problem:** Email changes in auth.users must sync to all profile tables.

**Solution:** PostgreSQL trigger on auth.users

```sql
CREATE TRIGGER on_auth_user_email_updated
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_email()

-- Function syncs to all three systems:
UPDATE profiles SET email = NEW.email WHERE id = NEW.id
UPDATE crm_users SET email = NEW.email WHERE auth_user_id = NEW.id
UPDATE hrm_users SET email = NEW.email WHERE profile_id = NEW.id
```

**Why not app-level?** Triggers guarantee consistency at the database level, even if app fails.

### New User Flow

**Flow:** Admin invites someone → User registers → They appear in all systems (if eligible)

```
SUPER_ADMIN creates hrm_pending_profile(email, desired_role)
    ↓ (sends invite email)
USER visits invite link / registers with that email
    ↓
auth.users record created
    ↓ (trigger fires)
handle_new_user() runs:
  ├─ Check email domain → role determination
  ├─ Create profiles entry (education)
  ├─ Check if crm-eligible → create crm_users
  └─ Check pending HRM profile → link & create hrm_users
    ↓
USER has accounts in all appropriate systems
```

### Data Consistency Guarantees

| Scenario                  | Guarantee                                           |
| ------------------------- | --------------------------------------------------- |
| User edits email in auth  | All three systems sync via trigger                  |
| Auth user deleted         | CASCADE → all profiles deleted                      |
| Profile.role modified     | RLS policies enforce limits (admin can't overwrite) |
| CRM user becomes inactive | Leads remain (must reassign or archive)             |
| HRM user deleted          | Assignments cascade, submissions stay for audit     |

---

## Comparison Table

### When to Use This Architecture

| Characteristic          | This Approach                         | Better With Unified         |
| ----------------------- | ------------------------------------- | --------------------------- |
| **# of User Types**     | 3+ distinct roles                     | 1-2                         |
| **Role Permissions**    | System-specific                       | Generic                     |
| **Data Schemas**        | Vastly different                      | Similar                     |
| **Query Patterns**      | Isolated per system                   | Cross-system lookups needed |
| **Scaling**             | Uneven (1000 customers, 50 employees) | Even distribution           |
| **Team Structure**      | Separate product teams                | Single team                 |
| **Migration Frequency** | Different cadences                    | Synchronized                |
| **Risk Tolerance**      | High → Bugs isolated                  | Low → Bugs cascade          |

### This Project: ✅ Perfect Fit

- ✅ 3 distinct systems (unlikely to merge)
- ✅ Different roles (customer, MARKETER, EMPLOYEE)
- ✅ Different data (profiles vs leads vs KPI scores)
- ✅ Different permissions (self-service vs managed vs hierarchical)
- ✅ Different growth (e-commerce growth ≠ HRM fixed size)
- ✅ Separate teams (education team vs CRM team vs HR team)

---

## Trade-offs

### Accepted Trade-offs

| Trade-off                                     | Mitigation                                   |
| --------------------------------------------- | -------------------------------------------- |
| Duplicate emails in multiple tables           | Email UNIQUE per system, trigger sync        |
| More complex registration flow                | Automated via trigger, handled transparently |
| Need to update 3 tables on profile change     | Trigger-based sync, no manual updates        |
| Potential data inconsistency if trigger fails | PL/pgSQL SECURITY DEFINER + monitoring       |
| More storage (email, timestamp duplication)   | Negligible vs 1000s of users                 |

### Rejected Alternatives

**Single Unified Table:**

- ❌ Hard to separate concerns
- ❌ Hard to scale independently
- ❌ Monolithic schema causes pain later

**Completely Separate Systems (3 Supabase Projects):**

- ❌ Session management complexity
- ❌ Can't share auth seamlessly
- ❌ Expensive (3× Supabase subscription)
- ❌ User confusion (different logins)

**NoSQL (Firebase/Firestore):**

- ❌ Our team is SQL-proficient
- ❌ Supabase committed to this stack
- ❌ Easier auditing with SQL/triggers

---

## Implementation Status

### Core Tables ✅ COMPLETE

| Table                                    | Migration            | Status    |
| ---------------------------------------- | -------------------- | --------- |
| profiles (education)                     | 0001, 0002, 0004     | ✅ Active |
| crm_users, crm_leads, crm_contact_logs   | 0026                 | ✅ Active |
| hrm_users, hrm_assignments, hrm_criteria | 0039-0046            | ✅ Active |
| hrm_weeks, hrm_kpi_submissions           | 0039, 0040           | ✅ Active |
| Email sync                               | 0002, 20260220013529 | ✅ Active |

### Features ✅ COMPLETE

- ✅ Unified auth.users foundation
- ✅ Email sync across all systems
- ✅ Auto-registration flow (all systems)
- ✅ HRM pre-profiles (invite before register)
- ✅ RLS policies per system
- ✅ Cascade delete protections
- ✅ Audit logging (HRM email logs)

### Features 🔄 PLANNED

- [ ] Unified admin dashboard (see all 3 systems)
- [ ] Bulk user imports
- [ ] Compliance reports (all systems)
- [ ] User activity timeline
- [ ] Archive/soft-delete for users

---

## Operational Guidelines

### For Developers

**When adding features:**

1. Determine which system(s) affected
2. Modify only that system's tables
3. If email-related, ensure trigger handles it
4. Don't create cross-system queries (breaks isolation)

**Example: Add "Department" field to employee**

✅ **RIGHT:**

```sql
ALTER TABLE hrm_users ADD COLUMN department TEXT
-- Only affects HRM system
```

❌ **WRONG:**

```sql
ALTER TABLE profiles ADD COLUMN department TEXT
-- Pollutes education system with HRM data
```

### For Admins

**User Management:**

- Education: Manage via `/dashboard/admin`
- CRM: Manage via `/dashboard/crm/admin/users`
- HRM: Manage via `/dashboard/hrm/super`

**Permissions:**

- Education admin ≠ CRM admin ≠ HRM admin
- Same person can be all three (separate roles)

**Bulk Operations:**

- Never delete auth.users directly (cascades everywhere)
- Always revoke/block system access first
- Then delete from individual system if needed

### For Product Managers

**Roadmap Considerations:**

- Education features don't require CRM/HRM changes
- Can launch new CRM features without affecting students
- HRM can evolve independently (e.g., add 360 feedback)
- Shared constraint: Auth system performance

**Growth Planning:**

- Education: Scale to 10,000+ users (currently <1000)
- CRM: Expected to stay 100-500 leads
- HRM: Capped at 50-100 employees

---

## Monitoring & Maintenance

### Health Checks

Run weekly:

```sql
-- Orphaned records (shouldn't exist)
SELECT COUNT(*) FROM crm_leads
WHERE owner_id NOT IN (SELECT id FROM crm_users)

-- Email inconsistencies
SELECT COUNT(*) FROM profiles p
WHERE p.email != (SELECT email FROM auth.users WHERE id = p.id)

-- Missing profiles
SELECT COUNT(*) FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)

-- HRM assignments to inactive users
SELECT COUNT(*) FROM hrm_assignments
WHERE marker_admin_id NOT IN (
  SELECT id FROM hrm_users WHERE is_active = true
)
```

### Trigger Failures

Monitor PostgreSQL logs for:

```
handle_new_user() failed
sync_profile_email() failed
update_crm_updated_at() failed
```

**Action:** Manually re-run failed operation or contact support.

---

## Related Documentation

- [Users/Profile Structure Analysis](./USERS_PROFILE_STRUCTURE_ANALYSIS.md) - Detailed schema reference
- [Architecture Visual](./USERS_PROFILE_ARCHITECTURE_VISUAL.md) - Diagrams & flows
- [Quick Reference Guide](./USERS_PROFILE_QUICK_REFERENCE.md) - API & SQL examples
- [Auth Setup Docs](./docs/AUTH_EMAIL_SETUP.md) - Email configuration
- [Migrations Reference](./docs/MIGRATION_GUIDE.md) - DB schema history

---

## Lessons Learned

### What Went Well ✅

1. **Trigger-based sync** is more reliable than app-level
2. **Separate RLS policies** per system reduced bugs
3. **Cascade deletes** prevented orphans
4. **Email domains for admin detection** is elegant (no manual assignment)

### What Was Challenging 🤔

1. **Migration consistency** - Had to retry some migrations
2. **Trigger debugging** - Errors in prod were hard to trace
3. **HRM pre-profiles** - Complex to implement pre-reg flow
4. **Testing** - Hard to test RLS policies comprehensively

### If We Did It Again 🔄

1. **Add soft deletes** from day 1 (now hard to retrofit)
2. **Create audit triggers** for all tables (currently only HRM)
3. **Use database roles** more (currently relies on RLS)
4. **Document system interactions** better (created this doc!)

---

## Approval & Sign-Off

| Role            | Name | Date       | Approval |
| --------------- | ---- | ---------- | -------- |
| Tech Lead       | -    | 2026-02-16 | ✅       |
| Product Manager | -    | 2026-02-16 | ✅       |
| CTO             | -    | 2026-02-16 | ✅       |

---

## Version History

| Version | Date       | Author | Changes                 |
| ------- | ---------- | ------ | ----------------------- |
| 1.0     | 2026-02-25 | AI     | Initial ADR + rationale |
| -       | -          | -      | -                       |

---

**Architecture Decision Record v1.0** | Last Updated: 2026-02-25
**Status: APPROVED & IMPLEMENTED** | Review Period: Annual
