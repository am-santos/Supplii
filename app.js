'use strict';

const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const connectMongo = require('connect-mongo');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const logger = require('morgan');
const mongoose = require('mongoose');
//const passport = require('passport');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const deserializeUser = require('./middleware/deserializeUser');
const bindUserToViewLocals = require('./middleware/bind-user-to-view-locals.js');
// const passportConfigure = require('./passport-configuration.js');
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');
const userRouter = require('./routes/user');
const hbs = require('hbs');

const app = express();

hbs.registerPartials(join(__dirname, 'views/partials'));

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(
  sassMiddleware({
    src: join(__dirname, 'public'),
    dest: join(__dirname, 'public'),
    outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: true
  })
);
app.use(express.static(join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 15,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    },
    store: new (connectMongo(expressSession))({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60 * 24
    })
  })
);
//app.use(passport.initialize());
//app.use(passport.session());
app.use(deserializeUser);
app.use(bindUserToViewLocals);

// Role Route Guard, is it possible?
// Use role guard in here, instead of repeating it inside every route
// Only do it once on the following routes

// Routes
app.use('/', indexRouter);
app.use('/authentication', authenticationRouter);
app.use('/user', userRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;
