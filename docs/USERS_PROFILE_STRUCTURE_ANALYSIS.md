# Users/Profile Structure Analysis

## Education, CRM & HRM Systems

**Date:** February 25, 2026

---

## 📋 Executive Summary

The system implements a **unified authentication layer** (`auth.users` via Supabase) with **three separate but interconnected domain-specific profile systems**:

1. **EDUCATION** - Customer/Admin profiles for course enrollment and business
2. **CRM** - Sales team users and lead management
3. **HRM** - Internal employee management and KPI tracking

Each system has its own tables, roles, and business logic while sharing the same authentication source.

---

## 🔐 Core Authentication Layer

### Source of Truth: `auth.users` (Supabase Auth)

| Field                | Type      | Purpose                                  |
| -------------------- | --------- | ---------------------------------------- |
| `id`                 | UUID      | Primary authentication identifier        |
| `email`              | TEXT      | Login email                              |
| `raw_user_meta_data` | JSONB     | Stores name, avatar, and custom metadata |
| `email_confirmed_at` | TIMESTAMP | Email verification status                |
| `created_at`         | TIMESTAMP | Account creation time                    |

**Key Points:**

- All three systems reference `auth.users(id)` as foreign key
- Email is automatically synced to domain-specific profile tables via trigger
- Supports multiple auth flows: password, OAuth, magic links, invitations

---

## 🎓 EDUCATION SYSTEM

### Primary Table: `profiles`

A single, unified table for all education system users (both customers and admins).

#### Schema

```sql
profiles
  ├── id (UUID) ─── FK: auth.users(id)
  ├── email (TEXT, UNIQUE) ─── synced from auth.users
  ├── full_name (TEXT)
  ├── phone (TEXT)
  ├── address (TEXT)
  ├── city (TEXT)
  ├── state (TEXT)
  ├── postal_code (TEXT)
  ├── country (TEXT) ─── default: 'BD'
  ├── avatar_url (TEXT)
  ├── role (ENUM: customer | admin) ─── default: 'customer'
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)
```

#### Roles & Access

| Role       | Usage                             | Auto-Assigned                    |
| ---------- | --------------------------------- | -------------------------------- |
| `customer` | Course enrollees, service buyers  | Default for all signups          |
| `admin`    | Business admins, dashboard access | Based on email domain validation |

**Auto-Assignment Logic:**

```
IF email LIKE '%@wetraineducation.com' OR
   email IN ('admin@wetraineducation.com', 'super@wetraineducation.com')
  → THEN role = 'admin'
ELSE
  → role = 'customer'
```

#### Related Tables

| Table            | Purpose                  | Link             |
| ---------------- | ------------------------ | ---------------- |
| `orders`         | Course/service purchases | profiles.id      |
| `payments`       | Payment records          | profiles.id      |
| `certifications` | User credentials         | profiles.id      |
| `client_stories` | Testimonials             | N/A (standalone) |

#### RLS Policies

```
SELECT: Users can view own profile OR if is_admin()
INSERT: Users can only insert own profile
UPDATE: Users can update own profile (role cannot change)
DELETE: Admin only
```

---

## 💼 CRM SYSTEM

### Design Pattern

The CRM is a **parallel system** for internal sales team operations. It maintains **separate user management** from the education system but shares the same auth.users foundation.

### Primary Tables

#### 1. `crm_users` ─ CRM Team Members

```sql
crm_users
  ├── id (UUID, PRIMARY KEY)
  ├── auth_user_id (UUID) ─── FK: auth.users(id)
  ├── email (TEXT, UNIQUE)
  ├── full_name (TEXT)
  ├── crm_role (ENUM: ADMIN | MARKETER) ─── default: 'MARKETER'
  ├── is_active (BOOLEAN) ─── default: true
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Indexes:
  - idx_crm_users_auth_user_id
  - idx_crm_users_email
  - idx_crm_users_crm_role
```

**Roles:**

- `ADMIN` - Full CRM access, manage users and leads
- `MARKETER` - Can view and manage assigned leads

#### 2. `crm_leads` ─ Sales Leads/Prospects

