'use strict';

const { Router } = require('express');

const passport = require('passport');

const clientRouter = new Router();

// routers in here

// Home Page - List of Products
clientRouter.get('/home/:clientId', (req, res, next) => {
  res.render('layout');
});

// Profile Page - personal area
clientRouter.get('/profile/:clientId', (req, res, next) => {
  res.render('user/profile');
});

clientRouter.get('/profile/:clientId/update', (req, res, next) => {
  res.render('user/profile');
});

// Product Page
clientRouter.get('/product/:productId', (req, res, next) => {
  res.render('user/product/single');
});

module.exports = clientRouter;
