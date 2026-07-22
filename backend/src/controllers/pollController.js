const pollService = require('../services/pollService');

module.exports = {
  async getPollStatus(req, res, next) {
    try {
      const settings = await pollService.getPollSettings();
      res.status(200).json(settings);
    } catch (err) {
      next(err);
    }
  },

  async configurePoll(req, res, next) {
    try {
      const { active, endsAt, published } = req.body;
      const updated = await pollService.updatePollSettings({ active, endsAt, published });
      res.status(200).json({ message: "Voting settings updated successfully", settings: updated });
    } catch (err) {
      next(err);
    }
  },

  async submitVote(req, res, next) {
    try {
      const { id } = req.params;
      const updatedPlayer = await pollService.vote(id);
      res.status(200).json({ message: "Vote registered successfully!", player: updatedPlayer });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async resetPoll(req, res, next) {
    try {
      const updatedSettings = await pollService.resetPoll();
      res.status(200).json({ message: "Poll has been reset successfully.", settings: updatedSettings });
    } catch (err) {
      require('fs').writeFileSync('error.log', err.stack);
      next(err);
    }
  }
};