```sql
crm_leads
  ├── id (UUID, PRIMARY KEY)
  ├── name (TEXT, NOT NULL)
  ├── email (TEXT)
  ├── phone (TEXT, UNIQUE)
  ├── company (TEXT)
  ├── status (ENUM) ───┬─ NEW
  │                    ├─ CONTACTED
  │                    ├─ QUALIFIED
  │                    ├─ PROPOSAL
  │                    ├─ NEGOTIATION
  │                    ├─ WON
  │                    └─ LOST
  ├── source (ENUM) ───┬─ ADMIN
  │                    ├─ WEBSITE
  │                    ├─ REFERRAL
  │                    ├─ SOCIAL_MEDIA
  │                    └─ OTHER
  ├── owner_id (UUID) ─── FK: crm_users(id)
  ├── notes (TEXT)
  ├── last_contacted_at (TIMESTAMPTZ)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Indexes:
  - idx_crm_leads_owner_id
  - idx_crm_leads_status
  - idx_crm_leads_created_at
  - idx_crm_leads_email
  - idx_crm_leads_phone
```

#### 3. `crm_contact_logs` ─ Interaction History

```sql
crm_contact_logs
  ├── id (UUID, PRIMARY KEY)
  ├── lead_id (UUID) ─── FK: crm_leads(id) [CASCADE]
  ├── user_id (UUID) ─── FK: crm_users(id) [RESTRICT]
  ├── contact_type (ENUM) ───┬─ CALL
  │                          ├─ EMAIL
  │                          ├─ MEETING
  │                          ├─ WHATSAPP
  │                          └─ OTHER
  ├── notes (TEXT)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Indexes:
  - idx_crm_contact_logs_lead_id
  - idx_crm_contact_logs_user_id
  - idx_crm_contact_logs_created_at
```

### User Creation Flow

```
Admin creates CRM user
    ↓
Supabase Auth user created (temporary password)
    ↓
crm_users row inserted
    ↓
Email sent with magic link/login credentials
    ↓
On first login, auth.users synced to profiles (education)
    ↓
User has dual presence: crm_users + profiles
```

### RLS Policies

**crm_users:**

- SELECT: All authenticated users
- UPDATE: Users can only update own profile (not role or is_active)
- DELETE: Admin only

**crm_leads:**

- SELECT: Users can view own leads + admins see all
- INSERT: Admins only
- UPDATE: Owner or admin
- DELETE: Admin only

**crm_contact_logs:**

- SELECT: Lead owner, log creator, or admin
- INSERT: Assigned user only
- UPDATE: Creator or admin

---

## 👥 HRM SYSTEM

### Design Pattern

HRM is the **most complex system** with:

- Pre-registration pending profiles
- Employee hierarchy (admin → employee assignments)
- Weekly KPI tracking
- Monthly performance summaries
- Email audit logs

### Primary Tables

#### 1. `hrm_users` ─ HRM System Participants

```sql
hrm_users
  ├── id (UUID, PRIMARY KEY)
  ├── profile_id (UUID, UNIQUE) ─── FK: profiles(id)
  ├── hrm_role (ENUM) ─────┬─ SUPER_ADMIN
  │                        ├─ ADMIN
  │                        └─ EMPLOYEE
  ├── full_name (TEXT)
  ├── email (TEXT)
  ├── is_active (BOOLEAN) ─── default: true
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Indexes:
  - idx_hrm_users_profile_id
  - idx_hrm_users_hrm_role
  - idx_hrm_users_is_active
```

**Roles:**

- `SUPER_ADMIN` - System-wide access, can create users and modify all data
- `ADMIN` - Regular admin, mark employees, manage assignments
- `EMPLOYEE` - Subject of review, can view own scores

#### 2. `hrm_pending_profiles` ─ Pre-Registration Users

Allows SUPER_ADMIN to create user profiles before they register.

```sql
hrm_pending_profiles
  ├── id (UUID, PRIMARY KEY)
  ├── email (TEXT, UNIQUE, LOWERCASE)
  ├── full_name (TEXT)
  ├── desired_role (ENUM: ADMIN | EMPLOYEE)
  ├── is_active (BOOLEAN) ─── default: true
  ├── created_by (UUID) ─── FK: auth.users(id)
  ├── linked_auth_id (UUID, NULLABLE) ─── FK: auth.users(id)
  ├── linked_at (TIMESTAMPTZ)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Indexes:
  - idx_hrm_pending_profiles_email
  - idx_hrm_pending_profiles_linked_auth_id
  - idx_hrm_pending_profiles_created_by
  - idx_hrm_pending_profiles_desired_role
  - idx_hrm_pending_profiles_is_active
```

**Flow:**

1. SUPER_ADMIN creates pending profile (email: user@example.com)
2. Email invitation sent
3. User registers with that email
4. Trigger auto-links pending profile to auth user
5. hrm_users row created with desired_role

