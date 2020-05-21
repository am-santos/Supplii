'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String
  },
  role: {
    type: String,
    enum: ['client', 'owner', 'supplier'],
    default: 'client'
  },
  profilePhotoUrl: {
    type: String,
    path: String
  },
  confirmation: {
    token: {
      type: String,
      default: 'test123'
    },
    result: {
      type: Boolean
    }
  }
});

module.exports = mongoose.model('User', schema);
