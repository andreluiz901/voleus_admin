"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { colors, spacing, typography } from "@/styles/theme";

type Game = {
  id: string;
  date: string;
  startTime: string;
  location: string;
  status: string;
  teamSize: number;
};

export default function AdminPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState({ totalGames: 0, totalPlayers: 0, upcomingGames: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, playersRes] = await Promise.all([
          fetch("/api/games"),
          fetch("/api/players"),
        ]);

        const gamesData: Game[] = (await gamesRes.json()) || [];
        const playersData = (await playersRes.json()) || [];

        setGames(gamesData);
        const upcomingCount = gamesData.filter(
          (g) => new Date(g.date) > new Date()
        ).length;
        setStats({
          totalGames: gamesData.length,
          totalPlayers: playersData.length,
          upcomingGames: upcomingCount,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const upcomingGames = games
    .filter((g) => new Date(g.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <AdminLayout>
      <div style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <div style={{ marginBottom: spacing.xxxl }}>
          <h1 style={{ margin: "0 0 8px 0", ...typography.h1, color: colors.textPrimary }}>
            Dashboard
          </h1>
          <p style={{ margin: "0", ...typography.bodySmall, color: colors.textSecondary }}>
            Bem-vindo ao gerenciador de jogos de vôlei
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: spacing.lg, marginBottom: spacing.xxxl }}>
          <Card elevated>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 8px 0", ...typography.caption, color: colors.textSecondary }}>
                Total de Jogos
              </p>
              <p style={{ margin: "0", fontSize: "32px", fontWeight: "bold", color: colors.primary }}>
                {stats.totalGames}
              </p>
            </div>
          </Card>

          <Card elevated>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 8px 0", ...typography.caption, color: colors.textSecondary }}>
                Próximos Jogos
              </p>
              <p style={{ margin: "0", fontSize: "32px", fontWeight: "bold", color: colors.success }}>
                {stats.upcomingGames}
              </p>
            </div>
          </Card>

          <Card elevated>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 8px 0", ...typography.caption, color: colors.textSecondary }}>
                Total de Jogadores
              </p>
              <p style={{ margin: "0", fontSize: "32px", fontWeight: "bold", color: colors.primary }}>
                {stats.totalPlayers}
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: spacing.xxxl }}>
          <h2 style={{ margin: "0 0 16px 0", ...typography.h3, color: colors.textPrimary }}>
            Ações Rápidas
          </h2>
          <div style={{ display: "flex", gap: spacing.lg, flexWrap: "wrap" }}>
            <Link href="/admin/games/new" style={{ textDecoration: "none" }}>
              <Button>+ Novo Jogo</Button>
            </Link>
            <Link href="/admin/players" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Gerenciar Jogadores</Button>
            </Link>
            <Link href="/admin/games" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Ver Todos os Jogos</Button>
            </Link>
          </div>
        </div>

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <div>
            <h2 style={{ margin: "0 0 16px 0", ...typography.h3, color: colors.textPrimary }}>
              Próximos Jogos
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
              {upcomingGames.map((game) => {
                const date = new Date(game.date);
                const formattedDate = date.toLocaleDateString("pt-BR");

                return (
                  <Link key={game.id} href={`/admin/games/${game.id}`} style={{ textDecoration: "none" }}>
                    <Card hoverable>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                          <p style={{ margin: "0 0 8px 0", ...typography.body, fontWeight: "600", color: colors.textPrimary }}>
                            {formattedDate} às {game.startTime}
                          </p>
                          <p style={{ margin: "0 0 8px 0", ...typography.bodySmall, color: colors.textSecondary }}>
                            📍 {game.location}
                          </p>
                          <p style={{ margin: "0", ...typography.caption, color: colors.textTertiary }}>
                            Time: {game.teamSize} jogadores
                          </p>
                        </div>
                        <div
                          style={{
                            padding: `${spacing.sm} ${spacing.md}`,
                            backgroundColor: colors.success,
                            color: colors.white,
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {game.status}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
