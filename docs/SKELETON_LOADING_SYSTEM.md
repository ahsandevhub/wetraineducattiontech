# Skeleton Loading System

## Overview

This document describes the comprehensive skeleton loading system implemented to provide exact UI mirroring during data fetching and route transitions.

## Architecture

### Core Components (`components/skeletons/`)

Reusable skeleton building blocks that can be composed across different pages:

1. **StatCardSkeleton** - Statistics/metric cards
2. **TableSkeleton** - Configurable data tables with row/column control
3. **ChartSkeleton** - Chart placeholders (bar, line, pie)
4. **KpiCardSkeleton** - KPI metric cards for CRM dashboard
5. **DialogSkeleton** - Generic dialog placeholder

### HRM-Specific Components (`components/hrm/skeletons/`)

Domain-specific skeleton components for HRM dialogs:

1. **PeopleDialogSkeleton** - People management form (5 fields)
2. **CreatePendingProfileDialogSkeleton** - Profile creation form (4 fields)
3. **MarkingDialogSkeleton** - Performance marking dialog (employee card + criteria)

## Route-Level Loading States

### Education Dashboard (`app/dashboard/admin/`)

- **Main Dashboard**: 4 stat cards + 2 charts + recent activity table
- **Customers**: Header + search + table with pagination

### CRM Dashboard (`app/dashboard/crm/`)

- **Main Dashboard**: 6 KPI cards + 4 charts + leads table
- **Leads**: Header + filters + table with pagination

### HRM Dashboard (`app/dashboard/hrm/`)

#### Super Admin Routes:

- **Main**: Navigation card grid (6 cards)
- **People**: Tabs + action buttons + table
- **Criteria**: Tabs + action buttons + table

#### Admin Routes:

- **Main**: Stats grid + charts + activity table
- **Overview**: Same structure as main dashboard

#### Employee Routes:

- **Main**: Schedule table + quick links
- **Profile**: Avatar card + details grid + info sections

## Usage Guidelines

### Creating New Page Loaders

1. **Import Required Components**:

```tsx
import { StatCardSkeleton, TableSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
```

2. **Mirror Exact Layout**:

- Match container structure (divs, Cards, grids)
- Use identical spacing classes (space-y-6, gap-4, etc.)
- Match responsive breakpoints (md:grid-cols-2, lg:grid-cols-4)

3. **Header Pattern**:

```tsx
<div>
  <Skeleton className="h-9 w-32 mb-2" /> {/* Title */}
  <Skeleton className="h-4 w-64" /> {/* Description */}
</div>
```

4. **Action Buttons Pattern**:

```tsx
<div className="flex gap-2">
  <Skeleton className="h-10 w-28" />
  <Skeleton className="h-10 w-32" />
</div>
```

### Dialog Integration

To use dialog skeletons in components with data fetching:

```tsx
import { Suspense } from "react";
import { PeopleDialogSkeleton } from "@/components/hrm/skeletons";

function DialogContent() {
  // Async data fetching
  const data = await fetchData();
  return <ActualForm data={data} />;
}

export function MyDialog({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Suspense fallback={<PeopleDialogSkeleton />}>
        <DialogContent />
      </Suspense>
    </Dialog>
  );
}
```

## Key Sizing Standards

- **Titles (h1)**: `h-9 w-32` to `w-64`
- **Subtitles**: `h-4 w-48` to `w-96`
- **Buttons**: `h-10 w-24` to `w-32`
- **Input Fields**: `h-10 w-full` or `flex-1`
- **Avatar**: `h-24 w-24 rounded-full`
- **Card Titles**: `h-6 w-32` to `w-48`

## Benefits

1. **Perceived Performance**: Users see instant layout feedback
2. **Reduced CLS**: No layout shift when content loads
3. **Professional UX**: Matches production apps (Linear, Notion, Vercel)
4. **Maintainability**: Reusable components prevent duplication
5. **Consistency**: Standardized loading patterns across apps

## Future Extensions

- Add more dialog skeletons for CRM lead management
- Create form-specific skeleton patterns
- Add animation variants for different loading states
- Implement context-aware skeletons based on user role
