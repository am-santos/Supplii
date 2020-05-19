'use strict';

const { Router } = require('express');

const passport = require('passport');

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post(
  '/sign-up',
  passport.authenticate('local-sign-up', {
    successRedirect: '/waiting-confirmation',
    failureRedirect: '/sign-up'
  })
);

router.get('/waiting-confirmation', (req, res, next) => {
  res.render('waiting-confirmation');
});

router.get('/confirmation/:token', (req, res, next) => {
  const token = req.params.token;
  res.render('confirmation', { token });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post(
  '/sign-in',
  passport.authenticate('local-sign-in', {
    successRedirect: '/private',
    failureRedirect: '/sign-in'
  })
);

router.post('/sign-out', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
