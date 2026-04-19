"use client";

import React from "react";
import Link from "next/link";
import { colors, spacing, shadows, typography } from "@/styles/theme";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: colors.background }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: shadows.sm,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: `${spacing.lg} ${spacing.xl}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/jogos" style={{ textDecoration: "none" }}>
            <h1
              style={{
                margin: "0",
                ...typography.h2,
                color: colors.primary,
                cursor: "pointer",
              }}
            >
              ⚽ Volei Manager
            </h1>
          </Link>

          <div style={{ display: "flex", gap: spacing.lg, alignItems: "center" }}>
            <Link href="/jogos" style={{ textDecoration: "none" }}>
              <span
                style={{
                  color: colors.textSecondary,
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                Jogos
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: spacing.xl,
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: colors.white,
          borderTop: `1px solid ${colors.border}`,
          padding: spacing.xl,
          textAlign: "center",
          color: colors.textTertiary,
          fontSize: "14px",
        }}
      >
        <p style={{ margin: "0" }}>© 2026 Volei Manager. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
