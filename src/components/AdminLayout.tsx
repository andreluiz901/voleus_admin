"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { colors, spacing, borderRadius, shadows, typography, breakpoints } from "@/styles/theme";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < parseInt(breakpoints.tablet));
      if (window.innerWidth < parseInt(breakpoints.tablet)) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Jogos", href: "/admin/games", icon: "🎮" },
    { label: "Jogadores", href: "/admin/players", icon: "👥" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: colors.background, overflow: "hidden" }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? (isMobile ? "280px" : "250px") : "80px",
          backgroundColor: colors.white,
          borderRight: `1px solid ${colors.border}`,
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          boxShadow: shadows.sm,
          position: isMobile ? (sidebarOpen ? "fixed" : "absolute") : "relative",
          height: "100vh",
          zIndex: isMobile ? 50 : "auto",
          left: 0,
          top: 0,
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            padding: spacing.xl,
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: sidebarOpen ? "auto" : spacing.huge,
          }}
        >
          {sidebarOpen && (
            <h2 style={{ margin: "0", ...typography.h3, color: colors.primary }}>
              ⚽ Volei
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: colors.textSecondary,
              padding: spacing.sm,
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: `${spacing.md} 0`, overflow: "auto" }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.md,
                  color: colors.textSecondary,
                  fontSize: "16px",
                  minHeight: "48px",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.surface;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                <span style={{ fontSize: "20px", minWidth: "24px", textAlign: "center" }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout Area */}
        <div
          style={{
            padding: spacing.lg,
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: spacing.md,
            cursor: "pointer",
            minHeight: "48px",
            justifyContent: sidebarOpen ? "flex-start" : "center",
          }}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.surface;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <span style={{ fontSize: "18px" }}>🚪</span>
          {sidebarOpen && (
            <span style={{ fontSize: "14px", color: colors.textSecondary }}>Sair</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: colors.background,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.border}`,
            padding: `0 ${spacing.xl}`,
            minHeight: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: shadows.sm,
            flexShrink: 0,
          }}
        >
          <p style={{ margin: "0", ...typography.body, color: colors.textSecondary }}>
            Admin - Volei Manager
          </p>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: colors.primary,
              }}
            >
              ☰
            </button>
          )}
        </header>

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: isMobile ? spacing.lg : spacing.xl,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
