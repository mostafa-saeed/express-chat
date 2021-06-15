const { badRequest } = require('@hapi/boom');
const { hash, compare } = require('bcrypt');
const usersService = require('../services/users');
const { generateRandomString } = require('../services/common');
const { sendMail } = require('../services/sendgrid');
const { generateToken } = require('../services/auth');

const { FRONT_END_HOST } = process.env;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const HASH_ROUNDS = 10;

const validateRegistration = (payload) => {
  const { username, email } = payload;
  if (!username || !email) throw badRequest('MISSING_FIELDS');
  if (!EMAIL_REGEX.test(email)) throw badRequest('INVALID_EMAIL');
};

module.exports = {
  create: async (req, res) => {
    // Validation
    validateRegistration(req.body);
    const { username, email } = req.body;
    // Username exists
    const usernameMatch = await usersService.findUserByUsername(username);
    if (usernameMatch) throw badRequest('USERNAME_ALREADY_EXISTS');
    // Email exists
    const emailMatch = await usersService.findUserByEmail(email);
    if (emailMatch) throw badRequest('EMAIL_ALREADY_EXISTS');
    // Generate Token
    const token = generateRandomString();
    // Insert
    await usersService.addUser(username, email, token);
    // Send email
    await sendMail(email, 'Your Account Token',
      `<p>Hello ${username}! Click <a href="${FRONT_END_HOST}/password?token=${token}">here</a> to set your password.</p>`);
    res.send({ success: true });
  },

  validateToken: async (req, res) => {
    // Validate Token
    const { token } = req.body;
    const user = await usersService.findUserByToken(token);
    if (!user) throw badRequest('BAD_TOKEN');

    res.send({ success: true });
  },

  updatePassword: async (req, res) => {
    // Validate Token
    const { token } = req.body;
    const user = await usersService.findUserByToken(token);
    if (!user) throw badRequest('BAD_TOKEN');
    // Validate password
    const { password } = req.body;
    if (!password) throw badRequest('MISSING_FIELDS');
    // Add password & Remove token
    const hashedPassword = await hash(password, HASH_ROUNDS);
    await usersService.setPassword(user, hashedPassword);

    res.send({ success: true });
  },

  login: async (req, res) => {
    // Validate input
    const { login, password } = req.body;
    if (!login || !password) throw badRequest('MISSING_FIELDS');
    // Find user using username or email
    const user = await usersService.findUserByUsernameEmail(login);
    if (!user) throw badRequest('INVALID_LOGIN');
    // Compare passwords
    const matchedPasswords = await compare(password, user.password);
    if (!matchedPasswords) throw badRequest('INVALID_LOGIN');
    // Generate JWT
    res.send({
      token: generateToken({
        // eslint-disable-next-line no-underscore-dangle
        id: user._id,
        email: user.email,
        username: user.username,
      }),
    });
  },

  me: (req, res) => {
    res.send(req.user);
  },
};
