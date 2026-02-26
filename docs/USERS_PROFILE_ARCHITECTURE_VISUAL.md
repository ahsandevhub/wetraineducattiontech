# Users/Profile Structure - Visual Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE AUTHENTICATION                             │
│                              auth.users                                     │
│                   (Email, Password, OAuth, Magic Link)                     │
│                                                                             │
│  Unique Source of Truth: id (UUID) | email | raw_user_meta_data            │
└──────────────────┬──────────────────────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   ┌────────┐  ┌──────────┐  ┌──────────┐
   │EDUCATION│  │ CRM      │  │ HRM      │
   │SYSTEM  │  │ SYSTEM   │  │ SYSTEM   │
   └────────┘  └──────────┘  └──────────┘
```

## Detailed System Structure

### EDUCATION SYSTEM (Left)

```
┌─ EDUCATION ─────────────────────────┐
│                                     │
│  auth.users                         │
│      ↓                              │
│  profiles (1-to-1)                  │
│  ├─ id (UUID)                       │
│  ├─ email (TEXT UNIQUE)             │
│  ├─ full_name                       │
│  ├─ phone                           │
│  ├─ address                         │
│  ├─ city, state, postal_code        │
│  ├─ country (default: BD)           │
│  ├─ avatar_url                      │
│  ├─ role (customer | admin)         │
│  ├─ created_at                      │
│  └─ updated_at                      │
│      ↓                              │
│   ├─ orders                         │
│   ├─ payments                       │
│   └─ certifications                 │
│                                     │
│  ROLES:                             │
│  ├─ customer (default)              │
│  └─ admin (@wetraineducation.com)   │
└─────────────────────────────────────┘
```

### CRM SYSTEM (Middle)

```
┌─ CRM ────────────────────────────────────────┐
│                                              │
│  auth.users                                  │
│      ↓                                       │
│  crm_users (1-to-1, parallel)                │
│  ├─ id (UUID)                                │
│  ├─ auth_user_id → auth.users                │
│  ├─ email (unique)                           │
│  ├─ full_name                                │
│  ├─ crm_role (ADMIN | MARKETER)              │
│  ├─ is_active                                │
│  ├─ created_at                               │
│  └─ updated_at                               │
│      ↓                                       │
│   ├─ crm_leads                               │
│   │   ├─ name, email, phone, company        │
│   │   ├─ status (NEW→LOST|WON)              │
│   │   ├─ source (ADMIN|WEBSITE|...)         │
│   │   ├─ owner_id → crm_users                │
│   │   ├─ notes, last_contacted_at           │
│   │   └─ timestamps                         │
│   │       ↓                                  │
│   │   └─ crm_contact_logs                    │
│   │       ├─ lead_id → crm_leads             │
│   │       ├─ user_id → crm_users             │
│   │       ├─ contact_type (CALL|EMAIL|...)  │
│   │       └─ notes, timestamp                │
│   └── ...                                    │
│                                              │
│  ROLES:                                      │
│  ├─ MARKETER (default)                       │
│  └─ ADMIN (CRM admin only)                   │
└──────────────────────────────────────────────┘
```

### HRM SYSTEM (Right)

```
┌─ HRM ──────────────────────────────────────────────┐
│                                                    │
│  auth.users                                        │
│      ↓                                             │
│  hrm_pending_profiles (Pre-registration)           │
│  ├─ email (unique lowercase)                       │
│  ├─ full_name                                      │
│  ├─ desired_role (ADMIN | EMPLOYEE)                │
│  ├─ is_active                                      │
│  ├─ created_by, created_at                         │
│  └─ linked_auth_id (null → UUID on register)       │
│      ↓ (on first login)                            │
│  hrm_users (1-to-1)                                │
│  ├─ id (UUID)                                      │
│  ├─ profile_id → profiles(id)                      │
│  ├─ hrm_role (SUPER_ADMIN|ADMIN|EMPLOYEE)          │
│  ├─ full_name, email                               │
│  ├─ is_active                                      │
│  └─ timestamps                                     │
│      ├─→ MARKER-SUBJECT RELATIONSHIPS              │
│      │   hrm_assignments                           │
│      │   ├─ marker_admin_id → hrm_users            │
│      │   ├─ subject_user_id → hrm_users            │
│      │   ├─ is_active                              │
│      │   └─ UNIQUE(marker, subject)                │
│      │                                             │
│      ├─→ CRITERIA CONFIGURATION                    │
│      │   hrm_criteria (Global)                     │
│      │   ├─ key (unique identifier)                │
│      │   ├─ name, description                      │
│      │   ├─ default_scale_max (10)                 │
│      │   └─ ...                                    │
│      │       ↓                                     │
│      │   hrm_subject_criteria_sets                 │
│      │   ├─ subject_user_id                        │
│      │   ├─ active_from, active_to                 │
│      │   └─ created_by_id                          │
│      │       ↓                                     │
│      │   hrm_subject_criteria_items                │
│      │   ├─ criteria_set_id                        │
│      │   ├─ criteria_id                            │
│      │   ├─ weight, scale_max                      │
│      │   └─ UNIQUE(set, criteria)                  │
│      │                                             │
│      └─→ SCORING & RESULTS                         │
│          hrm_weeks                                 │
│          ├─ week_key (e.g., "2026-W08")            │
│          ├─ friday_date (unique)                   │
│          ├─ status (OPEN | LOCKED)                 │
│          └─ ...                                    │
│              ↓                                     │
│          hrm_kpi_submissions (Weekly Scores)       │
│          ├─ week_id → hrm_weeks                    │
│          ├─ marker_admin_id → hrm_users            │
│          ├─ subject_user_id → hrm_users            │
│          ├─ total_score (DECIMAL)                  │
│          ├─ comment, submitted_at                  │
│          └─ UNIQUE(week, marker, subject)          │
│              ↓                                     │
│          hrm_kpi_submission_items                  │
│          ├─ submission_id                          │
│          ├─ criteria_id → hrm_criteria             │
│          ├─ score_raw (individual criterion)       │
│          └─ UNIQUE(submission, criteria)           │
│              ↓                                     │
│          hrm_weekly_results (Aggregated)           │
│          ├─ week_id, subject_user_id               │
│          ├─ weekly_avg_score (mean)                │
│          ├─ expected_markers_count                 │
│          ├─ submitted_markers_count                │
│          ├─ is_complete                            │
│          └─ computed_at                            │
│                                                    │
│          hrm_months (Monthly Period)               │
│          ├─ month_key (e.g., "2026-02")            │
│          ├─ start_date, end_date                   │
│          ├─ status (OPEN | LOCKED)                 │
│          └─ expected_weeks_count                   │
│              ↓                                     │
│          hrm_monthly_results (Aggregated)          │
│          ├─ month_id, subject_user_id              │
│          ├─ monthly_avg_score (mean)               │
│          ├─ median_score                           │
│          ├─ weeks_count_used                       │
│          ├─ expected_weeks_count                   │
│          ├─ is_complete_month                      │
│          └─ computed_at                            │
│                                                    │
│          ┌─ EMAIL AUDIT ──────────────────────┐   │
│          │ hrm_email_logs                     │   │
│          │ ├─ subject_user_id → hrm_users    │   │
│          │ ├─ recipient_email                 │   │
│          │ ├─ month_id → hrm_months           │   │
│          │ ├─ email_type (MARKSHEET, ...)     │   │
│          │ ├─ subject_line, html_content      │   │
│          │ ├─ text_content, sent_by_admin_id  │   │
│          │ ├─ sent_at, delivery_status        │   │
│          │ ├─ delivery_error, opened_at       │   │
│          │ └─ created_at, updated_at          │   │
│          └────────────────────────────────────┘   │
│                                                    │
│  ROLES:                                            │
│  ├─ SUPER_ADMIN (Full system access)               │
│  ├─ ADMIN (Mark employees)                         │
│  └─ EMPLOYEE (Submit, view own scores)             │
└────────────────────────────────────────────────────┘
```

## User Creation & Sync Flow

```
USER REGISTRATION
    ↓
    ├─ POST to /api/auth/signup (or OAuth/magic link)
    ↓
