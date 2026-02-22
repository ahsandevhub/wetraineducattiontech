# 🎨 Theme Implementation Reference - Code Examples

## Quick Start

All theme colors are defined in two synced systems:

```
/config/theme.ts ─────────────> Source of Truth
                ↓ (auto-sync)
/app/globals.css ──────────────> CSS Variables
                ↓
            shadcn/ui components use these variables
```

---

## 1. Using Colors in Components

### React/TSX Components

#### Buttons

```jsx
// Primary CTA - Yellow
<button className="bg-primary text-primary-foreground px-4 py-2 rounded">
  Get Started
</button>

// Secondary action
<button className="bg-secondary text-secondary-foreground px-4 py-2 rounded">
  Learn More
</button>

// Destructive (danger)
<button className="bg-destructive text-destructive-foreground px-4 py-2 rounded">
  Delete
</button>
```

#### Cards with Accents

```jsx
// Card with soft yellow hover
<div className="bg-card text-card-foreground hover:bg-accent rounded-lg p-4">
  <h3>Feature Card</h3>
  <p>This card has soft yellow on hover</p>
</div>
```

#### Focus Rings (Accessibility)

```jsx
// Auto-uses yellow focus ring via globals.css
<input
  className="border border-input rounded px-3 py-2 ring-2 ring-offset-2 ring-ring focus:ring-2"
  placeholder="Focus me"
/>
```

### CSS Directly

```css
/* Use CSS variables */
button {
  background-color: var(--primary);
  color: var(--primary-foreground);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
}

/* Dark mode automatically applied */
@media (prefers-color-scheme: dark) {
  body {
    background: var(--background);
    color: var(--foreground);
  }
}
```

---

## 2. Sidebar Components

### Light Mode Example

```jsx
<aside className="bg-sidebar text-sidebar-foreground">
  <nav>
    {/* Active item */}
    <a
      href="/dashboard"
      className="bg-sidebar-primary text-sidebar-primary-foreground px-4 py-2"
    >
      📊 Dashboard
    </a>

    {/* Inactive item */}
    <a
      href="/profile"
      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-4 py-2"
    >
      👤 Profile
    </a>

    {/* Border */}
    <hr className="border-sidebar-border" />
  </nav>
</aside>
```

### Visual Result (Light Mode)

```
┌─────────────────┐
│  Sidebar        │  ← soft warm white bg (oklch(0.98 0.02 97.5))
├─────────────────┤
│ 📊 Dashboard    │  ← yellow bg + dark text (active)
│ 👤 Profile      │  ← hover: soft yellow
│ ⚙️  Settings     │  ← hover: soft yellow
├─────────────────┤  ← subtle gray border
│   ...           │
└─────────────────┘
```

### Visual Result (Dark Mode)

```
┌─────────────────┐
│  Sidebar        │  ← deep dark bg (oklch(0.15 0 0))
├─────────────────┤
│ 📊 Dashboard    │  ← bright yellow text + dark bg (active) ✨
│ 👤 Profile      │  ← hover: muted yellow
│ ⚙️  Settings     │  ← hover: muted yellow
├─────────────────┤  ← subtle white border @ 8% opacity
│   ...           │
└─────────────────┘
```

---

## 3. Form Elements

### Input with Focus Ring

```jsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium text-foreground">
    Email
  </label>
  <input
    id="email"
    type="email"
    placeholder="Enter your email"
    className="
      w-full
      px-3 py-2
      border border-input
      rounded-md
      bg-input
      text-foreground
      placeholder:text-muted-foreground
      focus:outline-none
      focus:ring-2
      focus:ring-ring  /* Yellow focus ring */
      focus:ring-offset-2
      focus:ring-offset-background
    "
  />
</div>
```

**Result**: Clean input with yellow focus ring on focus state 🟨

### Select Dropdown

