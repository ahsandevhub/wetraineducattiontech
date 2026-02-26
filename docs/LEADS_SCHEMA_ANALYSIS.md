# Leads CSV → crm_leads Schema Mapping

## Column Comparison

| CSV Column        | DB Schema Column  | Type                 | Status            | Notes                                          |
| ----------------- | ----------------- | -------------------- | ----------------- | ---------------------------------------------- |
| id                | id                | UUID                 | ✅ Match          | Use as-is                                      |
| name              | name              | TEXT NOT NULL        | ✅ Match          | Use as-is                                      |
| email             | email             | TEXT                 | ✅ Match          | Use as-is                                      |
| phone             | phone             | TEXT UNIQUE          | ⚠️ **FIX NEEDED** | Currently in scientific notation (8.80182E+12) |
| company           | company           | TEXT                 | ✅ Match          | Use as-is                                      |
| status            | status            | lead_status ENUM     | ✅ Valid Values   | NEW, CONTACTED, PROPOSAL, LOST all valid       |
| source            | source            | lead_source ENUM     | ✅ Valid Values   | Has "ADMIN" which is valid in enum             |
| owner_id          | owner_id          | UUID NOT NULL FK     | ⚠️ **CRITICAL**   | Empty values + needs mapping to new crm_users  |
| notes             | notes             | TEXT                 | ✅ Match          | Use as-is                                      |
| last_contacted_at | last_contacted_at | TIMESTAMPTZ          | ✅ Match          | Use as-is                                      |
| created_at        | created_at        | TIMESTAMPTZ NOT NULL | ✅ Match          | Use as-is                                      |
| updated_at        | updated_at        | TIMESTAMPTZ NOT NULL | ✅ Match          | Use as-is                                      |

## Valid ENUM Values in Your Schema

### lead_status (Current values in CSV are valid)

- NEW ✅
- CONTACTED ✅
- QUALIFIED (not in your CSV)
- PROPOSAL ✅
- NEGOTIATION (not in your CSV)
- WON (not in your CSV)
- LOST ✅

### lead_source (Current value is valid)

- ADMIN ✅ (in your CSV)
- WEBSITE (not in your CSV)
- REFERRAL (not in your CSV)
- SOCIAL_MEDIA (not in your CSV)
- OTHER (not in your CSV)

## Required Changes

### 1. **PHONE Column - CRITICAL** ✗

**Problem**: Scientific notation format (8.80182E+12)
**Example**: `8.80182E+12` = `8801820000000`
**Solution**:

- Convert from scientific to decimal format
- Remove leading zeros or format as proper phone number

```
OLD: 8.80182E+12
NEW: 8801820000000 (or +88018-XX-XX-XXXX if formatted)
```

### 2. **OWNER_ID Column - CRITICAL** ✗

**Problem 1**: Many rows have EMPTY owner_id (but it's NOT NULL in schema)
**Problem 2**: owner_id values are OLD auth.users IDs, need mapping to NEW crm_users IDs

**Old User ID → New crm_users ID Mapping:**

```
OLD auth.users ID → NEW CRM User
e13d88f9-ca81-4035-8ae2-172cf3279c05 → (Needs mapping from users table)
6c486cea-dddd-4044-9020-c13f25e06c29 → (Needs mapping from users table)
6aa50550-e1cc-49c6-92ea-8bf1f8d3e021 → (Needs mapping from users table)
adc17272-937b-4e3b-940d-7e1395fe35d7 → (Needs mapping from users table)
1e806385-219a-4e53-aff0-65e983d7a4c0 → (Needs mapping from users table)
```

**Solutions for empty owner_id:**

- Option A: Remove rows with empty owner_id (~many rows)
- Option B: Assign to a default ADMIN user (e.g., Ahsan Habib: 877e222f-d28c-4935-a301-bc2ed54b48c0)
- Option C: Keep empty initially, then update via SQL after import

### 3. **Phone Uniqueness** ⚠️

**Note**: Many rows might have duplicate phone numbers after conversion. Schema requires UNIQUE phone.
**Solutions**:

- Remove duplicates
- Make phone nullable in the CSV if duplicate exists

## Column Order for Import

```
id,name,email,phone,company,status,source,owner_id,notes,last_contacted_at,created_at,updated_at
```

## Sample Transformation (First 3 rows)

### BEFORE (Current CSV):

```
39e22aee-a992-405f-96b3-fd497ae0697e,Md Mahabubul Mowla,,8.80182E+12,,NEW,ADMIN,e13d88f9-ca81-4035-8ae2-172cf3279c05,,2025-11-27 10:38:05.546+00,2025-11-27 05:12:40.008522+00,2025-11-27 10:38:05.702389+00
39e314c3-6234-4999-a2d4-f54738338636,Mukta Khatun,,8.80183E+12,,NEW,ADMIN,,,2025-12-08 04:55:02.492482+00,2025-12-08 04:55:02.492482+00
39e9a552-9435-4f17-b555-d94941fa830c,MD NAZMUL HASAN,,8.80179E+12,,NEW,ADMIN,,,2025-12-08 04:57:38.117486+00,2025-12-08 04:57:38.117486+00
```

### AFTER (Should be):

```
39e22aee-a992-405f-96b3-fd497ae0697e,Md Mahabubul Mowla,,8801820000000,,NEW,ADMIN,550e8400-e29b-41d4-a716-446655440009,,2025-11-27 10:38:05.546+00,2025-11-27 05:12:40.008522+00,2025-11-27 10:38:05.702389+00
39e314c3-6234-4999-a2d4-f54738338636,Mukta Khatun,,8801830000000,,NEW,ADMIN,550e8400-e29b-41d4-a716-446655440009,,2025-12-08 04:55:02.492482+00,2025-12-08 04:55:02.492482+00
39e9a552-9435-4f17-b555-d94941fa830c,MD NAZMUL HASAN,,8801790000000,,NEW,ADMIN,550e8400-e29b-41d4-a716-446655440009,,2025-12-08 04:57:38.117486+00,2025-12-08 04:57:38.117486+00
```

## Action Items

1. **Convert phone numbers** from scientific notation ✓
2. **Map old owner_ids** to new crm_users IDs ✓
3. **Handle empty owner_ids** - Choose a default ADMIN ✓
4. **Check for duplicate phones** after conversion ✓
5. **Validate status values** - all look good ✓
6. **Validate source values** - all are "ADMIN", which is valid ✓

## Summary

- **Columns to keep**: All 12 columns match schema
- **Columns to modify**: None (just values)
- **Columns to add**: None
- **Columns to remove**: None
- **Data fixes needed**: Phone numbers + owner_id mapping