auth.users record created (trigger fires)
    ↓
    ├─ Trigger: handle_new_user() ─────────────────────────────┐
    │                                                           │
    │   1. Check email domain:                                  │
    │      @wetraineducation.com → role: admin                 │
    │      else                 → role: customer               │
    │   ↓                                                        │
    │   2. Create profiles row:                                 │
    │      INSERT profiles (id, email, full_name, role)        │
    │   ↓                                                        │
    │   3. If crm_role auto-eligible & not exists:             │
    │      INSERT crm_users (auth_user_id, crm_role='ADMIN')   │
    │   ↓                                                        │
    │   4. Check pending HRM profile:                           │
    │      IF EXISTS pending profile with matching email:       │
    │        ├─ Link pending to auth user                       │
    │        └─ Create hrm_users with desired_role              │
    │                                                           │
    └─────────────────────────────────────────────────────────┘
    ↓
USER LOGGED IN (with email updated later)
    ↓
    └─ Trigger: sync_profile_email() fires
        ├─ UPDATE profiles.email = new email
        ├─ UPDATE crm_users.email = new email (if exists)
        └─ UPDATE hrm_users.email = new email (if exists)
```

## Data Consistency Across Systems

```
┌─────────────────────────────────────────────────────────────┐
│               EMAIL SYNC TRIGGER FLOW                       │
│                                                             │
│  User updates email in auth UI                             │
│      ↓                                                      │
│  auth.users.email changed                                  │
│      ↓                                                      │
│  PostgreSQL TRIGGER: on_auth_user_email_updated            │
│      ↓                                                      │
│  ├─→ profiles.email ← new email                             │
│  ├─→ crm_users.email ← new email (if exists)                │
│  └─→ hrm_users.email ← new email (if exists)                │
│      ↓                                                      │
│  All three systems now have same email                     │
└─────────────────────────────────────────────────────────────┘
```

## Foreign Key Cascade Behavior

```
IF auth.users (id: ABC-123) is deleted:
    ↓
    ├─ CASCADE → profiles (id: ABC-123)
    │   └─ CASCADE → orders, payments, certifications
    ├─ CASCADE → crm_users (auth_user_id: ABC-123)
    │   └─ DELETE RESTRICT → crm_leads (must reassign first)
    └─ CASCADE → hrm_pending_profiles (created_by: ABC-123)
        └─ SET NULL → hrm_users if linked to that profile

