"use client";

import { toPng } from "html-to-image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PublicLayout } from "@/components/PublicLayout";
import { Toast, type ToastType } from "@/components/Toast";
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
  const [isCopyingSummary, setIsCopyingSummary] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

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
  const pricePerPlayer =
    game.attendances.length > 0 ? totalCost / game.attendances.length : 0;
  const confirmedCount = game.attendances.filter((a) => a.confirmed).length;
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const getTeamSkillTotal = (teamId: string) =>
    game.teams
      .find((team) => team.id === teamId)
      ?.players.reduce(
        (acc, teamPlayer) => acc + teamPlayer.player.skillLevel,
        0,
      ) || 0;

  const buildShareSummary = () => {
    const confirmedPlayers = [...game.attendances]
      .filter((attendance) => attendance.confirmed)
      .sort((a, b) => b.player.skillLevel - a.player.skillLevel);
    const paidCount = confirmedPlayers.filter(
      (attendance) => attendance.paid,
    ).length;

    const playersLines = confirmedPlayers.map(
      (attendance, index) =>
        `${index + 1}. ${attendance.player.name} - Skill ${attendance.player.skillLevel} - ${attendance.paid ? "Pago" : "Pendente"}`,
    );

    const teamLines = game.teams.flatMap((team) => [
      `${team.name} (Skill ${getTeamSkillTotal(team.id)})`,
      ...team.players.map(
        (teamPlayer) =>
          `  - ${teamPlayer.player.name} (Skill ${teamPlayer.player.skillLevel})`,
      ),
      "",
    ]);

    return [
      `🏐 Jogo - ${formattedDate}`,
      `${game.startTime} | ${game.location}`,
      "",
      "📊 Resumo",
      `- Confirmados: ${confirmedCount}/${game.maxPlayers}`,
      `- Times gerados: ${game.teams.length}`,
      `- Valor total: ${formatCurrency(totalCost)}`,
      `- Valor por jogador: ${formatCurrency(pricePerPlayer)}`,
      `- Pagamentos: ${paidCount}/${confirmedCount}`,
      "",
      "👥 Jogadores",
      ...playersLines,
      "",
      "🧩 Times",
      ...teamLines,
      "Gerado no Volei Manager",
    ].join("\n");
  };

  const handleCopySummary = async () => {
    if (!game.teams.length) {
      setToast({
        message: "Os times ainda nao foram gerados para este jogo",
        type: "warning",
      });
      return;
    }

    setIsCopyingSummary(true);
    try {
      await navigator.clipboard.writeText(buildShareSummary());
      setToast({
        message: "Resumo copiado! Agora e so colar no WhatsApp.",
        type: "success",
      });
    } catch (err) {
      console.error("Error copying summary:", err);
      setToast({
        message: "Nao foi possivel copiar o resumo",
        type: "error",
      });
    } finally {
      setIsCopyingSummary(false);
    }
  };

  const handleShareOnWhatsApp = () => {
    if (!game.teams.length) {
      setToast({
        message: "Os times ainda nao foram gerados para este jogo",
        type: "warning",
      });
      return;
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(buildShareSummary())}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportImage = async () => {
    if (!exportCardRef.current || !game.teams.length) {
      setToast({
        message: "Os times ainda nao foram gerados para este jogo",
        type: "warning",
      });
      return;
    }

    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(exportCardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: colors.background,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileName = `times-${game.id}.png`;
      const imageFile = new File([blob], fileName, { type: "image/png" });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [imageFile] })
      ) {
        await navigator.share({
          title: `Times ${formattedDate}`,
          text: `Times do jogo de ${formattedDate}`,
          files: [imageFile],
        });
        setToast({
          message: "Imagem pronta e compartilhada com sucesso!",
          type: "success",
        });
        return;
      }

      const downloadLink = document.createElement("a");
      downloadLink.download = fileName;
      downloadLink.href = dataUrl;
      downloadLink.click();
      setToast({
        message: "Imagem exportada! Voce pode compartilhar no WhatsApp.",
        type: "success",
      });
    } catch (err) {
      console.error("Error exporting image:", err);
      setToast({
        message: "Erro ao exportar imagem do jogo",
        type: "error",
      });
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <>
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
            <h1
              style={{
                margin: "0 0 8px 0",
                ...typography.h1,
                color: colors.textPrimary,
              }}
            >
              {formattedDate}
            </h1>
            <p
              style={{
                margin: "0",
                ...typography.body,
                color: colors.textSecondary,
              }}
            >
              {game.startTime} • {game.location}
            </p>
          </div>

          {/* Main Info Card */}
          <Card
            elevated
            style={{ marginBottom: spacing.xl, padding: spacing.xl }}
          >
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
                <p
                  style={{
                    margin: "0",
                    ...typography.h3,
                    color: colors.primary,
                  }}
                >
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
                <p
                  style={{
                    margin: "0",
                    ...typography.body,
                    color: colors.textPrimary,
                  }}
                >
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
                <p
                  style={{
                    margin: "0",
                    ...typography.body,
                    color: colors.textPrimary,
                  }}
                >
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
                <p
                  style={{
                    margin: "0",
                    ...typography.body,
                    color: colors.textPrimary,
                  }}
                >
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
                <p
                  style={{
                    margin: "0",
                    ...typography.h3,
                    color: colors.success,
                  }}
                >
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
                <p
                  style={{
                    margin: "0",
                    ...typography.body,
                    color: colors.textPrimary,
                    fontWeight: "600",
                  }}
                >
                  R$ {pricePerPlayer.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {game.notes && (
            <Card
              style={{
                marginBottom: spacing.xl,
                backgroundColor: colors.surface,
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  ...typography.caption,
                  color: colors.textSecondary,
                }}
              >
                📝 Notas
              </p>
              <p
                style={{
                  margin: "0",
                  ...typography.body,
                  color: colors.textPrimary,
                }}
              >
                {game.notes}
              </p>
            </Card>
          )}

          {/* Participants */}
          <div style={{ marginBottom: spacing.xl }}>
            <h2
              style={{
                margin: "0 0 16px 0",
                ...typography.h2,
                color: colors.textPrimary,
              }}
            >
              ✅ Confirmados ({confirmedCount}/{game.maxPlayers})
            </h2>

            {confirmedCount === 0 ? (
              <Card style={{ textAlign: "center", padding: spacing.lg }}>
                <p style={{ color: colors.textSecondary }}>
                  Nenhum jogador confirmado ainda
                </p>
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
                              backgroundColor: a.paid
                                ? colors.success
                                : colors.error,
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
              <h2
                style={{
                  margin: "0 0 16px 0",
                  ...typography.h2,
                  color: colors.textPrimary,
                }}
              >
                🏐 Times
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: spacing.sm,
                  flexWrap: "wrap",
                  marginBottom: spacing.lg,
                }}
              >
                <Button
                  variant="secondary"
                  onClick={handleCopySummary}
                  disabled={isCopyingSummary}
                  loading={isCopyingSummary}
                >
                  📋 Copiar resumo para compartilhar
                </Button>
                <Button variant="secondary" onClick={handleShareOnWhatsApp}>
                💬 Compartilhar no WhatsApp
                </Button>
                <Button
                  onClick={handleExportImage}
                  disabled={isExportingImage}
                  loading={isExportingImage}
                >
                  🖼️ Exportar imagem dos times
                </Button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: spacing.lg,
                }}
              >
                {game.teams.map((team) => (
                  <Card
                    key={team.id}
                    style={{ backgroundColor: colors.surface }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        ...typography.h3,
                        color: colors.primary,
                      }}
                    >
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

              <div
                style={{
                  position: "fixed",
                  left: "-9999px",
                  top: "0",
                  width: "960px",
                  padding: spacing.xxl,
                  background:
                    "linear-gradient(135deg, #eef4ff 0%, #f8f9fa 55%, #f2fdf5 100%)",
                  color: colors.textPrimary,
                  borderRadius: "20px",
                }}
              >
                <div
                  ref={exportCardRef}
                  style={{
                    borderRadius: "20px",
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.white,
                    overflow: "hidden",
                    boxShadow: "0 10px 32px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <div
                    style={{
                      padding: spacing.xxl,
                      background:
                        "linear-gradient(120deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)",
                      color: colors.white,
                    }}
                  >
                    <p style={{ margin: `0 0 ${spacing.xs} 0`, opacity: 0.9 }}>
                      VOLEI MANAGER
                    </p>
                    <h2
                      style={{
                        margin: `0 0 ${spacing.sm} 0`,
                        fontSize: "36px",
                      }}
                    >
                      Times do jogo - {formattedDate}
                    </h2>
                    <p style={{ margin: "0", fontSize: "18px", opacity: 0.95 }}>
                      {game.startTime} • {game.location}
                    </p>
                  </div>

                  <div style={{ padding: spacing.xxl }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: spacing.lg,
                        marginBottom: spacing.xl,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#eef4ff",
                          padding: spacing.lg,
                          borderRadius: "12px",
                        }}
                      >
                        <p
                          style={{
                            margin: `0 0 ${spacing.xs} 0`,
                            color: colors.textSecondary,
                          }}
                        >
                          Confirmados
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "24px",
                            fontWeight: 700,
                          }}
                        >
                          {confirmedCount}/{game.maxPlayers}
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#ecfdf3",
                          padding: spacing.lg,
                          borderRadius: "12px",
                        }}
                      >
                        <p
                          style={{
                            margin: `0 0 ${spacing.xs} 0`,
                            color: colors.textSecondary,
                          }}
                        >
                          Valor por jogador
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "24px",
                            fontWeight: 700,
                          }}
                        >
                          {formatCurrency(pricePerPlayer)}
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#fff7ed",
                          padding: spacing.lg,
                          borderRadius: "12px",
                        }}
                      >
                        <p
                          style={{
                            margin: `0 0 ${spacing.xs} 0`,
                            color: colors.textSecondary,
                          }}
                        >
                          Total da quadra
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "24px",
                            fontWeight: 700,
                          }}
                        >
                          {formatCurrency(totalCost)}
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#f5f3ff",
                          padding: spacing.lg,
                          borderRadius: "12px",
                        }}
                      >
                        <p
                          style={{
                            margin: `0 0 ${spacing.xs} 0`,
                            color: colors.textSecondary,
                          }}
                        >
                          Times
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "24px",
                            fontWeight: 700,
                          }}
                        >
                          {game.teams.length}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: spacing.lg,
                      }}
                    >
                      {game.teams.map((team) => (
                        <div
                          key={`share-${team.id}`}
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: "12px",
                            padding: spacing.lg,
                            backgroundColor: "#fcfcfd",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: spacing.sm,
                            }}
                          >
                            <h3
                              style={{
                                margin: "0",
                                color: colors.primaryDark,
                                fontSize: "22px",
                              }}
                            >
                              {team.name}
                            </h3>
                            <span
                              style={{
                                color: colors.textSecondary,
                                fontSize: "14px",
                                fontWeight: 600,
                              }}
                            >
                              Skill {getTeamSkillTotal(team.id)}
                            </span>
                          </div>
                          <div style={{ display: "grid", gap: spacing.xs }}>
                            {team.players.map((teamPlayer) => (
                              <p
                                key={`share-player-${teamPlayer.id}`}
                                style={{ margin: "0", fontSize: "16px" }}
                              >
                                • {teamPlayer.player.name}
                                <span
                                  style={{
                                    marginLeft: spacing.sm,
                                    color: colors.textSecondary,
                                    fontSize: "14px",
                                  }}
                                >
                                  Skill {teamPlayer.player.skillLevel}
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PublicLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
