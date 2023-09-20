import { LeagueTableType, Match } from "../types";

// Function to update the league table
export const generateLeagueTable = (matches: Match[]) => {
  const table: LeagueTableType = {};

  matches.forEach((match) => {
    const { home_team, away_team, home_goals, away_goals, group_name } = match;

    if (!table[home_team]) {
      table[home_team] = {
        games_played: 0,
        group_name: group_name,
        form: "",
        points: 0,
        goalsScored: 0,
        goalsConceded: 0,
      };
    }

    if (!table[away_team]) {
      table[away_team] = {
        games_played: 0,
        group_name: group_name,
        form: "",
        points: 0,
        goalsScored: 0,
        goalsConceded: 0,
      };
    }

    if (home_goals !== undefined && away_goals !== undefined) {
      if (home_goals > away_goals) {
        table[home_team].points += 3;
        table[home_team].form += "W";
        table[away_team].form += "L";
      } else if (home_goals === away_goals) {
        table[home_team].form += "D";
        table[away_team].form += "D";
        table[home_team].points += 1;
        table[away_team].points += 1;
      } else {
        table[away_team].points += 3;
        table[home_team].form += "L";
        table[away_team].form += "W";
      }

      table[home_team].goalsScored += home_goals;
      table[home_team].goalsConceded += away_goals;
      table[away_team].goalsScored += away_goals;
      table[away_team].goalsConceded += home_goals;

      table[home_team].games_played += 1;
      table[away_team].games_played += 1;
    }
  });

  const sortedTeams = Object.keys(table).sort((a, b) => {
    const teamA = table[a];
    const teamB = table[b];

    if (teamA.points !== teamB.points) return teamB.points - teamA.points;
    const goalDiffA = teamA.goalsScored - teamA.goalsConceded;
    const goalDiffB = teamB.goalsScored - teamB.goalsConceded;
    if (goalDiffA !== goalDiffB) return goalDiffB - goalDiffA;
    return teamB.goalsScored - teamA.goalsScored;
  });

  return sortedTeams.map((team) => ({ team, ...table[team] }));
};
