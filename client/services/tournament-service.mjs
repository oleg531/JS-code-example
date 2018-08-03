import batching from './shared/batch.mjs';

export default class TournamentService {
  constructor(http) {
    this.http = http;
  }

  createTournament(numberOfTeams, teamsPerMatch) {
    if (!Number.isInteger(numberOfTeams) || numberOfTeams < 0) {
      return Promise.reject(new Error('numberOfTeams is required and must be non negative number'));
    }

    if (!Number.isInteger(teamsPerMatch) || teamsPerMatch < 0) {
      return Promise.reject(new Error('teamsPerMatch is required and must be non negative number'));
    }

    const data = `SOME=${numberOfTeams}&SOME=${teamsPerMatch}`;
    return this.http.post('/SOME-URL', data)
      .then(result => JSON.parse(result));
  }

  getTeamsData(tournamentId, match) {
    if (!Number.isInteger(tournamentId) || tournamentId < 0) {
      return Promise.reject(new Error('tournamentId is required and must be non negative number'));
    }

    if (!match) {
      return Promise.reject(new Error('match is required'));
    }

    // batching
    const teamBatches = batching(match.teamIds, 10, id => this.http.get(`/SOME-URL?SOME=${tournamentId}&SOME=${id}`));

    return teamBatches
      .then(teams => ({
        ...match,
        teams: teams.map(t => JSON.parse(t))
      }));
  }

  getMatchScore(tournamentId, round, match) {
    if (!Number.isInteger(tournamentId) || tournamentId < 0) {
      return Promise.reject(new Error('tournamentId is required and must be non negative number'));
    }

    if (!Number.isInteger(round) || round < 0) {
      return Promise.reject(new Error('round is required and must be non negative number'));
    }

    if (!match) {
      return Promise.reject(new Error('match is required'));
    }

    return this.http.get(`/SOME-URL?SOME=${tournamentId}&SOME=${round}&SOME=${match.match}`)
      .then(score => ({
        ...match,
        score: JSON.parse(score).score
      }));
  }

  getWinnerScore(tournamentId, match, winnerPerMatchHandler) {
    if (!Number.isInteger(tournamentId) || tournamentId < 0) {
      return Promise.reject(new Error('tournamentId is required and must be non negative number'));
    }

    if (!match) {
      return Promise.reject(new Error('match is required'));
    }

    if (!match.teams) {
      return Promise.reject(new Error('match.teams is required'));
    }

    if (!winnerPerMatchHandler || typeof winnerPerMatchHandler !== "function") {
      return Promise.reject(new Error('winnerPerMatchHandler is required and must be a function'));
    }

    return this.http.get(`/SOME-URL?SOME=${tournamentId}${match.teams.map(team => `&SOME=${team.score}`).join('')}&SOME=${match.score}`)
      .then(score => {
        winnerPerMatchHandler();
        return score;
      })
      .then(score => ({
        ...match,
        winner: JSON.parse(score).score
      }));
  }
}
