# HRM Automation Cron Jobs

This document describes the automated HRM cron jobs for weekly and monthly KPI computation.

## Overview

The HRM system includes three protected cron endpoints that automate:

1. **Week creation** - Ensures current Friday's week exists
2. **Week computation** - Computes KPI results for most recent Friday
3. **Month computation** - Computes and locks previous month (runs in first 2 days of new month)

## Security

All cron endpoints require authentication via the `X-CRON-SECRET` header:

```bash
X-CRON-SECRET: your_hrm_cron_secret_key_change_in_production
```

This secret is configured in the `.env` file as `HRM_CRON_SECRET`.

**⚠️ Important:** Change the default secret in production! Generate a secure secret:

```bash
openssl rand -hex 32
```

## Cron Endpoints

### 1. Ensure Week (`/api/hrm/cron/ensure-week`)

**Purpose:** Ensures the current Friday's HrmWeek record exists with status OPEN

**Schedule:** Daily at 00:01 Dhaka time (18:01 UTC previous day)

**Behavior:**

- Determines current Friday in Asia/Dhaka timezone
- Creates week if it doesn't exist
- Idempotent: safe to call multiple times

**Local Test:**

```bash
curl -X POST http://localhost:3000/api/hrm/cron/ensure-week \
  -H "X-CRON-SECRET: your_hrm_cron_secret_key_change_in_production"
```

**Example Response:**

```json
{
  "success": true,
  "action": "created",
  "weekKey": "2026-02-20",
  "weekId": "uuid-here",
  "status": "OPEN",
  "message": "Week 2026-02-20 created successfully"
}
```

---

### 2. Compute Last Friday (`/api/hrm/cron/compute-last-friday`)

**Purpose:** Computes KPI results for the most recent Friday

**Schedule:** Every Friday at 23:30 Dhaka time (17:30 UTC)

**Behavior:**

- Determines most recent Friday (today if Friday, else previous Friday)
- Skips if week is LOCKED (unless `?force=true`)
- Computes weekly results and admin compliance
- Idempotent: uses upsert logic

**Local Test:**

```bash
# Basic computation
curl -X POST http://localhost:3000/api/hrm/cron/compute-last-friday \
  -H "X-CRON-SECRET: your_hrm_cron_secret_key_change_in_production"

# Force recomputation of locked week
curl -X POST "http://localhost:3000/api/hrm/cron/compute-last-friday?force=true" \
  -H "X-CRON-SECRET: your_hrm_cron_secret_key_change_in_production"
```

**Example Response:**

```json
{
  "success": true,
  "action": "computed",
  "weekKey": "2026-02-14",
  "subjectsComputed": 15,
  "adminsComputed": 5,
  "message": "Week 2026-02-14 computed successfully"
}
```

---

### 3. Compute Month If Ended (`/api/hrm/cron/compute-month-if-ended`)

**Purpose:** Computes and locks previous month if we're in the first 2 days of a new month

**Schedule:** Daily at 01:00 Dhaka time (19:00 UTC previous day)

**Behavior:**

- Checks if current Dhaka date is day 1 or 2 of month
- If yes, computes previous month's results (if not already computed)
- Locks previous month after successful computation
- Skips if previous month is already LOCKED
- Idempotent and deterministic

**Local Test:**

```bash
curl -X POST http://localhost:3000/api/hrm/cron/compute-month-if-ended \
  -H "X-CRON-SECRET: your_hrm_cron_secret_key_change_in_production"
```

**Example Responses:**

When running on day 1-2 of month:

```json
{
  "success": true,
  "action": "computed_and_locked",
  "monthKey": "2026-01",
  "expectedWeeksCount": 4,
  "computedSubjects": 15,
  "status": "LOCKED",
  "message": "Month 2026-01 computed (15 subjects) and locked successfully"
}
```

When running on day 3+ of month:

```json
{
  "success": true,
  "action": "skipped",
  "reason": "not_in_first_2_days",
  "currentDay": 19,
  "message": "Skipped: Current day is 19. Only runs on days 1-2 of month."
}
```

---

## Vercel Cron Configuration

The `vercel.json` file configures automated cron execution on Vercel:

```json
{
  "crons": [
    {
      "path": "/api/hrm/cron/ensure-week",
      "schedule": "1 18 * * *"
    },
    {
      "path": "/api/hrm/cron/compute-last-friday",
      "schedule": "30 17 * * 5"
    },
    {
      "path": "/api/hrm/cron/compute-month-if-ended",
      "schedule": "0 19 * * *"
    }
  ]
}
```

### Schedule Details (Cron Syntax: `minute hour day month weekday`)

| Endpoint                 | Schedule      | UTC Time         | Dhaka Time (UTC+6) | Description                 |
| ------------------------ | ------------- | ---------------- | ------------------ | --------------------------- |
| `ensure-week`            | `1 18 * * *`  | 18:01 UTC daily  | 00:01 Dhaka daily  | Create current week         |
| `compute-last-friday`    | `30 17 * * 5` | 17:30 UTC Friday | 23:30 Dhaka Friday | Compute week results        |
| `compute-month-if-ended` | `0 19 * * *`  | 19:00 UTC daily  | 01:00 Dhaka daily  | Compute/lock previous month |

