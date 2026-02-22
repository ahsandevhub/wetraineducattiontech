/**
 * THEME CUSTOMIZATION GUIDE
 * ========================
 *
 * This guide explains how to safely customize your application theme
 * using the centralized theme configuration system.
 */

/**
 * ARCHITECTURE OVERVIEW
 * =====================
 *
 * The theme system consists of 3 files working together:
 *
 * 1. /config/theme.ts
 *    - Master configuration file with all design tokens
 *    - Single source of truth for theme values
 *    - Organized by color, typography, spacing, radius
 *
 * 2. /tailwind.config.ts
 *    - Tailwind CSS configuration
 *    - References CSS variables for colors and radius
 *    - Defines font families and extends theme
 *
 * 3. /app/globals.css
 *    - CSS variables definition
 *    - Light mode (:root) and dark mode (.dark)
 *    - Auto-syncs with theme.ts values
 *
 * Flow: theme.ts → globals.css (CSS vars) → tailwind.config.ts → Components
 */

/**
 * HOW TO CHANGE THE PRIMARY COLOR SAFELY
 * =======================================
 *
 * The primary color is used throughout your app (buttons, links, focus states, etc.)
 *
 * STEP 1: Locate the color values
 * --------------------------------
 * Open: /config/theme.ts
 *
 * Find the colors section (around line 24-25):
 *   export const theme = {
 *     colors: {
 *       primary: "oklch(0.205 0 0)",
 *       primaryForeground: "oklch(0.985 0 0)",
 *       ...
 *
 * STEP 2: Update light mode primary color
 * ----------------------------------------
 * Change the primary value in light mode:
 *   primary: "oklch(0.205 0 0)",  ← Change this
 *
 * To a new OkLCh color:
 *   primary: "oklch(0.45 0.25 45)",  // Example: warm orange
 *
 * Also update primaryForeground for text contrast if needed:
 *   primaryForeground: "oklch(0.95 0 0)",  // Light text for dark bg
 *
 * STEP 3: Update dark mode primary color
 * ----------------------------------------
 * Scroll down to the "dark" section (around line 150-160)
 *
 * Find and update dark mode values:
 *   dark: {
 *     colors: {
 *       primary: "oklch(0.922 0 0)",      ← Dark mode primary
 *       primaryForeground: "oklch(0.205 0 0)",  ← Dark mode text
 *
 * STEP 4: Check your changes
 * ---------------------------
 * The globals.css file will automatically work with your changes because:
 * - tailwind.config.ts reads CSS variables from globals.css
 * - CSS variables are defined in globals.css to match your theme
 * - You don't need to manually update globals.css
 *
 * But if you want consistency, update globals.css:
 *   In /app/globals.css at :root section:
 *     --primary: oklch(0.45 0.25 45);  ← Match theme.ts
 *
 *   In .dark section:
 *     --primary: oklch(0.922 0 0);  ← Match theme.ts dark values
 *
 * STEP 5: Rebuild and test
 * -------------------------
 * Run: npm run build
 * Or: npm run dev
 *
 * The primary color will now appear:
 * - in all buttons                  (bg-primary)
 * - link focus states               (focus-ring)
 * - active navigation items
 * - brand accents
 */

/**
 * OKLCH COLOR FORMAT EXPLANATION
 * ===============================
 *
 * OkLCh is a modern color format that's perceptually uniform:
 * oklch(lightness saturation hue)
 *
 * Examples:
 * --------
 * oklch(1 0 0)              → Pure white (no saturation)
 * oklch(0 0 0)              → Pure black (no saturation)
 * oklch(0.5 0.2 0)          → Mid-gray red (50% lightness, red hue)
 * oklch(0.45 0.25 45)       → Orange (45% lightness, 25% saturation, 45° hue)
 *
 * Component Ranges:
 * ----------------
 * Lightness (L):   0 to 1      (0=black, 1=white)
 * Saturation (C):  0 to 0.4    (0=grayscale, 0.4=very vibrant)
 * Hue (H):         0 to 360    (0=red, 120=green, 240=blue)
 *
 * Tips for choosing colors:
 * -------------------------
 * - Keep saturation 0.15-0.25 for professional look
 * - Use lightness 0.4-0.6 for vibrant colors
 * - For dark mode, increase lightness (0.7-0.9)
 *
 * Online OkLCh generator: https://oklch.com/
 */

