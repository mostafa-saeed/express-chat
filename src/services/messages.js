const { ObjectId } = require('mongodb');
const db = require('./db');
const redis = require('./redis');

const LIST_NAME = 'MESSAGES';
const RECENT_MESSAGES_LIMIT = 10;

// const pushToRecent = async (message) => {
//   await redis.lpush(LIST_NAME, JSON.stringify(message));
//   const listLength = await redis.llen(LIST_NAME);

//   if (listLength > RECENT_MESSAGES_LIMIT) {
//     await redis.rpop(LIST_NAME);
//   }
// };

const pushToRecent = async (message) => {
  const recentMessages = JSON.parse(await redis.get(LIST_NAME) || '[]');
  recentMessages.push(message);

  if (recentMessages.length > RECENT_MESSAGES_LIMIT) recentMessages.shift();
  await redis.set(LIST_NAME, JSON.stringify(recentMessages));
};

module.exports = {
  addMessage: async (user, text) => {
    const { id, username } = user;
    const result = await db.Messages.insertOne({
      user: new ObjectId(id),
      time: new Date(),
      username,
      text,
    });

    const message = result.ops[0];
    await pushToRecent(message);

    return message;
  },

  getRecent: async () => {
    const messages = await redis.get(LIST_NAME);
    if (messages) return JSON.parse(messages);

    const recentMessages = await db.Messages.find({})
      .sort({ _id: -1 })
      .limit(RECENT_MESSAGES_LIMIT)
      .toArray();

    // Update cache
    await redis.set(LIST_NAME, JSON.stringify(recentMessages));

    return recentMessages;
  },
};
