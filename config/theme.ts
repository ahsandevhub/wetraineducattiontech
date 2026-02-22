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
    // Premium SaaS Yellow-based Color System
    // Primary: #facc15 (yellow-400) → oklch(0.782 0.281 98.3)

    // Core Colors - Yellow as Primary Brand
    primary: "oklch(0.782 0.281 98.3)", // #facc15 - vibrant yellow for CTAs
    primaryForeground: "oklch(0.145 0 0)", // dark text on yellow
    secondary: "oklch(0.97 0 0)", // light gray background
    secondaryForeground: "oklch(0.205 0 0)", // dark text on light

    // Neutral Colors - Clean SaaS aesthetic
    background: "oklch(1 0 0)", // pure white
    foreground: "oklch(0.145 0 0)", // near-black for text
    card: "oklch(1 0 0)", // white cards
    cardForeground: "oklch(0.145 0 0)", // dark text
    popover: "oklch(1 0 0)", // white popovers
    popoverForeground: "oklch(0.145 0 0)", // dark text
    muted: "oklch(0.975 0 0)", // very light backgrounds
    mutedForeground: "oklch(0.556 0 0)", // medium gray text

    // Interactive Colors - Soft yellow accents
    accent: "oklch(0.945 0.095 97.5)", // soft yellow for hover/backgrounds
    accentForeground: "oklch(0.205 0 0)", // dark text on light yellow
    destructive: "oklch(0.577 0.245 27.325)", // red for danger

    // UI Element Colors - Premium minimalist
    border: "oklch(0.92 0 0)", // subtle light gray border
    input: "oklch(0.97 0 0)", // light input backgrounds
    ring: "oklch(0.782 0.281 98.3)", // yellow focus ring (matches primary)

    // Chart Colors (5-color palette optimized for dark backgrounds)
    chart: {
      "1": "oklch(0.782 0.281 98.3)", // yellow (primary)
      "2": "oklch(0.6 0.222 265.4)", // blue (complementary cool)
      "3": "oklch(0.72 0.18 142.5)", // green (success)
      "4": "oklch(0.72 0.245 70.1)", // amber (warning)
      "5": "oklch(0.635 0.237 27.325)", // red (danger)
    },

    // Sidebar Colors - Subtle yellow branding
    sidebar: {
      base: "oklch(0.98 0.02 97.5)", // very soft warm white
      foreground: "oklch(0.145 0 0)", // dark text
      primary: "oklch(0.782 0.281 98.3)", // yellow highlight for active
      primaryForeground: "oklch(0.145 0 0)", // dark text on yellow
      accent: "oklch(0.945 0.095 97.5)", // soft yellow hover state
      accentForeground: "oklch(0.205 0 0)", // dark text
      border: "oklch(0.92 0 0)", // light border
      ring: "oklch(0.782 0.281 98.3)", // yellow focus ring
    },

    // Custom Brand Colors (non-shadcn) - Removed redundant secondary/tertiary
    brandYellow: {
      primary: "#facc15", // oklch(0.782 0.281 98.3)
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
      // Dark mode: Yellow remains vibrant for CTAs
      primary: "oklch(0.782 0.281 98.3)", // bright yellow on dark
      primaryForeground: "oklch(0.145 0 0)", // dark text keeps good contrast
      secondary: "oklch(0.25 0 0)", // very dark gray
      secondaryForeground: "oklch(0.985 0 0)", // light text

      // Deep neutral backgrounds
      background: "oklch(0.1 0 0)", // near-black background
      foreground: "oklch(0.985 0 0)", // near-white text
      card: "oklch(0.15 0 0)", // deep dark cards
      cardForeground: "oklch(0.985 0 0)", // light text
      popover: "oklch(0.15 0 0)", // deep dark popovers
      popoverForeground: "oklch(0.985 0 0)", // light text
      muted: "oklch(0.25 0 0)", // muted dark backgrounds
      mutedForeground: "oklch(0.708 0 0)", // medium gray text

      // Muted yellow accents in dark mode
      accent: "oklch(0.35 0.1 97.5)", // toned-down yellow for dark backgrounds
      accentForeground: "oklch(0.985 0 0)", // light text
      destructive: "oklch(0.704 0.191 22.216)", // red adjusted for dark

      // UI elements with subtle tones
      border: "oklch(1 0 0 / 8%)", // very subtle white border on dark
      input: "oklch(1 0 0 / 12%)", // subtle input background
      ring: "oklch(0.782 0.281 98.3)", // yellow focus ring for visibility

      // Chart Colors (optimized for dark mode)
      chart: {
        "1": "oklch(0.782 0.281 98.3)", // yellow (bright for dark backgrounds)
        "2": "oklch(0.6 0.222 265.4)", // blue (cool tone)
        "3": "oklch(0.72 0.18 142.5)", // green (muted success)
        "4": "oklch(0.72 0.245 70.1)", // amber (warning)
        "5": "oklch(0.635 0.237 27.325)", // red (danger)
      },

      // Sidebar Colors for dark mode
      sidebar: {
        base: "oklch(0.15 0 0)", // dark sidebar background
        foreground: "oklch(0.985 0 0)", // light text
        primary: "oklch(0.782 0.281 98.3)", // bright yellow for active items
        primaryForeground: "oklch(0.145 0 0)", // dark text on yellow
        accent: "oklch(0.35 0.1 97.5)", // subtle yellow hover
        accentForeground: "oklch(0.985 0 0)", // light text
        border: "oklch(1 0 0 / 8%)", // subtle border
        ring: "oklch(0.782 0.281 98.3)", // yellow focus ring
      },
    },
  },
} as const;

/**
 * Type export for use in other files
 */
export type Theme = typeof theme;
