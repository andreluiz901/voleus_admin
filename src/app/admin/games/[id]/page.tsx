"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormInput, FormSelect } from "@/components/FormInput";
import { Toast, type ToastType } from "@/components/Toast";
import { type Gender, genderOptions, getGenderLabel } from "@/lib/gender";
import { getSkillLabel } from "@/lib/skill-levels";
import { colors, spacing, typography } from "@/styles/theme";

type Player = {
  id: string;
  name: string;
  skillLevel: number;
  gender: Gender;
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

type GameRestriction = {
  id: string;
  type: "TOGETHER" | "NOT_TOGETHER";
  playerAId: string;
  playerBId: string;
  playerA: Player;
  playerB: Player;
};

type TeamLock = {
  id: string;
  playerId: string;
  targetTeamNumber: number;
  player: Player;
};

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerSkill, setNewPlayerSkill] = useState(3);
  const [newPlayerGender, setNewPlayerGender] = useState<Gender>("OTHER");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
  const [showGenerationPanel, setShowGenerationPanel] = useState(false);
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);
  const [togglingPayment, setTogglingPayment] = useState<string | null>(null);
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);
  const [restrictions, setRestrictions] = useState<GameRestriction[]>([]);
  const [locks, setLocks] = useState<TeamLock[]>([]);
  const [newRestriction, setNewRestriction] = useState<{
    playerAId: string;
    playerBId: string;
    type: "TOGETHER" | "NOT_TOGETHER";
  }>({
    playerAId: "",
    playerBId: "",
    type: "NOT_TOGETHER",
  });
  const [newLock, setNewLock] = useState({ playerId: "", targetTeamNumber: 1 });
  const [quickEdit, setQuickEdit] = useState({
    date: "",
    startTime: "",
    location: "",
    maxPlayers: 16,
    teamSize: 4,
    hourPrice: 40,
    hours: 2,
    notes: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gameRes, playersRes, restrictionsRes, locksRes] =
          await Promise.all([
            fetch(`/api/games/${gameId}`),
            fetch("/api/players"),
            fetch(`/api/games/${gameId}/restrictions`),
            fetch(`/api/games/${gameId}/team-locks`),
          ]);

        if (!gameRes.ok) {
          setError("Jogo não encontrado");
          return;
        }

        const gameData = await gameRes.json();
        setGame(gameData);
        setQuickEdit({
          date: new Date(gameData.date).toISOString().slice(0, 10),
          startTime: gameData.startTime,
          location: gameData.location ?? "",
          maxPlayers: gameData.maxPlayers,
          teamSize: gameData.teamSize,
          hourPrice: gameData.hourPrice,
          hours: gameData.hours,
          notes: gameData.notes ?? "",
        });

        if (playersRes.ok) {
          const playersData = await playersRes.json();
          setAllPlayers(playersData);
        }
        if (restrictionsRes.ok) {
          setRestrictions(await restrictionsRes.json());
        }
        if (locksRes.ok) {
          setLocks(await locksRes.json());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [gameId]);

  const handleAddPlayer = async () => {
    setIsAddingPlayer(true);
    try {
      if (isCreatingNew) {
        const response = await fetch(`/api/games/${gameId}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newPlayerName,
            skillLevel: newPlayerSkill,
            gender: newPlayerGender,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setToast({
            message: data.error || "Erro ao adicionar jogador",
            type: "error",
          });
          return;
        }

        const updatedGame = await response.json();
        setGame(updatedGame);
        setToast({
          message: "Jogador adicionado com sucesso!",
          type: "success",
        });
      } else {
        if (selectedPlayerIds.length === 0) {
          setToast({
            message: "Selecione pelo menos 1 jogador",
            type: "warning",
          });
          return;
        }

        const response = await fetch(`/api/games/${gameId}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerIds: selectedPlayerIds }),
        });

        if (!response.ok) {
          const data = await response.json();
          setToast({
            message:
              data.error ||
              "Nao foi possivel adicionar os jogadores selecionados",
            type: "error",
          });
          return;
        }

        const updatedGame = await response.json();
        setGame(updatedGame);
        setToast({
          message: `${selectedPlayerIds.length} jogador(es) adicionado(s) com sucesso!`,
          type: "success",
        });
      }

      setShowAddPlayer(false);
      setSelectedPlayerIds([]);
      setIsCreatingNew(false);
      setNewPlayerName("");
      setNewPlayerSkill(3);
      setNewPlayerGender("OTHER");
    } catch (err) {
      console.error("Error adding player:", err);
      setToast({
        message: "Erro ao adicionar jogador. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleQuickEditSave = async () => {
    if (!game) return;
    setIsSavingQuickEdit(true);
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickEdit),
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({
          message: data.error || "Erro ao salvar edição rápida",
          type: "error",
        });
        return;
      }

      const updatedGame = await response.json();
      setGame(updatedGame);
      setQuickEdit({
        date: new Date(updatedGame.date).toISOString().slice(0, 10),
        startTime: updatedGame.startTime,
        location: updatedGame.location ?? "",
        maxPlayers: updatedGame.maxPlayers,
        teamSize: updatedGame.teamSize,
        hourPrice: updatedGame.hourPrice,
        hours: updatedGame.hours,
        notes: updatedGame.notes ?? "",
      });
      setToast({ message: "Jogo atualizado com sucesso!", type: "success" });
    } catch (err) {
      console.error("Error saving quick edit:", err);
      setToast({ message: "Erro ao salvar edição rápida", type: "error" });
    } finally {
      setIsSavingQuickEdit(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    setRemovingPlayerId(playerId);
    try {
      const response = await fetch(`/api/games/${gameId}/attendance`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({
          message: data.error || "Erro ao remover jogador",
          type: "error",
        });
        return;
      }

      const updatedGame = await response.json();
      setGame(updatedGame);
      setToast({ message: "Jogador removido com sucesso!", type: "success" });
    } catch (err) {
      console.error("Error removing player:", err);
      setToast({
        message: "Erro ao remover jogador. Tente novamente.",
        type: "error",
      });
    } finally {
      setRemovingPlayerId(null);
    }
  };

  const handleGenerateTeams = async () => {
    const confirmedCount =
      game?.attendances.filter((a) => a.confirmed).length || 0;
    if (confirmedCount === 0) {
      setToast({
        message: "Adicione jogadores antes de gerar times",
        type: "warning",
      });
      return;
    }

    setIsGeneratingTeams(true);
    try {
      const response = await fetch(`/api/games/${gameId}/teams/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        setToast({
          message: data.error || "Erro ao gerar times",
          type: "error",
        });
        return;
      }

      const updatedGame = await response.json();
      setGame(updatedGame);
      setToast({ message: "Times gerados com sucesso!", type: "success" });
    } catch (err) {
      console.error("Error generating teams:", err);
      setToast({
        message: "Erro ao gerar times. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsGeneratingTeams(false);
    }
  };

  const refreshRules = async () => {
    const [restrictionsRes, locksRes] = await Promise.all([
      fetch(`/api/games/${gameId}/restrictions`),
      fetch(`/api/games/${gameId}/team-locks`),
    ]);
    if (restrictionsRes.ok) setRestrictions(await restrictionsRes.json());
    if (locksRes.ok) setLocks(await locksRes.json());
  };

  const handleAddRestriction = async () => {
    if (!newRestriction.playerAId || !newRestriction.playerBId) {
      setToast({
        message: "Selecione os dois jogadores da restricao",
        type: "warning",
      });
      return;
    }
    const response = await fetch(`/api/games/${gameId}/restrictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRestriction),
    });
    if (!response.ok) {
      const data = await response.json();
      setToast({
        message: data.error || "Erro ao salvar restricao",
        type: "error",
      });
      return;
    }
    setNewRestriction({ playerAId: "", playerBId: "", type: "NOT_TOGETHER" });
    await refreshRules();
  };

  const handleDeleteRestriction = async (restrictionId: string) => {
    const response = await fetch(`/api/games/${gameId}/restrictions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restrictionId }),
    });
    if (response.ok) await refreshRules();
  };

  const handleAddLock = async () => {
    if (!newLock.playerId || !newLock.targetTeamNumber) {
      setToast({
        message: "Selecione jogador e numero do time",
        type: "warning",
      });
      return;
    }
    const response = await fetch(`/api/games/${gameId}/team-locks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLock),
    });
    if (!response.ok) {
      const data = await response.json();
      setToast({
        message: data.error || "Erro ao salvar fixacao",
        type: "error",
      });
      return;
    }
    setNewLock({ playerId: "", targetTeamNumber: 1 });
    await refreshRules();
  };

  const handleDeleteLock = async (lockId: string) => {
    const response = await fetch(`/api/games/${gameId}/team-locks`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lockId }),
    });
    if (response.ok) await refreshRules();
  };

  const handleTogglePayment = async (playerId: string) => {
    const attendance = game?.attendances.find((a) => a.playerId === playerId);
    if (!attendance) return;

    setTogglingPayment(playerId);
    try {
      const response = await fetch(
        `/api/games/${gameId}/attendance/${playerId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paid: !attendance.paid }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setToast({
          message: data.error || "Erro ao atualizar pagamento",
          type: "error",
        });
        return;
      }

      const updatedGame = await response.json();
      setGame(updatedGame);
      setToast({
        message: "Pagamento atualizado com sucesso!",
        type: "success",
      });
    } catch (err) {
      console.error("Error toggling payment:", err);
      setToast({
        message: "Erro ao atualizar pagamento. Tente novamente.",
        type: "error",
      });
    } finally {
      setTogglingPayment(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Card>
          <p style={{ color: colors.textSecondary }}>Carregando...</p>
        </Card>
      </AdminLayout>
    );
  }

  if (error || !game) {
    return (
      <AdminLayout>
        <Card>
          <p style={{ color: colors.error, ...typography.body }}>{error}</p>
          <Link href="/admin/games" style={{ textDecoration: "none" }}>
            <Button variant="secondary" style={{ marginTop: spacing.lg }}>
              ← Voltar
            </Button>
          </Link>
        </Card>
      </AdminLayout>
    );
  }

  const date = new Date(game.date);
  const formattedDate = date.toLocaleDateString("pt-BR");
  const totalCost = game.hourPrice * game.hours;
  const pricePerPlayer =
    game.attendances.length > 0 ? totalCost / game.attendances.length : 0;
  const confirmedPlayers = game.attendances.filter((a) => a.confirmed).length;
  const getPlayerSkillTotal = (teamId: string) =>
    game.teams
      .find((t) => t.id === teamId)
      ?.players.reduce((total, tp) => total + tp.player.skillLevel, 0) || 0;

  const availablePlayers = allPlayers.filter(
    (p) => !game.attendances.some((a) => a.playerId === p.id),
  );

  const toggleSelectedPlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  return (
    <>
      <AdminLayout>
        <div style={{ maxWidth: "1200px" }}>
          {/* Header */}
          <div style={{ marginBottom: spacing.xl }}>
            <Link href="/admin/games" style={{ textDecoration: "none" }}>
              <p
                style={{
                  margin: "0 0 16px 0",
                  color: colors.primary,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                ← Voltar aos Jogos
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
            <div style={{ marginTop: spacing.md }}>
              <Link
                href={`/admin/games/${gameId}/edit`}
                style={{ textDecoration: "none" }}
              >
                <Button variant="secondary">Editar completo</Button>
              </Link>
            </div>
          </div>

          <Card style={{ marginBottom: spacing.xl, padding: spacing.lg }}>
            <h3
              style={{
                margin: `0 0 ${spacing.md} 0`,
                ...typography.h3,
                color: colors.textPrimary,
              }}
            >
              Edição rápida
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: spacing.md,
              }}
            >
              <FormInput
                label="Data"
                type="date"
                value={quickEdit.date}
                onChange={(e) =>
                  setQuickEdit((prev) => ({ ...prev, date: e.target.value }))
                }
              />
              <FormInput
                label="Horário"
                type="time"
                value={quickEdit.startTime}
                onChange={(e) =>
                  setQuickEdit((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
              <FormInput
                label="Duração (h)"
                type="number"
                min="1"
                value={quickEdit.hours}
                onChange={(e) =>
                  setQuickEdit((prev) => ({
                    ...prev,
                    hours: Number(e.target.value),
                  }))
                }
              />
              <FormInput
                label="Valor/hora (R$)"
                type="number"
                min="0"
                step="0.01"
                value={quickEdit.hourPrice}
                onChange={(e) =>
                  setQuickEdit((prev) => ({
                    ...prev,
                    hourPrice: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div style={{ marginTop: spacing.md }}>
              <Button
                onClick={handleQuickEditSave}
                loading={isSavingQuickEdit}
                disabled={isSavingQuickEdit}
              >
                Salvar edição rápida
              </Button>
            </div>
          </Card>

          {/* Game Info Cards */}
          <Card
            elevated
            style={{ marginBottom: spacing.xl, padding: spacing.lg }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
                  Data
                </p>
                <p
                  style={{
                    margin: "0",
                    ...typography.h3,
                    color: colors.textPrimary,
                  }}
                >
                  {formattedDate}
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
                  {game.location}
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
                  Confirmados
                </p>
                <p
                  style={{
                    margin: "0",
                    ...typography.h3,
                    color:
                      confirmedPlayers === game.maxPlayers
                        ? colors.success
                        : colors.warning,
                  }}
                >
                  {confirmedPlayers}/{game.maxPlayers}
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
                  Time Size
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
            </div>

            {confirmedPlayers > 0 && (
              <div
                style={{
                  marginTop: spacing.lg,
                  paddingTop: spacing.lg,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
                        fontWeight: "600",
                        color: colors.textPrimary,
                      }}
                    >
                      R$ {pricePerPlayer.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Add Player Section */}
          <div style={{ marginBottom: spacing.xl }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.lg,
                flexWrap: "wrap",
                gap: spacing.lg,
              }}
            >
              <h2
                style={{
                  margin: "0",
                  ...typography.h2,
                  color: colors.textPrimary,
                }}
              >
                👥 Jogadores ({confirmedPlayers})
              </h2>
              <Button onClick={() => setShowAddPlayer(!showAddPlayer)}>
                {showAddPlayer ? "✕ Cancelar" : "+ Adicionar"}
              </Button>
            </div>

            {showAddPlayer && (
              <Card
                style={{
                  marginBottom: spacing.xl,
                  backgroundColor: colors.surface,
                  padding: spacing.lg,
                }}
              >
                {/* Option 1: Select Existing Player */}
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.md,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                    border: `2px ${!isCreatingNew ? `solid ${colors.primary}` : `solid ${colors.border}`}`,
                    borderRadius: "8px",
                    backgroundColor: !isCreatingNew
                      ? "rgba(37, 99, 235, 0.05)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (isCreatingNew) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(37, 99, 235, 0.03)";
                      e.currentTarget.style.borderColor = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isCreatingNew) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  <input
                    type="radio"
                    checked={!isCreatingNew}
                    onChange={() => setIsCreatingNew(false)}
                    style={{
                      cursor: "pointer",
                      width: "20px",
                      height: "20px",
                      marginTop: "2px",
                      accentColor: colors.primary,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        ...typography.body,
                        fontWeight: "600",
                        color: colors.textPrimary,
                      }}
                    >
                      Selecionar jogador existente
                    </p>
                    <p
                      style={{
                        margin: "0",
                        ...typography.bodySmall,
                        color: colors.textSecondary,
                      }}
                    >
                      Escolha um jogador já cadastrado no sistema
                    </p>
                  </div>
                </button>

                {!isCreatingNew && (
                  <div
                    style={{
                      marginBottom: spacing.lg,
                      paddingLeft: spacing.lg,
                      borderLeft: `3px solid ${colors.primary}`,
                      paddingTop: spacing.md,
                      paddingBottom: spacing.md,
                    }}
                  >
                    {availablePlayers.length > 0 ? (
                      <>
                        <div style={{ marginBottom: spacing.sm }}>
                          <p
                            style={{
                              margin: "0 0 6px 0",
                              ...typography.bodySmall,
                              color: colors.textSecondary,
                            }}
                          >
                            Selecione varios jogadores de uma vez
                          </p>
                          <div style={{ display: "flex", gap: spacing.sm }}>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                setSelectedPlayerIds(
                                  availablePlayers.map((player) => player.id),
                                )
                              }
                            >
                              Marcar todos
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedPlayerIds([])}
                            >
                              Limpar
                            </Button>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: spacing.sm,
                            maxHeight: "260px",
                            overflowY: "auto",
                            paddingRight: spacing.xs,
                          }}
                        >
                          {availablePlayers.map((player) => {
                            const checked = selectedPlayerIds.includes(
                              player.id,
                            );
                            return (
                              <label
                                key={player.id}
                                style={{
                                  display: "flex",
                                  gap: spacing.sm,
                                  alignItems: "center",
                                  border: `1px solid ${checked ? colors.primary : colors.border}`,
                                  borderRadius: "8px",
                                  padding: spacing.sm,
                                  backgroundColor: checked
                                    ? "rgba(37, 99, 235, 0.08)"
                                    : colors.white,
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleSelectedPlayer(player.id)
                                  }
                                  style={{
                                    accentColor: colors.primary,
                                    width: "16px",
                                    height: "16px",
                                  }}
                                />
                                <span
                                  style={{
                                    ...typography.bodySmall,
                                    color: colors.textPrimary,
                                  }}
                                >
                                  {player.name} •{" "}
                                  {getSkillLabel(player.skillLevel)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          padding: spacing.md,
                          backgroundColor: "rgba(220, 53, 69, 0.05)",
                          borderRadius: "6px",
                          borderLeft: `3px solid ${colors.error}`,
                        }}
                      >
                        <p
                          style={{
                            margin: "0",
                            ...typography.bodySmall,
                            color: colors.error,
                            fontWeight: "600",
                          }}
                        >
                          ⚠️ Todos os jogadores já foram adicionados
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            ...typography.bodySmall,
                            color: colors.textSecondary,
                          }}
                        >
                          Crie um novo jogador ou remova alguém existente
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Option 2: Create New Player */}
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.md,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                    border: `2px ${isCreatingNew ? `solid ${colors.primary}` : `solid ${colors.border}`}`,
                    borderRadius: "8px",
                    backgroundColor: isCreatingNew
                      ? "rgba(37, 99, 235, 0.05)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCreatingNew) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(37, 99, 235, 0.03)";
                      e.currentTarget.style.borderColor = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCreatingNew) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  <input
                    type="radio"
                    checked={isCreatingNew}
                    onChange={() => setIsCreatingNew(true)}
                    style={{
                      cursor: "pointer",
                      width: "20px",
                      height: "20px",
                      marginTop: "2px",
                      accentColor: colors.primary,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        ...typography.body,
                        fontWeight: "600",
                        color: colors.textPrimary,
                      }}
                    >
                      Criar novo jogador
                    </p>
                    <p
                      style={{
                        margin: "0",
                        ...typography.bodySmall,
                        color: colors.textSecondary,
                      }}
                    >
                      Adicione um novo jogador ao sistema
                    </p>
                  </div>
                </button>

                {isCreatingNew && (
                  <div
                    style={{
                      marginBottom: spacing.lg,
                      paddingLeft: spacing.lg,
                      borderLeft: `3px solid ${colors.primary}`,
                      paddingTop: spacing.md,
                      paddingBottom: spacing.md,
                    }}
                  >
                    <FormInput
                      label="Nome completo"
                      placeholder="Ex: João Silva"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                    />

                    <FormSelect
                      label="Nível de Habilidade"
                      value={newPlayerSkill}
                      onChange={(e) =>
                        setNewPlayerSkill(Number(e.target.value))
                      }
                      options={[
                        { value: 1, label: "⭐ Iniciante" },
                        { value: 2, label: "⭐⭐ Básico" },
                        { value: 3, label: "⭐⭐⭐ Intermediário" },
                        { value: 4, label: "⭐⭐⭐⭐ Avançado" },
                        { value: 5, label: "⭐⭐⭐⭐⭐ Profissional" },
                      ]}
                    />
                    <FormSelect
                      label="Gênero"
                      value={newPlayerGender}
                      onChange={(e) =>
                        setNewPlayerGender(e.target.value as Gender)
                      }
                      options={genderOptions.map((gender) => ({
                        value: gender,
                        label: getGenderLabel(gender),
                      }))}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: spacing.lg,
                    flexWrap: "wrap",
                    paddingTop: spacing.lg,
                    borderTop: `1px solid ${colors.border}`,
                  }}
                >
                  <Button
                    onClick={handleAddPlayer}
                    disabled={
                      isAddingPlayer ||
                      (!isCreatingNew && selectedPlayerIds.length === 0) ||
                      (isCreatingNew && !newPlayerName)
                    }
                    loading={isAddingPlayer}
                  >
                    ✓ Adicionar{" "}
                    {isCreatingNew
                      ? "Jogador"
                      : `${selectedPlayerIds.length} Jogador(es)`}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowAddPlayer(false);
                      setIsCreatingNew(false);
                      setSelectedPlayerIds([]);
                      setNewPlayerName("");
                      setNewPlayerSkill(3);
                      setNewPlayerGender("OTHER");
                    }}
                  >
                    ✕ Cancelar
                  </Button>
                </div>
              </Card>
            )}

            {/* Players Grid */}
            {confirmedPlayers === 0 ? (
              <Card
                style={{
                  textAlign: "center",
                  padding: spacing.xl,
                  backgroundColor: colors.surface,
                }}
              >
                <p style={{ color: colors.textSecondary }}>
                  Nenhum jogador adicionado ainda
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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: spacing.md,
                          }}
                        >
                          <p
                            style={{
                              margin: "0",
                              ...typography.body,
                              fontWeight: "600",
                              color: colors.textPrimary,
                              flex: 1,
                            }}
                          >
                            {a.player.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayer(a.playerId)}
                            disabled={removingPlayerId === a.playerId}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "18px",
                              cursor:
                                removingPlayerId === a.playerId
                                  ? "wait"
                                  : "pointer",
                              color: colors.error,
                              padding: "0",
                              marginLeft: spacing.sm,
                              opacity:
                                removingPlayerId === a.playerId ? 0.6 : 1,
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        <p
                          style={{
                            margin: "0 0 12px 0",
                            ...typography.caption,
                            color: colors.textSecondary,
                          }}
                        >
                          {getSkillLabel(a.player.skillLevel)} •{" "}
                          {getGenderLabel(a.player.gender)}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleTogglePayment(a.playerId)}
                          disabled={togglingPayment === a.playerId}
                          style={{
                            width: "100%",
                            padding: spacing.sm,
                            backgroundColor: a.paid
                              ? colors.success
                              : colors.error,
                            color: colors.white,
                            border: "none",
                            borderRadius: "4px",
                            cursor:
                              togglingPayment === a.playerId
                                ? "wait"
                                : "pointer",
                            ...typography.caption,
                            fontWeight: "600",
                            opacity: togglingPayment === a.playerId ? 0.7 : 1,
                          }}
                        >
                          {togglingPayment === a.playerId
                            ? "Atualizando..."
                            : a.paid
                              ? "✓ Pago"
                              : "Não pago"}
                        </button>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Teams Section */}
          {game.teams && game.teams.length > 0 && (
            <div style={{ marginBottom: spacing.xl }}>
              <h2
                style={{
                  margin: "0 0 16px 0",
                  ...typography.h2,
                  color: colors.textPrimary,
                }}
              >
                🏐 Times ({game.teams.length})
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
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

                    <p
                      style={{
                        margin: "0 0 16px 0",
                        ...typography.bodySmall,
                        color: colors.textTertiary,
                      }}
                    >
                      Skill total:{" "}
                      <strong>{getPlayerSkillTotal(team.id)}</strong>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: spacing.sm,
                      }}
                    >
                      {team.players.map((tp) => (
                        <p
                          key={tp.id}
                          style={{
                            margin: "0",
                            ...typography.bodySmall,
                            color: colors.textPrimary,
                          }}
                        >
                          • {tp.player.name}
                          <span
                            style={{
                              color: colors.textTertiary,
                              marginLeft: spacing.sm,
                            }}
                          >
                            ({tp.player.skillLevel})
                          </span>
                        </p>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Generate Teams Button */}
          <div
            style={{
              display: "flex",
              gap: spacing.lg,
              flexWrap: "wrap",
              marginBottom: spacing.lg,
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowGenerationPanel((prev) => !prev)}
            >
              {showGenerationPanel
                ? "Ocultar configuracao"
                : "Configurar geracao"}
            </Button>
            <Button
              size="lg"
              onClick={handleGenerateTeams}
              disabled={isGeneratingTeams || confirmedPlayers === 0}
              loading={isGeneratingTeams}
            >
              🏐 Gerar Times
            </Button>

            {confirmedPlayers === 0 && (
              <p
                style={{
                  margin: "0",
                  ...typography.bodySmall,
                  color: colors.textTertiary,
                  alignSelf: "center",
                }}
              >
                Adicione jogadores para gerar times
              </p>
            )}
          </div>
          {showGenerationPanel && (
            <Card style={{ padding: spacing.lg, marginBottom: spacing.lg }}>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  ...typography.h3,
                  color: colors.textPrimary,
                }}
              >
                Regras de geracao deste jogo
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.lg,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      ...typography.bodySmall,
                      fontWeight: "600",
                      color: colors.textPrimary,
                    }}
                  >
                    Restricoes (juntos/separados)
                  </p>
                  <FormSelect
                    label="Jogador A"
                    value={newRestriction.playerAId}
                    onChange={(e) =>
                      setNewRestriction((prev) => ({
                        ...prev,
                        playerAId: e.target.value,
                      }))
                    }
                    options={[
                      { value: "", label: "Selecione" },
                      ...game.attendances
                        .filter((a) => a.confirmed)
                        .map((a) => ({
                          value: a.playerId,
                          label: a.player.name,
                        })),
                    ]}
                  />
                  <FormSelect
                    label="Jogador B"
                    value={newRestriction.playerBId}
                    onChange={(e) =>
                      setNewRestriction((prev) => ({
                        ...prev,
                        playerBId: e.target.value,
                      }))
                    }
                    options={[
                      { value: "", label: "Selecione" },
                      ...game.attendances
                        .filter((a) => a.confirmed)
                        .map((a) => ({
                          value: a.playerId,
                          label: a.player.name,
                        })),
                    ]}
                  />
                  <FormSelect
                    label="Tipo"
                    value={newRestriction.type}
                    onChange={(e) =>
                      setNewRestriction((prev) => ({
                        ...prev,
                        type: e.target.value as "TOGETHER" | "NOT_TOGETHER",
                      }))
                    }
                    options={[
                      { value: "TOGETHER", label: "Ficam juntos" },
                      { value: "NOT_TOGETHER", label: "Ficam separados" },
                    ]}
                  />
                  <Button size="sm" onClick={handleAddRestriction}>
                    Adicionar restricao
                  </Button>
                  <div
                    style={{
                      marginTop: spacing.sm,
                      display: "flex",
                      flexDirection: "column",
                      gap: spacing.xs,
                    }}
                  >
                    {restrictions.map((restriction) => (
                      <div
                        key={restriction.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: spacing.sm,
                        }}
                      >
                        <span
                          style={{
                            ...typography.caption,
                            color: colors.textSecondary,
                          }}
                        >
                          {restriction.playerA.name}{" "}
                          {restriction.type === "TOGETHER" ? "com" : "sem"}{" "}
                          {restriction.playerB.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteRestriction(restriction.id)
                          }
                          style={{
                            border: "none",
                            background: "none",
                            color: colors.error,
                            cursor: "pointer",
                          }}
                        >
                          remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      ...typography.bodySmall,
                      fontWeight: "600",
                      color: colors.textPrimary,
                    }}
                  >
                    Fixar jogador em time
                  </p>
                  <FormSelect
                    label="Jogador"
                    value={newLock.playerId}
                    onChange={(e) =>
                      setNewLock((prev) => ({
                        ...prev,
                        playerId: e.target.value,
                      }))
                    }
                    options={[
                      { value: "", label: "Selecione" },
                      ...game.attendances
                        .filter((a) => a.confirmed)
                        .map((a) => ({
                          value: a.playerId,
                          label: a.player.name,
                        })),
                    ]}
                  />
                  <FormInput
                    label="Numero do time"
                    type="number"
                    min="1"
                    value={newLock.targetTeamNumber}
                    onChange={(e) =>
                      setNewLock((prev) => ({
                        ...prev,
                        targetTeamNumber: Number(e.target.value),
                      }))
                    }
                  />
                  <Button size="sm" onClick={handleAddLock}>
                    Adicionar fixacao
                  </Button>
                  <div
                    style={{
                      marginTop: spacing.sm,
                      display: "flex",
                      flexDirection: "column",
                      gap: spacing.xs,
                    }}
                  >
                    {locks.map((lock) => (
                      <div
                        key={lock.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: spacing.sm,
                        }}
                      >
                        <span
                          style={{
                            ...typography.caption,
                            color: colors.textSecondary,
                          }}
                        >
                          {lock.player.name} fixo no Time{" "}
                          {lock.targetTeamNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteLock(lock.id)}
                          style={{
                            border: "none",
                            background: "none",
                            color: colors.error,
                            cursor: "pointer",
                          }}
                        >
                          remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </AdminLayout>
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
