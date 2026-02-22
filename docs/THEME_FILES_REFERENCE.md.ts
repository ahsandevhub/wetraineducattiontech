/**
 * QUICK FILE REFERENCE
 * ====================
 *
 * This file shows the final structure of the three key theme files.
 * Use as reference when making customizations.
 */

/**
 * FILE 1: /config/theme.ts
 * ========================
 *
 * Structure (first 100 lines):
 *
 * export const theme = {
 *   colors: {
 *     primary: "oklch(0.205 0 0)",
 *     primaryForeground: "oklch(0.985 0 0)",
 *     secondary: "oklch(0.97 0 0)",
 *     secondaryForeground: "oklch(0.205 0 0)",
 *     background: "oklch(1 0 0)",
 *     foreground: "oklch(0.145 0 0)",
 *     card: "oklch(1 0 0)",
 *     cardForeground: "oklch(0.145 0 0)",
 *     popover: "oklch(1 0 0)",
 *     popoverForeground: "oklch(0.145 0 0)",
 *     muted: "oklch(0.97 0 0)",
 *     mutedForeground: "oklch(0.556 0 0)",
 *     accent: "oklch(0.97 0 0)",
 *     accentForeground: "oklch(0.205 0 0)",
 *     destructive: "oklch(0.577 0.245 27.325)",
 *     border: "oklch(0.922 0 0)",
 *     input: "oklch(0.922 0 0)",
 *     ring: "oklch(0.708 0 0)",
 *     chart: { "1": "...", "2": "...", ... },
 *     sidebar: { ... },
 *     brandYellow: { primary: "#facc15", ... },
 *   },
 *   radius: {
 *     sm: "calc(0.625rem - 4px)",
 *     md: "calc(0.625rem - 2px)",
 *     lg: "0.625rem",
 *     xl: "calc(0.625rem + 4px)",
 *     ...
 *   },
 *   typography: {
 *     fontSans: ['Baloo Da 2', 'sans-serif'],
 *     fontMono: ['Monaco', 'monospace'],
 *     fontHeading: ['Baloo Da 2', 'sans-serif'],
 *     weights: { ... },
 *     sizes: { ... },
 *     lineHeights: { ... },
 *   },
 *   spacing: { ... },
 *   dark: {
 *     colors: { ... }  // Dark mode overrides
 *   },
 * }
 *
 * CUSTOMIZE BY:
 * - Changing color values (e.g., "oklch(0.205 0 0)" to "oklch(0.45 0.25 45)")
 * - Adjusting font families
 * - Modifying border radius calculations
 * - Adding custom color tokens
 */

/**
 * FILE 2: /tailwind.config.ts
 * ===========================
 *
 * Key sections:
 *
 * export default {
 *   darkMode: "class" as const,  // Dark mode via .dark class
 *   content: [
 *     './app/**\/*.{js,ts,jsx,tsx,mdx}',
 *     './components/**\/*.{js,ts,jsx,tsx,mdx}',
 *     './lib/**\/*.{js,ts,jsx,tsx,mdx}',
 *   ],
 *   theme: {
 *     extend: {
 *       colors: {
 *         background: "var(--background)",
 *         foreground: "var(--foreground)",
 *         card: {
 *           DEFAULT: "var(--card)",
 *           foreground: "var(--card-foreground)",
 *         },
 *         primary: {
 *           DEFAULT: "var(--primary)",
 *           foreground: "var(--primary-foreground)",
 *         },
 *         secondary: { ... },
 *         muted: { ... },
 *         accent: { ... },
 *         destructive: { ... },
 *         border: "var(--border)",
 *         input: "var(--input)",
 *         ring: "var(--ring)",
 *         chart: { "1": "var(--chart-1)", ... },
 *         sidebar: { ... },
 *       },
 *       borderRadius: {
 *         lg: "var(--radius-lg)",
 *         md: "calc(var(--radius-md))",
 *         sm: "calc(var(--radius-sm))",
 *         ...
 *       },
 *       fontFamily: {
 *         sans: ["Baloo Da 2", "sans-serif"],
 *         mono: ["Monaco", "monospace"],
 *         heading: ["Baloo Da 2", "sans-serif"],
 *       },
 *     },
 *   },
 * }
 *
 * CUSTOMIZE BY:
 * - Never manually edit color values (keep as var(--name))
 * - Add new color tokens in extend.colors
 * - Modify border radius formulas if needed
 * - Add font family variations
 */

