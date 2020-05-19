'use strict';

module.exports = (req, res, next) => {
  res.locals.user = req.user;
  // console.log(req.user);
  if (req.user) {
    switch (req.user.role) {
      case 'client':
        res.locals.user.isClient = true;
        break;
      case 'owner':
        res.locals.user.owner = true;
        break;
      case 'supplier':
        res.locals.user.isSupplier = true;
        break;
    }
  }
  next();
};
