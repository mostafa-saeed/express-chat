const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const socketioJwt = require('socketio-jwt');
const db = require('./services/db');
const { isLoggedIn } = require('./services/auth');
const asyncMiddleware = require('./services/asyncMiddleware');
const usersController = require('./controllers/users.controller');
const messagesController = require('./controllers/messages.controller');
const initSocket = require('./controllers/socket.controller');
const redis = require('./services/redis');

const {
  PORT, DB_CONNECTION_STRING, DB_NAME, JWT_SECRET,
} = process.env;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

io.use(socketioJwt.authorize({
  secret: JWT_SECRET,
  handshake: true,
  auth_header_required: true,
}));

app.post('/users', asyncMiddleware(usersController.create));
app.post('/users/token', asyncMiddleware(usersController.validateToken));
app.post('/users/password', asyncMiddleware(usersController.updatePassword));
app.post('/users/login', asyncMiddleware(usersController.login));

app.get('/users/me', isLoggedIn, usersController.me);

app.get('/messages', isLoggedIn, asyncMiddleware(messagesController.getRecent));

app.use((err, req, res, next) => {
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    return next(
      res.status(401).send('NO_TOKEN'),
    );
  }
  return next(
    res.status(err.output.statusCode).json(err.output.payload),
  );
});

server.listen(PORT, async () => {
  await db.connect(DB_CONNECTION_STRING, DB_NAME);
  // Reset Redis
  await redis.flushAll();
  initSocket(io);
});
