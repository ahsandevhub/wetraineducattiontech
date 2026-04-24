# Store Module Documentation

## Overview

The Store module provides an internal cafeteria and office store system for employee purchases, balance tracking, and stock management.

## Business Purpose

- **Target Users**: Employees and store admins
- **Value Proposition**: Simple self-service purchasing with auditable account and stock control
- **Operational Focus**: Internal inventory, employee balances, and monthly purchase reporting

## Routes & Pages

### Protected Routes (`/dashboard/store/*`)

- `/dashboard/store` - Personal dashboard overview
- `/dashboard/store/invoices/new` - New invoice creation
- `/dashboard/store/purchases` - Personal purchase logs
- `/dashboard/store/accounts` - Personal account ledger
- `/dashboard/store/admin` - Store admin dashboard
- `/dashboard/store/admin/employees` - Employee/store-access management
- `/dashboard/store/admin/invoices` - Invoice review and reversal management
- `/dashboard/store/admin/products` - Product management
- `/dashboard/store/admin/stocks` - Stock management
- `/dashboard/store/admin/accounts` - Balance and ledger management
- `/dashboard/store/admin/owner-purchases` - Owner-level monthly cost tracking
- `/dashboard/store/admin/reports` - Reporting and summaries

## Key Components

### Employee Self-Service

- Balance summary dashboard
- Invoice builder with barcode scan and manual search
- Purchase history
- Account ledger with categorized entries

### Admin Tools

- Employee/store-admin management
- Product and pricing management
- Invoice review and reversal handling
- Stock additions, deductions, and corrections
- Account adjustments with category and optional reason/notes
- Owner purchase tracking with monthly carry-forward
- Month close and reporting workflows

## Data Models

### Core Tables

- `store_users` - Store access and store roles linked to `auth.users`
- `store_products` - Product catalog, prices, barcodes, and active state
- `store_stock_entries` - Restock and manual stock input records
- `store_stock_movements` - Immutable stock ledger
- `store_invoices` - Purchase invoice headers
- `store_invoice_items` - Invoice line items
- `store_account_entries` - Immutable balance ledger
- `store_month_closures` - Monthly open/close snapshots and carry-forward records
- `store_owner_purchases` - Standalone owner-level purchase entries
- `store_owner_month_closures` - Owner purchase opening/closing carry-forward snapshots

### Key Relationships

- Users → Invoices → Invoice Items
- Users → Account Entries
- Products → Stock Movements
- Products → Invoice Items
- Months → Carry-forward and close snapshots

## Authentication & Roles

### User Types

- **STORE_USER**: Can purchase items and view personal logs
- **STORE_ADMIN**: Can manage store operations and still purchase items personally

### Permission Rules

- Store access is separate from Education, CRM, and HRM access
- Store access is determined only by `store_users`
- Store admins are also store users
- Store has only two roles: `USER` and `ADMIN`
- Initial store admin setup is done directly in the database or seed flow
- Personal balances, purchases, and ledger views are self-service only unless accessed through admin workflows

## Business Workflows

### Purchase Flow

1. User opens new invoice
2. User adds items by barcode scan or search
3. User confirms quantity and invoice summary
4. System saves invoice, deducts balance, and records stock movements
5. Invoice becomes immutable for the user

### Invoice Reversal Flow

1. Admin reviews a confirmed invoice
2. Admin provides a reversal reason
3. System creates append-only reversal entries for:
   - employee account balance
   - stock movements tied to tracked products
4. Invoice status changes to `REVERSED` while the original invoice remains in audit history

### Balance Management Flow

1. Admin selects employee
2. Admin adds or deducts balance manually
3. Admin chooses a category and may add reason/notes
4. System creates an immutable account entry
5. Updated balance appears in employee and admin ledgers

### Month Close Flow

1. Admin reviews open month data
2. Admin closes the month for reporting
3. Closing balance carries forward automatically to the next month
4. New allocations or deductions for the next month remain manual admin actions

## Accounting Rules

- There is no automatic monthly 600 BDT deposit
- Balance is an append-only ledger, not a manually trusted balance field
- Each manual deposit or withdrawal requires:
  - amount
  - direction
  - category
  - optional reason/notes
  - effective date or month
- Recommended entry categories:
  - `MONTHLY_ALLOCATION`
  - `EMPLOYEE_PAYMENT`
  - `PURCHASE`
  - `REFUND`
  - `REVERSAL`
  - `CORRECTION`
  - `PENALTY`
  - `BONUS_OR_REWARD`
  - `OTHER`

## Implementation Notes

### Server Actions

- Invoice confirmation
- Product and stock mutations
- Account adjustments
- Month close actions

### Route Handlers

- Camera/barcode or device-specific integrations if needed
- Admin/reporting endpoints where route handlers fit better than form actions

### Security Considerations

- Keep balance and stock history append-only
- Use reversal entries instead of destructive edits
- Protect admin actions with explicit server-side role checks
- Treat invoice/account/stock operations as audit-sensitive

## Testing Considerations

- Role-based access for users and store admins
- Accurate balance deduction on invoice save
- Accurate stock deduction and reversal behavior
- Category validation and optional reason/notes handling for admin adjustments
- Correct carry-forward on month close
- Mobile behavior for invoice scan/search flows

## Future Enhancements

- Cash receipt reference tracking
- Supplier purchase and restock costing
- Notifications for low stock
- Advanced reporting and exports
- Receipt printing or downloadable invoice summaries
