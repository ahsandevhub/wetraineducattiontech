# Store Module Implementation Checklist

This checklist breaks the Store module into implementation tickets with concrete deliverables. It is intended to be the working build sequence for the first release of the internal cafeteria/store application.

## Phase 1: MVP Foundation

### ST-001: Add Store to shared access model

**Goal**

Add Store as a first-class protected application in the shared auth and dashboard access system.

**Deliverables**

- Extend `app/utils/auth/roles.ts` with:
  - `hasStoreAccess`
  - `storeRole`
  - Store role types
- Add Store guard helpers in `app/utils/auth/require.ts`
- Update dashboard-level access checks to allow Store users into protected routes
- Preserve existing redirect priority for Education > CRM > HRM > Store

**Acceptance criteria**

- A Store-only user can enter `/dashboard`
- A non-Store user cannot access `/dashboard/store/*`
- Existing Education, CRM, and HRM routing behavior remains unchanged

### ST-002: Add Store routing and dashboard navigation

**Goal**

Expose Store in the dashboard shell, switchers, breadcrumbs, and navigation.

**Deliverables**

- Add `/dashboard/store` route scaffold
- Add Store to:
  - application switcher
  - team switcher
  - dashboard breadcrumbs
  - sidebar navigation
- Add placeholder Store layout with server-side access enforcement

**Acceptance criteria**

- Store appears in navigation only for users with Store access
- Navigating to Store shows the Store section title and correct breadcrumb labels

### ST-003: Create Store database schema

**Goal**

Create the base schema for Store users, products, invoices, stock, balances, and month closures.

**Deliverables**

- New migrations for:
  - `store_users`
  - `store_products`
  - `store_stock_movements`
  - `store_invoices`
  - `store_invoice_items`
  - `store_account_entries`
  - `store_month_closures`
- Enums or constraints for:
  - store roles
  - invoice status
  - stock movement type
  - account entry category
- Indexes for:
  - user/month lookups
  - barcode lookup
  - product activity
  - recent ledger/invoice queries

**Acceptance criteria**

- Schema migrates successfully in the test database
- Core relationships and foreign keys are valid
- Balance and stock history are modeled as append-only ledgers

### ST-004: Add Store RLS policies

**Goal**

Secure Store tables with self-service and admin-safe policies.

**Deliverables**

- RLS policies for self-service access to:
  - own invoices
  - own invoice items
  - own account entries
- RLS policies for Store admins to manage Store operational data
- Restrict `store_users` management actions to Store admins via server path

**Acceptance criteria**

- Store users can read only their own purchase/account data
- Store admins can manage Store operations
- Non-Store users cannot read Store data

### ST-005: Build Store user/admin management page

**Goal**

Let Store admins manage Store users and Store roles independently from other modules.

**Deliverables**

- `/dashboard/store/admin/employees`
- Employee search/list view
- Add/remove Store access
- Grant/revoke Store `ADMIN` role within the Store module
- Role and access status columns

**Acceptance criteria**

- Admin can manage Store users
- Store role changes remain fully inside Store’s own access model
- Access changes are reflected in auth-resolved navigation

### ST-006: Build product management

**Goal**

Enable Store admins to manage sellable products.

**Deliverables**

- `/dashboard/store/admin/products`
- Product create/edit form with:
  - name
  - price
  - barcode
  - active status
  - stock-tracking flag
- Product list/table with search/filter
- Server actions and validation schema

**Acceptance criteria**

- Admin can create, edit, and deactivate products
- Inactive products are not sellable
- Barcode uniqueness is enforced if barcode is present

### ST-007: Build stock management basics

**Goal**

Track product stock through immutable movement records.

**Deliverables**

- `/dashboard/store/admin/stocks`
- Admin actions for:
  - add stock
  - deduct stock
  - adjust stock
- Current on-hand stock display
- Stock movement history table
- Validation for stock-tracked items

**Acceptance criteria**

- Every stock change creates a movement record
- Current stock totals are derived correctly
- Negative stock is blocked unless an explicit correction policy is implemented

### ST-008: Build manual account ledger management

**Goal**

Allow admins to add or deduct employee balance with category and optional reason/notes.

**Deliverables**

- `/dashboard/store/admin/accounts`
- Manual credit/debit action form with:
  - employee
  - amount
  - direction
  - category
  - optional reason/notes
  - effective date/month
- Admin ledger table
- Validation schema and server actions

**Acceptance criteria**

- Manual balance changes validate category and signed amount correctly
- Entries are visible in the employee ledger immediately
- Balance is calculated from ledger entries

### ST-009: Build employee Store dashboard

**Goal**

Provide a clear self-service home for Store users, including Store admins acting as users.

**Deliverables**

- `/dashboard/store`
- Summary cards for:
  - current balance
  - current month purchase total
  - recent account activity
- CTA to create a new invoice
- Recent purchases section
- Loading, empty, and error states

**Acceptance criteria**

- Store users can see their own balance and recent activity
- Store admins can also use this page as a normal Store user

### ST-010: Build invoice creation with manual item search

**Goal**

Ship the core purchase flow without barcode scanning first.

**Deliverables**

- `/dashboard/store/invoices/new`
- Searchable product picker
- Qty input defaulting to `1`
- Draft invoice item list
- Confirmation dialog with:
  - items
  - quantities
  - line totals
  - invoice total
- Save flow that creates:
  - invoice
  - invoice items
  - purchase ledger entry
  - stock movements

**Acceptance criteria**