/**
 * FILE 3: /app/globals.css (Relevant sections)
 * ============================================
 *
 * Light Mode (:root):
 *
 * :root {
 *   --primary-yellow: #facc15;
 *   --secondary-yellow: #eccf4f;
 *   --tertiary-yellow: #fbf8f0;
 *   --radius: 0.625rem;
 *
 *   --background: oklch(1 0 0);
 *   --foreground: oklch(0.145 0 0);
 *   --card: oklch(1 0 0);
 *   --card-foreground: oklch(0.145 0 0);
 *   --popover: oklch(1 0 0);
 *   --popover-foreground: oklch(0.145 0 0);
 *
 *   --primary: oklch(0.205 0 0);
 *   --primary-foreground: oklch(0.985 0 0);
 *   --secondary: oklch(0.97 0 0);
 *   --secondary-foreground: oklch(0.205 0 0);
 *   --muted: oklch(0.97 0 0);
 *   --muted-foreground: oklch(0.556 0 0);
 *   --accent: oklch(0.97 0 0);
 *   --accent-foreground: oklch(0.205 0 0);
 *   --destructive: oklch(0.577 0.245 27.325);
 *
 *   --border: oklch(0.922 0 0);
 *   --input: oklch(0.922 0 0);
 *   --ring: oklch(0.708 0 0);
 *
 *   --chart-1: oklch(0.646 0.222 41.116);
 *   --chart-2: oklch(0.6 0.118 184.704);
 *   --chart-3: oklch(0.398 0.07 227.392);
 *   --chart-4: oklch(0.828 0.189 84.429);
 *   --chart-5: oklch(0.769 0.188 70.08);
 *
 *   --sidebar: oklch(0.985 0 0);
 *   --sidebar-foreground: oklch(0.145 0 0);
 *   --sidebar-primary: oklch(0.205 0 0);
 *   --sidebar-primary-foreground: oklch(0.985 0 0);
 *   --sidebar-accent: oklch(0.97 0 0);
 *   --sidebar-accent-foreground: oklch(0.205 0 0);
 *   --sidebar-border: oklch(0.922 0 0);
 *   --sidebar-ring: oklch(0.708 0 0);
 * }
 *
 * Dark Mode (.dark):
 *
 * .dark {
 *   --background: oklch(0.145 0 0);
 *   --foreground: oklch(0.985 0 0);
 *   --card: oklch(0.205 0 0);
 *   --card-foreground: oklch(0.985 0 0);
 *   --popover: oklch(0.205 0 0);
 *   --popover-foreground: oklch(0.985 0 0);
 *
 *   --primary: oklch(0.922 0 0);
 *   --primary-foreground: oklch(0.205 0 0);
 *   --secondary: oklch(0.269 0 0);
 *   --secondary-foreground: oklch(0.985 0 0);
 *   --muted: oklch(0.269 0 0);
 *   --muted-foreground: oklch(0.708 0 0);
 *   --accent: oklch(0.269 0 0);
 *   --accent-foreground: oklch(0.985 0 0);
 *   --destructive: oklch(0.704 0.191 22.216);
 *
 *   --border: oklch(1 0 0 / 10%);
 *   --input: oklch(1 0 0 / 15%);
 *   --ring: oklch(0.556 0 0);
 *
 *   --chart-1: oklch(0.488 0.243 264.376);
 *   --chart-2: oklch(0.696 0.17 162.48);
 *   --chart-3: oklch(0.769 0.188 70.08);
 *   --chart-4: oklch(0.627 0.265 303.9);
 *   --chart-5: oklch(0.645 0.246 16.439);
 *
 *   --sidebar: oklch(0.205 0 0);
 *   --sidebar-foreground: oklch(0.985 0 0);
 *   --sidebar-primary: oklch(0.488 0.243 264.376);
 *   --sidebar-primary-foreground: oklch(0.985 0 0);
 *   --sidebar-accent: oklch(0.269 0 0);
 *   --sidebar-accent-foreground: oklch(0.985 0 0);
 *   --sidebar-border: oklch(1 0 0 / 10%);
 *   --sidebar-ring: oklch(0.556 0 0);
 * }
 *
 * CUSTOMIZE BY:
 * - Update --primary value to match config/theme.ts
 * - Update both :root and .dark sections
 * - Keep OkLCh format consistent
 */

/**
 * FILE 4: /components.json (Update note)
 * =====================================
 *
 * Just need to ensure:
 *
 * {
 *   "tailwind": {
 *     "config": "tailwind.config.ts",  // ← Points to our config
 *     "css": "app/globals.css",
 *     "cssVariables": true,
 *   }
 * }
 *
 * This ensures new shadcn components use your custom theme.
 */

/**
 * SYNCHRONIZATION GUIDE
 * ====================
 *
 * To keep everything in sync:
 *
 * 1. Primary changes go in config/theme.ts
 *    (This is where you make decisions)
 *
 * 2. Must also update globals.css CSS variables
 *    (These must match theme.ts values)
 *
 * 3. tailwind.config.ts references globals.css
 *    (Should NOT be manually edited for colors)
 *
 * Example Flow - Changing Primary Color to Orange:
 * ------------------------------------------------
 *
 * Step 1 - config/theme.ts:
 *   primary: "oklch(0.45 0.25 45)",  // ← Orange
 *
 * Step 2 - globals.css :root:
 *   --primary: oklch(0.45 0.25 45);  // ← Must match
 *
 * Step 3 - config/theme.ts dark:
 *   primary: "oklch(0.85 0.2 45)",  // ← Light orange for dark
 *
 * Step 4 - globals.css .dark:
 *   --primary: oklch(0.85 0.2 45);  // ← Must match
 *
 * Step 5 - Rebuild:
 *   npm run build
 *
 * Done! All components using bg-primary now show orange.
 */

/**
 * COMPONENT USAGE EXAMPLES
 * =======================
 *
 * After setup, components use colors like this:
 *
 * Light Mode (default):
 *   <button className="bg-primary text-primary-foreground">
 *     Click Me  // Shows dark button with light text
 *   </button>
 *
 * Dark Mode:
 *   <button className="bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground">
 *     Click Me  // Colors auto-adjust when .dark class is on
 *   </button>
 *
 * Card Backgrounds:
 *   <div className="bg-card text-card-foreground">
 *     Uses CSS variables for universal styling
 *   </div>
 *
 * Focus States:
 *   <input className="focus:ring-2 focus:ring-ring">
 *     Focuses with your custom ring color
 *   </input>
 */

export {};
