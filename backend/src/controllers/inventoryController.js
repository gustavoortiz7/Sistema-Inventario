const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

const toPositiveNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const validateMovementPayload = ({ productId, quantity, reason }) => {
  if (!mongoose.isValidObjectId(productId)) {
    return 'Producto invalido';
  }

  if (!toPositiveNumber(quantity)) {
    return 'La cantidad debe ser mayor a 0';
  }

  if (!reason || !reason.trim()) {
    return 'El motivo es requerido';
  }

  return null;
};

const createMovement = async ({ productId, userId, type, quantity, reason, reference, provider }) => {
  return Inventory.create({
    product: productId,
    user: userId,
    type,
    quantity,
    reason: reason.trim(),
    reference: reference || '',
    provider: provider || ''
  });
};

// ENTRADA DE INVENTARIO
exports.addStock = async (req, res) => {
  try {
    const { productId, quantity, reason, provider, reference } = req.body;
    const validationError = validateMovementPayload({ productId, quantity, reason });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const movementQuantity = toPositiveNumber(quantity);
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: movementQuantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const movement = await createMovement({
      productId,
      userId: req.user.id,
      type: 'entrada',
      quantity: movementQuantity,
      reason,
      reference,
      provider: provider || product.provider || ''
    });

    const populatedMovement = await Inventory.findById(movement._id)
      .populate('product')
      .populate('user', 'name email');

    return res.json({ product, movement: populatedMovement });
  } catch (error) {
    console.error('addStock error:', error);
    return res.status(500).json({ message: 'Error al agregar stock' });
  }
};

// SALIDA DE INVENTARIO
exports.removeStock = async (req, res) => {
  try {
    const { productId, quantity, reason, provider, reference } = req.body;
    const validationError = validateMovementPayload({ productId, quantity, reason });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const movementQuantity = toPositiveNumber(quantity);
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: movementQuantity } },
      { $inc: { stock: -movementQuantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      const existingProduct = await Product.findById(productId);
      return res.status(existingProduct ? 400 : 404).json({
        message: existingProduct ? 'Stock insuficiente' : 'Producto no encontrado'
      });
    }

    const movement = await createMovement({
      productId,
      userId: req.user.id,
      type: 'salida',
      quantity: movementQuantity,
      reason,
      reference,
      provider: provider || product.provider || ''
    });

    const populatedMovement = await Inventory.findById(movement._id)
      .populate('product')
      .populate('user', 'name email');

    return res.json({ product, movement: populatedMovement });
  } catch (error) {
    console.error('removeStock error:', error);
    return res.status(500).json({ message: 'Error al retirar stock' });
  }
};

// HISTORIAL
exports.getHistory = async (req, res) => {
  try {
    const history = await Inventory.find()
      .populate('product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: 'Error al cargar historial' });
  }
};

exports.getProductHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Producto invalido' });
    }

    const history = await Inventory.find({ product: productId })
      .populate('product')
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: 'Error al cargar kardex' });
  }
};
