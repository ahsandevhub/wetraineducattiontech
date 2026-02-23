# CRM Users Data Import Guide

## Files Created

Three formatted CSV files are ready for import into Supabase:

### 1. **crm_users_import.csv** (REQUIRED)

- Table: `crm_users`
- Contains: 11 users (9 MARKETERS + 3 ADMINS)
- Schema: `id, auth_user_id, email, full_name, crm_role, is_active, created_at, updated_at`

### 2. **profiles_import.csv** (RECOMMENDED)

- Table: `profiles`
- Contains: 11 user profiles
- Schema: `id, email, full_name, role, created_at, updated_at`
- Note: Maps ADMIN → admin, MARKETER → customer

### 3. **auth_users_import.csv** (OPTIONAL)

- Table: `auth.users` (if you can import directly)
- Contains: Email and timestamps only
- Schema: `id, email, created_at, updated_at`

## Import Steps in Supabase Dashboard

### Step 1: Import CRM Users (Primary)

1. Go to Supabase Dashboard → Your Project
2. SQL Editor → Click "New Query"
3. Copy & paste this SQL:

```sql
-- First, check if auth.users exist
-- If not, you may need to create them via Supabase Auth UI

-- Then import crm_users
COPY crm_users (id, auth_user_id, email, full_name, crm_role, is_active, created_at, updated_at)
FROM stdin
WITH (FORMAT csv, HEADER true);
```

4. Go to Table Editor → Select `crm_users`
5. Click "Insert" → "Import Data"
6. Upload `crm_users_import.csv`

### Step 2: Import Profiles (Recommended)

1. Table Editor → Select `profiles`
2. Click "Insert" → "Import Data"
3. Upload `profiles_import.csv`

> **Note**: Make sure auth.users with matching IDs exist first, or use the profile sync triggers to auto-create them.

## Column Mapping

### crm_users

| Column       | Type        | Source      | Notes                                |
| ------------ | ----------- | ----------- | ------------------------------------ |
| id           | UUID        | Generated   | New unique IDs for crm_users records |
| auth_user_id | UUID        | Original ID | Links to auth.users                  |
| email        | TEXT        | email       | Must be unique                       |
| full_name    | TEXT        | full_name   | User's name                          |
| crm_role     | ENUM        | role        | MARKETER or ADMIN                    |
| is_active    | BOOLEAN     | is_active   | true/false                           |
| created_at   | TIMESTAMPTZ | created_at  | Original timestamp                   |
| updated_at   | TIMESTAMPTZ | updated_at  | Original timestamp                   |

### profiles

| Column     | Type        | Mapping       | Notes                |
| ---------- | ----------- | ------------- | -------------------- |
| id         | UUID        | auth.users.id | Same as auth_user_id |
| email      | TEXT        | email         | From CSV             |
| full_name  | TEXT        | full_name     | From CSV             |
| role       | ENUM        | role mapped   | admin/customer       |
| created_at | TIMESTAMPTZ | created_at    | Original timestamp   |
| updated_at | TIMESTAMPTZ | updated_at    | Original timestamp   |

## User Summary

| Name                 | Email                             | Role     | Status |
| -------------------- | --------------------------------- | -------- | ------ |
| Maruf Hossain Mollik | marufmollik51@gmail.com           | MARKETER | Active |
| Rafijul Islam Rupes  | wmt.rafijulrupes@gmail.com        | MARKETER | Active |
| Yeamim Akter         | yeamim163@gmail.com               | MARKETER | Active |
| System Administrator | admin@wetrain.com                 | ADMIN    | Active |
| Md. Naim             | rnnaimislam8@gmail.com            | MARKETER | Active |
| Ahsan Habib          | ahsan.habib@wetraineducation.com  | ADMIN    | Active |
| Saiful Islam         | saiful.islam@wetraineducation.com | ADMIN    | Active |
| Khalid Hosen Rusan   | khalidrusan285@gmail.com          | MARKETER | Active |
| Sagor Sharif         | sagor@wetraineducation.com        | ADMIN    | Active |
| MD Nuruzzaman Razon  | mdnuruzzamanrazon@gmail.com       | MARKETER | Active |
| Md. Sazzadur Rahman  | kazisazzad47@gmail.com            | MARKETER | Active |

**Total: 11 users (3 ADMINS + 8 MARKETERS)**

## Troubleshooting

### Foreign Key Error on crm_users

- **Issue**: "violates foreign key constraint 'crm_users_auth_user_id_fkey'"
- **Solution**: Import auth.users first OR manually create users in Supabase Auth

### Duplicate Key Error

- **Issue**: "duplicate key value violates unique constraint"
- **Solution**: User already exists. Clear table first or use ON CONFLICT clause

### Timestamp Format Error

- **Issue**: "invalid input syntax for timestamp"
- **Solution**: Use format: `YYYY-MM-DD HH:MM:SS.SSSSS+00`

## Files Location

- `crm_users_import.csv` - Main CRM data
- `profiles_import.csv` - User profiles
- `auth_users_import.csv` - Auth users (backup reference)
