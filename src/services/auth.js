const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const { JWT_SECRET } = process.env;

module.exports = {
  generateToken: (payload) => jwt.sign(payload, JWT_SECRET),

  isLoggedIn: expressJwt({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
  }),

};
