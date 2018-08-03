import batching from '../services/shared/batch.mjs';

export default class Tournament {
  constructor(tournamentService) {
    this.tournamentService = tournamentService;

    this.tournamentId = -1;
    this.teamsPerMatch = -1;
    this.winnerPerMatchHandler = () => null;
  }

  initialize(numberOfTeams, teamsPerMatch, winnerPerMatchHandler) {
    this.teamsPerMatch = teamsPerMatch;
    this.winnerPerMatchHandler = winnerPerMatchHandler;

    return this.tournamentService
      .createTournament(numberOfTeams, teamsPerMatch)
      .then(tournament => {
        this.tournamentId = tournament.tournamentId;
        return tournament.matchUps;
      })
      .then(matches => this.run(matches))
  }

  run(matches, round = 0) {
    if (matches.length == 1 && matches[0].teams && matches[0].teams.length == 1) {
      return matches[0].teams[0];
    }

    // batching matches : 10 per batch
    const roundResults = batching(matches, 10, match =>
      (!match.teams ? this.tournamentService.getTeamsData(this.tournamentId, match) : Promise.resolve(match))
        .then(match => this.tournamentService.getMatchScore(this.tournamentId, round, match))
        .then(match => this.tournamentService.getWinnerScore(this.tournamentId, match, this.winnerPerMatchHandler))
    );

    return roundResults
      .then(matches => {
        const intermediateWinners = matches.map(match => {
          return match.teams.filter(t => t.score === match.winner).sort((a, b) => a.teamId - b.teamId)[0];
        });
        const teamsSlices = this.sliceToMatch(intermediateWinners, this.teamsPerMatch);
        const matchUps = teamsSlices.map((teamSlice, i) => ({
          match: i,
          teamIds: teamSlice.map(t => t.teamId),
          teams: teamSlice
        }));

        return this.run(matchUps, ++round);
      });
  }

  sliceToMatch(arr, teamsInMatch) {
    const res = [];
    while (arr.length > 0) {
      res.push(arr.splice(0, teamsInMatch));
    }
    return res;
  }
}