#### 3. `hrm_assignments` ─ Marker-Subject Relationships

Maps which admins mark which employees.

```sql
hrm_assignments
  ├── id (UUID, PRIMARY KEY)
  ├── marker_admin_id (UUID) ─── FK: hrm_users(id) [CASCADE]
  ├── subject_user_id (UUID) ─── FK: hrm_users(id) [CASCADE]
  ├── is_active (BOOLEAN) ─── default: true
  ├── created_by_id (UUID) ─── FK: hrm_users(id)
  ├── created_at (TIMESTAMPTZ)
  ├── updated_at (TIMESTAMPTZ)
  └── UNIQUE(marker_admin_id, subject_user_id)

Indexes:
  - idx_hrm_assignments_marker_admin_id
  - idx_hrm_assignments_subject_user_id
  - idx_hrm_assignments_is_active
```

#### 4. `hrm_criteria` ─ KPI Definition

Standard criteria that admins use to score employees.

```sql
hrm_criteria
  ├── id (UUID, PRIMARY KEY)
  ├── key (TEXT, UNIQUE)
  ├── name (TEXT)
  ├── default_scale_max (INTEGER) ─── default: 10
  ├── description (TEXT)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)
```

**Example Criteria:**

- Quality of Work (key: quality_work)
- Punctuality (key: punctuality)
- Team Collaboration (key: team_collab)
- Communication (key: communication)

#### 5. `hrm_subject_criteria_sets` ─ Employee Scoring Periods

Customizable criteria sets per employee per time period.

```sql
hrm_subject_criteria_sets
  ├── id (UUID, PRIMARY KEY)
  ├── subject_user_id (UUID) ─── FK: hrm_users(id) [CASCADE]
  ├── active_from (DATE)
  ├── active_to (DATE, NULLABLE)
  ├── created_by_id (UUID) ─── FK: hrm_users(id)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Index:
  - idx_hrm_subject_criteria_sets_subject_user_id
  - idx_hrm_subject_criteria_sets_active_from
```

#### 6. `hrm_subject_criteria_items` ─ Weighted Criteria

```sql
hrm_subject_criteria_items
  ├── id (UUID, PRIMARY KEY)
  ├── criteria_set_id (UUID) ─── FK: hrm_subject_criteria_sets(id) [CASCADE]
  ├── criteria_id (UUID) ─── FK: hrm_criteria(id)
  ├── weight (INTEGER)
  ├── scale_max (INTEGER) ─── default: 10
  ├── created_at (TIMESTAMPTZ)
  ├── updated_at (TIMESTAMPTZ)
  └── UNIQUE(criteria_set_id, criteria_id)

Index:
  - idx_hrm_subject_criteria_items_criteria_set_id
```

#### 7. `hrm_weeks` ─ Weekly Period Definition

```sql
hrm_weeks
  ├── id (UUID, PRIMARY KEY)
  ├── week_key (TEXT, UNIQUE) ─── e.g., "2026-W08"
  ├── friday_date (DATE, UNIQUE) ─── End of week Friday
  ├── status (ENUM: OPEN | LOCKED)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Indexes:
  - idx_hrm_weeks_status
  - idx_hrm_weeks_friday_date
```

#### 8. `hrm_kpi_submissions` ─ Weekly Scores

```sql
hrm_kpi_submissions
  ├── id (UUID, PRIMARY KEY)
  ├── week_id (UUID) ─── FK: hrm_weeks(id) [CASCADE]
  ├── marker_admin_id (UUID) ─── FK: hrm_users(id)
  ├── subject_user_id (UUID) ─── FK: hrm_users(id)
  ├── total_score (DECIMAL 10,2)
  ├── comment (TEXT)
  ├── submitted_at (TIMESTAMPTZ)
  ├── created_at (TIMESTAMPTZ)
  ├── updated_at (TIMESTAMPTZ)
  └── UNIQUE(week_id, marker_admin_id, subject_user_id)

Indexes:
  - idx_hrm_kpi_submissions_week_id
  - idx_hrm_kpi_submissions_marker_admin_id
  - idx_hrm_kpi_submissions_subject_user_id
```

#### 9. `hrm_kpi_submission_items` ─ Individual Criterion Scores

