# User Management Refactor Summary

## Overview

Successfully refactored the CRM and HRM user management systems to follow a unified architecture where:

- Users must exist in `auth.users` first (single source of truth)
- CRM/HRM tables only contain `id` (FK to auth.users) and `role`
- Both systems use the same search-and-add workflow pattern
- No duplicate email/name fields - pulled from profiles via joins

## Architecture Changes

### Before

- **CRM**: Manual user creation with email, password, full_name, crm_role, is_active, etc.
- **HRM**: Pre-invite workflow with pending_profiles table
- **Duplicate Data**: email and full_name stored in multiple tables

### After

- **CRM**: Search existing auth users, link with role selection
- **HRM**: Search existing auth users, link with role selection
- **Unified Pattern**: Both follow identical search → select → link workflow
- **Single Source**: All user data comes from auth.users via profiles join

## Files Created

### 1. Database Migrations

#### `supabase/migrations/0048_simplify_crm_users.sql`

- Drops old crm_users table (CASCADE)
- Creates new schema: `id UUID PK` (FK to auth.users), `crm_role`, timestamps
- Maintains RLS policies for CRM admin access

#### `supabase/migrations/0049_simplify_hrm_users.sql`

- Drops old hrm_users table (CASCADE)
- Creates new schema: `id UUID PK` (FK to auth.users), `hrm_role`, timestamps
- Maintains RLS policies for HRM super admin access

#### `supabase/migrations/0050_drop_hrm_pending_profiles.sql`

- Removes hrm_pending_profiles table
- Eliminates pre-invite workflow

### 2. API Endpoint

#### `app/api/auth/users/search/route.ts`

- **Purpose**: Unified user search for both CRM and HRM
- **Method**: GET with query parameter `?q=search_term`
- **Search**: Profiles table by name or email (case-insensitive, ILIKE)
- **Returns**: `[{id, fullName, email}]` (max 10 results)
- **Auth**: Requires authenticated user

### 3. Server Actions

#### `app/dashboard/crm/_actions/users.ts`

**Refactored functions**:

- `linkUserToCRM(userId, crmRole)` - Link existing user to CRM
- `unlinkUserFromCRM(userId)` - Remove user from CRM (checks for active leads)
- `updateCRMUserRole(userId, newRole)` - Change user role
- `getAllUsers()` - Fetch all CRM users with profile data

**Removed functions**:

- `createUser()` - No longer manually create auth users
- `updateUser()` - Replaced by updateCRMUserRole
- `deleteUser()` - Replaced by unlinkUserFromCRM
- `toggleUserStatus()` - No is_active field anymore
- `resetUserPassword()` - Not CRM's responsibility

#### `app/dashboard/hrm/super/_actions/users.ts`

**New file with functions**:

- `linkUserToHRM(userId, role)` - Link existing user to HRM (SUPER_ADMIN only)
- `unlinkUserFromHRM(userId)` - Remove user from HRM (checks for assignments)
- `updateHRMUserRole(userId, newRole)` - Change user role
- `getAllHRMUsers()` - Fetch all HRM users with profile data

### 4. UI Components

#### `app/dashboard/crm/admin/_components/AddCRMUserDialog.tsx`

- **UI**: Dialog with Command/Popover search component
- **Features**:
  - Debounced search by name/email
  - User selection from dropdown
  - Role selection (MARKETER/ADMIN)
  - Form validation
- **Pattern**: Matches payment record dialog UX
- **Action**: Calls `linkUserToCRM` on submit

#### `app/dashboard/hrm/super/_components/AddHRMUserDialog.tsx`

- **UI**: Identical structure to CRM dialog
- **Features**:
  - Debounced search by name/email
  - User selection from dropdown
  - Role selection (EMPLOYEE/ADMIN/SUPER_ADMIN)
  - Form validation
- **Action**: Calls `linkUserToHRM` on submit

## Files Modified

### 1. CRM Users Page

#### `app/dashboard/crm/admin/users/users-client.tsx`

**Changes**:

- ✅ Replaced "Create User" button with `AddCRMUserDialog`
- ✅ Updated imports to use new actions (unlinkUserFromCRM, updateCRMUserRole)
- ✅ Removed create user form/dialog
- ✅ Removed reset password dialog and button
- ✅ Removed toggle status button
- ✅ Removed `is_active` column from table
- ✅ Updated edit dialog to only change role (no name editing)
- ✅ Changed delete to "Remove from CRM" (calls unlinkUserFromCRM)
- ✅ Updated user ID comparison (auth_user_id → id)

### 2. HRM People Page

#### `app/dashboard/hrm/super/people/page.tsx`

**Changes**:

