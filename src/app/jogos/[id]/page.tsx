"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { colors, spacing, typography } from "@/styles/theme";

type Player = {
  id: string;
  name: string;
  skillLevel: number;
};

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
  notes?: string;
  attendances: Array<{
    id: string;
    playerId: string;
    confirmed: boolean;
    paid: boolean;
    player: Player;
  }>;
  teams: Array<{
    id: string;
    name: string;
    gameId: string;
    players: Array<{
      id: string;
      teamId: string;
      playerId: string;
      player: Player;
    }>;
  }>;
};

export default function JogoDetailPublicPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          setError("Jogo não encontrado");
          return;
        }
        const data = await response.json();
        setGame(data);
      } catch (err) {
        console.error("Error fetching game:", err);
        setError("Erro ao carregar detalhes do jogo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  if (isLoading) {
    return (
      <PublicLayout>
        <Card style={{ textAlign: "center", padding: spacing.huge }}>
          <p style={{ color: colors.textSecondary }}>Carregando...</p>
        </Card>
      </PublicLayout>
    );
  }

  if (error || !game) {
    return (
      <PublicLayout>
        <Card style={{ padding: spacing.xl }}>
          <p style={{ color: colors.error, ...typography.body }}>{error}</p>
          <Link href="/jogos" style={{ textDecoration: "none" }}>
            <Button variant="secondary" style={{ marginTop: spacing.lg }}>
              ← Voltar aos Jogos
            </Button>
          </Link>
        </Card>
      </PublicLayout>
    );
  }

  const date = new Date(game.date);
  const formattedDate = date.toLocaleDateString("pt-BR");
  const totalCost = game.hourPrice * game.hours;
  const pricePerPlayer = game.attendances.length > 0 ? totalCost / game.attendances.length : 0;
  const confirmedCount = game.attendances.filter((a) => a.confirmed).length;

  return (
    <PublicLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: spacing.xl }}>
          <Link href="/jogos" style={{ textDecoration: "none" }}>
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
            {formattedDate}
          </h1>
          <p style={{ margin: "0", ...typography.body, color: colors.textSecondary }}>
            {game.startTime} • {game.location}
          </p>
        </div>

        {/* Main Info Card */}
        <Card elevated style={{ marginBottom: spacing.xl, padding: spacing.xl }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.lg,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  ...typography.caption,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Horário
              </p>
              <p style={{ margin: "0", ...typography.h3, color: colors.primary }}>
                {game.startTime}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  ...typography.caption,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Local
              </p>
              <p style={{ margin: "0", ...typography.body, color: colors.textPrimary }}>
                📍 {game.location}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  ...typography.caption,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Tamanho do Time
              </p>
              <p style={{ margin: "0", ...typography.body, color: colors.textPrimary }}>
                {game.teamSize} jogadores
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  ...typography.caption,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Duração
              </p>
              <p style={{ margin: "0", ...typography.body, color: colors.textPrimary }}>
                {game.hours}h
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  ...typography.caption,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Valor Total
              </p>
              <p style={{ margin: "0", ...typography.h3, color: colors.success }}>
                R$ {totalCost.toFixed(2)}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  ...typography.caption,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Por Jogador
              </p>
              <p style={{ margin: "0", ...typography.body, color: colors.textPrimary, fontWeight: "600" }}>
                R$ {pricePerPlayer.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {game.notes && (
          <Card style={{ marginBottom: spacing.xl, backgroundColor: colors.surface }}>
            <p style={{ margin: "0 0 8px 0", ...typography.caption, color: colors.textSecondary }}>
              📝 Notas
            </p>
            <p style={{ margin: "0", ...typography.body, color: colors.textPrimary }}>
              {game.notes}
            </p>
          </Card>
        )}

        {/* Participants */}
        <div style={{ marginBottom: spacing.xl }}>
          <h2 style={{ margin: "0 0 16px 0", ...typography.h2, color: colors.textPrimary }}>
            ✅ Confirmados ({confirmedCount}/{game.maxPlayers})
          </h2>

          {confirmedCount === 0 ? (
            <Card style={{ textAlign: "center", padding: spacing.lg }}>
              <p style={{ color: colors.textSecondary }}>Nenhum jogador confirmado ainda</p>
            </Card>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: spacing.md,
              }}
            >
              {game.attendances
                .filter((a) => a.confirmed)
                .sort((a, b) => b.player.skillLevel - a.player.skillLevel)
                .map((a) => (
                  <Card key={a.id}>
                    <div>
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          ...typography.body,
                          fontWeight: "600",
                          color: colors.textPrimary,
                        }}
                      >
                        {a.player.name}
                      </p>
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          ...typography.bodySmall,
                          color: colors.textSecondary,
                        }}
                      >
                        Skill: {a.player.skillLevel}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.sm,
                          marginTop: spacing.md,
                          paddingTop: spacing.md,
                          borderTop: `1px solid ${colors.border}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            padding: `${spacing.xs} ${spacing.sm}`,
                            borderRadius: "4px",
                            backgroundColor: a.paid ? colors.success : colors.error,
                            color: colors.white,
                            fontWeight: "600",
                          }}
                        >
                          {a.paid ? "Pago ✓" : "Não pago"}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Teams */}
        {game.teams && game.teams.length > 0 && (
          <div>
            <h2 style={{ margin: "0 0 16px 0", ...typography.h2, color: colors.textPrimary }}>
              🏐 Times
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: spacing.lg,
              }}
            >
              {game.teams.map((team) => (
                <Card key={team.id} style={{ backgroundColor: colors.surface }}>
                  <h3 style={{ margin: "0 0 12px 0", ...typography.h3, color: colors.primary }}>
                    {team.name}
                  </h3>
                  <div>
                    {team.players.map((tp) => (
                      <p
                        key={tp.id}
                        style={{
                          margin: "8px 0",
                          ...typography.bodySmall,
                          color: colors.textPrimary,
                        }}
                      >
                        • {tp.player.name} (Skill: {tp.player.skillLevel})
                      </p>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
