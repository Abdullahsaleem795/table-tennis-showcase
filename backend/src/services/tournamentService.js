const { supabase, isSupabaseConfigured } = require('../config/supabase');
const Tournament = require('../models/Tournament');
const playerService = require('./playerService');
const dbConfig = require('../config/db');

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateMatchId() {
  return 'm_' + Math.random().toString(36).substring(2, 9);
}

module.exports = {
  async getTournament() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('social_links')
          .eq('id', 'tournament_data')
          .maybeSingle();

        if (!error && data && data.social_links) {
          return data.social_links;
        }
      } catch (err) {
        console.error("Supabase getTournament failed:", err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      let t = await Tournament.findOne({});
      return t || { status: 'not_started', totalPlayers: 0, rounds: [], champion: null };
    } else {
      const data = dbConfig.getLocalData();
      return data.tournament || { status: 'not_started', totalPlayers: 0, rounds: [], champion: null };
    }
  },

  async generateTournament() {
    const players = await playerService.getAll();
    if (!players || players.length < 2) {
      throw new Error("At least 2 registered players are required to generate a tournament bracket.");
    }

    // 1. Shuffle players randomly
    const shuffled = shuffle(players);
    const totalPlayers = shuffled.length;

    // 2. Generate Round 1 matches
    const round1Matches = [];
    for (let i = 0; i < totalPlayers; i += 2) {
      const p1 = shuffled[i];
      const p2 = shuffled[i + 1] || null; // Bye if odd number of players
      round1Matches.push({
        matchId: generateMatchId(),
        player1: p1,
        player2: p2,
        winner: p2 ? null : p1, // Auto advance if bye
        status: p2 ? 'pending' : 'completed'
      });
    }

    const rounds = [];
    
    // Determine labels based on total matches in Round 1
    const getRoundName = (matchCount, roundIndex, totalRounds) => {
      if (roundIndex === totalRounds - 1) return 'Final';
      if (roundIndex === totalRounds - 2) return 'Semi-finals';
      if (roundIndex === totalRounds - 3) return 'Quarter-finals';
      return `Round ${roundIndex + 1}`;
    };

    // Calculate total rounds needed
    const totalRoundsCount = Math.max(1, Math.ceil(Math.log2(totalPlayers)));

    // Push Round 1
    rounds.push({
      roundNumber: 1,
      roundName: getRoundName(round1Matches.length, 0, totalRoundsCount),
      matches: round1Matches
    });

    // Generate empty slots for next rounds
    let prevMatchCount = round1Matches.length;
    let roundNum = 2;

    while (prevMatchCount > 1) {
      const currentMatchCount = Math.ceil(prevMatchCount / 2);
      const matches = [];

      for (let i = 0; i < currentMatchCount; i++) {
        matches.push({
          matchId: generateMatchId(),
          player1: null,
          player2: null,
          winner: null,
          status: 'pending'
        });
      }

      rounds.push({
        roundNumber: roundNum,
        roundName: getRoundName(currentMatchCount, roundNum - 1, totalRoundsCount),
        matches: matches
      });

      prevMatchCount = currentMatchCount;
      roundNum++;
    }

    // Auto-advance Byes from Round 1 into Round 2 if exists
    if (rounds.length > 1) {
      round1Matches.forEach((m, matchIdx) => {
        if (m.winner && m.status === 'completed') {
          const nextMatchIdx = Math.floor(matchIdx / 2);
          const isP1 = (matchIdx % 2 === 0);
          if (rounds[1].matches[nextMatchIdx]) {
            if (isP1) rounds[1].matches[nextMatchIdx].player1 = m.winner;
            else rounds[1].matches[nextMatchIdx].player2 = m.winner;
            
            // If the next match gets a Player 1 and Player 2 is a bye (or has no opponent yet because of uneven structures), we handle it
          }
        }
      });
    }

    const tournamentData = {
      status: 'in_progress',
      totalPlayers: totalPlayers,
      rounds: rounds,
      champion: null,
      updatedAt: new Date().toISOString()
    };

    return await this.saveTournament(tournamentData);
  },

  async selectWinner(matchId, winnerId) {
    const tournament = await this.getTournament();
    if (!tournament || !tournament.rounds || tournament.rounds.length === 0) {
      throw new Error("No active tournament found.");
    }

    let targetRoundIdx = -1;
    let targetMatchIdx = -1;
    let targetMatch = null;

    // Find the match
    for (let r = 0; r < tournament.rounds.length; r++) {
      const mIdx = tournament.rounds[r].matches.findIndex(m => m.matchId === matchId);
      if (mIdx !== -1) {
        targetRoundIdx = r;
        targetMatchIdx = mIdx;
        targetMatch = tournament.rounds[r].matches[mIdx];
        break;
      }
    }

    if (!targetMatch) {
      throw new Error("Match not found.");
    }

    // Find winning player object
    const winningPlayer = (targetMatch.player1 && (targetMatch.player1._id === winnerId || targetMatch.player1.id === winnerId))
      ? targetMatch.player1
      : (targetMatch.player2 && (targetMatch.player2._id === winnerId || targetMatch.player2.id === winnerId))
        ? targetMatch.player2
        : null;

    if (!winningPlayer) {
      throw new Error("Selected winner is not part of this match.");
    }

    // Set winner
    targetMatch.winner = winningPlayer;
    targetMatch.status = 'completed';

    // If it was the final round
    if (targetRoundIdx === tournament.rounds.length - 1) {
      tournament.champion = winningPlayer;
      tournament.status = 'completed';
    } else {
      // Advance to next round
      const nextRoundIdx = targetRoundIdx + 1;
      const nextMatchIdx = Math.floor(targetMatchIdx / 2);
      const isPlayer1Slot = (targetMatchIdx % 2 === 0);

      const nextMatch = tournament.rounds[nextRoundIdx].matches[nextMatchIdx];
      if (nextMatch) {
        if (isPlayer1Slot) {
          nextMatch.player1 = winningPlayer;
        } else {
          nextMatch.player2 = winningPlayer;
        }
        
        // If the other player is a BYE/doesn't exist, we can auto-advance
        // (Typically handled when all predecessor matches complete)
      }
    }

    return await this.saveTournament(tournament);
  },

  async resetTournament() {
    const empty = {
      status: 'not_started',
      totalPlayers: 0,
      rounds: [],
      champion: null,
      updatedAt: new Date().toISOString()
    };
    return await this.saveTournament(empty);
  },

  async saveTournament(tournamentData) {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('settings')
          .upsert([{ id: 'tournament_data', social_links: tournamentData }]);
      } catch (err) {
        console.error("Supabase saveTournament notice:", err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      let t = await Tournament.findOne({});
      if (!t) t = new Tournament(tournamentData);
      else Object.assign(t, tournamentData);
      await t.save();
    } else {
      const data = dbConfig.getLocalData();
      data.tournament = tournamentData;
      dbConfig.saveLocalData(data);
    }

    return tournamentData;
  }
};
