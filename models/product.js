'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: {
    type: ObjectId
  },
  ownerId: {
    type: ObjectId
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['type1', 'type2', 'type3', 'type4', 'type5']
  },
  shortDescription: {
    type: String
  },
  longDescription: {
    type: String
  },
  quantity: {
    type: Number,
    required: true
  },
  availability: {
    type: Boolean
  },
  price: {
    type: Number,
    required: true
  },
  rate: {
    type: Number
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  supplyTrigger: {
    quantity: {
      type: Number
    },
    triggered: {
      type: Boolean,
      default: false
    }
  },
  productPhotoUrl: {
    type: String,
    path: String
  }
});

module.exports = mongoose.model('Product', schema);
