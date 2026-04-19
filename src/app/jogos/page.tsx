"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { theme } from "@/styles/theme";
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

export default function JogosPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        const data: Game[] = await response.json();
        setGames(data || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const upcomingGames = games
    .filter((g) => new Date(g.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastGames = games
    .filter((g) => new Date(g.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <PublicLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: theme.spacing.huge }}>
        {/* Header with Back Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: theme.spacing.xl,
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: theme.colors.text.primary, marginBottom: "4px" }}>
              Histórico de Jogos
            </h1>
            <p style={{ color: theme.colors.text.secondary, marginTop: 0 }}>
              Veja todos os jogos agendados e passados
            </p>
          </div>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="secondary">← Voltar</Button>
          </Link>
        </div>

        {isLoading ? (
          <Card>
            <p style={{ textAlign: "center", color: theme.colors.text.secondary }}>Carregando...</p>
          </Card>
        ) : (
          <>
            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
              <div style={{ marginBottom: theme.spacing.huge }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
                  📅 Próximos Jogos
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
                  {upcomingGames.map((game) => (
                    <Link key={game.id} href={`/jogos/${game.id}`} style={{ textDecoration: "none" }}>
                      <Card hoverable style={{ cursor: "pointer" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: theme.spacing.lg,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: theme.colors.text.secondary,
                                marginBottom: "4px",
                              }}
                            >
                              {new Date(game.date).toLocaleDateString("pt-BR")} às {game.startTime}
                            </p>
                            <h3 style={{ fontWeight: "bold", color: theme.colors.text.primary, marginTop: 0 }}>
                              📍 {game.location}
                            </h3>
                          </div>

                          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
                            <p
                              style={{
                                fontSize: "1.25rem",
                                fontWeight: "bold",
                                color: theme.colors.success,
                                margin: 0,
                              }}
                            >
                              R$ {(game.hourPrice * game.hours / game.maxPlayers).toFixed(2)}
                            </p>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                                backgroundColor: getStatusBgColor(game.status),
                                color: getStatusColor(game.status),
                                borderRadius: theme.borderRadius.md,
                                fontWeight: "600",
                                textAlign: "center",
                              }}
                            >
                              {getStatusLabel(game.status)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Past Games */}
            {pastGames.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
                  📜 Histórico
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
                  {pastGames.map((game) => (
                    <Link key={game.id} href={`/jogos/${game.id}`} style={{ textDecoration: "none" }}>
                      <Card hoverable style={{ cursor: "pointer", padding: theme.spacing.md }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: theme.spacing.md,
                          }}
                        >
                          <div>
                            <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary, margin: 0 }}>
                              {new Date(game.date).toLocaleDateString("pt-BR")} • {game.startTime}
                            </p>
                            <p
                              style={{
                                fontWeight: "500",
                                color: theme.colors.text.primary,
                                margin: "4px 0 0 0",
                              }}
                            >
                              {game.location}
                            </p>
                          </div>

                          <div
                            style={{
                              fontSize: "0.75rem",
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
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {games.length === 0 && (
              <Card style={{ textAlign: "center", padding: theme.spacing.huge }}>
                <p style={{ fontSize: "3rem", margin: 0 }}>😅</p>
                <p style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.md }}>
                  Nenhum jogo disponível no momento
                </p>
                <p style={{ color: theme.colors.text.secondary, fontSize: "0.875rem" }}>
                  Volte em breve para ver novos jogos!
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
