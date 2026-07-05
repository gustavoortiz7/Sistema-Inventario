const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],

  total: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'qr', 'cheque'],
    default: 'efectivo'
  },

  customer: {
    name: String,
    email: String,
    phone: String
  },

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },

  notes: String,

  status: {
    type: String,
    enum: ['completada', 'cancelada', 'pendiente'],
    default: 'completada'
  }

}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
