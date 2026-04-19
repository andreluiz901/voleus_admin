import React from "react";
import { colors, spacing, borderRadius, shadows, transitions, touchTargets } from "@/styles/theme";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    border: "none",
    borderRadius: borderRadius.md,
    fontWeight: "600",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: transitions.fast,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: fullWidth ? "100%" : "auto",
    minHeight: touchTargets.button,
  };

  const sizeStyles = {
    sm: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: "14px",
    },
    md: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: "16px",
      minHeight: touchTargets.button,
    },
    lg: {
      padding: `${spacing.lg} ${spacing.xl}`,
      fontSize: "16px",
      minHeight: touchTargets.button,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: disabled ? colors.disabled : colors.primary,
      color: colors.white,
      "&:hover": disabled ? {} : { backgroundColor: colors.primaryDark },
    },
    secondary: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
      "&:hover": disabled ? {} : { backgroundColor: colors.background },
    },
    danger: {
      backgroundColor: disabled ? colors.disabled : colors.error,
      color: colors.white,
      "&:hover": disabled ? {} : { backgroundColor: colors.errorLight },
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors.primary,
      "&:hover": disabled ? {} : { backgroundColor: colors.surface },
    },
  };

  const style: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? "Carregando..." : children}
    </button>
  );
}
