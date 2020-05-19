'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String
  },

  role: {
    type: String,
    required: true,
    enum: ['client', 'owner', 'supplier'],
    default: 'client'
  },
  profilePhotoUrl: {
    type: String,
    path: String
  }
});

module.exports = mongoose.model('User', schema);
