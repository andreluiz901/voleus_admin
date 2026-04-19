// Design System & Theme Constants
// Centralized styling for consistent UI across the app

export const colors = {
  // Primary
  primary: "#2563eb", // Blue
  primaryLight: "#3b82f6",
  primaryDark: "#1e40af",

  // Semantic
  success: "#16a34a", // Green
  successLight: "#22c55e",
  warning: "#ea580c", // Orange
  error: "#dc2626", // Red
  errorLight: "#ef4444",

  // Neutral
  white: "#ffffff",
  background: "#f8f9fa", // Light gray
  surface: "#f3f4f6", // Slightly darker gray
  border: "#e5e7eb", // Gray for borders
  textPrimary: "#1f2937", // Dark gray
  textSecondary: "#6b7280", // Medium gray
  textTertiary: "#9ca3af", // Light gray
  disabled: "#d1d5db", // Disabled state

  // Contextual
  paid: "#16a34a", // Same as success
  unpaid: "#dc2626", // Same as error
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  xxl: "24px",
  xxxl: "32px",
  huge: "40px",
};

export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
};

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
};

export const typography = {
  h1: {
    fontSize: "32px",
    fontWeight: "bold" as const,
    lineHeight: "1.2",
  },
  h2: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    lineHeight: "1.3",
  },
  h3: {
    fontSize: "20px",
    fontWeight: "600" as const,
    lineHeight: "1.4",
  },
  body: {
    fontSize: "16px",
    fontWeight: "400" as const,
    lineHeight: "1.5",
  },
  bodySmall: {
    fontSize: "14px",
    fontWeight: "400" as const,
    lineHeight: "1.5",
  },
  caption: {
    fontSize: "12px",
    fontWeight: "400" as const,
    lineHeight: "1.4",
  },
};

// Mobile-optimized typography
export const typographyMobile = {
  h1: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    lineHeight: "1.2",
  },
  h2: {
    fontSize: "20px",
    fontWeight: "bold" as const,
    lineHeight: "1.3",
  },
  h3: {
    fontSize: "18px",
    fontWeight: "600" as const,
    lineHeight: "1.4",
  },
  body: {
    fontSize: "15px",
    fontWeight: "400" as const,
    lineHeight: "1.5",
  },
};

export const transitions = {
  fast: "0.15s ease-in-out",
  normal: "0.2s ease-in-out",
  slow: "0.3s ease-in-out",
};

export const breakpoints = {
  mobile: "640px",
  tablet: "768px",
  desktop: "1024px",
};

// Touch-friendly sizes (min 44px for buttons, 48px recommended)
export const touchTargets = {
  button: "44px",
  input: "44px",
  item: "48px",
};

// Consolidated theme object for easier usage
export const theme = {
  colors: {
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    success: colors.success,
    successLight: colors.successLight,
    warning: colors.warning,
    error: colors.error,
    errorLight: colors.errorLight,
    white: colors.white,
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
    paid: colors.paid,
    unpaid: colors.unpaid,
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      tertiary: colors.textTertiary,
    },
    bg: {
      primary: colors.background,
      secondary: colors.surface,
    },
    disabled: colors.disabled,
  },
  spacing: spacing,
  borderRadius: borderRadius,
  shadows: shadows,
  transitions: transitions,
  typography: typography,
  typographyMobile: typographyMobile,
  breakpoints: breakpoints,
  touchTargets: touchTargets,
};
