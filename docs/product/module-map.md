# Module Map

## Overview

This document provides a visual and structural map of the main business modules in the WeTrainEducation platform, showing their relationships, boundaries, and integration points.

## Module Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    WeTrainEducation Platform                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   LANDING       │  │   EDUCATION     │  │   CRM           │  │
│  │   (Public)      │  │   (Customers)   │  │   (Sales)       │  │
│  │                 │  │                 │  │                 │  │
│  │ • Marketing     │  │ • Course Sales  │  │ • Lead Mgmt     │  │
│  │ • Lead Capture  │  │ • Payments      │  │ • Pipeline      │  │
│  │ • Course Catalog│  │ • Certificates  │  │ • Requests      │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                       │                       │      │
├───────────┼───────────────────────┼───────────────────────┼──────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   SHARED        │  │   SHARED        │  │   SHARED        │  │
│  │   SYSTEMS       │  │   SYSTEMS       │  │   SYSTEMS       │  │
│  │                 │  │                 │  │                 │  │
│  │ • Supabase Auth │  │ • Shadcn UI     │  │ • Supabase Auth │  │
│  │ • Database      │  │ • Theme System  │  │ • Database      │  │
│  │ • Middleware    │  │ • Components    │  │ • Middleware    │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌─────────────────────────────────┐ │
│  │     STORE MODULE     │  │           HRM MODULE            │ │
│  │  (Internal Cafeteria)│  │       (Employee Management)     │ │
│  │                      │  │                                 │ │
│  │ • Purchases          │  │ • KPI Tracking                  │ │
│  │ • Balances           │  │ • Profile / Hierarchy           │ │
│  │ • Inventory          │  │ • Reviews / Reports             │ │
│  │ • Stock Reports      │  │ • Notifications                 │ │
│  └──────────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Module Boundaries & Responsibilities

### Landing Module (Public)

**Purpose**: Marketing and lead generation
**Routes**: `/(landing)/*`
**Users**: Anonymous visitors + registered users
**Responsibilities**:

- Company branding and messaging
- Service and course showcase
- Lead capture and conversion
- Public course browsing
- Account registration

### Education Module (Customers)

**Purpose**: Course sales and delivery
**Routes**: `/dashboard/customer/*`
**Users**: Course purchasers (customers + admins)
**Responsibilities**:

- Course catalog management
- Secure payment processing
- Student enrollment tracking
- Certificate generation
- Customer support

### CRM Module (Sales)

**Purpose**: Sales pipeline management
**Routes**: `/dashboard/crm/*`
**Users**: Sales team members
**Responsibilities**:

- Lead capture and qualification
- Sales pipeline tracking
- Customer request handling
- Sales performance analytics
- Lead assignment and management

### HRM Module (Employees)

**Purpose**: Employee performance management
**Routes**: `/dashboard/hrm/*`
**Users**: Employees, managers, HR admins
**Responsibilities**:

- Employee profile management
- Performance KPI tracking
- Hierarchical approval workflows
- HR reporting and analytics
- Organizational management

### Store Module (Internal Cafeteria)

**Purpose**: Internal cafeteria/store purchasing and balance management
**Routes**: `/dashboard/store/*`
**Users**: Employees, store admins, super admins
**Responsibilities**:

- Employee self-service purchases
- Manual balance allocation and collection
- Product and stock management
- Month close and carry-forward tracking
- Internal store reporting and audit logs

## Data Relationships

### Shared Data Elements

```
Supabase Auth (auth.users)
         │
    ┌────┼────┬──────┐
    │    │    │      │
    ▼    ▼    ▼      ▼
profiles  crm_users  hrm_users  store_users
(edu)    (sales)   (employees) (store access)
```

### Module-Specific Data

- **Education**: orders, payments, certificates, enrollments
- **CRM**: crm_leads, crm_requests, crm_logs
- **HRM**: hrm_kpis, hrm_months, hrm_weeks, hrm_notifications
- **Store**: store_users, store_products, store_stock_movements, store_invoices, store_account_entries

### Cross-Module Integration

- **Lead → Customer**: CRM leads can become education customers
- **Employee → Sales**: HRM users can have CRM access
- **Customer → Employee**: Education customers can be internal employees
- **Employee → Store User**: Internal users can receive store access and separate store admin privileges

## Integration Points

### Authentication Flow

```
Landing Registration → Supabase Auth → Role Assignment → Module Access
```

### Data Flow

```
Lead Form (Landing) → CRM Lead → Qualification → Customer Conversion → Education Enrollment
```

### User Journey

```
Visitor → Lead (CRM) → Customer (Education) → Employee (HRM) → Store User
```

## Shared Infrastructure

### Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Custom Theme
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel

### Common Patterns

- Server Actions for data mutations
- RLS policies for data security
- Component-based architecture
- Responsive design principles
- Error handling and loading states

## Module Communication

### Event-Driven Integration

- **Lead Created**: Notify sales team
- **Payment Completed**: Update customer status
- **Employee Hired**: Create user accounts

### Shared Services

- **Email Service**: Transactional emails across modules
- **Notification System**: In-app notifications
- **Audit Logging**: Cross-module activity tracking
- **File Storage**: Shared file management

## Development Guidelines

### Module Isolation

- Each module maintains separate codebase sections
- Clear API boundaries between modules
- Independent deployment capabilities
- Module-specific testing strategies

### Shared Responsibility

- Common components in `/components/shared/`
- Shared utilities in `/lib/` and `/utils/`
- Cross-module documentation
- Coordinated release planning

### Code Organization

```
app/dashboard/
├── customer/    # Education module
├── crm/         # CRM module
├── hrm/         # HRM module
└── store/       # Store module

components/
├── shared/      # Cross-module components
├── ui/         # Shadcn UI library
└── [module]/   # Module-specific components
```

## Scaling Considerations

### Independent Scaling

- Modules can scale independently
- Shared infrastructure scales with usage
- Database partitioning by module
- CDN for global content delivery

### Performance Optimization

- Module-specific caching strategies
- Lazy loading of module components
- Database query optimization per module
- Shared resource pooling

## Future Module Extensions

### Potential Additions

- **Marketing Module**: Advanced campaign management
- **Support Module**: Customer service ticketing
- **Analytics Module**: Cross-platform reporting
- **Integration Module**: Third-party service connections

### Extension Patterns

- Follow existing module structure
- Integrate with shared authentication
- Use established UI patterns
- Maintain data isolation principles
