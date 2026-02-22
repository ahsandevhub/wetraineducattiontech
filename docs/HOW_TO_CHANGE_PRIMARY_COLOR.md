# How to Safely Change the Primary Color - Step by Step

## The Process (3 Easy Steps)

```
config/theme.ts                    globals.css
       ↓                                  ↓
Light & Dark Mode Values  →  CSS Variables (:root & .dark)
       ↓
tailwind.config.ts (reads CSS vars)
       ↓
Tailwind generates utilities (bg-primary, text-primary, etc.)
       ↓
Components get updated color globally
```

---

## Step-by-Step Example: Changing Primary to Orange

### Option A: Copy-Paste Method (Recommended)

**File 1: `/config/theme.ts`**

Find this section (around line 24-25):

```typescript
export const theme = {
  colors: {
    primary: "oklch(0.205 0 0)",           // ← CHANGE THIS (Light Mode)
    primaryForeground: "oklch(0.985 0 0)",
    ...
```

Change to:

```typescript
export const theme = {
  colors: {
    primary: "oklch(0.45 0.25 45)",        // ← New orange light mode
    primaryForeground: "oklch(0.95 0 0)",  // ← Lighter text for readability
    ...
```

Then find dark mode section (around line 150-160):

```typescript
dark: {
  colors: {
    primary: "oklch(0.922 0 0)",           // ← CHANGE THIS (Dark Mode)
    primaryForeground: "oklch(0.205 0 0)",
    ...
```

Change to:

```typescript
dark: {
  colors: {
    primary: "oklch(0.85 0.2 45)",        // ← New orange dark mode (lighter)
    primaryForeground: "oklch(0.15 0 0)",  // ← Dark text for readability
    ...
```

**File 2: `/app/globals.css`**

Find `:root` section (around line 36):

```css
:root {
  /* ... other vars ... */
  --primary: oklch(0.205 0 0);            // ← CHANGE THIS
  --primary-foreground: oklch(0.985 0 0);
  ...
}
```

Change to:

```css
:root {
  /* ... other vars ... */
  --primary: oklch(0.45 0.25 45);         // ← Match theme.ts light
  --primary-foreground: oklch(0.95 0 0);
  ...
}
```

Find `.dark` section (around line 100):

```css
.dark {
  --primary: oklch(0.922 0 0);            // ← CHANGE THIS
  --primary-foreground: oklch(0.205 0 0);
  ...
}
```

Change to:

```css
.dark {
  --primary: oklch(0.85 0.2 45);          // ← Match theme.ts dark
  --primary-foreground: oklch(0.15 0 0);
  ...
}
```

**Step 3: Rebuild and test**

```bash
npm run build
npm run dev
```

---

## Color Examples for Quick Reference

### Professional Colors

**Blue (Tech Brand)**

- Light: `oklch(0.45 0.25 250)`
- Dark: `oklch(0.85 0.2 250)`

**Green (Success/Growth)**

- Light: `oklch(0.45 0.25 150)`
- Dark: `oklch(0.85 0.2 150)`

**Purple (Premium)**

- Light: `oklch(0.45 0.25 280)`
- Dark: `oklch(0.85 0.2 280)`

**Orange (Warm Brand)**

- Light: `oklch(0.45 0.25 45)`
- Dark: `oklch(0.85 0.2 45)`

**Red (Warning/Error)**

- Light: `oklch(0.45 0.25 30)`
- Dark: `oklch(0.85 0.2 30)`

### Text Colors for All Primary Colors

- **Light primary background**: Use `oklch(0.95 0 0)` for contrast
- **Dark primary background**: Use `oklch(0.15 0 0)` for contrast

---

## Where Primary Color Appears

When you change the primary color, it affects:

1. **Buttons**
   - `bg-primary` - Main buttons
   - `border-primary` - Primary borders
   - `text-primary` - Primary text color

2. **Interactive Elements**
   - Links when active
   - Selected checkboxes
   - Active tabs
   - Toggle switches (on state)

3. **Focus States**
   - Some focus rings default to primary

4. **Navigation**
   - Active navigation items
   - Active menu items
   - Selected list items

5. **Indicators**
   - Progress bars
   - Status indicators
   - Loading spinners

---

## Verification Checklist

After making changes:

- [ ] Light mode primary shows in buttons
- [ ] Dark mode primary shows when dark mode is enabled
- [ ] Text on primary buttons is readable (high contrast)
- [ ] All pages still work (no broken styling)
- [ ] Build completes without errors
- [ ] No console errors in browser

---

## Troubleshooting

**Problem: Color doesn't update**

```
Solution:
1. Did you update BOTH light and dark in theme.ts? ✓
2. Did you update BOTH :root and .dark in globals.css? ✓
3. Did you rebuild (npm run build)? ✓
4. Did you clear browser cache? ✓
```

**Problem: Text is unreadable on primary button**

```
Solution:
- Check primaryForeground value in theme.ts
- Should be opposite of primary lightness
- If primary is dark (0.45), primaryForeground should be light (0.95)
- If primary is light (0.85), primaryForeground should be dark (0.15)
```

**Problem: Build fails with color error**

```
Solution:
- Check OkLCh syntax: oklch(L C H) with spaces
- L (lightness): 0 to 1
- C (saturation): 0 to 0.4
- H (hue): 0 to 360
Example: oklch(0.45 0.25 45) ✓
Example: oklch(0.45,0.25,45) ✗ (wrong - commas)
```

---

## Quick Decision Template

**When choosing a primary color:**

1. **Pick your hue** (0-360)
   - 0 = Red
   - 45 = Orange
   - 120 = Green
   - 240 = Blue
   - 280 = Purple

2. **Light mode settings**
   - Lightness: 0.45 (medium)
   - Saturation: 0.25 (professional)

3. **Dark mode settings**
   - Lightness: 0.85 (light)
   - Saturation: 0.2 (slightly muted)

4. **Text colors**
   - Light primary (0.45) needs light text (0.95)
   - Dark primary (0.85) needs dark text (0.15)

**Example for blue brand:**

```
Light mode primary: oklch(0.45 0.25 250)
Dark mode primary: oklch(0.85 0.2 250)
Light mode text: oklch(0.95 0 0)
Dark mode text: oklch(0.15 0 0)
```

---

## Advanced: Multiple Accent Colors

If you want different accent colors for different sections:

1. Keep using `--primary` for your main brand
2. Add custom CSS variables for section-specific colors
3. In `globals.css`:
   ```css
   :root {
     --primary: oklch(0.45 0.25 250);  // Main blue
     --accent-red: oklch(0.45 0.25 30); // Error sections
     --accent-green: oklch(0.45 0.25 150); // Success sections
   }
   ```
4. In `tailwind.config.ts`:
   ```typescript
   accentRed: "var(--accent-red)",
   accentGreen: "var(--accent-green)",
   ```
5. Use in components:
   ```jsx
   <button className="bg-accent-red">Delete</button>
   <button className="bg-accent-green">Save</button>
   ```

---

## Summary

**Changing primary color is safe because:**

- ✅ Contained to theme.ts and globals.css
- ✅ Doesn't affect component code
- ✅ Automatically applies everywhere
- ✅ Easy to revert (undo your edits)
- ✅ Build process validates syntax

**Best practice workflow:**

1. Edit theme.ts
2. Edit globals.css to match
3. npm run build
4. Test in browser
5. Deploy with confidence!
