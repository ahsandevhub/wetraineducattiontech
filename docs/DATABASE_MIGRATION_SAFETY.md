# Database Migration Safety System

This project uses a two-database system to prevent accidental migrations to production:

- **TEST_DB** (wetrain_testing): For safe testing of migrations
- **LIVE_DB** (wetrain_live): Production database (requires explicit confirmation)

## Usage

### Always Start With Test Database

```bash
npm run migrate:test
```

This will:

1. Link to TEST_DB automatically
2. Show pending migrations
3. Ask for confirmation before applying

### Migrate to Live Database (After Testing)

```bash
npm run migrate:live
```

This will:

1. Show warning that you're about to hit PRODUCTION
2. Require you to type "yes" to confirm
3. Show all migrations that will be applied
4. Require you to type "LIVE" for final confirmation
5. Apply migrations only if both confirmations pass

## Database References

- TEST_DB: `uvakcxevpuixskqyrgia` (wetrain_testing)
- LIVE_DB: `iynvamrrxedbszairasl` (wetrain_live)

## Safety Features

✅ **Automatic Safety Checks:**

- Test database is the default
- Live database requires double confirmation
- All migrations are displayed before applying
- Interactive prompts prevent accidental clicks
- Database is automatically switched before migration

✅ **Workflow Enforcement:**

1. Always develop and test on TEST_DB first
2. Migrations must pass full testing in TEST_DB
3. Only migrate to LIVE_DB after successful TEST_DB migration
4. Interactive confirmation prevents muscle memory mistakes

## Important

- Never manually run `npx supabase db push` without checking which database is linked first
- Always use `npm run migrate:test` or `npm run migrate:live` scripts
- Run `npx supabase projects list` to see which database is currently active (marked with ●)
