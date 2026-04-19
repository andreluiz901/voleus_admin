"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Toast } from "@/components/Toast";
import { theme } from "@/styles/theme";
import { getStatusLabel, getStatusColor, getStatusBgColor } from "@/lib/game-status";

interface Game {
  id: string;
  date: string;
  startTime: string;
  location?: string;
  status: "OPEN" | "FINISHED" | "CLOSED";
  maxPlayers: number;
  attendances: { id: string }[];
}

export default function GamesStatusPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning" | "info"; message: string } | null>(
    null
  );
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        setGames(data.sort((a: Game, b: Game) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Failed to fetch games:", error);
        setToast({ type: "error", message: "Erro ao carregar jogos" });
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleStatusChange = async (gameId: string, newStatus: "OPEN" | "FINISHED" | "CLOSED") => {
    setUpdating(gameId);
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setGames(games.map((g) => (g.id === gameId ? { ...g, status: newStatus } : g)));
      setToast({ type: "success", message: `Status atualizado para ${getStatusLabel(newStatus)}` });
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({ type: "error", message: "Erro ao atualizar status" });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const statuses = ["OPEN", "FINISHED", "CLOSED"] as const;

  return (
    <AdminLayout>
      <div style={{ padding: theme.spacing.lg }}>
        <div style={{ marginBottom: theme.spacing.lg }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: theme.colors.text.primary, marginBottom: "4px" }}>
            Gerenciar Status dos Jogos
          </h1>
          <p style={{ color: theme.colors.text.secondary }}>
            Controle o status de cada jogo (Aberto, Acontecido ou Fechado)
          </p>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {loading ? (
          <div style={{ textAlign: "center", padding: theme.spacing.huge, color: theme.colors.text.secondary }}>
            <p>Carregando jogos...</p>
          </div>
        ) : games.length === 0 ? (
          <Card>
            <p style={{ textAlign: "center", color: theme.colors.text.secondary }}>
              Nenhum jogo encontrado
            </p>
          </Card>
        ) : (
          <div style={{ display: "grid", gap: theme.spacing.lg }}>
            {games.map((game) => (
              <Card key={game.id} elevated>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    gap: theme.spacing.lg,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: theme.spacing.md,
                        alignItems: "start",
                        marginBottom: theme.spacing.md,
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary, marginBottom: "4px" }}>
                          {formatDate(game.date)} às {game.startTime}
                        </p>
                        <h3 style={{ fontWeight: "bold", fontSize: "1.125rem", color: theme.colors.text.primary }}>
                          {game.location || "Local a definir"}
                        </h3>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: theme.spacing.lg,
                        fontSize: "0.875rem",
                        color: theme.colors.text.secondary,
                      }}
                    >
                      <span>Jogadores: {game.attendances.length}/{game.maxPlayers}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: theme.spacing.sm,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        variant={game.status === status ? "primary" : "secondary"}
                        onClick={() => handleStatusChange(game.id, status)}
                        disabled={updating === game.id}
                        style={{
                          minWidth: "110px",
                          opacity: updating === game.id && game.status !== status ? 0.5 : 1,
                        }}
                      >
                        {updating === game.id && game.status !== status ? "..." : getStatusLabel(status)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  style={{
                    marginTop: theme.spacing.md,
                    paddingTop: theme.spacing.md,
                    borderTop: `1px solid ${theme.colors.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary }}>Status atual:</p>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                      backgroundColor: getStatusBgColor(game.status),
                      color: getStatusColor(game.status),
                      borderRadius: theme.borderRadius.md,
                      fontWeight: "600",
                    }}
                  >
                    {getStatusLabel(game.status)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