```sql
hrm_kpi_submission_items
  ├── id (UUID, PRIMARY KEY)
  ├── submission_id (UUID) ─── FK: hrm_kpi_submissions(id) [CASCADE]
  ├── criteria_id (UUID) ─── FK: hrm_criteria(id)
  ├── score_raw (DECIMAL 10,2)
  ├── created_at (TIMESTAMPTZ)
  ├── updated_at (TIMESTAMPTZ)
  └── UNIQUE(submission_id, criteria_id)

Index:
  - idx_hrm_kpi_submission_items_submission_id
```

#### 10. `hrm_weekly_results` ─ Aggregated Weekly Scores

```sql
hrm_weekly_results
  ├── id (UUID, PRIMARY KEY)
  ├── week_id (UUID) ─── FK: hrm_weeks(id) [CASCADE]
  ├── subject_user_id (UUID) ─── FK: hrm_users(id)
  ├── weekly_avg_score (DECIMAL 10,2)
  ├── expected_markers_count (INTEGER)
  ├── submitted_markers_count (INTEGER)
  ├── is_complete (BOOLEAN)
  ├── computed_at (TIMESTAMPTZ)
  └── UNIQUE(week_id, subject_user_id)

Indexes:
  - idx_hrm_weekly_results_week_id
  - idx_hrm_weekly_results_subject_user_id
```

#### 11. `hrm_months` ─ Monthly Period Tracking

```sql
hrm_months
  ├── id (UUID, PRIMARY KEY)
  ├── month_key (TEXT, UNIQUE) ─── e.g., "2026-02"
  ├── start_date (DATE)
  ├── end_date (DATE)
  ├── status (ENUM: OPEN | LOCKED)
  ├── expected_weeks_count (INTEGER)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)
```

#### 12. `hrm_monthly_results` ─ Monthly Performance Summary

```sql
hrm_monthly_results
  ├── id (UUID, PRIMARY KEY)
  ├── month_id (UUID) ─── FK: hrm_months(id) [CASCADE]
  ├── subject_user_id (UUID) ─── FK: hrm_users(id)
  ├── monthly_avg_score (DECIMAL 10,2)
  ├── median_score (DECIMAL 10,2)
  ├── weeks_count_used (INTEGER)
  ├── expected_weeks_count (INTEGER)
  ├── is_complete_month (BOOLEAN)
  ├── computed_at (TIMESTAMPTZ)
  ├── created_at (TIMESTAMPTZ)
  ├── updated_at (TIMESTAMPTZ)
  └── UNIQUE(month_id, subject_user_id)
```

#### 13. `hrm_email_logs` ─ Marksheet Email Audit Trail

```sql
hrm_email_logs
  ├── id (UUID, PRIMARY KEY)
  ├── subject_user_id (UUID) ─── FK: hrm_users(id) [CASCADE]
  ├── recipient_email (TEXT)
  ├── month_id (UUID) ─── FK: hrm_months(id) [CASCADE]
  ├── email_type (VARCHAR 50) ─── default: 'MARKSHEET'
  ├── subject_line (TEXT)
  ├── html_content (TEXT)
  ├── text_content (TEXT)
  ├── sent_by_admin_id (UUID) ─── FK: hrm_users(id)
  ├── sent_at (TIMESTAMPTZ)
  ├── delivery_status (VARCHAR 50) ─── PENDING | SENT | FAILED | BOUNCED
  ├── delivery_error (TEXT)
  ├── opened_at (TIMESTAMPTZ)
  ├── created_at (TIMESTAMPTZ)
  └── updated_at (TIMESTAMPTZ)

Indexes:
  - idx_hrm_email_logs_subject_user_id
  - idx_hrm_email_logs_month_id
  - idx_hrm_email_logs_sent_at
  - idx_hrm_email_logs_email_type
```

---

## 🔄 Data Flow & Relationships

### User Registration Flow

```
User signs up (email: user@example.com)
    ↓
[Migration: 20260220013529_fix_user_invite_trigger]
    ↓
Trigger: handle_new_user() executes
    ├─ Check if email is admin domain
    │   ├─ If YES → Create profiles row with role='admin'
    │   │   └─ Also create crm_users row with crm_role='ADMIN'
    │   └─ If NO → Create profiles row with role='customer'
    │
    ├─ Also check if pending HRM profile exists
    │   └─ Auto-link to hrm_users (if desired_role set)
    │
    └─ Create customer/education profile records
```

### Profile Sync Mechanism

```
auth.users email updated
    ↓
Trigger: sync_profile_email()
    ↓
Update all related tables:
  ├─ profiles.email
  ├─ crm_users.email
  └─ hrm_users.email
```

