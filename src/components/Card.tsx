import React from "react";
import { colors, spacing, borderRadius, shadows } from "@/styles/theme";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  elevated?: boolean;
}

export function Card({
  hoverable = false,
  elevated = false,
  children,
  style,
  ...props
}: CardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    border: `1px solid ${colors.border}`,
    boxShadow: elevated ? shadows.md : shadows.sm,
    transition: "all 0.2s ease-in-out",
    ...(hoverable && {
      cursor: "pointer",
      "&:hover": {
        boxShadow: shadows.lg,
        transform: "translateY(-2px)",
      },
    }),
    ...style,
  };

  return (
    <div
      {...props}
      style={cardStyle}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = shadows.lg;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = elevated ? shadows.md : shadows.sm;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </div>
  );
}
