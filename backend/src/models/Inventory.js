const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
 product: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product'
 },
 type: {
  type: String,
  enum: ['IN', 'OUT'],
  required: true
 },
 quantity: {
  type: Number,
  required: true
 },
 user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);