Result: User completely removed from system
Warning: Orphaned CRM leads if not reassigned first
```

## Role-Based Access Control (RLS)

```
┌──────────────────────────────────────────────────────────┐
│           EDUCATION SYSTEM RLS                           │
├──────────────────────────────────────────────────────────┤
│ Role: customer                                           │
│   SELECT: Only own profile + is_admin check             │
│   UPDATE: Own profile (role field immutable)            │
│   DELETE: Never (RLS blocks)                            │
│                                                          │
│ Role: admin                                              │
│   SELECT: Any profile (via is_admin() function)         │
│   UPDATE: Any profile (except role field)               │
│   DELETE: Any profile                                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│           CRM SYSTEM RLS                                 │
├──────────────────────────────────────────────────────────┤
│ crm_users table:                                         │
│   SELECT: All authenticated users                        │
│   UPDATE: Own profile only (role & is_active immutable)  │
│   DELETE: Admin only                                     │
│                                                          │
│ crm_leads table:                                         │
│   SELECT: Own leads + admins see all                     │
│   INSERT: Admin only                                     │
│   UPDATE: Owner or admin                                 │
│   DELETE: Admin only                                     │
│                                                          │
│ crm_contact_logs table:                                  │
│   SELECT: Creator + lead owner + admin                   │
│   INSERT: Assigned user only                             │
│   UPDATE: Creator or admin                               │
│   DELETE: Admin only                                     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│           HRM SYSTEM RLS                                 │
├──────────────────────────────────────────────────────────┤
│ hrm_users:                                               │
│   SELECT: Assigned or SUPER_ADMIN                        │
│   UPDATE: SUPER_ADMIN only                               │
│                                                          │
│ hrm_pending_profiles:                                    │
│   SELECT/INSERT/UPDATE: SUPER_ADMIN only                 │
│   DELETE: SUPER_ADMIN only                               │
│                                                          │
│ hrm_assignments:                                         │
│   SELECT: SUPER_ADMIN                                    │
│   INSERT/UPDATE: SUPER_ADMIN only                        │
│                                                          │
│ hrm_kpi_submissions:                                     │
│   SELECT: Own submissions + assigned markers + ADMIN     │
│   INSERT: Assigned marker or SUPER_ADMIN                 │
│   UPDATE: Creator or SUPER_ADMIN                         │
│                                                          │
│ hrm_email_logs:                                          │
│   SELECT: Own + SUPER_ADMIN                              │
│   INSERT: SUPER_ADMIN only                               │
│   DELETE: SUPER_ADMIN only                               │
└──────────────────────────────────────────────────────────┘
```

## HRM Scoring Pipeline (Weekly)

```
FRIDAY (End of Week)
    ↓
