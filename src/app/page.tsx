"use client";

import React, { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { theme } from "@/styles/theme";
import { getStatusLabel, getStatusColor, getStatusBgColor } from "@/lib/game-status";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  skillLevel: number;
}

interface Attendance {
  id: string;
  playerId: string;
  player: Player;
  isPaid: boolean;
}

interface Game {
  id: string;
  date: string;
  startTime: string;
  location?: string;
  status: string;
  maxPlayers: number;
  teamSize: number;
  hourPrice: number;
  hours: number;
  attendances: Attendance[];
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        if (!response.ok) throw new Error("Failed to fetch");
        const allGames = await response.json();

        // Filter only OPEN games with date >= today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const openGames = allGames
          .filter((game: Game) => {
            const gameDate = new Date(game.date);
            gameDate.setHours(0, 0, 0, 0);
            return game.status === "OPEN" && gameDate >= today;
          })
          .sort((a: Game, b: Game) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setGames(openGames);
        if (openGames.length > 0 && !selectedGameId) {
          setSelectedGameId(openGames[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const calculatePricePerPlayer = (game: Game) => {
    return ((game.hourPrice * game.hours) / game.maxPlayers).toFixed(2);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ textAlign: "center", padding: theme.spacing.huge, color: theme.colors.text.secondary }}>
          <p style={{ fontSize: "1.125rem" }}>Carregando jogos...</p>
        </div>
      </PublicLayout>
    );
  }

  if (games.length === 0) {
    return (
      <PublicLayout>
        <main style={{ paddingBottom: theme.spacing.huge }}>
          <div
            style={{
              textAlign: "center",
              padding: "80px 16px",
              color: theme.colors.text.secondary,
            }}
          >
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: theme.spacing.lg }}>
              Voleus
            </h1>
            <p style={{ fontSize: "1.125rem", marginBottom: theme.spacing.xl }}>
              😴 Nenhum jogo aberto no momento
            </p>
            <p style={{ fontSize: "0.875rem" }}>Fique atento! Em breve haverá novos jogos agendados.</p>
          </div>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main style={{ paddingBottom: theme.spacing.huge }}>
        {/* Header */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: theme.colors.text.primary }}>
            Voleus
          </h1>
          <p style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
            Próximos jogos de vôlei
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: theme.spacing.lg,
            minHeight: "500px",
          }}
        >
          {/* Games List */}
          <div>
            <h2
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                color: theme.colors.text.secondary,
                textTransform: "uppercase",
                marginBottom: theme.spacing.md,
                letterSpacing: "0.05em",
              }}
            >
              📅 Próximas Datas
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  style={{
                    padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
                    border: `2px solid ${selectedGameId === game.id ? theme.colors.primary : theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor:
                      selectedGameId === game.id ? "rgba(37, 99, 235, 0.1)" : "transparent",
                    color: theme.colors.text.primary,
                    cursor: "pointer",
                    transition: `all ${theme.transitions.fast}`,
                    textAlign: "left",
                    fontWeight: selectedGameId === game.id ? "600" : "400",
                  }}
                >
                  <div style={{ fontSize: "0.875rem", color: theme.colors.text.secondary }}>
                    {formatDate(game.date)}
                  </div>
                  <div style={{ fontSize: "1.125rem", fontWeight: "bold", marginTop: "4px" }}>
                    {game.startTime}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: theme.colors.text.secondary, marginTop: "4px" }}>
                    {game.attendances.length}/{game.maxPlayers} confirmados
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Details */}
          {selectedGame && (
            <Card elevated style={{ padding: theme.spacing.lg }}>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {formatFullDate(selectedGame.date)}
                </h2>
                <p
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: "bold",
                    color: theme.colors.primary,
                  }}
                >
                  {selectedGame.startTime}
                </p>
              </div>

              <div
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.bg.secondary,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg,
                }}
              >
                <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary, marginBottom: "4px" }}>
                  📍 Local
                </p>
                <p style={{ fontSize: "1.125rem", fontWeight: "600", color: theme.colors.text.primary }}>
                  {selectedGame.location || "A definir"}
                </p>
              </div>

              {/* Game Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                }}
              >
                <div>
                  <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary, marginBottom: "4px" }}>
                    Duração
                  </p>
                  <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.colors.primary }}>
                    {selectedGame.hours}h
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary, marginBottom: "4px" }}>
                    Tamanho do Time
                  </p>
                  <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.colors.primary }}>
                    {selectedGame.teamSize}v{selectedGame.teamSize}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary, marginBottom: "4px" }}>
                    Vagas
                  </p>
                  <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.colors.primary }}>
                    {selectedGame.maxPlayers}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: "0.875rem", color: theme.colors.text.secondary, marginBottom: "4px" }}>
                    Valor por Pessoa
                  </p>
                  <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.colors.success }}>
                    R$ {calculatePricePerPlayer(selectedGame)}
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div
                style={{
                  paddingTop: theme.spacing.lg,
                  borderTop: `2px solid ${theme.colors.border}`,
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Confirmados ({selectedGame.attendances.length}/{selectedGame.maxPlayers})
                </h3>

                {selectedGame.attendances.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm }}>
                    {selectedGame.attendances.map((att) => (
                      att.player && (
                        <div
                          key={att.id}
                          style={{
                            padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                            backgroundColor: theme.colors.bg.secondary,
                            borderRadius: theme.borderRadius.md,
                            fontSize: "0.875rem",
                            color: theme.colors.text.primary,
                            fontWeight: "500",
                          }}
                        >
                          {att.player.name}
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <p style={{ color: theme.colors.text.secondary, fontStyle: "italic" }}>
                    Nenhum jogador confirmado ainda
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <div style={{ marginTop: theme.spacing.lg }}>
                <Link href={`/jogos/${selectedGame.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <Button variant="primary" style={{ width: "100%" }}>
                    Ver Detalhes Completos
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