---

## 📊 System Comparison Matrix

| Feature                | EDUCATION            | CRM                  | HRM                                 |
| ---------------------- | -------------------- | -------------------- | ----------------------------------- |
| **Primary User Table** | `profiles`           | `crm_users`          | `hrm_users`                         |
| **Roles**              | customer, admin      | MARKETER, ADMIN      | EMPLOYEE, ADMIN, SUPER_ADMIN        |
| **Pre-Registration**   | No                   | No                   | Yes (`hrm_pending_profiles`)        |
| **Hierarchy**          | None                 | Flat                 | Marker-Subject (Manager → Employee) |
| **Tracked Events**     | None                 | Contacts (@lead)     | KPI scores (@weekly/@monthly)       |
| **Scoring/Metrics**    | None                 | Lead status          | Weekly & Monthly averages           |
| **Email Audit**        | None                 | None                 | Yes (`hrm_email_logs`)              |
| **Customization**      | Basic profile        | Flexible lead fields | Per-employee criteria sets          |
| **Access Model**       | Role-based (2 roles) | Lead ownership       | Role + assignment based             |

---

## 🔐 Security & RLS Summary

### Authentication

- **Source:** Supabase Auth (auth.users)
- **Methods:** Password, OAuth, Magic links, Invitations
- **Email verification:** Required for confirmation flows

### Row Level Security (RLS)

**EDUCATION (profiles):**

```
View: Own profile OR admin
Update: Own profile (no role change)
Delete: Admins only
```

**CRM:**

```
crm_users:
  View: All authenticated
  Update: Own profile only
  Delete: Admins only

crm_leads:
  View: Own leads OR admin
  Insert/Update/Delete: Lead owner OR admin

crm_contact_logs:
  View: Creator OR lead owner OR admin
  Insert: Assigned user only
  Update/Delete: Creator OR admin
```

**HRM:**

```
hrm_users:
  View: Assigned users OR admin

hrm_assignments:
  Create/Update: Admin only

hrm_pending_profiles:
  View/Create/Update: SUPER_ADMIN only

hrm_kpi_submissions:
  View: Own submissions OR assigned markers OR admin
  Create/Update: Assigned marker OR admin

hrm_email_logs:
  View: Own logs OR admin
  Create/Delete: SUPER_ADMIN only
```

---

## 🔗 Key Constraints & Relationships

### Foreign Key Relationships

```
auth.users
  ├─→ profiles (1-to-1)
  │   └─→ orders, payments, certifications
  ├─→ crm_users (1-to-1, nullable)
  │   ├─→ crm_leads (as owner)
  │   └─→ crm_contact_logs (as user)
  └─→ hrm_pending_profiles (1-to-many)
      └─→ hrm_users (1-to-1 via profile_id)
          ├─→ hrm_assignments
          └─→ hrm_kpi_submissions
```

### Cascade Behaviors

| Table        | On Delete           | Impact                                 |
| ------------ | ------------------- | -------------------------------------- |
| `auth.users` | CASCADE             | All profiles, crm_users deleted        |
| `profiles`   | N/A                 | Orders, payments cascade; RLS protects |
| `crm_leads`  | RESTRICT from owner | Prevents orphaned leads                |
| `hrm_users`  | CASCADE             | Assignments, submissions deleted       |
| `hrm_weeks`  | CASCADE             | All weekly submissions deleted         |

---

## 📝 Audit & Logging

### Automatic Tracking

All tables have `created_at` and `updated_at` timestamps with auto-update triggers.

### Manual Audit Logs

**HRM Email Logs** - Full email audit trail:

- What: Email content (HTML + text)
- Who: Sent by admin
- When: Sent timestamp + delivery status
- Status: PENDING → SENT → FAILED/BOUNCED or OPENED

---

## 🚀 Notable Features & Patterns

### 1. **Unified Authentication, Separate Systems**

- Single auth.users foundation
- Three independent domain profiles
- Each has own roles, permissions, and workflows

### 2. **Email Sync Across Systems**

- Changes to auth.users.email automatically propagate
- Keeps all systems in sync via trigger

### 3. **Pre-Registration (HRM Only)**

- SUPER_ADMIN can invite users before they register
- Pending profile auto-links on first login
- Allows workflows where roles are predetermined

### 4. **Flexible Scoring (HRM)**

- Per-employee customizable criteria sets
- Weighted scoring
- Multiple markers per employee
- Weekly aggregation → Monthly summary

### 5. **Lead Ownership (CRM)**

