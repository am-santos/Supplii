'use strict';

const { Router } = require('express');

const bcrypt = require('bcryptjs');
const User = require('../models/user');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

const router = new Router();

// Sign-up - Registration

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  let pass;

  bcrypt
    .hash(password, 10)
    .then((hashAndSalt) => {
      pass = hashAndSalt;
      return bcrypt.hash(pass, 10);
    })
    .then((hash) => {
      const strHash = String(hash)
        .split('/')
        .join();
      return User.create({
        name,
        email,
        passwordHash: pass,
        confirmation: {
          token: strHash,
          result: false
        }
      });
    })
    .then((newUser) => {
      req.session.userId = newUser._id;
      return transporter.sendMail({
        from: `Suppli App${process.env.NODEMAILER_EMAIL}`,

        // For development:
        // to: `${process.env.NODEMAILER_EMAIL}`, //Change this when to deploy application
        // To deploy:
        to: `${newUser.email}`, //Change this when to deploy application
        subject: `${newUser.name}, welcome to Suppli`,
        // Local
        // html: `<strong>Hello ${newUser.name}</strong><br/> <br/> <em>Click on the following link to confirm your registration.</em> <br/> <a href="http://localhost:3000/authentication/welcome/${newUser.confirmation.token}">Confirm your registration</a> <br/> <p>Thank you for joining Suppli<p/>`
        // Heroku
        html: `<strong>Hello ${newUser.name}</strong><br/> <br/> <em>Click on the following link to confirm your registration.</em> <br/> <a href="https://supplii.herokuapp.com/authentication/welcome/${newUser.confirmation.token}">Confirm your registration</a> <br/> <p>Thank you for joining Suppli<p/>`
      });
    })
    .then((emailResult) => {
      console.log(emailResult);
      res.redirect('welcome');
    })
    .catch((err) => {
      next(err);
    });
});

// Welcome-confirmation

// Welcome without token
router.get('/welcome', (req, res, next) => {
  const confirmedUser = false;
  res.render('welcome_confirmation', confirmedUser);
});

// Welcome with token
router.get('/welcome/:token', (req, res, next) => {
  const token = req.params.token;
  // const savedToken = req.user.confirmation.token;
  // const loggedUserId = req.user._id;
  let confirmedUser = false;
  // if (token === savedToken) {
  //   confirmedUser = true;
  // }
  User.findOneAndUpdate(
    { 'confirmation.token': token },
    { $set: { 'confirmation.result': true } },
    { new: true }
  )
    .then((resUser) => {
      req.session.userId = resUser._id;
      confirmedUser = resUser.confirmation.result;
      res.render('welcome_confirmation', { confirmedUser });
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/welcome/:token', (req, res, next) => {
  const role = req.body.role;
  const token = req.params.token;
  User.findOneAndUpdate({ 'confirmation.token': token }, { $set: { role: role } })
    .then((resUser) => {
      req.session.userId = resUser._id;
      switch (role) {
        case 'client':
          res.redirect(`/user/home`);
          break;
        case 'owner':
          res.redirect(`/user/${resUser._id}/home`);
          break;
        case 'supplier':
          res.redirect(`/user/${resUser._id}/home/supplier`);
          break;
      }
    })
    .catch((err) => {
      next(err);
    });
});

// Sign-in - Log-in

router.get('/sign-in', (req, res, next) => {
  console.log('sign in running');
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let signInUser;

  User.findOne({ email })
    .then((resUser) => {
      signInUser = resUser;
      return bcrypt.compare(password, resUser.passwordHash);
    })
    .then((compResult) => {
      if (compResult) {
        req.session.userId = signInUser._id;
        switch (signInUser.role) {
          case 'client':
            res.redirect(`/user/home`);
            break;
          case 'owner':
            res.redirect(`/user/${signInUser._id}/home`);
            break;
          case 'supplier':
            res.redirect(`/user/${signInUser._id}/home/supplier`);
            break;
        }
      } else {
        return Promise.reject(new Error('Password does not match'));
      }
    })
    .catch((err) => {
      next(err);
    });
});

// Sign-out - Log-out

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
