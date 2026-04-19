import { useEffect } from "react";
import { colors, spacing, typography } from "@/styles/theme";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return colors.success;
      case "error":
        return colors.error;
      case "warning":
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: spacing.lg,
        right: spacing.lg,
        backgroundColor: getBackgroundColor(),
        color: colors.white,
        padding: `${spacing.md} ${spacing.lg}`,
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: spacing.md,
        ...typography.body,
        fontWeight: "500",
        zIndex: 9999,
        maxWidth: "400px",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "18px", minWidth: "20px" }}>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: "18px",
          padding: "0",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
