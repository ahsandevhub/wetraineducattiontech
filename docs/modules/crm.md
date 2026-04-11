# CRM Module Documentation

## Overview

The CRM module provides sales pipeline management and lead tracking for the sales team.

## Business Purpose

- **Target Users**: Sales representatives and managers
- **Value Proposition**: Streamlined lead management and conversion tracking
- **Revenue Model**: Supports sales-driven revenue through lead conversion

## Routes & Pages

### Protected Routes (`/dashboard/crm/*`)

- `/dashboard/crm` - CRM dashboard overview
- `/dashboard/crm/leads` - Lead management
- `/dashboard/crm/requests` - Customer requests/inquiries
- `/dashboard/crm/logs` - Activity logs
- `/dashboard/crm/admin` - Administrative functions

## Key Components

### Dashboard Components

- Lead list and detail views
- Request management interface
- Activity logging displays
- Sales pipeline visualization

### Data Management

- Lead creation and editing forms
- Request processing workflows
- Status update mechanisms
- Assignment and reassignment tools

## Data Models

### Core Tables

- `crm_users` - Sales team member profiles
- `crm_leads` - Sales leads and prospects
- `crm_requests` - Customer inquiries and requests
- `crm_logs` - Activity and interaction logs

### Key Relationships

- Sales User → Assigned Leads
- Leads → Associated Requests
- Leads → Activity Logs
- Requests → Resolution tracking

## Authentication & Roles

### User Types

- **Sales Users**: Standard CRM access with lead ownership
- **Admins**: Full access to all leads and administrative functions

### Role-Based Access

- Leads assigned to specific sales users
- RLS policies enforce ownership
- Admin override capabilities
- Hierarchical permissions

## Business Workflows

### Lead Management Flow

1. Lead creation (manual or from requests)
2. Assignment to sales representative
3. Qualification and nurturing
4. Status updates through pipeline
5. Conversion tracking

### Request Processing Flow

1. Customer submits request/inquiry
2. Automatic lead creation or association
3. Assignment to appropriate sales user
4. Response and follow-up
5. Resolution tracking

## Integration Points

### Email Integration

- Lead notification emails
- Request acknowledgment
- Follow-up communications
- Status update notifications

### Analytics & Reporting

- Lead conversion metrics
- Sales performance tracking
- Pipeline analytics
- Time-to-conversion reporting

### External Systems

- Email marketing integrations
- Calendar/CRM tool sync
- Lead import/export capabilities

## Implementation Notes

### Server Actions

- Lead CRUD operations
- Request processing
- Assignment management
- Status updates

### Client Components

- Interactive data tables
- Lead detail modals
- Pipeline visualization
- Activity timelines

### Security Considerations

- Lead data privacy
- Sales user permissions
- Data access logging
- Compliance with data protection regulations

## Development Guidelines

### When Adding Lead Sources

1. Update lead creation forms
2. Add source tracking fields
3. Configure automated assignments
4. Update reporting queries

### When Modifying Pipeline

1. Update status definitions
2. Modify workflow logic
3. Update UI components
4. Test conversion tracking

### When Adding Features

1. Maintain sales team UX focus
2. Ensure data security
3. Test role-based access
4. Update training materials

## Testing Considerations

- Lead assignment and ownership
- Status transition logic
- Data table filtering/sorting
- Role-based permissions
- Email notifications
- Bulk operations
- Data export/import

## Future Enhancements

- Advanced lead scoring
- Automated lead nurturing
- Integration with marketing automation
- Mobile sales app
- Predictive analytics
- Team collaboration features
