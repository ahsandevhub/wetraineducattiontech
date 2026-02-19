/**
 * Global Theme Configuration
 *
 * Centralized theme management for the application.
 * All design tokens (colors, radius, typography, spacing) are defined here.
 *
 * To customize the theme:
 * 1. Modify values in this file
 * 2. No need to update globals.css - it auto-syncs via CSS variables
 * 3. Changes apply globally across all components
 *
 * Color Format: OkLCh (oklch) for perceptually uniform colors
 * - oklch(lightness saturation hue)
 * - lightness: 0-1 (0=black, 1=white)
 * - saturation: 0-0.4 (0=grayscale, 0.4=vibrant)
 * - hue: 0-360 (color angle)
 */

export const theme = {
  // ==================== COLORS ====================
  colors: {
    // Core Colors
    primary: "oklch(0.205 0 0)",
    primaryForeground: "oklch(0.985 0 0)",
    secondary: "oklch(0.97 0 0)",
    secondaryForeground: "oklch(0.205 0 0)",

    // Neutral Colors
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    popoverForeground: "oklch(0.145 0 0)",
    muted: "oklch(0.97 0 0)",
    mutedForeground: "oklch(0.556 0 0)",

    // Interactive Colors
    accent: "oklch(0.97 0 0)",
    accentForeground: "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",

    // UI Element Colors
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)",

    // Chart Colors (5-color palette)
    chart: {
      "1": "oklch(0.646 0.222 41.116)",
      "2": "oklch(0.6 0.118 184.704)",
      "3": "oklch(0.398 0.07 227.392)",
      "4": "oklch(0.828 0.189 84.429)",
      "5": "oklch(0.769 0.188 70.08)",
    },

    // Sidebar Colors
    sidebar: {
      base: "oklch(0.985 0 0)",
      foreground: "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      accent: "oklch(0.97 0 0)",
      accentForeground: "oklch(0.205 0 0)",
      border: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
    },

    // Custom Brand Colors (non-shadcn)
    brandYellow: {
      primary: "#facc15",
      secondary: "#eccf4f",
      tertiary: "#fbf8f0",
    },
  },

  // ==================== RADIUS ====================
  radius: {
    sm: "calc(0.625rem - 4px)", // 2.25px
    md: "calc(0.625rem - 2px)", // 4.25px
    lg: "0.625rem", // 6.25px (base)
    xl: "calc(0.625rem + 4px)", // 10.25px
    "2xl": "calc(0.625rem + 8px)", // 14.25px
    "3xl": "calc(0.625rem + 12px)", // 18.25px
    "4xl": "calc(0.625rem + 16px)", // 22.25px
  },

  // ==================== TYPOGRAPHY ====================
  typography: {
    fontSans: ["Baloo Da 2", "sans-serif"],
    fontMono: ["Monaco", "monospace"],
    fontHeading: ["Baloo Da 2", "sans-serif"],

    // Font weights
    weights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    // Font sizes (rem-based, relative to 16px base)
    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },

    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // ==================== SPACING ====================
  spacing: {
    "0": "0px",
    p: "0.25rem", // 4px
    "1.5": "0.375rem", // 6px
    "2.5": "0.625rem", // 10px
    "3.5": "0.875rem", // 14px
    "5.5": "1.375rem", // 22px
    "6.5": "1.625rem", // 26px
    "7": "1.75rem", // 28px
    "8": "2rem", // 32px
    "9": "2.25rem", // 36px
    "10": "2.5rem", // 40px
    "11": "2.75rem", // 44px
    "12": "3rem", // 48px
    "13": "3.25rem", // 52px
    "14": "3.5rem", // 56px
    "15": "3.75rem", // 60px
    "16": "4rem", // 64px
  },

  // ==================== DARK MODE OVERRIDES ====================
  dark: {
    colors: {
      primary: "oklch(0.922 0 0)",
      primaryForeground: "oklch(0.205 0 0)",
      secondary: "oklch(0.269 0 0)",
      secondaryForeground: "oklch(0.985 0 0)",

      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      cardForeground: "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      popoverForeground: "oklch(0.985 0 0)",
      muted: "oklch(0.269 0 0)",
      mutedForeground: "oklch(0.708 0 0)",

      accent: "oklch(0.269 0 0)",
      accentForeground: "oklch(0.985 0 0)",
      destructive: "oklch(0.704 0.191 22.216)",

      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.556 0 0)",

      chart: {
        "1": "oklch(0.488 0.243 264.376)",
        "2": "oklch(0.696 0.17 162.48)",
        "3": "oklch(0.769 0.188 70.08)",
        "4": "oklch(0.627 0.265 303.9)",
        "5": "oklch(0.645 0.246 16.439)",
      },

      sidebar: {
        base: "oklch(0.205 0 0)",
        foreground: "oklch(0.985 0 0)",
        primary: "oklch(0.488 0.243 264.376)",
        primaryForeground: "oklch(0.985 0 0)",
        accent: "oklch(0.269 0 0)",
        accentForeground: "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        ring: "oklch(0.556 0 0)",
      },
    },
  },
} as const;

/**
 * Type export for use in other files
 */
export type Theme = typeof theme;
