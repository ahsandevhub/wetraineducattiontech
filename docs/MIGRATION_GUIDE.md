# 🗄️ Database Migration Guide

## Overview

This project uses **Supabase Migrations** exclusively. Prisma has been removed.

All database changes are tracked in: `supabase/migrations/`

---

## Current Status

- ✅ **43 migrations** deployed to production
- ✅ **All tables**: Education (profiles, orders), CRM (leads, contact logs), HRM (KPI system)
- ✅ **Production database**: Connected and synced

---

## How to Add a New Migration

### 1. Create a New Migration File

```bash
npx supabase migration new add_my_new_feature
```

This creates: `supabase/migrations/0044_add_my_new_feature.sql`

### 2. Write Your SQL

Edit the migration file and add your SQL:

```sql
-- Migration: Add my new feature
-- Date: 2026-02-20

CREATE TABLE public.my_new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS if needed
ALTER TABLE public.my_new_table ENABLE ROW LEVEL SECURITY;

-- Add policies if needed
CREATE POLICY "everyone_can_read" ON public.my_new_table
  FOR SELECT USING (true);
```

### 3. Test Locally (Optional)

```bash
npx supabase migration resolve --status applied 0044
npx supabase db up
```

### 4. Deploy to Production

```bash
npx supabase db push
```

Confirm when prompted: `[Y/n] y`

---

## Migration Naming Convention

- `000X_clear_name_of_change.sql`
- Examples:
  - `0044_add_notifications_table.sql`
  - `0045_add_rls_policies_for_users.sql`
  - `0046_create_lead_archive_view.sql`

---

## Important Rules

✅ **DO:**

- Number migrations sequentially (0044, 0045, 0046...)
- Write idempotent SQL (use `IF NOT EXISTS`, `IF NOT NULL`, etc.)
- Add comments explaining the "why"
- Test in a staging environment first
- Keep migrations focused on one feature

❌ **DON'T:**

- Edit migration files after they're pushed to production
- Skip migration numbers
- Use Prisma (it's removed)
- Modify the database directly (always use migrations)
- Run migrations manually in Supabase console

---

## Useful Commands

```bash
# See all migrations and their status
npx supabase migration list

# Check what will be pushed
npx supabase migration resolve

# Push all pending migrations
npx supabase db push

# Emergency: Pull the current production schema (requires Docker)
npx supabase db pull --linked
```

---

## Migration History

| Range     | Purpose                                                        |
| --------- | -------------------------------------------------------------- |
| 0001-0025 | Base schema: auth, profiles, orders, payments, services        |
| 0026-0027 | CRM system: users, leads, contact logs                         |
| 0030-0038 | CRM enhancements: requests, timeseries, reassignments          |
| 0039-0042 | HRM system: KPI tracking, criteria, assignments, notifications |
| 0043+     | Future enhancements                                            |

---

## Troubleshooting

### Migration Failed?

```bash
npx supabase migration repair --status reverted <number>
npx supabase db push
```

### Can't See New Table?

1. Wait 30 seconds (caching)
2. Check: `npx supabase migration list`
3. Verify in Supabase Dashboard → SQL Editor

### Need to Rollback?

- **Option 1**: Create a new migration that reverts changes
- **Option 2**: Create new database from Supabase backup (Settings → Backups)

---

## Questions?

Refer to:

- Supabase Docs: https://supabase.com/docs/guides/cli/managing-migrations
- Our migrations: `supabase/migrations/*.sql`
