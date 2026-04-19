// Skill level mapping - Convert numeric levels to descriptive labels
export const skillLevelLabels = {
  1: { emoji: "⭐", name: "Iniciante" },
  2: { emoji: "⭐⭐", name: "Básico" },
  3: { emoji: "⭐⭐⭐", name: "Intermediário" },
  4: { emoji: "⭐⭐⭐⭐", name: "Avançado" },
  5: { emoji: "⭐⭐⭐⭐⭐", name: "Profissional" },
} as const;

export function getSkillLabel(level: number): string {
  const skill = skillLevelLabels[level as keyof typeof skillLevelLabels];
  return skill ? `${skill.emoji} ${skill.name}` : `Nível ${level}`;
}

export function getSkillEmoji(level: number): string {
  const skill = skillLevelLabels[level as keyof typeof skillLevelLabels];
  return skill?.emoji || "✓";
}

export function getSkillName(level: number): string {
  const skill = skillLevelLabels[level as keyof typeof skillLevelLabels];
  return skill?.name || `Nível ${level}`;
}
