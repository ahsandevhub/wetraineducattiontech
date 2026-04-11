# Education Module Documentation

## Overview

The Education module provides a customer-facing e-commerce platform for course sales, delivery, and certification management.

## Business Purpose

- **Target Users**: Course purchasers and students
- **Value Proposition**: Professional development through structured courses
- **Revenue Model**: Course sales with payment processing

## Routes & Pages

### Public Routes (`/(landing)/*`)

- `/courses` - Course catalog
- `/courses/[slug]` - Individual course pages
- `/checkout` - Payment processing
- `/verify` - Email verification

### Protected Routes (`/dashboard/customer/*`)

- `/dashboard/customer` - Customer dashboard overview
- `/dashboard/customer/packages` - Available course packages
- `/dashboard/customer/payments` - Payment history
- `/dashboard/customer/profile` - Customer profile management
- `/dashboard/customer/services` - Additional services

## Key Components

### Dashboard Components

- `CustomerDashboardClient.tsx` - Main dashboard interface
- Course enrollment components
- Payment status displays
- Certificate download functionality

### Shared Components

- Payment forms and processors
- Course catalog displays
- User profile management
- Certificate generators

## Data Models

### Core Tables

- `profiles` - Customer profiles (education-specific)
- `orders` - Course purchase orders
- `payments` - Payment records (Stripe integration)
- `certificates` - Course completion certificates
- `enrollments` - Course enrollment tracking

### Key Relationships

- Customer → Orders → Payments
- Customer → Enrollments → Courses
- Courses → Certificates

## Authentication & Roles

### User Types

- **Customer**: Standard course purchaser
- **Admin**: Administrative access to customer data

### Role Checking

```typescript
const roles = await getCurrentUserWithRoles();
if (roles.profileRole === "admin") {
  // Admin functionality
}
```

## Business Workflows

### Course Purchase Flow

1. Browse courses (`/courses`)
2. Select package (`/checkout`)
3. Payment processing (Stripe)
4. Enrollment creation
5. Access granted to course materials

### Certification Flow

1. Complete course requirements
2. Automatic certificate generation
3. Download available in dashboard
4. PDF generation with course details

## Integration Points

### Payment Processing

- Stripe integration for payments
- Webhook handling for payment confirmation
- Refund processing capabilities

### Email Communications

- Purchase confirmations
- Course access notifications
- Certificate delivery
- Payment receipts

### External Services

- PDF generation for certificates
- Email delivery via Supabase
- File storage for course materials

## Implementation Notes

### Server Actions

- Payment processing in `/api/checkout/`
- Certificate generation
- Enrollment management
- Profile updates

### Client Components

- Interactive course players
- Payment forms
- Dashboard widgets
- File upload/download

### Security Considerations

- Payment data handling
- Certificate authenticity
- User data privacy
- Course access control

## Development Guidelines

### When Adding Courses

1. Update course catalog data
2. Add pricing information
3. Configure enrollment logic
4. Set up certificate templates

### When Modifying Payments

1. Test Stripe integration
2. Update webhook handlers
3. Verify refund processes
4. Check email notifications

### When Adding Features

1. Maintain customer-focused UX
2. Ensure mobile responsiveness
3. Test payment flows
4. Update documentation

## Testing Considerations

- Payment processing end-to-end
- Certificate generation
- Course enrollment flows
- Mobile responsiveness
- Email delivery
- Error handling for failed payments

## Future Enhancements

- Course progress tracking
- Interactive course content
- Student analytics
- Advanced certification options
- Integration with learning management systems
