# Component Audit & Migration Checklist

## 🎯 Objective

Ensure all dashboard components use the new **semantic color system** instead of hardcoded colors.

---

## 📋 Audit Process

### Step 1: Search for Hardcoded Colors

Run these searches across your codebase to find hardcoded color usage:

```bash
# Search for old yellow utilities
grep -r "bg-primary-yellow" app/ components/
grep -r "text-primary-yellow" app/ components/
grep -r "bg-secondary-yellow" app/ components/
grep -r "bg-tertiary-yellow" app/ components/

# Search for hardcoded hex colors
grep -r "#facc15" app/ components/
grep -r "#eccf4f" app/ components/

# Search for old Tailwind gray classes (should use semantic tokens)
grep -r "bg-gray-" app/ components/
grep -r "text-gray-" app/ components/
grep -r "border-gray-" app/ components/
```

### Step 2: Component-by-Component Review

Check each component category:

---

## 🔍 Component Categories

### ✅ Buttons

**Files to check:**

- `components/ui/button.tsx`
- All page components using buttons

**Common issues:**

```tsx
/* ❌ WRONG */
<Button className="bg-[#facc15] text-black">

/* ✅ CORRECT */
<Button className="bg-primary text-primary-foreground hover:bg-primary-600">
```

**Variants to verify:**

- Primary buttons → `bg-primary text-primary-foreground`
- Secondary buttons → `bg-secondary text-secondary-foreground`
- Ghost buttons → `hover:bg-accent text-foreground`
- Destructive buttons → `bg-destructive text-destructive-foreground`

---

### ✅ Cards

**Files to check:**

- `components/ui/card.tsx`
- All dashboard pages with stat cards
- All modal/dialog components

**Common issues:**

```tsx
/* ❌ WRONG */
<Card className="bg-white border-gray-200">

/* ✅ CORRECT */
<Card className="bg-card border-border">
```

**Verify:**

- Background: `bg-card`
- Border: `border-border`
- Title: `text-foreground`
- Description: `text-muted-foreground`
- Highlighted cards: `bg-primary-50 border-primary-300`

---

### ✅ Tables

**Files to check:**

- `components/ui/table.tsx`
- `components/DataTable.tsx` (if exists)
- All pages with tables (leads, logs, admin/users, etc.)

**Common issues:**

```tsx
/* ❌ WRONG */
<TableHeader className="bg-gray-100">
  <TableHead className="text-gray-700">

/* ✅ CORRECT */
<TableHeader className="bg-secondary">
  <TableHead className="text-secondary-foreground">
```

**Verify:**

- Header background: `bg-secondary`
- Row hover: `hover:bg-accent`
- Row borders: `border-b border-border`
- Cell text: `text-foreground`

---

### ✅ Badges

**Files to check:**

- `components/ui/badge.tsx`
- All status indicators (lead status, user roles, etc.)

**Common issues:**

```tsx
/* ❌ WRONG */
<Badge className="bg-green-500 text-white">Active</Badge>

/* ✅ CORRECT */
<Badge className="bg-success text-success-foreground">Active</Badge>
```

**Status mappings:**

- Active/Success → `bg-success text-success-foreground`
- Pending/Warning → `bg-warning text-warning-foreground`
- Inactive/Error → `bg-destructive text-destructive-foreground`
- Featured/New → `bg-primary-100 text-primary-700 border-primary-300`
- Neutral → `bg-secondary text-secondary-foreground`

---

### ✅ Forms & Inputs

**Files to check:**

- `components/ui/input.tsx`
- `components/ui/select.tsx`
- `components/ui/textarea.tsx`
- All form components (login, lead creation, etc.)

**Common issues:**

```tsx
/* ❌ WRONG */
<Input className="border-gray-300 focus:border-yellow-400">

/* ✅ CORRECT */
<Input className="bg-background border-input text-foreground focus:border-primary focus:ring-primary">
```

**Verify:**

- Background: `bg-background`
- Border: `border-input`
- Text: `text-foreground`
- Placeholder: `placeholder:text-muted-foreground`
- Focus ring: `focus:ring-primary`
- Label: `text-foreground`
- Help text: `text-muted-foreground`

---

### ✅ Navigation (Sidebar/Topbar)

**Files to check:**

- `components/Sidebar.tsx`
- `components/Topbar.tsx`
- `app/dashboard/_components/AdminLayout.tsx`

**Common issues:**

```tsx
/* ❌ WRONG */
<nav className="bg-yellow-50">
  <a className="text-yellow-600 hover:bg-yellow-100">

/* ✅ CORRECT */
<nav className="bg-sidebar border-sidebar-border">
  <a className="text-sidebar-foreground hover:bg-sidebar-accent">
```

**Verify:**

- Background: `bg-sidebar`
- Text: `text-sidebar-foreground`
- Active item: `bg-sidebar-accent` or `text-sidebar-primary`
- Hover: `hover:bg-sidebar-accent`
- Border: `border-sidebar-border`

