const crypto = require('crypto');

module.exports = {
  generateRandomString: () => crypto.randomBytes(20).toString('hex'),
};