/**
 * CHANGING OTHER DESIGN TOKENS
 * =============================
 *
 * COLORS
 * ------
 * Secondary, accent, destructive, muted, etc. follow same pattern as primary
 *
 * Example - Change secondary color:
 * 1. Open /config/theme.ts
 * 2. Find: secondary: "oklch(0.97 0 0)"
 * 3. Change to new value
 * 4. Update dark.colors.secondary too
 *
 * BORDER RADIUS
 * ---------------
 * In /config/theme.ts, find the radius section:
 *
 *   radius: {
 *     sm: "calc(0.625rem - 4px)",   // 2.25px
 *     md: "calc(0.625rem - 2px)",   // 4.25px
 *     lg: "0.625rem",               // 6.25px (base)
 *     ...
 *
 * Change the --radius base value to adjust all radii:
 *   From: --radius: 0.625rem
 *   To:   --radius: 0.5rem  (for smaller corners)
 *
 * TYPOGRAPHY
 * -----------
 * Change fonts in /config/theme.ts typography section:
 *
 *   fontSans: ['Baloo Da 2', 'sans-serif'],
 *   fontMono: ['Monaco', 'monospace'],
 *
 * Then update /app/globals.css to import the new fonts:
 *
 *   @import url("https://fonts.googleapis.com/css2?family=YourFont:wght@400..800");
 *
 * SPACING
 * --------
 * Most apps don't need to change spacing values
 * But if needed, update in /config/theme.ts spacing section
 */

/**
 * CSS VARIABLES IN GLOBALS.CSS
 * ============================
 *
 * Important: Keep these in sync with theme.ts!
 *
 * Light Mode (:root):
 *   --background: oklch(1 0 0);          // Page background
 *   --foreground: oklch(0.145 0 0);      // Default text color
 *   --primary: oklch(0.205 0 0);         // Primary button color
 *   --secondary: oklch(0.97 0 0);        // Secondary elements
 *   --destructive: oklch(...);           // Error/delete buttons
 *   --muted: oklch(...);                 // Disabled/inactive
 *   --border: oklch(...);                // Border colors
 *   --input: oklch(...);                 // Input field background
 *   --ring: oklch(...);                  // Focus ring color
 *
 * Dark Mode (.dark):
 *   Same variables but with dark-appropriate values
 *   Applied when <html class="dark"> is added
 *
 * Usage in components:
 *   bg-background      // Uses --background CSS var
 *   text-foreground    // Uses --foreground CSS var
 *   bg-primary         // Uses --primary CSS var
 *   border-border      // Uses --border CSS var
 *   ring-ring          // Uses --ring CSS var
 */

/**
 * QUICK REFERENCE: COLORS USED BY SHADCN/UI
 * ===========================================
 *
 * background     - Page/card backgrounds
 * foreground     - Default text color
 * card           - Card backgrounds
 * popover        - Dropdown/tooltip backgrounds
 * primary        - Main CTA buttons, active states
 * secondary      - Secondary buttons, alternative actions
 * destructive    - Delete/error buttons
 * muted          - Disabled, placeholder, secondary text
 * accent         - Highlights, active navigation
 * border         - All borders
 * input          - Input field backgrounds
 * ring           - Focus rings (e.g., tabbing)
 * chart-1 to 5   - Chart colors (for data visualization)
 * sidebar-*      - Sidebar-specific colors (if using sidebar)
 */

/**
 * TESTING YOUR CHANGES
 * ====================
 *
 * After modifying theme.ts:
 *
 * 1. Rebuild: npm run build
 * 2. Check for errors (there should be none)
 * 3. Start dev: npm run dev
 * 4. Test in browser:
 *    - Check buttons (primary color visible)
 *    - Toggle dark mode (if implemented)
 *    - Check focus states (ring color)
 *    - Test on different pages
 *
 * Common issues:
 * - Colors don't update: Ensure CSS variables in globals.css match theme.ts
 * - Dark mode not working: Add "dark" class to <html> tag via JavaScript
 * - Build fails: Check OkLCh syntax (must be: oklch(L C H))
 */

/**
 * ADVANCED: CONDITIONAL COLORS
 * =============================
 *
 * If you need different colors for specific components:
 *
 * Option 1: Use Tailwind variants
 *   className="bg-primary dark:bg-primary/80"
 *
 * Option 2: Add custom CSS variables
 *   In globals.css :root:
 *     --component-bg: oklch(0.95 0 0);
 *   In your component:
 *     style={{ backgroundColor: 'var(--component-bg)' }}
 *
 * Option 3: Create new theme colors
 *   In theme.ts colors:
 *     brandPurple: "oklch(...)"
 *   In globals.css :root:
 *     --brand-purple: oklch(...);
 *   In tailwind.config.ts extend.colors:
 *     brandPurple: "var(--brand-purple)"
 */

export {}; // This file is documentation only
