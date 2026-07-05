const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
 name: {
  type: String,
  required: true
 },
 description: String,
 category: {
  type: String,
  default: 'General'
 },
 provider: {
  type: String,
  default: ''
 },
 providerPhone: {
  type: String,
  default: ''
 },
 subCategory: {
  type: String,
  default: ''
 },
image: {
    type: String,
    default: ''
},
 price: {
  type: Number,
  required: true
 },
 stock: {
  type: Number,
  default: 0
 },
 user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);