```jsx
<select className="px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## 4. Chart/Data Visualization

### React Chart Library Example

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const MyChart = () => {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis />
      <YAxis />

      {/* Primary line - Yellow */}
      <Line
        type="monotone"
        dataKey="revenue"
        stroke="var(--chart-1)" /* oklch(0.782 0.281 98.3) = Yellow */
        strokeWidth={2}
      />

      {/* Secondary line - Blue */}
      <Line
        type="monotone"
        dataKey="users"
        stroke="var(--chart-2)" /* oklch(0.6 0.222 265.4) = Blue */
        strokeWidth={2}
      />
    </LineChart>
  );
};
```

### Chart Color Reference

```javascript
const chartColors = {
  primary: "var(--chart-1)", // 🟨 Yellow - main metric
  secondary: "var(--chart-2)", // 🔵 Blue - comparison
  success: "var(--chart-3)", // 🟩 Green - positive
  warning: "var(--chart-4)", // 🟧 Amber - attention
  danger: "var(--chart-5)", // 🔴 Red - critical
};
```

---

## 5. Status Badges

```jsx
export function StatusBadge({ status } {
  const styles = {
    active: 'bg-chart-3 text-white',      // Green
    warning: 'bg-chart-4 text-black',     // Amber + dark text
    error: 'bg-chart-5 text-white',       // Red
    processing: 'bg-primary text-primary-foreground', // Yellow
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}
```

---

## 6. Dark Mode Toggle

```jsx
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-muted text-muted-foreground hover:bg-accent"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
```

---

## 7. Alert/Notification Components

### Info Alert

```jsx
<div className="bg-muted text-muted-foreground px-4 py-3 rounded-md border border-border">
  ℹ️ Information message
</div>
```

### Success Alert

```jsx
<div className="bg-chart-3 text-white px-4 py-3 rounded-md">
  ✓ Success message
</div>
```

### Warning Alert

```jsx
<div className="bg-chart-4 text-foreground px-4 py-3 rounded-md">
  ⚠️ Warning message
</div>
```

### Error Alert

```jsx
<div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-md">
  ✗ Error message
</div>
```

---

## 8. Breadcrumb Navigation

```jsx
<nav className="flex items-center gap-2 text-sm text-muted-foreground">
  <a href="/" className="hover:text-primary hover:underline">
    Home
  </a>
  <span>/</span>
  <a href="/products" className="hover:text-primary hover:underline">
    Products
  </a>
  <span>/</span>
  <span className="text-foreground font-medium">Product Detail</span>
</nav>
```

**Yellow hover state** makes navigation interactive and branded ✨

---

## 9. Loading States

### Spinner with Yellow

```jsx
export function LoadingSpinner() {
  return (
    <div className="inline-block">
      <div
        className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin"
        style={{ borderTopColor: "var(--primary)" }}
      />
    </div>
  );
}
```

### Progress Bar

```jsx
<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
  <div className="h-full bg-primary rounded-full" style={{ width: "65%" }} />
</div>
```

---

## 10. Modal/Dialog

```jsx
export function Modal({ isOpen, onClose, children }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card text-card-foreground rounded-lg p-6 shadow-lg max-w-md">
            <h2 className="text-lg font-semibold mb-4">{children}</h2>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-primary text-primary-foreground">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 11. Color Palette Usage Chart

### Light Mode Components

| Component        | Background     | Text                     | Hover              | Border                        |
| ---------------- | -------------- | ------------------------ | ------------------ | ----------------------------- |
| Primary Button   | `--primary` 🟨 | `--primary-foreground`   | N/A                | None                          |
| Secondary Button | `--secondary`  | `--secondary-foreground` | `--accent`         | `--border`                    |
| Input Field      | `--input`      | `--foreground`           | None               | `--border` focus: `--ring` 🟨 |
| Card             | `--card`       | `--card-foreground`      | `--accent`         | `--border`                    |
| Sidebar Item     | `--sidebar`    | `--sidebar-foreground`   | `--sidebar-accent` | `--sidebar-border`            |
| Badge (success)  | `--chart-3`    | white                    | -                  | -                             |

### Dark Mode Components

| Component        | Background     | Text                   | Hover      | Border                              |
| ---------------- | -------------- | ---------------------- | ---------- | ----------------------------------- |
| Primary Button   | `--primary` 🟨 | `--primary-foreground` | N/A        | None                                |
| Card             | `--card`       | `--card-foreground`    | `--accent` | `--border`                          |
| Input            | `--input`      | `--foreground`         | None       | `--border` focus: `--ring` 🟨       |
| Sidebar (active) | None           | N/A                    | N/A        | Highlight in `--sidebar-primary` 🟨 |

---

## 12. Typography Levels

```jsx
// Headlines
<h1 className="text-4xl font-bold text-foreground">Main Title</h1>