- ✅ Completely replaced with simplified version
- ✅ Removed pending profiles tab and all related code
- ✅ Removed CreatePendingProfileDialog import/usage
- ✅ Added AddHRMUserDialog component
- ✅ Replaced fetch calls with getAllHRMUsers action
- ✅ Inlined table (removed dependency on PeopleTable component)
- ✅ Removed `is_active` column from table
- ✅ Updated edit dialog to only change role
- ✅ Changed delete to "Remove from HRM" (calls unlinkUserFromHRM)
- ✅ Removed all filter/search state (can be added back later if needed)

## Data Flow

### CRM User Addition

1. Admin clicks "Add User" button
2. Dialog opens with search input
3. User types name/email → debounced API call to `/api/auth/users/search`
4. Results shown in dropdown with name + email
5. Admin selects user and chooses CRM role
6. Submit calls `linkUserToCRM(userId, role)`
7. Server action inserts row into crm_users table
8. Page refreshes to show new user with data from profiles

### HRM User Addition

1. Super Admin clicks "Add User" button
2. Dialog opens with search input
3. User types name/email → debounced API call to `/api/auth/users/search`
4. Results shown in dropdown with name + email
5. Super Admin selects user and chooses HRM role
6. Submit calls `linkUserToHRM(userId, role)`
7. Server action inserts row into hrm_users table (SUPER_ADMIN check)
8. Page refreshes to show new user with data from profiles

## Schema Changes

### CRM Users Table

```sql
CREATE TABLE public.crm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_role crm_role NOT NULL DEFAULT 'MARKETER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Removed fields**: email, full_name, is_active, password_hash, etc.

### HRM Users Table

```sql
CREATE TABLE public.hrm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hrm_role hrm_role NOT NULL DEFAULT 'EMPLOYEE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Removed fields**: email, full_name, is_active, password_hash, etc.

## Breaking Changes

### API Changes

- ❌ `/api/crm/admin/users` (old create/update endpoints) - No longer used
- ❌ `/api/hrm/super/people` (old endpoints) - No longer used
- ✅ `/api/auth/users/search` - New unified search endpoint

### Action Changes

- ❌ `createUser()` - Removed from CRM
- ❌ `updateUser()` - Removed from CRM
- ❌ `deleteUser()` - Removed from CRM
- ❌ `toggleUserStatus()` - Removed from CRM
- ❌ `resetUserPassword()` - Removed from CRM
- ✅ `linkUserToCRM()` - New
- ✅ `unlinkUserFromCRM()` - New
- ✅ `updateCRMUserRole()` - New
- ✅ `linkUserToHRM()` - New
- ✅ `unlinkUserFromHRM()` - New
- ✅ `updateHRMUserRole()` - New

### Component Changes

- ❌ `CreatePendingProfileDialog` - No longer used by HRM
- ❌ `PendingProfilesTable` - No longer used by HRM
- ❌ Old create user dialog in CRM - Removed
- ✅ `AddCRMUserDialog` - New
- ✅ `AddHRMUserDialog` - New

## Migration Notes

### Data Migration Required

⚠️ **IMPORTANT**: Before running these migrations in production:

1. **Backup existing data** from crm_users and hrm_users tables
2. **Identify orphan users** (users in CRM/HRM but not in auth.users)
3. **Create auth accounts** for any orphan users before migration
4. **Export role mappings** to re-link users after schema change

### Fresh Start Option

If starting fresh (development environment):

1. Run the three migrations in order (0048, 0049, 0050)
2. Existing auth.users remain untouched
3. CRM/HRM tables reset with new schema
4. Re-add users using the new search dialog

## Testing Checklist

- [ ] Run migrations in development environment
- [ ] Test CRM user search and add
- [ ] Test HRM user search and add
- [ ] Test CRM role updates
- [ ] Test HRM role updates
- [ ] Test CRM user removal (verify lead ownership check)
- [ ] Test HRM user removal (verify assignments check)
- [ ] Verify profile data displays correctly in tables
- [ ] Test with users who have no profile (error handling)
- [ ] Test permission checks (CRM admin, HRM super admin)

## Benefits

1. **Single Source of Truth**: All user data in auth.users
2. **Reduced Duplication**: No more duplicate email/name fields
3. **Consistent UX**: Same workflow for CRM and HRM
4. **Simplified Auth**: No password management at module level
5. **Better Separation**: Module tables only track role/membership
6. **Easier Maintenance**: Less data to keep in sync
7. **Clearer Permissions**: auth.users controls authentication, module tables control authorization

## Next Steps (Optional Enhancements)

1. Add search filters (role, created date) to both pages
2. Add pagination for large user lists
3. Add bulk import functionality
4. Add audit log for user additions/removals
5. Add "recently added" indicator
6. Consider adding user profile completion check before adding to CRM/HRM