---

### ✅ Alerts & Toasts

**Files to check:**

- `components/ui/alert.tsx`
- Any toast/notification components

**Common issues:**

```tsx
/* ❌ WRONG */
<Alert className="bg-red-100 border-red-400 text-red-800">

/* ✅ CORRECT */
<Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive">
```

**Variants:**

- Error → `bg-destructive/10 border-destructive text-destructive`
- Success → `bg-success/10 border-success text-success`
- Warning → `bg-warning/10 border-warning text-warning`
- Info → `bg-info/10 border-info text-info`

---

### ✅ Dialogs & Modals

**Files to check:**

- `components/ui/dialog.tsx`
- `components/LeadDialog.tsx`
- All modal components

**Common issues:**

```tsx
/* ❌ WRONG */
<DialogContent className="bg-white">
  <DialogTitle className="text-black">

/* ✅ CORRECT */
<DialogContent className="bg-popover">
  <DialogTitle className="text-popover-foreground">
```

**Verify:**

- Background: `bg-popover`
- Text: `text-popover-foreground`
- Border: `border-border`
- Footer actions: Use button semantic tokens

---

### ✅ Charts

**Files to check:**

- All pages with charts (dashboard overview pages)
- Any custom chart components

**Verify charts use:**

```tsx
fill = "var(--chart-1)"; // Yellow
fill = "var(--chart-2)"; // Blue
fill = "var(--chart-3)"; // Green
fill = "var(--chart-4)"; // Orange
fill = "var(--chart-5)"; // Purple
```

**Not:**

```tsx
fill = "#facc15"; // ❌ Hardcoded
```

---

### ✅ Stat Cards / Metrics

**Files to check:**

- All dashboard pages (admin, CRM, HRM)
- Stat card components

**Recommended pattern:**

```tsx
<Card className="bg-card border-border">
  <CardContent className="p-6">
    <div className="flex items-center gap-4">
      {/* Icon with yellow accent */}
      <div className="p-3 bg-primary-100 rounded-lg">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Label</p>
        <h3 className="text-2xl font-bold text-foreground">Value</h3>
        <p className="text-sm text-success">Change indicator</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

### ✅ Loading States & Skeletons

**Files to check:**

- All `loading.tsx` files
- `components/skeletons/` directory

**Verify:**

```tsx
/* Skeleton should use muted colors */
<Skeleton className="h-4 w-24 bg-muted" />

/* Not hardcoded grays */
<Skeleton className="h-4 w-24 bg-gray-200" /> // ❌
```

---

## 🔧 Automated Migration

### Find & Replace Guide

Run these replacements across your codebase:

```bash
# Old yellow utilities → New semantic tokens
bg-primary-yellow       → bg-primary
text-primary-yellow     → text-primary
border-primary-yellow   → border-primary
hover:bg-primary-yellow → hover:bg-primary-600

bg-secondary-yellow     → bg-primary-100
bg-tertiary-yellow      → bg-primary-50

# Common gray utilities → Semantic tokens
bg-white                → bg-card (for cards)
bg-gray-50              → bg-secondary (for subtle backgrounds)
bg-gray-100             → bg-secondary
text-gray-900           → text-foreground
text-gray-500           → text-muted-foreground
text-gray-600           → text-muted-foreground
border-gray-200         → border-border
border-gray-300         → border-border

# Status colors
bg-green-500            → bg-success
text-green-500          → text-success
bg-red-500              → bg-destructive
text-red-500            → text-destructive
bg-yellow-500           → bg-warning
text-yellow-500         → text-warning
bg-blue-500             → bg-info
text-blue-500           → text-info
```

---

## 📝 File-by-File Checklist

### Priority Files (Check First)

- [ ] `app/globals.css` ✅ (Already updated)
- [ ] `components/ui/button.tsx`
- [ ] `components/ui/card.tsx`
- [ ] `components/ui/badge.tsx`
- [ ] `components/ui/input.tsx`
- [ ] `components/ui/table.tsx`
- [ ] `components/Sidebar.tsx`
- [ ] `components/Topbar.tsx`
- [ ] `app/dashboard/_components/AdminLayout.tsx`

### Dashboard Pages

**Education:**

- [ ] `app/dashboard/admin/page.tsx`
- [ ] `app/dashboard/admin/customers/page.tsx`

**CRM:**

- [ ] `app/dashboard/crm/page.tsx`
- [ ] `app/dashboard/crm/leads/page.tsx`
- [ ] `app/dashboard/crm/leads/leads-client.tsx`
- [ ] `app/dashboard/crm/logs/page.tsx`
- [ ] `app/dashboard/crm/admin/users/page.tsx`
- [ ] `components/LeadDialog.tsx`
- [ ] `components/LeadFilters.tsx`

**HRM:**

- [ ] `app/dashboard/hrm/super/page.tsx`
- [ ] `app/dashboard/hrm/super/people/page.tsx`
- [ ] `app/dashboard/hrm/super/criteria/page.tsx`
- [ ] `app/dashboard/hrm/admin/page.tsx`
- [ ] `app/dashboard/hrm/admin/overview/page.tsx`
- [ ] `app/dashboard/hrm/employee/page.tsx`
- [ ] `app/dashboard/hrm/employee/profile/page.tsx`

### Shared Components

- [ ] `components/DataTable.tsx`
- [ ] `components/AdminPageHeader.tsx`
- [ ] `components/RichTextEditor.tsx`
- [ ] `components/ChangePasswordForm.tsx`
- [ ] All `loading.tsx` files
- [ ] All skeleton components

### UI Components

- [ ] `components/ui/alert.tsx`
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/dropdown-menu.tsx`
- [ ] `components/ui/select.tsx`
- [ ] `components/ui/checkbox.tsx`
- [ ] `components/ui/radio-group.tsx`
- [ ] `components/ui/progress.tsx`
- [ ] `components/ui/avatar.tsx`
- [ ] `components/ui/calendar.tsx`

