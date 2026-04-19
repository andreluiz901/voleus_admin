"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Toast } from "@/components/Toast";
import { colors, spacing, typography } from "@/styles/theme";
import { getStatusLabel, getStatusColor, getStatusBgColor } from "@/lib/game-status";

type Game = {
  id: string;
  date: string;
  startTime: string;
  location: string;
  maxPlayers: number;
  teamSize: number;
  hourPrice: number;
  hours: number;
  status: string;
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleStatusChange = async (gameId: string, newStatus: string) => {
    setUpdatingStatus(gameId);
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedGame = await response.json();
      setGames(games.map((g) => (g.id === gameId ? { ...g, status: updatedGame.status } : g)));
      setToast({ type: "success", message: `Status atualizado para ${getStatusLabel(newStatus)}` });
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({ type: "error", message: "Erro ao atualizar status" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: "1200px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.xl,
            gap: spacing.lg,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 8px 0", ...typography.h1, color: colors.textPrimary }}>
              📋 Voleus Admin - Jogos
            </h1>
            <p style={{ margin: "0", ...typography.bodySmall, color: colors.textSecondary }}>
              Gerencie seus jogos, horários e status
            </p>
          </div>
          <Link href="/admin/games/new" style={{ textDecoration: "none" }}>
            <Button>+ Novo Jogo</Button>
          </Link>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {isLoading ? (
          <Card>
            <p style={{ color: colors.textSecondary, textAlign: "center" }}>Carregando...</p>
          </Card>
        ) : games.length === 0 ? (
          <Card style={{ textAlign: "center", padding: spacing.huge }}>
            <p style={{ ...typography.h3, color: colors.textSecondary, marginBottom: spacing.lg }}>
              😅 Nenhum jogo criado ainda
            </p>
            <Link href="/admin/games/new" style={{ textDecoration: "none" }}>
              <Button>Criar Primeiro Jogo</Button>
            </Link>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
            {games.map((game) => {
              const date = new Date(game.date);
              const formattedDate = date.toLocaleDateString("pt-BR");
              const totalCost = game.hourPrice * game.hours;

              return (
                <Card key={game.id} elevated>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: spacing.lg,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          ...typography.caption,
                          color: colors.textSecondary,
                          textTransform: "uppercase",
                        }}
                      >
                        Data
                      </p>
                      <p style={{ margin: "0", ...typography.body, fontWeight: "600", color: colors.textPrimary }}>
                        {formattedDate}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          ...typography.caption,
                          color: colors.textSecondary,
                          textTransform: "uppercase",
                        }}
                      >
                        Horário
                      </p>
                      <p style={{ margin: "0", ...typography.body, color: colors.primary, fontWeight: "600" }}>
                        {game.startTime}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          ...typography.caption,
                          color: colors.textSecondary,
                          textTransform: "uppercase",
                        }}
                      >
                        Local
                      </p>
                      <p style={{ margin: "0", ...typography.bodySmall, color: colors.textPrimary }}>
                        {game.location}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          ...typography.caption,
                          color: colors.textSecondary,
                          textTransform: "uppercase",
                        }}
                      >
                        Time
                      </p>
                      <p style={{ margin: "0", ...typography.bodySmall, color: colors.textPrimary }}>
                        {game.teamSize} jogadores
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          ...typography.caption,
                          color: colors.textSecondary,
                          textTransform: "uppercase",
                        }}
                      >
                        Valor Total
                      </p>
                      <p style={{ margin: "0", ...typography.body, fontWeight: "600", color: colors.success }}>
                        R$ {totalCost.toFixed(2)}
                      </p>
                    </div>

                    <Link href={`/admin/games/${game.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary">Ver Detalhes</Button>
                    </Link>
                  </div>

                  {/* Status Controls */}
                  <div
                    style={{
                      marginTop: spacing.lg,
                      paddingTop: spacing.lg,
                      borderTop: `1px solid ${colors.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: spacing.md,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          ...typography.caption,
                          color: colors.textSecondary,
                          textTransform: "uppercase",
                        }}
                      >
                        Status
                      </p>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          padding: `${spacing.xs}px ${spacing.md}px`,
                          backgroundColor: getStatusBgColor(game.status),
                          color: getStatusColor(game.status),
                          borderRadius: "4px",
                          fontWeight: "600",
                          display: "inline-block",
                        }}
                      >
                        {getStatusLabel(game.status)}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                      {["OPEN", "FINISHED", "CLOSED"].map((status) => (
                        <Button
                          key={status}
                          variant={game.status === status ? "primary" : "ghost"}
                          onClick={() => handleStatusChange(game.id, status)}
                          disabled={updatingStatus === game.id}
                          style={{ minWidth: "100px", fontSize: "0.875rem" }}
                        >
                          {updatingStatus === game.id ? "..." : getStatusLabel(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
