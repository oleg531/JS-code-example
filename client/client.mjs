import Http from "./services/shared/http.mjs";
import TournamentService from "./services/tournament-service.mjs";
import Tournament from "./components/tournament.mjs";

(() => {
    const http = new Http();
    const tournamentService = new TournamentService(http);
    const tournament = new Tournament(tournamentService);

    document.getElementById('SOME-ID').onclick = () => {

        document.getElementById('SOME-ID').innerHTML = '';
        document.getElementById('SOME-ID').innerHTML = '';
        const teamsPerMatch = document.getElementById('SOME-ID').value;
        const numberOfTeams = document.getElementById('SOME-ID').value;

        drawMatches(teamsPerMatch, numberOfTeams);

        tournament.initialize(+numberOfTeams, +teamsPerMatch, fillMatch)
            .then(res => {
                document.getElementById('SOME-ID').innerHTML = `${res.name}`
                document.getElementById('SOME-ID').innerHTML = ' is the Winner.';
            })
            .catch(error => {
                console.error(error.message);
                alert(error.message);
            });
    }

    function drawMatches(teamsPerMatch, numberOfTeams) {
        const progress = document.getElementById('SOME-ID');
        while (progress.firstChild) {
            progress.removeChild(progress.firstChild);
        }

        let matchesPerRound = numberOfTeams;
        let matchesCount = 0;
        while (matchesPerRound > 1) {
            matchesCount += (matchesPerRound /= teamsPerMatch);
        }

        for (let i = 0; i < matchesCount; i++) {
            const div = document.createElement('div');
            div.className = 'match';
            progress.appendChild(div);
        }
    }

    function fillMatch() {
        const match = document.querySelector('.match:not(.compleated)');
        match.className += ' compleated';
    }
})();

