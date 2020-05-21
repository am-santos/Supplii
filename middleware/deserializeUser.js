'use strict';

const User = require('../models/user');

module.exports = (req, res, next) => {
  const userId = req.session.userId;

  if (userId) {
    User.findById(userId)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        next(err);
      });
  } else {
    next();
  }
};
