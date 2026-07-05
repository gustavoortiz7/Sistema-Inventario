const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
 product: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product'
 },

 user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
 },

 type: {
  type: String,
  enum: ['entrada', 'salida'],
  required: true
 },

 quantity: {
  type: Number,
  required: true
 },

 reason: {
  type: String,
  required: true
 },

 reference: {
  type: String,
  default: ''
 },

 provider: {
  type: String,
  default: ''
 }

}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);