import React from "react";
import { colors, spacing, borderRadius, typography } from "@/styles/theme";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

export function FormInput({
  label,
  error,
  help,
  id,
  ...props
}: FormInputProps) {
  const inputId = id || `input-${Math.random()}`;

  return (
    <div style={{ marginBottom: spacing.lg, width: "100%" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            marginBottom: spacing.sm,
            ...typography.bodySmall,
            color: colors.textPrimary,
            fontWeight: "600",
          }}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        {...props}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: `${spacing.md} ${spacing.lg}`,
          border: `2px solid ${error ? colors.error : colors.border}`,
          borderRadius: borderRadius.md,
          fontSize: "16px",
          fontFamily: "inherit",
          minHeight: "48px",
          backgroundColor: colors.white,
          color: colors.textPrimary,
          transition: "border-color 0.2s, background-color 0.2s",
          ...props.style,
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = colors.primary;
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = colors.border;
          }
        }}
      />

      {error && (
        <p
          style={{
            margin: `${spacing.sm} 0 0 0`,
            ...typography.bodySmall,
            color: colors.error,
          }}
        >
          {error}
        </p>
      )}

      {help && !error && (
        <p
          style={{
            margin: `${spacing.sm} 0 0 0`,
            ...typography.caption,
            color: colors.textTertiary,
          }}
        >
          {help}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export function FormSelect({
  label,
  error,
  options,
  id,
  ...props
}: FormSelectProps) {
  const selectId = id || `select-${Math.random()}`;

  return (
    <div style={{ marginBottom: spacing.lg, width: "100%" }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: "block",
            marginBottom: spacing.sm,
            ...typography.bodySmall,
            color: colors.textPrimary,
            fontWeight: "600",
          }}
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        {...props}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: `${spacing.md} ${spacing.lg}`,
          border: `2px solid ${error ? colors.error : colors.border}`,
          borderRadius: borderRadius.md,
          fontSize: "16px",
          fontFamily: "inherit",
          minHeight: "48px",
          backgroundColor: colors.white,
          color: colors.textPrimary,
          cursor: "pointer",
          transition: "border-color 0.2s, background-color 0.2s",
          ...props.style,
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = colors.primary;
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = colors.border;
          }
        }}
      >
        {options.map((opt, index) => (
          <option key={`${opt.value}-${index}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          style={{
            margin: `${spacing.sm} 0 0 0`,
            ...typography.bodySmall,
            color: colors.error,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