Friday date creates hrm_weeks row (status: OPEN)
    ↓
ADMINISTRATORS (markers) log in
    ↓
For each assigned EMPLOYEE (subject):
    │  ├─ View customized criteria set (hrm_subject_criteria_items)
    │  ├─ Enter scores for each criteria
    │  └─ Submit hrm_kpi_submission + hrm_kpi_submission_items
    ↓
SYSTEM - After all submissions:
    ├─ Compute weighted average per employee
    ├─ Store in hrm_weekly_results
    ├─ Update hrm_weeks.status = LOCKED
    └─ TRIGGER: on_week_locked (no more edits)

MONTHLY AGGREGATION (End of Month):
    ├─ Create hrm_months row
    ├─ For each employee:
    │  ├─ Collect all weeks in month
    │  ├─ Calculate monthly_avg_score (MEAN of weeks)
    │  ├─ Calculate median_score
    │  └─ Store in hrm_monthly_results
    └─ Lock month (status: LOCKED)

NOTIFICATION:
    └─ Send marksheet email (hrm_email_logs)
        ├─ Generated by SUPER_ADMIN or automated job
        ├─ Contains monthly results
        ├─ Stores html_content + text_content
        ├─ Tracks delivery_status
        └─ Records sent_by_admin_id
```

## System Separation Benefits

```
┌─────────────────────────────────────────────┐
│        WHY THREE SEPARATE SYSTEMS?          │
├─────────────────────────────────────────────┤
│                                             │
│ 1. EDUCATION                                │
│    - Customer-facing (public)               │
│    - B2C business model                     │
│    - Simple profile data                    │
│    - 2 basic roles                          │
│                                             │
│ 2. CRM                                      │
│    - Internal sales team (private)          │
│    - Lead management workflow                │
│    - Contact tracking                       │
│    - Ownership-based access                 │
│                                             │
│ 3. HRM                                      │
│    - Internal employee management           │
│    - Hierarchical structure                 │
│    - Complex scoring/metrics                │
│    - Audit trail (email logs)                │
│                                             │
│ ADVANTAGES:                                 │
│ ✓ Clean separation of concerns              │
│ ✓ Independent scaling                       │
│ ✓ Different permission models               │
│ ✓ Easier to maintain and debug              │
│ ✓ Can swap implementations if needed        │
│ ✓ No data leakage between systems           │
│                                             │
│ TRADEOFF:                                   │
│ ✗ Duplicate user management                 │
│ ✗ Need email sync triggers                  │
│ ✗ More complex user registration            │
│ ✗ System-wide profile updates required     │
└─────────────────────────────────────────────┘
```

---

**Visual Architecture Diagram Created** | Reference for implementation & debugging
