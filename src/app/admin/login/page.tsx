"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormInput } from "@/components/FormInput";
import { colors, spacing, typography } from "@/styles/theme";

function safeRedirectPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/admin";
  }
  return raw;
}

function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Login falhou");
        return;
      }

      const nextPath = safeRedirectPath(searchParams.get("redirect"));
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError("Algo deu errado. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: spacing.lg,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: spacing.huge,
        }}
        elevated
      >
        <div style={{ textAlign: "center", marginBottom: spacing.xxxl }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "48px" }}>⚽</h1>
          <h2
            style={{
              margin: "0 0 8px 0",
              ...typography.h2,
              color: colors.textPrimary,
            }}
          >
            Volei Manager
          </h2>
          <p
            style={{
              margin: "0",
              ...typography.bodySmall,
              color: colors.textSecondary,
            }}
          >
            Painel Administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                backgroundColor: colors.errorLight,
                color: colors.white,
                padding: spacing.md,
                borderRadius: "4px",
                marginBottom: spacing.lg,
                ...typography.bodySmall,
              }}
            >
              {error}
            </div>
          )}

          <FormInput
            id="password"
            type="password"
            label="Senha Admin"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            size="lg"
          >
            Entrar
          </Button>

          <p
            style={{
              margin: `${spacing.lg} 0 0 0`,
              textAlign: "center",
              ...typography.bodySmall,
              color: colors.textTertiary,
            }}
          >
            Entre com a senha para acessar o painel
          </p>
        </form>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
          }}
        >
          <p style={{ ...typography.body, color: colors.textSecondary }}>
            Carregando…
          </p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
