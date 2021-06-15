const messagesService = require('../services/messages');

module.exports = {
  getRecent: async (req, res) => {
    const messages = await messagesService.getRecent();
    res.send(messages);
  },
};
