'use strict';

const { Router } = require('express');

const User = require('../models/user');
const Product = require('../models/product');

const routeGuard = require('../middleware/route-guard');

const multer = require('multer');
const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multerStorageCloudinary({
  cloudinary,
  folder: 'Project-2-fullstack-api'
});

const uploader = multer({ storage });

const userRouter = new Router();

// Owners Route Guard
let allowedRoles = ['owner'];

const roleGuard = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  } else {
    next(new Error('User is not authorized to this page.'));
  }
};

// ---------->> LIST OF PRODUCTS ROUTES <<---------------

// Home Page - List of Owned Products
allowedRoles = ['owner'];
userRouter.get('/:userId/home', routeGuard, roleGuard(allowedRoles), (req, res, next) => {
  const userId = req.params.userId;

  Product.find({ ownerId: userId })
    .then((products) => {
      res.render('user/home-page-layout', { products, userId });
    })
    .catch((err) => {
      next(err);
    });
});

// Home Page - Suppliers
userRouter.get('/:userId/home/supplier', routeGuard, roleGuard(['supplier']), (req, res, next) => {
  const userId = req.params.userId;

  Product.find({ $expr: { $lte: ['$quantity', '$supplyTrigger.quantity'] } })
    .then((products) => {
      res.render('user/home-page-layout', { products, userId });
    })
    .catch((err) => {
      next(err);
    });
});

// Home Page - List of Products
userRouter.get('/home', (req, res, next) => {
  const userId = req.params.userId;

  Product.find({ $expr: { $gte: ['$quantity', '$supplyTrigger.quantity'] } })
    .populate('ownerId')
    .then((products) => {
      res.render('user/home-page-layout', { products, userId });
    })
    .catch((err) => {
      next(err);
    });
});

// ---------->> PROFILE ROUTES <<---------------

// Profile Page - personal area
userRouter.get('/profile/:userId', routeGuard, (req, res, next) => {
  const userId = req.params.userId;

  User.findById({ _id: userId })
    .then((renderUser) => {
      res.render('user/profile', { renderUser });
    })
    .catch((err) => {
      next(err);
    });
});

// Update Profile page
userRouter.get('/profile/:userId/update', routeGuard, (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((renderUser) => {
      res.render('user/update_profile', { renderUser });
    })
    .catch((err) => {
      next(err);
    });
});

userRouter.post(
  '/profile/:userId/update',
  routeGuard,
  uploader.single('picture'),
  (req, res, next) => {
    const userId = req.params.userId;

    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;

    let profilePhotoUrl;

    if (req.file) {
      profilePhotoUrl = req.file.url;
    }

    User.findByIdAndUpdate(userId, {
      name,
      email,
      role,
      profilePhotoUrl
    })
      .then((renderUser) => {
        res.redirect(`/user/profile/${renderUser._id}`);
        switch (renderUser.role) {
          case 'client':
            res.redirect(`/user/home`);
            break;
          case 'owner':
            res.redirect(`/user/${renderUser._id}/home`);
            break;
          case 'supplier':
            res.redirect(`/user/${renderUser._id}/home/supplier`);
            break;
        }
      })
      .catch((err) => {
        next(err);
      });
  }
);

// ---------->> PRODUCT ROUTES <<---------------

// Product Page - Create
allowedRoles = ['owner'];
userRouter.get('/:userid/product/create', routeGuard, roleGuard(allowedRoles), (req, res, next) => {
  res.render('user/product/create_product');
});

userRouter.post(
  '/:userid/product/create',
  routeGuard,
  roleGuard(allowedRoles),
  uploader.single('picture'),
  (req, res, next) => {
    /*
    const ownerId = req.params.userid;
    const name = req.body.productName;
    const category = req.body.category;
    const shortDescription = req.body.shortDescription;
    const longDescription = req.body.longDescription;
    const quantity = req.body.productQuantity;
    const price = req.body.productPrice;
    const supplyTrigger = req.body.supplyTrigger;
    const productPhotoUrl = req.file.url;
    */

    const ownerId = req.params.userid;

    const {
      productName: name,
      category,
      shortDescription,
      longDescription,
      productQuantity: quantity,
      productPrice: price,
      supplyTrigger
    } = req.body;

    const productPhotoUrl = req.file.url;

    return Product.create({
      ownerId,
      name,
      category,
      shortDescription,
      longDescription,
      quantity,
      price,
      productPhotoUrl,
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
userRouter.get('/:userId/product/:productId', routeGuard, (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.params.userId;

  let productOwner = false;

  return Product.findById(productId)
    .populate('ownerId')
    .then((product) => {
      // console.log('User ID:', userId);
      // console.log('Owner ID:', product.ownerId);
      // console.log('productOwner :', productOwner);
      if (String(userId) === String(product.ownerId._id)) {
        productOwner = true;
      }
      // console.log('productOwner :', productOwner);
      res.render('user/product/single', { product, productOwner });
    })
    .catch((err) => {
      next(err);
    });
});

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

        // Secure owners that do not own the product to update it ??
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
  uploader.single('picture'),
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

    let productPhotoUrl;
    if (req.file) {
      const productPhotoUrl = req.file.url;
    }

    return Product.findByIdAndUpdate(
      productId,
      {
        name,
        category,
        shortDescription,
        longDescription,
        quantity,
        price,
        productPhotoUrl,
        supplyTrigger: { quantity: supplyTrigger }
      },
      {
        new: true
      }
    )
      .populate('ownerId')
      .then((product) => {
        res.redirect(`/user/${product.ownerId._id}/product/${product._id}`);
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
