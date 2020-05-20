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
userRouter.get('/:userId/home', routeGuard, roleGuard(allowedRoles), (req, res, next) => {
  const userId = req.params.userId;
  Product.find()
    .then((products) => {
      res.render('user/home-page-layout', { products, userId }); // name is not confirmed!!
    })
    .catch((err) => {
      next(err);
    });
});

// Profile Page - personal area
userRouter.get('/profile/:userId', routeGuard, roleGuard(allowedRoles), (req, res, next) => {
  const userId = req.params.userId;

  User.findById({ _id: userId })
    .then((user) => {
      res.render('user/profile', { user });
    })
    .catch((err) => {
      next(err);
    });
});

// Edit Profile page
/* userRouter.get('/profile/:userId/edit', (req, res, next) => {
  res.render('user/profile_edit');
}); */

// Product Page - Create
userRouter.get('/:userid/product/create', routeGuard, roleGuard(allowedRoles), (req, res, next) => {
  res.render('user/product/create_product');
});

userRouter.post(
  '/:userid/product/create',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    const ownerId = req.params.userid;
    const name = req.body.productName;
    const category = req.body.category;
    const shortDescription = req.body.shortDescription;
    const longDescription = req.body.longDescription;
    const quantity = req.body.productQuantity;
    const price = req.body.productPrice;
    const supplyTrigger = req.body.supplyTrigger;

    return Product.create({
      ownerId,
      name,
      category,
      shortDescription,
      longDescription,
      quantity,
      price,
      supplyTrigger: { quantity: supplyTrigger }
    })
      .then((product) => {
        res.redirect(`${product._id}`);
      })
      .catch((err) => {
        next(err);
      });
  }
);

// Product Page - View
userRouter.get(
  '/:userId/product/:productId',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    const productId = req.params.productId;
    const userId = req.params.userId;

    let productOwner = false;

    return Product.findById({ _id: productId })
      .populate('ownerId')
      .then((product) => {
        if (String(userId) === String(product.ownerId._id)) {
          productOwner = true;
        }
        res.render('user/product/single', { product, productOwner });
      })
      .catch((err) => {
        next(err);
      });
  }
);

// Product Page - Update
userRouter.get(
  '/:userid/product/:productId/update',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    const owner = req.params.userId;
    const productId = req.params.productId;

    return Product.findById({ _id: productId })
      .then((product) => {
        res.render('user/product/update_product', { product });

        /* if (String(owner) === String(product.ownerId)) {
      } else {
        res.redirect(`/${owner}/product/${productId}`);
      } */
      })
      .catch((err) => {
        next(err);
      });
  }
);

userRouter.post(
  '/:userid/product/:productId/update',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    // URL information
    const productId = req.params.productId;
    const userId = req.params.userId;

    // Form information
    const name = req.body.productName;
    const category = req.body.category;
    const shortDescription = req.body.shortDescription;
    const longDescription = req.body.longDescription;
    const quantity = req.body.productQuantity;
    const price = req.body.productPrice;
    const supplyTrigger = req.body.supplyTrigger;

    return Product.findByIdAndUpdate(productId, {
      name,
      category,
      shortDescription,
      longDescription,
      quantity,
      price,
      supplyTrigger: { quantity: supplyTrigger }
    })
      .populate('ownerId')
      .then((product) => {
        //Use render or redirect ???
        // res.render('user/product/single', { product });
        res.redirect(`/${product.ownerId}/product/${product._id}`);
      })
      .catch((err) => {
        next(err);
      });
  }
);

userRouter.post(
  '/:userid/product/:productId/delete',
  routeGuard,
  roleGuard(allowedRoles),
  (req, res, next) => {
    const productId = req.params.productId;
    const userId = req.params.userid;

    Product.findOneAndDelete({ _id: productId })
      .then(() => {
        res.redirect(`/user/${userId}/home`);
      })
      .catch((err) => {
        next(err);
      });
  }
);

module.exports = userRouter;
