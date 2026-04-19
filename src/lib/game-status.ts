// Game status labels and formatting utilities
export const gameStatusLabels = {
  OPEN: { label: "Aberto", color: "#16a34a", bgColor: "rgba(22, 163, 74, 0.1)" },
  FINISHED: {
    label: "Acontecido",
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.1)",
  },
  CLOSED: {
    label: "Fechado",
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.1)",
  },
} as const;

export function getStatusLabel(status: string): string {
  const st = gameStatusLabels[status as keyof typeof gameStatusLabels];
  return st?.label || status;
}

export function getStatusColor(status: string): string {
  const st = gameStatusLabels[status as keyof typeof gameStatusLabels];
  return st?.color || "#6b7280";
}

export function getStatusBgColor(status: string): string {
  const st = gameStatusLabels[status as keyof typeof gameStatusLabels];
  return st?.bgColor || "rgba(107, 114, 128, 0.1)";
}

export function shouldMarkAsFinished(gameDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(gameDate);
  date.setHours(0, 0, 0, 0);
  return date < today;
}