---

## 🧪 Testing Checklist

After migration, test these scenarios:

### Light Mode

- [ ] Page backgrounds are clean white/soft white
- [ ] Cards have clear visual separation
- [ ] Yellow CTAs stand out but aren't overwhelming
- [ ] Text is highly readable (dark on light)
- [ ] Borders are subtle but visible
- [ ] Hover states are clear

### Dark Mode

- [ ] Page backgrounds are dark but not pure black
- [ ] Cards have depth (slightly lighter than background)
- [ ] Yellow is softer/desaturated for comfort
- [ ] Text is bright white for contrast
- [ ] Borders are visible in dark context
- [ ] Status colors are bright enough

### Accessibility

- [ ] All text meets WCAG AA minimum (4.5:1)
- [ ] Primary buttons meet AAA (7:1)
- [ ] Focus states are clearly visible
- [ ] Status colors are distinguishable
- [ ] No color-only information (icons/text accompany)

### Interactive States

- [ ] Hover states change color appropriately
- [ ] Active/selected items use primary color
- [ ] Focus rings are visible (yellow)
- [ ] Disabled states are visually muted
- [ ] Loading states use muted colors

---

## 🎨 Visual Consistency Check

Ensure across all pages:

1. **Stat cards** all use same structure:
   - Icon in `bg-primary-100` with `text-primary-600`
   - Title in `text-muted-foreground`
   - Value in `text-foreground`
2. **Tables** all use:
   - Header: `bg-secondary`
   - Hover: `hover:bg-accent`
   - Borders: `border-border`

3. **Primary actions** all use:
   - `bg-primary text-primary-foreground hover:bg-primary-600`

4. **Status badges** consistent:
   - Same colors for same statuses across app
   - Active = Green, Pending = Yellow, Inactive = Red

---

## 🐛 Common Issues & Fixes

### Issue: "Yellow too bright/overwhelming"

**Fix:** You're likely using it for backgrounds. Use `bg-primary-50` or `bg-primary-100` instead of `bg-primary`.

### Issue: "Text not readable in dark mode"

**Fix:** Use `text-foreground` instead of hardcoded colors. It adapts.

### Issue: "Borders disappear in dark mode"

**Fix:** Use `border-border` which adapts to theme.

### Issue: "Focus ring not visible"

**Fix:** Ensure you're using `focus:ring-primary` not hardcoded colors.

### Issue: "Component doesn't support dark mode"

**Fix:** Remove fixed colors (white, black, grays) and use semantic tokens.

---

## 📊 Progress Tracking

```
Total components to audit: ~50
Completed: [ ] 0%

High Priority:
□ Buttons
□ Cards
□ Tables
□ Badges
□ Forms
□ Sidebar

Medium Priority:
□ Dialogs
□ Alerts
□ Charts
□ Stat Cards

Low Priority:
□ Skeletons
□ Minor UI components
```

---

## ✅ Definition of Done

A component is "migrated" when:

1. ✅ No hardcoded hex colors (`#facc15`, etc.)
2. ✅ No hardcoded Tailwind colors (`bg-yellow-400`, `text-gray-900`)
3. ✅ Uses semantic tokens (`bg-primary`, `text-foreground`, etc.)
4. ✅ Works in both light and dark modes
5. ✅ Passes accessibility contrast checks
6. ✅ Maintains visual hierarchy
7. ✅ Follows design system guidelines

---

## 🚀 Next Steps

1. **Start with high-priority components** (buttons, cards, tables)
2. **Test each change** in both light and dark modes
3. **Document any custom overrides** you need to make
4. **Review with the COLOR_SYSTEM_GUIDE.md** for best practices
5. **Run automated find/replace** for common patterns
6. **Manually review** critical user-facing components

---

**Good luck with the migration! The result will be a professional, consistent, accessible dashboard.** 🎨✨
