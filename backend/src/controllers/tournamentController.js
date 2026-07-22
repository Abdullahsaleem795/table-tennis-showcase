const tournamentService = require('../services/tournamentService');

module.exports = {
  async getTournament(req, res, next) {
    try {
      const data = await tournamentService.getTournament();
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  },

  async generateTournament(req, res, next) {
    try {
      const data = await tournamentService.generateTournament();
      res.status(201).json({ message: 'Tournament bracket generated successfully', tournament: data });
    } catch (err) {
      next(err);
    }
  },

  async selectWinner(req, res, next) {
    try {
      const { matchId, winnerId } = req.body;
      if (!matchId || !winnerId) {
        return res.status(400).json({ message: 'matchId and winnerId are required' });
      }
      const data = await tournamentService.selectWinner(matchId, winnerId);
      res.status(200).json({ message: 'Winner updated successfully', tournament: data });
    } catch (err) {
      next(err);
    }
  },

  async resetTournament(req, res, next) {
    try {
      const data = await tournamentService.resetTournament();
      res.status(200).json({ message: 'Tournament bracket reset successfully', tournament: data });
    } catch (err) {
      next(err);
    }
  }
};
