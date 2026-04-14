# HRM Module Documentation

## Overview

The HRM module provides employee performance management and HR operations for internal staff.

The internal cafeteria/store system is a separate Store module under `/dashboard/store/*`. Even if Store admin delegation reuses company hierarchy concepts, Store data and routes are not HRM-owned.

## Business Purpose

- **Target Users**: Employees, managers, and HR administrators
- **Value Proposition**: Structured performance tracking and management
- **Operational Focus**: Employee lifecycle management

## Routes & Pages

### Protected Routes (`/dashboard/hrm/*`)

- `/dashboard/hrm` - HRM dashboard overview
- `/dashboard/hrm/admin` - Administrative functions
- `/dashboard/hrm/employee` - Employee self-service
- `/dashboard/hrm/super` - Super admin functions
- `/dashboard/hrm/notifications` - Notification management
- `/dashboard/hrm/employee/reporting` - Employee regular task reporting
- `/dashboard/hrm/admin/reporting` - Admin task reporting and assigned employee visibility
- `/dashboard/hrm/super/reporting` - Super admin task reporting oversight

## Key Components

### Dashboard Components

- Performance dashboard for employees
- Management oversight interfaces
- KPI tracking displays
- Notification systems

### Management Tools

- Employee profile management
- Performance evaluation forms
- KPI configuration and tracking
- Hierarchical approval workflows
- Task reporting with role-based visibility and management

## Data Models

### Core Tables

- `hrm_users` - Employee profiles and hierarchy
- `hrm_kpis` - Key performance indicators
- `hrm_months` - Monthly tracking periods
- `hrm_weeks` - Weekly performance data
- `hrm_notifications` - System notifications
- `hrm_email_logs` - Communication tracking
- `hrm_task_reports` - Regular task/activity reporting entries

### Key Relationships

- Employees → Managers (hierarchical)
- Employees → KPIs → Performance data
- Users → Notifications
- Performance data → Time periods

## Authentication & Roles

### User Types

- **SUPER_ADMIN**: Full system access
- **ADMIN**: Department-level management
- **EMPLOYEE**: Self-service access

### Hierarchical Permissions

- Super admins see all data
- Admins manage their department
- Employees view their own data
- Approval workflows follow hierarchy

## Business Workflows

### Performance Management Flow

1. KPI definition and assignment
2. Regular performance tracking
3. Monthly/weekly data entry
4. Performance reviews and evaluations
5. Goal setting and adjustments

### Employee Onboarding Flow

1. Profile creation
2. KPI assignment
3. Access provisioning
4. Training and orientation
5. Performance baseline establishment

## Integration Points

### Notification System

- Performance reminders
- Review notifications
- Approval requests
- System announcements

### Reporting & Analytics

- Performance dashboards
- Trend analysis
- Comparative reporting
- Goal achievement tracking

### External Systems

- Payroll integration
- HRIS system sync
- Learning management systems
- Benefits administration

## Implementation Notes

### Server Actions

- KPI management
- Performance data updates
- Notification processing
- Profile management

### Client Components

- Performance input forms
- Dashboard visualizations
- Notification interfaces
- Hierarchical data displays

### Security Considerations

- Employee data privacy
- Hierarchical access control
- Performance data confidentiality
- Audit trail maintenance

## Development Guidelines

### When Adding KPIs

1. Define KPI structure
2. Update data models
3. Create input interfaces
4. Configure reporting
5. Test calculation logic

### When Modifying Hierarchy

1. Update role definitions
2. Modify access controls
3. Update approval workflows
4. Test permission changes
5. Update documentation

### When Adding Features

1. Maintain hierarchical UX
2. Ensure data security
3. Test role permissions
4. Update user training

## Testing Considerations

- Role-based access control
- Hierarchical permissions
- Performance calculation accuracy
- Notification delivery
- Data privacy and security
- Bulk operations
- Reporting accuracy

## Future Enhancements

- Advanced analytics and insights
- Employee self-service portal
- Integration with performance management systems
- Mobile HR app
- Automated performance reviews
- Succession planning tools
