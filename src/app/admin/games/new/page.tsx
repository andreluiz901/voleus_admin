"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
import { Toast, type ToastType } from "@/components/Toast";
import { colors, spacing, typography } from "@/styles/theme";

export default function NewGamePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "19:00",
    location: "",
    maxPlayers: 16,
    teamSize: 4,
    hourPrice: 40,
    hours: 2,
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate
      if (!formData.date || !formData.location) {
        setToast({ message: "Preencha todos os campos obrigatórios", type: "warning" });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({ message: data.error || "Erro ao criar jogo", type: "error" });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setToast({ message: "Jogo criado com sucesso!", type: "success" });
      setTimeout(() => router.push(`/admin/games/${data.id}`), 1500);
    } catch (err) {
      setToast({ message: "Erro ao criar jogo. Tente novamente.", type: "error" });
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "700px" }}>
        {/* Header */}
        <div style={{ marginBottom: spacing.xl }}>
          <Link href="/admin/games" style={{ textDecoration: "none" }}>
            <p
              style={{
                margin: "0 0 16px 0",
                color: colors.primary,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              ← Voltar aos Jogos
            </p>
          </Link>
          <h1 style={{ margin: "0", ...typography.h1, color: colors.textPrimary }}>
            ⚽ Novo Jogo
          </h1>
        </div>

        {/* Form Card */}
        <Card style={{ padding: spacing.lg }}>
          <form onSubmit={handleSubmit}>
            {/* Data e Horário - 2 Colunas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.lg, marginBottom: spacing.lg }}>
              <div>
                <label
                  htmlFor="date"
                  style={{
                    display: "block",
                    marginBottom: spacing.sm,
                    ...typography.bodySmall,
                    color: colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  Data *
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "48px",
                    backgroundColor: colors.white,
                    color: colors.textPrimary,
                    transition: "border-color 0.2s",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  style={{
                    display: "block",
                    marginBottom: spacing.sm,
                    ...typography.bodySmall,
                    color: colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  Horário
                </label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "48px",
                    backgroundColor: colors.white,
                    color: colors.textPrimary,
                    transition: "border-color 0.2s",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>
            </div>

            {/* Local */}
            <div style={{ marginBottom: spacing.lg }}>
              <label
                htmlFor="location"
                style={{
                  display: "block",
                  marginBottom: spacing.sm,
                  ...typography.bodySmall,
                  color: colors.textPrimary,
                  fontWeight: "600",
                }}
              >
                Local *
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Ginásio da Vila"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: `2px solid ${colors.border}`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  minHeight: "48px",
                  backgroundColor: colors.white,
                  color: colors.textPrimary,
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              />
            </div>

            {/* Config Grid - 4 colunas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: spacing.lg, marginBottom: spacing.lg }}>
              <div>
                <label
                  htmlFor="maxPlayers"
                  style={{
                    display: "block",
                    marginBottom: spacing.sm,
                    ...typography.bodySmall,
                    color: colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  Máx Jogadores
                </label>
                <input
                  id="maxPlayers"
                  type="number"
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  onChange={handleChange}
                  min="1"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "48px",
                    backgroundColor: colors.white,
                    color: colors.textPrimary,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="teamSize"
                  style={{
                    display: "block",
                    marginBottom: spacing.sm,
                    ...typography.bodySmall,
                    color: colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  Tamanho do Time
                </label>
                <input
                  id="teamSize"
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  min="1"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "48px",
                    backgroundColor: colors.white,
                    color: colors.textPrimary,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="hourPrice"
                  style={{
                    display: "block",
                    marginBottom: spacing.sm,
                    ...typography.bodySmall,
                    color: colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  Preço/hora (R$)
                </label>
                <input
                  id="hourPrice"
                  type="number"
                  name="hourPrice"
                  value={formData.hourPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "48px",
                    backgroundColor: colors.white,
                    color: colors.textPrimary,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="hours"
                  style={{
                    display: "block",
                    marginBottom: spacing.sm,
                    ...typography.bodySmall,
                    color: colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  Duração (horas)
                </label>
                <input
                  id="hours"
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  min="1"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "48px",
                    backgroundColor: colors.white,
                    color: colors.textPrimary,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>
            </div>

            {/* Notas */}
            <div style={{ marginBottom: spacing.lg }}>
              <label
                htmlFor="notes"
                style={{
                  display: "block",
                  marginBottom: spacing.sm,
                  ...typography.bodySmall,
                  color: colors.textPrimary,
                  fontWeight: "600",
                }}
              >
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Informações adicionais sobre o jogo"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: `${spacing.md} ${spacing.lg}`,
                  border: `2px solid ${colors.border}`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  minHeight: "100px",
                  fontFamily: "inherit",
                  color: colors.textPrimary,
                  backgroundColor: colors.white,
                  transition: "border-color 0.2s",
                  resize: "vertical",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: spacing.lg, flexWrap: "wrap" }}>
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
              >
                ✓ Criar Jogo
              </Button>
              <Link href="/admin/games" style={{ textDecoration: "none" }}>
                <Button variant="secondary">
                  ✕ Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
