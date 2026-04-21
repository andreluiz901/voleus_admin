"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormInput, FormSelect } from "@/components/FormInput";
import { Toast, type ToastType } from "@/components/Toast";
import { colors, spacing, typography } from "@/styles/theme";

type GameEditForm = {
  date: string;
  startTime: string;
  location: string;
  maxPlayers: number;
  teamSize: number;
  hourPrice: number;
  hours: number;
  notes: string;
  status: "OPEN" | "FINISHED" | "CLOSED";
};

export default function EditGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [form, setForm] = useState<GameEditForm>({
    date: "",
    startTime: "19:00",
    location: "",
    maxPlayers: 16,
    teamSize: 4,
    hourPrice: 40,
    hours: 2,
    notes: "",
    status: "OPEN",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          setToast({ message: "Jogo não encontrado", type: "error" });
          return;
        }
        const game = await response.json();
        setForm({
          date: new Date(game.date).toISOString().slice(0, 10),
          startTime: game.startTime,
          location: game.location ?? "",
          maxPlayers: game.maxPlayers,
          teamSize: game.teamSize,
          hourPrice: game.hourPrice,
          hours: game.hours,
          notes: game.notes ?? "",
          status: game.status,
        });
      } catch (error) {
        console.error("Error loading game:", error);
        setToast({ message: "Erro ao carregar jogo", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({
          message: data.error || "Erro ao atualizar jogo",
          type: "error",
        });
        return;
      }

      setToast({ message: "Jogo atualizado com sucesso!", type: "success" });
      setTimeout(() => router.push(`/admin/games/${gameId}`), 1000);
    } catch (error) {
      console.error("Error updating game:", error);
      setToast({ message: "Erro ao atualizar jogo", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "760px" }}>
        <div style={{ marginBottom: spacing.xl }}>
          <Link
            href={`/admin/games/${gameId}`}
            style={{ textDecoration: "none" }}
          >
            <p
              style={{
                margin: "0 0 16px 0",
                color: colors.primary,
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              ← Voltar ao jogo
            </p>
          </Link>
          <h1
            style={{ margin: "0", ...typography.h1, color: colors.textPrimary }}
          >
            Editar jogo
          </h1>
        </div>

        <Card style={{ padding: spacing.lg }}>
          {isLoading ? (
            <p style={{ color: colors.textSecondary }}>Carregando...</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.md,
                }}
              >
                <FormInput
                  label="Data"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
                <FormInput
                  label="Horário"
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
                <FormInput
                  label="Local"
                  value={form.location}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
                <FormSelect
                  label="Status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as "OPEN" | "FINISHED" | "CLOSED",
                    }))
                  }
                  options={[
                    { value: "OPEN", label: "Aberto" },
                    { value: "FINISHED", label: "Finalizado" },
                    { value: "CLOSED", label: "Fechado" },
                  ]}
                />
                <FormInput
                  label="Máx. jogadores"
                  type="number"
                  min="1"
                  value={form.maxPlayers}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxPlayers: Number(e.target.value),
                    }))
                  }
                />
                <FormInput
                  label="Tamanho do time"
                  type="number"
                  min="1"
                  value={form.teamSize}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      teamSize: Number(e.target.value),
                    }))
                  }
                />
                <FormInput
                  label="Preço/hora"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourPrice}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hourPrice: Number(e.target.value),
                    }))
                  }
                />
                <FormInput
                  label="Duração (horas)"
                  type="number"
                  min="1"
                  value={form.hours}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      hours: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div style={{ marginTop: spacing.md }}>
                <label
                  htmlFor="notes"
                  style={{
                    display: "block",
                    marginBottom: spacing.sm,
                    ...typography.bodySmall,
                    fontWeight: "600",
                  }}
                >
                  Notas
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    minHeight: "100px",
                    padding: spacing.md,
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: spacing.md,
                  marginTop: spacing.lg,
                }}
              >
                <Button
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  Salvar alterações
                </Button>
                <Link
                  href={`/admin/games/${gameId}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="secondary">Cancelar</Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
