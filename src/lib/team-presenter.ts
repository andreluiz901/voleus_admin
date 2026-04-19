type PlayerType = {
  name: string;
  skillLevel: number;
};

export function presentTeams(
  teams: PlayerType[][],
  hourPrice: number,
  hours: number
) {

  const totalPlayers = teams.flat().length;

  const totalCost = hourPrice * hours;

   const pricePerPlayer =
    totalCost / totalPlayers;

  console.log("\n🏆 TIMES SORTEADOS\n");

  console.log(
    `💰 Valor por jogador: R$ ${pricePerPlayer.toFixed(2)}`
  );

  console.log(
    `🧾 Total do jogo: R$ ${totalCost.toFixed(2)}\n`
  );

  teams.forEach((team, index) => {
    const totalSkill = team.reduce(
      (sum, player) => sum + player.skillLevel,
      0
    );

    console.log(
      `⚽ Time ${index + 1} (Skill total: ${totalSkill})`
    );

    console.log("--------------------------------");

    team.forEach(player => {
      const stars = "⭐".repeat(player.skillLevel);

      console.log(
        `${player.name.padEnd(12)} ${stars}`
      );
    });

    console.log("\n");
  });
}