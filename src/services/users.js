const db = require('./db');
const redis = require('./redis');

const LOGGED_IN = 'LOGGED_IN';

module.exports = {
  setLoggedIn: async (username) => {
    const loggedIn = await redis.hget(LOGGED_IN, username);
    if (!loggedIn) {
      await redis.hset(LOGGED_IN, username, 1);
    } else {
      await redis.hincrby(LOGGED_IN, username, 1);
    }
  },

  setLoggedOut: async (username) => {
    await redis.hincrby(LOGGED_IN, username, -1);
    const count = await redis.hget(LOGGED_IN, username);
    if (count < 1) {
      await redis.hdel(LOGGED_IN, username);
    }
  },

  getLoggedInUsers: () => redis.hkeys(LOGGED_IN),

  findUserByUsername: (username) => db.Users.findOne({ username }),

  findUserByEmail: (email) => db.Users.findOne({ email }),

  findUserByToken: (token) => db.Users.findOne({ token }),

  findUserByUsernameEmail: (login) => db.Users.findOne({
    $or: [
      { username: login },
      { email: login },
    ],
  }),

  addUser: (username, email, token) => db.Users.insertOne({ username, email, token }),

  setPassword: (user, hashedPassword) => db.Users.updateOne(user, {
    $set: {
      password: hashedPassword,
    },
    $unset: {
      token: '',
    },
  }),
};
