# Quick Reference: Users/Profile API & Operations Guide

## Table of Contents

1. [EDUCATION System](#education-system)
2. [CRM System](#crm-system)
3. [HRM System](#hrm-system)
4. [Common Operations](#common-operations)
5. [Query Examples](#query-examples)

---

## EDUCATION SYSTEM

### Profile Table

```
Table: public.profiles
Primary Key: id (UUID → auth.users)
Unique: email
```

### API Endpoints

#### Get User Profile

```typescript
// GET /app/dashboard/profile
GET /api/profile

Response:
{
  id: string,
  email: string,
  full_name: string,
  phone?: string,
  address?: string,
  city?: string,
  state?: string,
  postal_code?: string,
  country: string,
  avatar_url?: string,
  role: "customer" | "admin",
  created_at: timestamp,
  updated_at: timestamp
}
```

#### Update User Profile

```typescript
// PATCH /api/profile/update
PATCH /app/api/profile/update

Request:
{
  fullName?: string,
  phone?: string,
  address?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  country?: string
}

Response:
{ success: true } | { error: string }
```

#### Upload Avatar

```typescript
// Upload to Supabase storage (avatars bucket)
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`${userId}/avatar.jpg`, file);

// Then update profile:
await supabase
  .from("profiles")
  .update({ avatar_url: data.path })
  .eq("id", userId);
```

### Key Server Actions

#### File: `app/dashboard/profile/page.tsx`

```typescript
interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  avatar_url: string | null;
}

// Usage:
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();
```

### SQL Operations

#### View Own Profile

```sql
SELECT * FROM profiles
WHERE id = auth.uid()
```

#### List All Customers

```sql
-- Admin only
SELECT * FROM profiles
WHERE role = 'customer'
ORDER BY created_at DESC
```

#### Update Profile Fields

```sql
UPDATE profiles
SET
  full_name = 'New Name',
  updated_at = now()
WHERE id = auth.uid()
```

---

## CRM SYSTEM

### Tables

#### crm_users - Team Members

```
Table: public.crm_users
Primary Key: id (UUID)
Foreign Key: auth_user_id → auth.users(id)
Unique: email
```

#### crm_leads - Prospects/Customers

```
Table: public.crm_leads
Primary Key: id (UUID)
Foreign Key: owner_id → crm_users(id)
Unique: phone
Indexes: status, created_at, email
```

#### crm_contact_logs - Interaction History

```
Table: public.crm_contact_logs
Primary Key: id (UUID)
Foreign Keys: lead_id → crm_leads, user_id → crm_users
Indexes: lead_id, user_id, created_at
```

### API Operations

#### Create CRM User (Admin Only)

```typescript
// File: app/dashboard/crm/_actions/users.ts

export async function createUser(userData: CreateUserData) {
  // 1. Create auth.users entry
  const { data: authData } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: tempPassword,
    user_metadata: { full_name: userData.fullName },
  });

  // 2. Create crm_users entry
  const { error } = await supabaseAdmin.from("crm_users").insert({
    auth_user_id: authData.user.id,
    email: userData.email,
    full_name: userData.fullName,
    crm_role: userData.crmRole,
    is_active: true,
  });

  // 3. Email sent with magic link/credentials
  return { data: authData.user, error };
}
```

#### Update CRM User (Admin Only)

```typescript
export async function updateUser(userId: string, updates: UpdateUserData) {
  // Update auth metadata
  if (updates.fullName) {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: updates.fullName },
    });
  }

  // Update crm_users
  const { error } = await supabaseAdmin
    .from("crm_users")
    .update({
      full_name: updates.fullName,
      crm_role: updates.role,
      is_active: updates.isActive,
    })
    .eq("id", userId);

  return { error };
}
```

#### Create Lead

```typescript
const { data, error } = await supabase.from("crm_leads").insert({
  name: "Acme Corp",
  email: "contact@acme.com",
  phone: "+88017XXXXXXXX",
  company: "Acme Corp",
  status: "NEW",
  source: "WEBSITE", // or REFERRAL, SOCIAL_MEDIA, ADMIN, OTHER
  owner_id: currentUserId, // Current logged-in CRM user
});
```

#### Update Lead Status

```typescript
const { error } = await supabase
  .from("crm_leads")
  .update({
    status: "QUALIFIED",
    updated_at: new Date().toISOString(),
  })
  .eq("id", leadId);
```

#### Add Contact Log

```typescript
const { error } = await supabase.from("crm_contact_logs").insert({
  lead_id: leadId,
  user_id: currentUserId,
  contact_type: "CALL", // or EMAIL, MEETING, WHATSAPP, OTHER
  notes: "Discussed pricing and timeline",
});
```

#### List User's Leads

```typescript
const { data: leads } = await supabase
  .from("crm_leads")
  .select("*")
  .eq("owner_id", userId)
  .order("created_at", { ascending: false });
```

#### View Lead with History

```typescript
const { data: lead } = await supabase
  .from("crm_leads")
  .select(
    `
    *,
    owner_id(*),
    crm_contact_logs(*)
  `,
  )
  .eq("id", leadId)
  .single();
```

### SQL Queries

#### Get Lead Statistics (by user)

```sql
SELECT
  cu.id,
  cu.full_name,
  COUNT(cl.id)::INT as total_leads,
  COUNT(CASE WHEN cl.status = 'WON' THEN 1 END)::INT as won_count,
  COUNT(CASE WHEN cl.status = 'LOST' THEN 1 END)::INT as lost_count,
  COUNT(CASE WHEN cl.status = 'NEW' THEN 1 END)::INT as new_count
FROM crm_users cu
LEFT JOIN crm_leads cl ON cl.owner_id = cu.id
WHERE cu.is_active = true
GROUP BY cu.id, cu.full_name
ORDER BY won_count DESC
```

#### Get Lead Age (days since creation)

```sql
SELECT
  name,
  email,
  status,
  (NOW()::DATE - created_at::DATE) as days_in_system,
  last_contacted_at
FROM crm_leads
WHERE owner_id = $1
ORDER BY created_at DESC
```

#### Contact History for Lead

```sql
SELECT
  ccl.contact_type,
  ccl.notes,
  ccl.created_at,
  cu.full_name as contacted_by
FROM crm_contact_logs ccl
JOIN crm_users cu ON cu.id = ccl.user_id
WHERE ccl.lead_id = $1
ORDER BY ccl.created_at DESC
```

---

## HRM SYSTEM

### Core Tables

#### hrm_users - HRM Participants

```
Table: public.hrm_users
Primary Key: id (UUID)
Foreign Key: profile_id → profiles(id, UNIQUE)
Role: SUPER_ADMIN | ADMIN | EMPLOYEE
```

#### hrm_pending_profiles - Pre-Registration

```
Table: public.hrm_pending_profiles
Primary Key: id (UUID)
Unique: email (lowercase)
Used when: SUPER_ADMIN invites before user registers
```

#### hrm_assignments - Manager-Employee Mappings

```
Table: public.hrm_assignments
Primary Key: id (UUID)
Foreign Keys: marker_admin_id, subject_user_id → hrm_users
Unique: (marker_admin_id, subject_user_id)
```

#### hrm_criteria - Scoring Dimensions

```
Table: public.hrm_criteria
Primary Key: id (UUID)
Unique: key
Examples: 'quality_work', 'punctuality', 'team_collab'
```

#### hrm_weeks - Weekly Periods

```
Table: public.hrm_weeks
Primary Key: id (UUID)
Unique: week_key, friday_date
Format: week_key = "2026-W08"
Status: OPEN | LOCKED
```

#### hrm_kpi_submissions - Weekly Scores

```
Table: public.hrm_kpi_submissions
Composite: (week_id, marker_admin_id, subject_user_id)
Score: total_score (decimal)
Child: hrm_kpi_submission_items (individual criteria scores)
```

#### hrm_monthly_results - Monthly Summary

```
Table: public.hrm_monthly_results
Composite: (month_id, subject_user_id)
Contains: avg score, median, completeness
```

### API Operations

#### Create Pending HRM Profile (SUPER_ADMIN Only)

```typescript
// File: app/dashboard/hrm/super/people/page.tsx

const { data, error } = await supabase.from("hrm_pending_profiles").insert({
  email: "newemployee@company.com",
  full_name: "John Doe",
  desired_role: "EMPLOYEE", // or ADMIN
  is_active: true,
  created_by: currentUserId,
});

// Email sent to newemployee@company.com with invite link
```

#### Get All HRM Users

```typescript
const { data: hrmUsers } = await supabase
  .from("hrm_users")
  .select("*")
  .eq("is_active", true)
  .order("full_name");
```

#### Create Assignment (Admin Marks Employee)

```typescript
const { error } = await supabase.from("hrm_assignments").insert({
  marker_admin_id: adminId,
  subject_user_id: employeeId,
  is_active: true,
  created_by_id: currentSuperAdminId,
});
```

#### Get Assignments for Admin

```typescript
// What employees does this admin mark?
const { data: assignments } = await supabase
  .from("hrm_assignments")
  .select(
    `
    *,
    subject_user_id(full_name, email)
  `,
  )
  .eq("marker_admin_id", adminId)
  .eq("is_active", true);
```

#### Add Custom Criteria to Employee

```typescript
// Create criteria set for new period
const { data: set } = await supabase.from("hrm_subject_criteria_sets").insert({
  subject_user_id: employeeId,
  active_from: "2026-03-01",
  active_to: null, // ongoing
  created_by_id: superAdminId,
});

// Add specific criteria with weights
await supabase.from("hrm_subject_criteria_items").insert([
  {
    criteria_set_id: set.data[0].id,
    criteria_id: qualityWorkCriteriaId,
    weight: 30,
    scale_max: 10,
  },
  {
    criteria_set_id: set.data[0].id,
    criteria_id: punctualityCriteriaId,
    weight: 20,
    scale_max: 10,
  },
]);
```

#### Submit Weekly KPI Scores (Admin/Marker)

```typescript
// 1. Get current week
const { data: week } = await supabase
  .from("hrm_weeks")
  .select("*")
  .eq("status", "OPEN")
  .order("friday_date", { ascending: false })
  .limit(1)
  .single();

// 2. Get employee's criteria set
const { data: criteriaSet } = await supabase
  .from("hrm_subject_criteria_sets")
  .select("hrm_subject_criteria_items(*)")
  .eq("subject_user_id", employeeId)
  .single();

// 3. Calculate total score (weighted average)
const totalScore = calculateWeightedScore(scores, criteriaSet.items);

// 4. Create submission
const { data: submission } = await supabase.from("hrm_kpi_submissions").insert({
  week_id: week.id,
  marker_admin_id: currentAdminId,
  subject_user_id: employeeId,
  total_score: totalScore,
  comment: "Great work this week",
  submitted_at: now,
});

// 5. Add individual criterion scores
await supabase.from("hrm_kpi_submission_items").insert(
  criteriaSet.items.map((item) => ({
    submission_id: submission.data[0].id,
    criteria_id: item.criteria_id,
    score_raw: userScores[item.criteria_id],
  })),
);
```

#### View Weekly Results (Employee Dashboard)

```typescript
// Employee sees their weekly scores
const { data: weeklyResults } = await supabase
  .from("hrm_weekly_results")
  .select(
    `
    *,
    week_id(week_key, friday_date),
    kpi_submissions:hrm_kpi_submissions(
      marker_admin_id(full_name),
      total_score,
      comment
    )
  `,
  )
  .eq("subject_user_id", currentEmployeeId)
  .order("week_id.friday_date", { ascending: false });
```

#### View Monthly Summary (Employee Dashboard)

```typescript
const { data: monthlyResults } = await supabase
  .from("hrm_monthly_results")
  .select(
    `
    *,
    month_id(month_key, start_date, end_date)
  `,
  )
  .eq("subject_user_id", currentEmployeeId)
  .order("month_id.start_date", { ascending: false })
  .limit(3);

// Returns:
// {
//   monthly_avg_score: 8.5,
//   median_score: 8.7,
//   weeks_count_used: 4,
//   expected_weeks_count: 4,
//   is_complete_month: true,
//   month_id: { month_key: "2026-02" }
// }
```

#### Send Marksheet Email (SUPER_ADMIN Only)

```typescript
// Auto or manual trigger to send monthly marksheet
const { error } = await supabase.from("hrm_email_logs").insert({
  subject_user_id: employeeId,
  recipient_email: employee.email,
  month_id: monthId,
  email_type: "MARKSHEET",
  subject_line: "Your February 2026 Performance Marksheet",
  html_content: renderMarksheetHTML(monthlyResults),
  text_content: renderMarksheetText(monthlyResults),
  sent_by_admin_id: currentSuperAdminId,
  sent_at: new Date(),
  delivery_status: "PENDING",
});
```

### SQL Queries

#### Employee Performance Dashboard

```sql
-- Monthly performance trend
SELECT
  hmr.month_id,
  hm.month_key,
  hmr.monthly_avg_score,
  hmr.median_score,
  hmr.weeks_count_used,
  hmr.is_complete_month
FROM hrm_monthly_results hmr
JOIN hrm_months hm ON hm.id = hmr.month_id
WHERE hmr.subject_user_id = $1
ORDER BY hm.start_date DESC
LIMIT 6
```

#### Admin's Assignment Overview

```sql
-- What employees does admin mark and their latest scores
SELECT
  hu.id,
  hu.full_name,
  hu.email,
  hwr.weekly_avg_score,
  hw.friday_date,
  COUNT(DISTINCT hks.id)::INT as times_marked_this_week
FROM hrm_assignments ha
JOIN hrm_users hu ON hu.id = ha.subject_user_id
LEFT JOIN hrm_weekly_results hwr ON hwr.subject_user_id = hu.id
LEFT JOIN hrm_weeks hw ON hw.id = hwr.week_id AND hw.status = 'LOCKED'
LEFT JOIN hrm_kpi_submissions hks ON hks.marker_admin_id = $1
  AND hks.subject_user_id = hu.id
  AND hks.week_id = hw.id
WHERE ha.marker_admin_id = $1 AND ha.is_active = true
GROUP BY hu.id, hu.full_name, hu.email, hwr.weekly_avg_score, hw.friday_date
ORDER BY hw.friday_date DESC, hu.full_name
```

#### Team Performance Rankings (Monthly)

```sql
SELECT
  hu.full_name,
  hmr.monthly_avg_score,
  hmr.median_score,
  hmr.weeks_count_used,
  hm.month_key,
  RANK() OVER (
    PARTITION BY hm.id
    ORDER BY hmr.monthly_avg_score DESC
  ) as rank_in_month
FROM hrm_monthly_results hmr
JOIN hrm_users hu ON hu.id = hmr.subject_user_id
JOIN hrm_months hm ON hm.id = hmr.month_id
WHERE hu.hrm_role = 'EMPLOYEE'
  AND hm.month_key = '2026-02'
ORDER BY hmr.monthly_avg_score DESC
```

#### Criteria Impact Analysis

```sql
-- Which criteria have highest/lowest scores
SELECT
  hc.name,
  AVG(hksi.score_raw)::NUMERIC(10,2) as avg_score,
  COUNT(DISTINCT hksi.submission_id)::INT as times_scored,
  MIN(hksi.score_raw)::NUMERIC(10,2) as min_score,
  MAX(hksi.score_raw)::NUMERIC(10,2) as max_score
FROM hrm_criteria hc
JOIN hrm_kpi_submission_items hksi ON hksi.criteria_id = hc.id
JOIN hrm_kpi_submissions hks ON hks.id = hksi.submission_id
JOIN hrm_weeks hw ON hw.id = hks.week_id
WHERE hw.friday_date >= NOW() - INTERVAL '1 month'
GROUP BY hc.id, hc.name
ORDER BY avg_score DESC
```

#### Email Delivery Audit

```sql
SELECT
  hu.full_name,
  hel.recipient_email,
  hel.sent_at,
  hel.delivery_status,
  hel.delivery_error,
  hel.opened_at,
  had.full_name as sent_by
FROM hrm_email_logs hel
JOIN hrm_users hu ON hu.id = hel.subject_user_id
LEFT JOIN hrm_users had ON had.id = hel.sent_by_admin_id
WHERE hel.month_id = $1
  OR hel.email_type = $2
ORDER BY hel.sent_at DESC
```

---

## COMMON OPERATIONS

### Check User Exists in System

```typescript
// Education system
const { data: profile } = await supabase
  .from("profiles")
  .select("id")
  .eq("email", email)
  .maybeSingle();

// CRM system
const { data: crmUser } = await supabase
  .from("crm_users")
  .select("id")
  .eq("email", email)
  .maybeSingle();

// HRM system
const { data: hrmUser } = await supabase
  .from("hrm_users")
  .select("id")
  .eq("email", email)
  .maybeSingle();
```

### Get Full User Profile (All Systems)

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();

const [profile, crmUser, hrmUser] = await Promise.all([
  supabase.from("profiles").select("*").eq("id", user.id).single(),
  supabase
    .from("crm_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle(),
  supabase
    .from("hrm_users")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle(),
]);

return {
  auth: user,
  education: profile.data,
  crm: crmUser.data,
  hrm: hrmUser.data,
};
```

### Admin Dashboard: Check All System Access

```typescript
async function checkUserSystemAccess(userId: string) {
  // Education
  const isEducationAdmin =
    (await supabase.from("profiles").select("role").eq("id", userId).single())
      .data?.role === "admin";

  // CRM
  const crmRole = (
    await supabase
      .from("crm_users")
      .select("crm_role")
      .eq("auth_user_id", userId)
      .maybeSingle()
  ).data?.crm_role;

  // HRM
  const hrmRole = (
    await supabase
      .from("hrm_users")
      .select("hrm_role")
      .eq("profile_id", userId)
      .maybeSingle()
  ).data?.hrm_role;

  return {
    education: isEducationAdmin ? "admin" : "customer",
    crm: crmRole || null,
    hrm: hrmRole || null,
  };
}
```

---

## QUERY EXAMPLES

### Find Users Active in Multiple Systems

```sql
-- Users in both CRM and HRM
SELECT
  p.id,
  p.full_name,
  p.email,
  p.role as education_role,
  cu.crm_role,
  hu.hrm_role
FROM profiles p
LEFT JOIN crm_users cu ON cu.auth_user_id = p.id AND cu.is_active = true
LEFT JOIN hrm_users hu ON hu.profile_id = p.id AND hu.is_active = true
WHERE cu.id IS NOT NULL AND hu.id IS NOT NULL
ORDER BY p.created_at DESC
```

### Recent Activity Across Systems

```sql
-- Last activity per user in each system
WITH education_activity AS (
  SELECT
    'EDUCATION' as system,
    p.id as user_id,
    p.full_name,
    p.updated_at as last_activity
  FROM profiles p
),
crm_activity AS (
  SELECT
    'CRM' as system,
    cu.auth_user_id as user_id,
    cu.full_name,
    GREATEST(
      cu.updated_at,
      COALESCE((SELECT MAX(cl.created_at)
                FROM crm_contact_logs cl
                WHERE cl.user_id = cu.id), cu.updated_at)
    ) as last_activity
  FROM crm_users cu
),
hrm_activity AS (
  SELECT
    'HRM' as system,
    hu.profile_id as user_id,
    hu.full_name,
    GREATEST(
      hu.updated_at,
      COALESCE((SELECT MAX(hks.submitted_at)
                FROM hrm_kpi_submissions hks
                WHERE hks.marker_admin_id = hu.id), hu.updated_at)
    ) as last_activity
  FROM hrm_users hu
)
SELECT * FROM (
  SELECT * FROM education_activity
  UNION ALL
  SELECT * FROM crm_activity
  UNION ALL
  SELECT * FROM hrm_activity
)
ORDER BY last_activity DESC
LIMIT 50
```

### Cleanup: Find Unused Accounts (No Activity)

```sql
-- Accounts not active in any system for 90+ days
SELECT
  p.id,
  p.email,
  p.full_name,
  'EDUCATION' as system,
  p.updated_at as last_activity
FROM profiles p
WHERE p.updated_at < NOW() - INTERVAL '90 days'
  AND p.role = 'customer'

UNION ALL

SELECT
  cu.auth_user_id,
  cu.email,
  cu.full_name,
  'CRM' as system,
  GREATEST(cu.updated_at, COALESCE(
    (SELECT MAX(cl.created_at) FROM crm_contact_logs cl WHERE cl.user_id = cu.id),
    cu.updated_at
  )) as last_activity
FROM crm_users cu
WHERE GREATEST(cu.updated_at, COALESCE(
    (SELECT MAX(cl.created_at) FROM crm_contact_logs cl WHERE cl.user_id = cu.id),
    cu.updated_at
  )) < NOW() - INTERVAL '90 days'

ORDER BY last_activity ASC
```

---

**Quick Reference Guide Version 1.0** | Enable rapid API integration
