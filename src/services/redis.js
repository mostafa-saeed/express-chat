const { promisify } = require('util');
const redis = require('redis');

const { REDIS_CONNECTION_STRING } = process.env;

const client = redis.createClient(REDIS_CONNECTION_STRING);

client.on('error', (error) => {
  console.error(error);
});

module.exports = {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  del: promisify(client.del).bind(client),

  lpush: promisify(client.lpush).bind(client),
  llen: promisify(client.llen).bind(client),
  rpop: promisify(client.rpop).bind(client),

  hset: promisify(client.hset).bind(client),
  hget: promisify(client.hget).bind(client),
  hdel: promisify(client.hdel).bind(client),
  hkeys: promisify(client.hkeys).bind(client),
  hincrby: promisify(client.hincrby).bind(client),

  flushAll: promisify(client.flushall).bind(client),
};