// Subheading
<h2 className="text-2xl font-semibold text-foreground">Section</h2>

// Body
<p className="text-base text-foreground leading-relaxed">
  Regular paragraph text with good readability.
</p>

// Secondary Text
<span className="text-sm text-muted-foreground">Helper text</span>

// Highlighted
<a href="#" className="text-primary hover:underline">
  Link (yellow with underline on hover)
</a>
```

---

## 13. Practical Dashboard Example

```jsx
export function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-3 gap-4">
        {/* Stat Card with Yellow accent */}
        <div className="bg-card p-4 rounded-lg border border-border hover:border-primary">
          <p className="text-muted-foreground text-sm">Revenue</p>
          <p className="text-3xl font-bold text-primary">$12.5K</p>
        </div>

        {/* Chart Card */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm font-medium mb-4">Trend</p>
          {/* Chart component with var(--chart-1) = yellow */}
        </div>

        {/* Action Area */}
        <div className="bg-accent rounded-lg p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <button className="w-full bg-primary text-primary-foreground py-2 rounded font-medium">
            Create New
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 14. Color Variables Reference

### Quick Lookup

```css
/* Use these in any component */
background: var(--background);
foreground: var(--foreground);
primary: var(--primary); /* 🟨 Yellow */
primary-foreground: var(--primary-foreground);
accent: var(--accent); /* Soft yellow hover */
border: var(--border);
ring: var(--ring); /* 🟨 Yellow focus */

/* Charts */
chart-1: var(--chart-1); /* 🟨 Yellow */
chart-2: var(--chart-2); /* 🔵 Blue */
chart-3: var(--chart-3); /* 🟩 Green */
chart-4: var(--chart-4); /* 🟧 Amber */
chart-5: var(--chart-5); /* 🔴 Red */

/* Sidebar */
sidebar: var(--sidebar);
sidebar-primary: var(--sidebar-primary); /* 🟨 Yellow */
sidebar-accent: var(--sidebar-accent);
```

---

## 15. Don't Do This! ❌

```jsx
// ❌ WRONG - Hardcoded color
<button style={{ backgroundColor: '#facc15' }}>Bad</button>

// ✅ CORRECT - Use theme variable
<button className="bg-primary">Good</button>

// ❌ WRONG - Old system reference
<div className="bg-tertiary-yellow">Outdated</div>

// ✅ CORRECT - New system
<div className="bg-accent">Updated</div>

// ❌ WRONG - Mixing themes
<div className="bg-primary hover:bg-blue-500">Inconsistent</div>

// ✅ CORRECT - Consistent theming
<div className="bg-primary hover:bg-accent">Themeable</div>
```

---

## 🎯 Key Takeaways

1. **Always use CSS variables** - Never hardcode colors
2. **Primary yellow is for CTAs** - Not for text or large backgrounds
3. **Use semantic colors** - chart-3 for success, chart-5 for danger
4. **Accent for hover** - Soft yellow for interactive states
5. **Dark mode is automatic** - The .dark class handles it
6. **Sidebar has special colors** - Use sidebar-\* variables not regular ones
7. **Focus rings are yellow** - For accessibility and branding

---

**Last Updated**: February 22, 2026  
**Theme Version**: 2.0 (Yellow SaaS Premium)  
**Status**: ✅ Ready to Use
