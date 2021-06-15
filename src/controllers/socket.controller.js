const usersService = require('../services/users');
const messagesService = require('../services/messages');

module.exports = (io) => {
  io.on('connection', async (socket) => {
    await usersService.setLoggedIn(socket.decoded_token.username);
    let loggedInUsers = await usersService.getLoggedInUsers();
    io.emit('online', loggedInUsers);

    socket.on('disconnect', async () => {
      await usersService.setLoggedOut(socket.decoded_token.username);
      loggedInUsers = await usersService.getLoggedInUsers();
      io.emit('online', loggedInUsers);
    });

    socket.on('chat message', async (text) => {
      const trimmedMessage = text.trim().replace(/\s+/g, ' ');
      if (trimmedMessage) {
        const message = await messagesService.addMessage(socket.decoded_token, trimmedMessage);
        io.emit('chat message', message);
      }
    });
  });
};
