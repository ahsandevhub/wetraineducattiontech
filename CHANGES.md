# Database & Profile Management Updates

## 1. Database Scripts (Updated)

### Two Simple Scripts:

#### `npm run db:clean`

- **File**: `scripts/db-clean.mjs`
- **Purpose**: Clears the entire public schema (only tables/data, NOT auth)
- **Use case**: When you want a fresh start
- **Command**: `npm run db:clean`

#### `npm run db:seed`

- **File**: `scripts/db-seed.mjs`
- **Purpose**: Applies migrations AND seeds sample data
- **Use case**: Set up your database with initial data
- **Includes**:
  - All migrations (0001-0014)
  - Sample services (3 items)
  - Sample certifications (2 items)
  - Sample projects (2 items)
  - Sample client stories (3 items)
- **Command**: `npm run db:seed`

## 2. Profile Page Error Handling (`/dashboard/profile`)

### Improvements Made:

#### Authentication & Loading

- ✅ Graceful redirect to login if not authenticated
- ✅ Better loading state with message
- ✅ Error state with helpful messages

#### Error Handling

- ✅ Profile not found detection
- ✅ Validation errors for required fields
- ✅ File upload validation (size, type)
- ✅ Detailed error messages displayed on page
- ✅ Toast notifications for all actions

#### Data Validation

- ✅ Full name is required
- ✅ File size validation (max 5MB)
- ✅ Image type validation (jpg, png, gif, webp)
- ✅ Input trimming to remove extra spaces

#### User Experience

- ✅ Error alert box at top of form
- ✅ Disabled save button when no changes
- ✅ Proper loading states for all operations
- ✅ Success/error toast messages

### Error States Handled:

1. **Not authenticated** → Redirect to login
2. **Profile not found** → Show error message
3. **Network errors** → Display specific error
4. **File too large** → Show file size error
5. **Invalid file type** → Show format error
6. **Update failed** → Display error and allow retry
7. **Avatar upload failed** → Show upload error

## Usage Examples

```bash
# Seed the database with migrations and sample data
npm run db:seed

# Clean the database (remove all tables/data)
npm run db:clean

# Then you can re-seed with:
npm run db:seed
```

## Files Modified

1. ✅ `package.json` - Updated scripts
2. ✅ `scripts/db-clean.mjs` - Created (clean database script)
3. ✅ `scripts/db-seed.mjs` - Created (seed database script)
4. ✅ `app/dashboard/profile/page.tsx` - Enhanced error handling
5. ✅ `supabase/migrations/0007_add_performance_indexes.sql` - Fixed invalid references

## Notes

- The `db:clean` script requires `RESET_SEED_ALLOW=true` in `.env`
- The `db:seed` script applies all migrations before seeding data
- Profile page now handles all common error scenarios gracefully
- All operations provide visual feedback via toast notifications
