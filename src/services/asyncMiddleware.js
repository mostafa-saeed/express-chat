const { badImplementation } = require('@hapi/boom');

module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (!err.isBoom) {
      return next(badImplementation(err));
    }
    return next(err);
  });
};