**Note:** Vercel automatically adds the `X-CRON-SECRET` header when executing scheduled cron jobs. The secret is configured in Vercel Environment Variables.

---

## Deployment Setup

### 1. Configure Environment Variable in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `HRM_CRON_SECRET`
   - **Value:** (your secure secret - use `openssl rand -hex 32`)
   - **Environment:** Production, Preview, Development (as needed)
3. Redeploy the project

### 2. Verify Cron Jobs

After deployment:

1. Go to Vercel Dashboard → Your Deployment → Cron Jobs
2. Verify all 3 cron jobs are listed and scheduled
3. Check execution logs for any errors

---

## Manual Execution (Production)

If you need to manually trigger a cron job in production:

```bash
# Replace YOUR_SECRET and YOUR_DOMAIN
SECRET="your_production_cron_secret"
DOMAIN="wetraineducation.vercel.app"

# Ensure week
curl -X POST https://$DOMAIN/api/hrm/cron/ensure-week \
  -H "X-CRON-SECRET: $SECRET"

# Compute last Friday
curl -X POST https://$DOMAIN/api/hrm/cron/compute-last-friday \
  -H "X-CRON-SECRET: $SECRET"

# Compute month (force if needed for testing)
curl -X POST https://$DOMAIN/api/hrm/cron/compute-month-if-ended \
  -H "X-CRON-SECRET: $SECRET"
```

---

## Testing in Development

### Start Development Server

```bash
npm run dev
```

### Test Each Endpoint

1. **Set environment variable** in `.env`:

   ```
   HRM_CRON_SECRET=dev_secret_for_testing_only
   ```

2. **Test ensure-week:**

   ```bash
   curl -X POST http://localhost:3000/api/hrm/cron/ensure-week \
     -H "X-CRON-SECRET: dev_secret_for_testing_only"
   ```

3. **Test compute-last-friday:**

   ```bash
   curl -X POST http://localhost:3000/api/hrm/cron/compute-last-friday \
     -H "X-CRON-SECRET: dev_secret_for_testing_only"
   ```

4. **Test compute-month-if-ended:**
   ```bash
   curl -X POST http://localhost:3000/api/hrm/cron/compute-month-if-ended \
     -H "X-CRON-SECRET: dev_secret_for_testing_only"
   ```

### Test Authentication Failure

```bash
# Missing header
curl -X POST http://localhost:3000/api/hrm/cron/ensure-week

# Wrong secret
curl -X POST http://localhost:3000/api/hrm/cron/ensure-week \
  -H "X-CRON-SECRET: wrong_secret"
```

Expected responses:

- Missing header: `401 Unauthorized` with `"Missing X-CRON-SECRET header"`
- Wrong secret: `403 Forbidden` with `"Invalid cron secret"`

---

## Troubleshooting

### Cron job not executing

1. **Check Vercel logs:** Dashboard → Deployment → Functions → Cron
2. **Verify environment variable:** `HRM_CRON_SECRET` is set in Vercel
3. **Check schedule syntax:** Ensure cron expressions are valid

### Authentication errors

- Ensure `HRM_CRON_SECRET` matches in both Vercel and your test requests
- Vercel automatically injects this header for scheduled crons

### Computation errors

- **Week not found:** Run `ensure-week` first
- **No weekly results:** Ensure submissions exist and weeks are computed
- **Month already locked:** Month can only be computed once (unless unlocked manually)

---

## Workflow Summary

```
Daily 00:01 Dhaka:
  └─> ensure-week: Create current Friday's week

Friday 23:30 Dhaka:
  └─> compute-last-friday: Compute weekly KPI results

Daily 01:00 Dhaka:
  └─> compute-month-if-ended:
      ├─> If day 1-2 of month: Compute & lock previous month
      └─> Else: Skip
```

---

## Security Best Practices

1. ✅ **Never commit secrets** to git (.env is in .gitignore)
2. ✅ **Use strong secrets** in production (32+ random characters)
3. ✅ **Rotate secrets** periodically
4. ✅ **Monitor cron logs** for unauthorized access attempts
5. ✅ **Use HTTPS** only in production (Vercel enforces this)

---

## Integration with Existing System

These cron endpoints **complement** the existing manual system endpoints:

| Manual Endpoint                 | Cron Equivalent                        | Notes                            |
| ------------------------------- | -------------------------------------- | -------------------------------- |
| `/api/hrm/system/compute-week`  | `/api/hrm/cron/compute-last-friday`    | Manual requires SUPER_ADMIN auth |
| `/api/hrm/system/compute-month` | `/api/hrm/cron/compute-month-if-ended` | Manual requires SUPER_ADMIN auth |
| `/api/hrm/system/lock-month`    | (included in compute-month-if-ended)   | Auto-locks after computation     |

Manual endpoints remain available for:

- Ad-hoc recomputation
- Historical data fixes
- Testing specific weeks/months
