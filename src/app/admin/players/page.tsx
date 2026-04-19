"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
import { Toast, type ToastType } from "@/components/Toast";
import { getSkillLabel } from "@/lib/skill-levels";
import { colors, spacing, typography } from "@/styles/theme";

type Player = {
  id: string;
  name: string;
  skillLevel: number;
  createdAt: string;
};

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerSkill, setNewPlayerSkill] = useState(3);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/players");
        if (!response.ok) {
          setToast({ message: "Erro ao carregar jogadores", type: "error" });
          return;
        }
        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        console.error("Error fetching players:", err);
        setToast({ message: "Erro ao carregar jogadores", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      setToast({ message: "Digite o nome do jogador", type: "warning" });
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlayerName,
          skillLevel: newPlayerSkill,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({ message: data.error || "Erro ao criar jogador", type: "error" });
        return;
      }

      const newPlayer = await response.json();
      setPlayers([...players, newPlayer]);
      setNewPlayerName("");
      setNewPlayerSkill(3);
      setShowAddForm(false);
      setToast({ message: "Jogador criado com sucesso!", type: "success" });
    } catch (err) {
      console.error("Error adding player:", err);
      setToast({ message: "Erro ao criar jogador", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover ${name}?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/players/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({ message: data.error || "Erro ao deletar jogador", type: "error" });
        return;
      }

      setPlayers(players.filter((p) => p.id !== id));
      setToast({ message: "Jogador removido com sucesso!", type: "success" });
    } catch (err) {
      console.error("Error deleting player:", err);
      setToast({ message: "Erro ao remover jogador", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <div style={{ marginBottom: spacing.xl }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <p
              style={{
                margin: "0 0 16px 0",
                color: colors.primary,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              ← Voltar
            </p>
          </Link>
          <h1 style={{ margin: "0 0 8px 0", ...typography.h1, color: colors.textPrimary }}>
            👥 Gerenciar Jogadores
          </h1>
          <p style={{ margin: "0", ...typography.body, color: colors.textSecondary }}>
            Cadastre, edite ou remova jogadores do sistema
          </p>
        </div>

        {/* Add Player Button */}
        <div style={{ marginBottom: spacing.xl }}>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "✕ Cancelar" : "+ Novo Jogador"}
          </Button>
        </div>

        {/* Add Player Form */}
        {showAddForm && (
          <Card style={{ marginBottom: spacing.xl, padding: spacing.lg, backgroundColor: colors.surface }}>
            <h3 style={{ margin: "0 0 16px 0", ...typography.h2, color: colors.textPrimary }}>
              Adicionar Novo Jogador
            </h3>

            <FormInput
              label="Nome Completo"
              placeholder="Ex: João Silva"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
            />

            <div style={{ marginBottom: spacing.lg }}>
              <label
                style={{
                  display: "block",
                  marginBottom: spacing.sm,
                  ...typography.bodySmall,
                  color: colors.textPrimary,
                  fontWeight: "600",
                }}
              >
                Nível de Habilidade
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: spacing.md,
                }}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setNewPlayerSkill(level)}
                    style={{
                      padding: spacing.md,
                      border: `2px solid ${newPlayerSkill === level ? colors.primary : colors.border}`,
                      borderRadius: "8px",
                      backgroundColor: newPlayerSkill === level ? "rgba(37, 99, 235, 0.1)" : colors.white,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      ...typography.bodySmall,
                      fontWeight: "600",
                      color: newPlayerSkill === level ? colors.primary : colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    {["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"][level - 1]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: spacing.lg, flexWrap: "wrap" }}>
              <Button onClick={handleAddPlayer} disabled={isAdding} loading={isAdding}>
                ✓ Criar Jogador
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPlayerName("");
                  setNewPlayerSkill(3);
                }}
              >
                ✕ Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {isLoading ? (
          <Card>
            <p style={{ color: colors.textSecondary }}>Carregando jogadores...</p>
          </Card>
        ) : players.length === 0 ? (
          /* No Players */
          <Card style={{ textAlign: "center", padding: spacing.xl, backgroundColor: colors.surface }}>
            <p style={{ ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg }}>
              Nenhum jogador cadastrado ainda
            </p>
            <Button onClick={() => setShowAddForm(true)}>+ Criar Primeiro Jogador</Button>
          </Card>
        ) : (
          /* Players List */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: spacing.lg }}>
            {players.map((player) => (
              <Card key={player.id}>
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.md }}>
                    <h3 style={{ margin: "0", ...typography.body, fontWeight: "600", color: colors.textPrimary, flex: 1 }}>
                      {player.name}
                    </h3>
                    <button
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      disabled={deletingId === player.id}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: deletingId === player.id ? "wait" : "pointer",
                        color: colors.error,
                        padding: "0",
                        marginLeft: spacing.sm,
                        opacity: deletingId === player.id ? 0.7 : 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ padding: spacing.md, backgroundColor: colors.surface, borderRadius: "6px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 4px 0", ...typography.bodySmall, color: colors.textSecondary }}>
                      Habilidade
                    </p>
                    <p style={{ margin: "0", ...typography.h3, color: colors.primary }}>
                      {getSkillLabel(player.skillLevel)}
                    </p>
                  </div>

                  <p style={{ margin: `${spacing.md} 0 0 0`, ...typography.caption, color: colors.textTertiary }}>
                    Cadastrado em {new Date(player.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
