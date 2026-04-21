"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormInput, FormSelect } from "@/components/FormInput";
import { Toast, type ToastType } from "@/components/Toast";
import { type Gender, genderOptions, getGenderLabel } from "@/lib/gender";
import { colors, spacing, typography } from "@/styles/theme";

type PlayerForm = {
  name: string;
  skillLevel: number;
  gender: Gender;
};

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [form, setForm] = useState<PlayerForm>({
    name: "",
    skillLevel: 3,
    gender: "OTHER",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${playerId}`);
        if (!response.ok) {
          setToast({ message: "Jogador não encontrado", type: "error" });
          return;
        }
        const player = await response.json();
        setForm({
          name: player.name,
          skillLevel: player.skillLevel,
          gender: player.gender,
        });
      } catch (error) {
        console.error("Error loading player:", error);
        setToast({ message: "Erro ao carregar jogador", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({
          message: data.error || "Erro ao salvar jogador",
          type: "error",
        });
        return;
      }

      setToast({ message: "Jogador atualizado!", type: "success" });
      setTimeout(() => router.push("/admin/players"), 1000);
    } catch (error) {
      console.error("Error saving player:", error);
      setToast({ message: "Erro ao salvar jogador", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "640px" }}>
        <div style={{ marginBottom: spacing.xl }}>
          <Link href="/admin/players" style={{ textDecoration: "none" }}>
            <p
              style={{
                margin: "0 0 16px 0",
                color: colors.primary,
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              ← Voltar para jogadores
            </p>
          </Link>
          <h1
            style={{ margin: "0", ...typography.h1, color: colors.textPrimary }}
          >
            Editar jogador
          </h1>
        </div>

        <Card style={{ padding: spacing.lg }}>
          {isLoading ? (
            <p style={{ color: colors.textSecondary }}>Carregando...</p>
          ) : (
            <>
              <FormInput
                label="Nome"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <FormInput
                label="Nível de habilidade"
                type="number"
                min="1"
                max="5"
                value={form.skillLevel}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    skillLevel: Number(e.target.value),
                  }))
                }
              />

              <FormSelect
                label="Gênero"
                value={form.gender}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    gender: e.target.value as Gender,
                  }))
                }
                options={genderOptions.map((gender) => ({
                  value: gender,
                  label: getGenderLabel(gender),
                }))}
              />

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
                <Link href="/admin/players" style={{ textDecoration: "none" }}>
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