- Leads owned by single marketer
- Can be reassigned
- Contact history preserved

### 6. **Admin Email Domains (EDUCATION)**

- Auto-detection based on domain or email list
- Admins auto-assigned on signup
- Overridable via updates

---

## 📈 Growth Considerations

### Scalability Notes

1. **Weekly/Monthly Computation**
   - HRM uses event-driven updates
   - Computed results stored to avoid recalculation
   - Can handle 1000+ employees

2. **CRM Lead Performance**
   - Multiple indexes on status, dates, ownership
   - Contact logs cascade with leads
   - Supports bulk operations

3. **Storage**
   - HRM email logs store full HTML + text
   - Consider archive strategy for old logs (2+ years)
   - Submissions immutable after week lock

---

## 🔧 Configuration & Customization

### Configurable Elements

| System    | Configurable                          | Location                          |
| --------- | ------------------------------------- | --------------------------------- |
| EDUCATION | Admin domains                         | Migration 0026 (lines 147-151)    |
| CRM       | Lead statuses, sources, contact types | Migration 0026 (ENUM definitions) |
| HRM       | Criteria, roles, email types          | Migrations 0039, 0041, 0046       |

### Custom Criteria (HRM)

Admin can add new criteria:

```sql
INSERT INTO hrm_criteria (key, name, default_scale_max, description)
VALUES ('initiative', 'Initiative', 10, 'Proactive problem-solving');
```

Then assign to employee via:

```sql
INSERT INTO hrm_subject_criteria_items
  (criteria_set_id, criteria_id, weight, scale_max)
VALUES (...);
```

---

## 🎯 API Integration Points

### Education Profile API

- `GET /api/profile` - Get user profile
- `PATCH /api/profile/update` - Update profile fields

### CRM User Management

- `/app/dashboard/crm/admin/users` - User CRUD
- `/app/dashboard/crm/_actions/users.ts` - Server actions

### HRM Management

- `/app/dashboard/hrm/super/people` - User/pending profile management
- `/app/dashboard/hrm/super/criteria` - Criteria configuration
- `/app/dashboard/hrm/super/marks` - KPI submission interface

---

## 📌 Key Files Reference

| File                                         | Purpose                      |
| -------------------------------------------- | ---------------------------- |
| `0001_profiles.sql`                          | Education profiles base      |
| `0002_profiles_email.sql`                    | Email sync trigger           |
| `0004_profiles_address_fields.sql`           | Address fields               |
| `0026_consolidate_crm_schema.sql`            | CRM tables + unified trigger |
| `0039_add_hrm_kpi_system.sql`                | HRM core tables              |
| `0040_add_monthly_weeks_tracking.sql`        | Monthly aggregation          |
| `0041_add_hrm_email_logs.sql`                | HRM audit trail              |
| `0046_add_hrm_pending_profiles.sql`          | Pre-registration setup       |
| `20260220013529_fix_user_invite_trigger.sql` | Invite flow improvements     |

---

## ⚠️ Known Limitations & Considerations

1. **Email Unique Constraint**
   - Both `profiles.email` and `crm_users.email` have UNIQUE constraints
   - Same email cannot be used in both if trying to create manually (avoid, use triggers)

2. **Cascade Deletes**
   - Deleting auth.users cascades everywhere
   - No soft deletes currently implemented
   - Consider archiving before deletion

3. **HRM Pre-Profiles**
   - Once linked (`linked_auth_id`), cannot be reused
   - Email must match exactly (case-insensitive after insert)

4. **CRM Lead Ownership**
   - Single owner per lead (no shared ownership)
   - Reassignment is manual operation
   - Contact history remains with lead

5. **Performance at Scale**
   - Monthly/weekly result computation can be expensive
   - Consider batch processing for 1000+ employees
   - Email log storage grows quickly

---

## ✅ Validation Checklist

When implementing changes:

- [ ] Changes to `auth.users` sync correctly to all three systems
- [ ] RLS policies tested for each role
- [ ] Cascade deletes don't orphan records
- [ ] Email validation consistent across systems
- [ ] Timestamps auto-update on all tables
- [ ] Foreign key constraints prevent invalid data
- [ ] Admin email auto-assignment works as expected
- [ ] HRM pre-register → register → hrm_user flow works end-to-end
- [ ] CRM lead ownership and reassignment audited
- [ ] All indexes exist for critical queries

---

**Document Version:** 1.0 | **Last Updated:** 2026-02-25
