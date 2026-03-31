const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// ENTRADA DE INVENTARIO
exports.addStock = async (req, res) => {
 try {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  product.stock += quantity;
  await product.save();

  const movement = await Inventory.create({
   product: productId,
   type: 'IN',
   quantity,
   user: req.user.id
  });

  res.json({ product, movement });
 } catch (error) {
  res.status(500).json({ error: error.message });
 }
};

// SALIDA DE INVENTARIO
exports.removeStock = async (req, res) => {
 try {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  if (product.stock < quantity) {
   return res.status(400).json({ message: 'Stock insuficiente' });
  }

  product.stock -= quantity;
  await product.save();

  const movement = await Inventory.create({
   product: productId,
   type: 'OUT',
   quantity,
   user: req.user.id
  });

  res.json({ product, movement });
 } catch (error) {
  res.status(500).json({ error: error.message });
 }
};

// HISTORIAL
exports.getHistory = async (req, res) => {
 try {
  const history = await Inventory.find()
   .populate('product')
   .sort({ createdAt: -1 });

  res.json(history);
 } catch (error) {
  res.status(500).json({ error: error.message });
 }
};