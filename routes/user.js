'use strict';

const { Router } = require('express');

const User = require('../models/user');
const Product = require('../models/product');

const routeGuard = require('../middleware/route-guard');

const userRouter = new Router();

// Owners Route Guard
const allowedRoles = ['owner'];

const roleGuard = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  } else {
    next(new Error('User is not authorized to this page.'));
  }
};

// routers in here

// Home Page - List of Products
userRouter.get('/', routeGuard, roleGuard(allowedRoles), (req, res, next) => {
  res.render('');
});

// Profile Page - personal area
userRouter.get('/profile/:ownerId', routeGuard, roleGuard(allowedRoles), (req, res, next) => {
  const ownerId = req.params.ownerId;

  User.findById({ _id: ownerId })
    .then((owner) => {
      res.render('user/profile', { owner });
    })
    .catch((err) => {
      next(err);
    });
});

// Product Page - View
userRouter.get(
  '/:ownerId/product/:productId',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    const productId = req.params.productId;
    const ownerId = req.params.ownerId;

    // --------<< AUTHORIZED OWNER ISSUE>>--------
    // mkae camparison to send true or false to single page view.
    let productOwner;

    return Product.findById({ _id: productId })
      .then((product) => {
        res.render('user/product/single', { product });
      })
      .catch((err) => {
        next(err);
      });
  }
);

// Product Page - Create
userRouter.get(
  '/create-product/:ownerId',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    res.render('user/product/create');
  }
);

userRouter.post(
  '/create-product/:ownerId',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    const ownerId = req.params.ownerId;

    return Product.create({});

    // res.render('user/product/create');
  }
);

// Product Page - Update
userRouter.get(
  '/:ownerId/update-product/:productId',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    const owner = req.params.ownerId;
    const productId = req.params.productId;

    return Product.findById({ _id: productId })
      .then((product) => {
        if (owner === product.ownerId) {
          res.render('user/product/update', { product });
        } else {
          res.redirect(`/${owner}/product/${productId}`);
        }
      })
      .catch((err) => {
        next(err);
      });
  }
);

module.exports = userRouter;
