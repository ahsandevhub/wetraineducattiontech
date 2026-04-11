# Shared Systems Documentation

## Overview

Shared systems provide common infrastructure and utilities used across all modules of the WeTrainEducation platform.

The current protected application areas are Education, CRM, HRM, and Store.

## Core Systems

### Authentication System

- **Provider**: Supabase Auth
- **Features**: Email/password, magic links, social auth
- **Integration**: Unified across all modules
- **Middleware**: Session management and refresh

### Database Layer

- **Database**: PostgreSQL via Supabase
- **Security**: Row Level Security (RLS) policies
- **Migrations**: Version-controlled schema changes
- **Backup**: Automated backup procedures

### UI Component Library

- **Framework**: Shadcn UI on Radix UI
- **Styling**: Tailwind CSS with custom theme
- **Consistency**: Shared design system
- **Accessibility**: Built-in accessibility features

## Shared Components

### Layout Components

- `DashboardShell` - Main admin layout with navigation
- `Header/Footer` - Public site layout components
- Loading and error state components
- Responsive navigation elements

### Utility Components

- Form components with validation
- Data table components
- Modal and dialog components
- Toast notification system

## Shared Utilities

### Authentication Helpers

- `getCurrentUserWithRoles()` - Unified role checking
- `createClient()` - Supabase client initialization
- Middleware utilities for session management

Shared auth may resolve access across Education, CRM, HRM, and Store, but each module still owns its own business tables and authorization rules.

### Data Fetching

- Server action patterns
- API route conventions
- Error handling utilities
- Type-safe database queries

### UI Utilities

- Theme configuration and CSS variables
- Responsive design helpers
- Animation and transition utilities
- Icon and image optimization

## Cross-Module Concerns

### User Management

- Profile creation and updates
- Role assignment and changes
- Permission checking utilities
- User lifecycle management

### Data Consistency

- Shared data validation schemas
- Common data transformation utilities
- Audit logging patterns
- Data export/import utilities

### Communication

- Email sending utilities
- Notification systems
- System-wide messaging
- User communication preferences

## Development Guidelines

### When Adding Shared Components

1. Ensure reusability across modules
2. Maintain backward compatibility
3. Update documentation
4. Test in all affected modules

### When Modifying Shared Utilities

1. Assess impact on all modules
2. Provide migration path if needed
3. Update type definitions
4. Test integration points

### When Adding Shared Features

1. Define clear ownership
2. Document usage patterns
3. Provide examples
4. Plan for future extensibility

## Testing Considerations

- Cross-module compatibility
- Backward compatibility
- Performance impact assessment
- Integration testing
- Documentation accuracy

## Maintenance Tasks

### Regular Updates

- Dependency updates
- Security patches
- Performance optimizations
- Documentation updates

### Monitoring

- Usage analytics
- Error tracking
- Performance metrics
- Module adoption rates

## Future Enhancements

- Advanced caching strategies
- Real-time communication
- Advanced analytics
- API rate limiting
- Enhanced security features