- A valid invoice deducts stock and balance together
- Inactive products cannot be added
- Insufficient stock blocks save for tracked products

### ST-011: Build employee purchase logs

**Goal**

Allow users to review purchase history.

**Deliverables**

- `/dashboard/store/purchases`
- Purchase log table/cards
- Filters for month/date
- Invoice detail view or expandable summary

**Acceptance criteria**

- User sees only personal purchases
- Invoice totals and items match saved invoice data

### ST-012: Build employee account logs

**Goal**

Allow users to review categorized balance history.

**Deliverables**

- `/dashboard/store/accounts`
- Account ledger table/cards
- Filters for month/date/category
- Visible category and reason fields

**Acceptance criteria**

- User sees only personal ledger entries
- Ledger explains why each balance mutation happened

## Phase 2: Hardening

### ST-013: Add immutable invoice and reversal system

**Goal**

Protect audit history and enable safe corrections.

**Deliverables**

- Lock invoices after confirmation
- Admin reversal action for invoices
- Reversal linkage in invoice/account/stock records
- Admin correction entries for non-invoice issues

**Acceptance criteria**

- Users cannot edit or delete confirmed invoices
- Reversing an invoice restores stock and balance through append-only entries

### ST-014: Add month close and carry-forward

**Goal**

Close months for reporting while carrying forward balance automatically.

**Deliverables**

- Month close action
- `store_month_closures` usage in application flows
- Carry-forward posting or snapshot logic
- Closed-month transaction blocking

**Acceptance criteria**

- Closing a month prevents new postings into that month
- Next month starts with carried-forward balance only
- No automatic monthly 600 BDT credit is created

### ST-015: Add admin dashboard summaries

**Goal**

Give Store admins an operational overview.

**Deliverables**

- `/dashboard/store/admin`
- Cards/widgets for:
  - low-stock items
  - current month sales
  - negative-balance employees
  - recent ledger actions
- Quick links to products, stocks, accounts, and reports

**Acceptance criteria**

- Admin dashboard highlights operational issues without leaving the page

### ST-016: Add stronger validations and audit fields

**Goal**

Harden Store actions against common operational mistakes.

**Deliverables**

- Audit fields such as actor, timestamps, linked references
- Validation for:
  - closed-month writes
  - invalid category values
  - duplicate barcode
  - invalid reversal attempts
  - invalid stock deductions

**Acceptance criteria**

- Invalid operational writes are rejected clearly
- Sensitive records retain actor/context metadata

## Phase 3: Reporting

### ST-017: Build reporting pages

**Goal**

Provide actionable Store reporting for admins.

**Deliverables**

- `/dashboard/store/admin/reports`
- Reports for:
  - monthly sales
  - purchases by employee
  - purchases by product
  - low-stock products
  - negative balances
  - ledger activity by category

**Acceptance criteria**

- Admin can filter and review operational summaries by month
- Report totals reconcile with invoice and ledger data

### ST-018: Add month closure reporting

**Goal**

Show opening, closing, and carry-forward status for each month.

**Deliverables**

- Month closure summary view
- Opening vs closing balance visibility
- Reversal/adjustment visibility in monthly reports

**Acceptance criteria**

- Admin can understand how each month closed and what carried forward

## Phase 4: Barcode and UX polish

### ST-019: Add barcode scan flow

**Goal**

Speed up invoice entry for mobile and camera-capable devices.

**Deliverables**

- Barcode scan option in new invoice flow
- Camera permission handling
- Product lookup by barcode
- Search fallback when scan is unavailable or fails

**Acceptance criteria**

- Scanning a known barcode adds the correct product to the draft invoice
- Search flow remains fully usable without camera access

### ST-020: Add responsive polish and loading UX

**Goal**

Ensure Store works cleanly on mobile and desktop.

**Deliverables**

- Responsive review of dashboard, logs, admin pages, and invoice flow
- Loading skeletons or equivalent loading states
- Better empty states and action feedback

**Acceptance criteria**

- Core Store flows are usable on mobile
- Loading and empty states feel consistent with the rest of the app

## Phase 5: Verification and rollout safety

### ST-021: Add test coverage for core flows

**Goal**

Protect the highest-risk accounting, stock, and access paths.

**Deliverables**

- Tests for:
  - Store access control
  - product creation/editing
  - stock movements
  - manual balance adjustments
  - invoice creation
  - reversal flow
  - month close and carry-forward

**Acceptance criteria**

- Critical Store workflows have automated verification
- Regressions in auth, stock, and ledger behavior are caught early

### ST-022: Final permissions and consistency audit

**Goal**

Validate the Store module before broader rollout.

**Deliverables**

- Manual audit of:
  - non-Store user
  - Store user
  - Store admin
  - users with other module access but no Store access
- Naming consistency review across routes, types, and labels
- Final doc touch-up if implementation differs from current docs

**Acceptance criteria**

- Store permissions are internally consistent
- Final implementation matches documented rules

## Recommended implementation order

1. ST-001 to ST-004
2. ST-005 to ST-012
3. ST-013 to ST-016
4. ST-017 to ST-018
5. ST-019 to ST-022

## Notes

- Barcode scanning is intentionally deferred until after the manual invoice flow is stable.
- The balance model is manual and ledger-driven:
  - no automatic 600 BDT monthly credit
  - carry-forward only at month rollover
  - admin-managed balance changes with category and optional reason/notes
- Financial and stock-sensitive records should remain append-only wherever possible.
