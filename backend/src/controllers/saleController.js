const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');

const VALID_PAYMENT_METHODS = ['efectivo', 'tarjeta', 'transferencia', 'qr', 'cheque'];

const toPositiveNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const money = (value) => Math.round(Number(value) * 100) / 100;

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'La venta debe tener al menos un producto';
  }

  for (const item of items) {
    if (!mongoose.isValidObjectId(item.product)) {
      return 'La venta contiene un producto invalido';
    }

    if (!toPositiveNumber(item.quantity)) {
      return 'Cada producto debe tener una cantidad mayor a 0';
    }
  }

  return null;
};

const buildSaleItems = async (items, session) => {
  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).session(session);
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  return items.map((item) => {
    const product = productMap.get(item.product.toString());

    if (!product) {
      const error = new Error(`Producto ${item.product} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    const quantity = toPositiveNumber(item.quantity);

    if (product.stock < quantity) {
      const error = new Error(`Stock insuficiente para ${product.name}`);
      error.statusCode = 400;
      throw error;
    }

    const price = money(product.price);

    return {
      product: product._id,
      quantity,
      price,
      subtotal: money(price * quantity),
      provider: product.provider || ''
    };
  });
};

const getCustomerInfo = async ({ customer, customerId, userId, session }) => {
  if (!customerId) {
    return {
      customerInfo: {
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || ''
      },
      customerRef: null
    };
  }

  if (!mongoose.isValidObjectId(customerId)) {
    const error = new Error('Cliente invalido');
    error.statusCode = 400;
    throw error;
  }

  const existingCustomer = await Customer.findById(customerId).session(session);

  if (!existingCustomer) {
    const error = new Error('Cliente no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return {
    customerInfo: {
      name: existingCustomer.name,
      email: existingCustomer.email,
      phone: existingCustomer.phone
    },
    customerRef: existingCustomer._id
  };
};

const populateSale = (id) => {
  return Sale.findById(id)
    .populate('user', 'name email')
    .populate('items.product')
    .populate('customerId', 'name email phone');
};

// CREAR VENTA
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, paymentMethod, customer, customerId, notes } = req.body;
    const validationError = validateItems(items);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (paymentMethod && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Metodo de pago invalido' });
    }

    let saleId;

    await session.withTransaction(async () => {
      const saleItems = await buildSaleItems(items, session);
      const total = money(saleItems.reduce((sum, item) => sum + item.subtotal, 0));
      const { customerInfo, customerRef } = await getCustomerInfo({
        customer,
        customerId,
        userId: req.user.id,
        session
      });

      const [sale] = await Sale.create([{
        user: req.user.id,
        items: saleItems.map(({ provider, ...item }) => item),
        total,
        paymentMethod: paymentMethod || 'efectivo',
        customer: customerInfo,
        customerId: customerRef,
        notes: notes || '',
        status: 'completada'
      }], { session });

      saleId = sale._id;

      for (const item of saleItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session, runValidators: true }
        );

        if (!updatedProduct) {
          const error = new Error('Stock insuficiente al confirmar la venta');
          error.statusCode = 400;
          throw error;
        }

        await Inventory.create([{
          product: item.product,
          user: req.user.id,
          type: 'salida',
          quantity: item.quantity,
          reason: 'Venta POS',
          reference: sale._id.toString(),
          provider: item.provider
        }], { session });
      }
    });

    const populatedSale = await populateSale(saleId);
    return res.json(populatedSale);
  } catch (error) {
    console.error('createSale error:', error);
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Error al registrar la venta'
    });
  } finally {
    session.endSession();
  }
};

// OBTENER TODAS LAS VENTAS
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('user', 'name email')
      .populate('items.product')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ message: 'Error al cargar ventas' });
  }
};

// OBTENER UNA VENTA POR ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Venta invalida' });
    }

    const sale = await populateSale(id);

    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    return res.json(sale);
  } catch (error) {
    return res.status(500).json({ message: 'Error al cargar venta' });
  }
};

// CANCELAR VENTA
exports.cancelSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Venta invalida' });
    }

    let sale;

    await session.withTransaction(async () => {
      sale = await Sale.findById(id).session(session);

      if (!sale) {
        const error = new Error('Venta no encontrada');
        error.statusCode = 404;
        throw error;
      }

      if (sale.status !== 'completada') {
        const error = new Error('Solo se pueden cancelar ventas completadas');
        error.statusCode = 400;
        throw error;
      }

      for (const item of sale.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session, runValidators: true }
        );

        await Inventory.create([{
          product: item.product,
          user: req.user.id,
          type: 'entrada',
          quantity: item.quantity,
          reason: 'Reversion de venta POS',
          reference: sale._id.toString(),
          provider: ''
        }], { session });
      }

      sale.status = 'cancelada';
      await sale.save({ session });
    });

    return res.json(await populateSale(sale._id));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Error al cancelar venta'
    });
  } finally {
    session.endSession();
  }
};

// RESTAURAR VENTA
exports.restoreSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Venta invalida' });
    }

    let sale;

    await session.withTransaction(async () => {
      sale = await Sale.findById(id).session(session);

      if (!sale) {
        const error = new Error('Venta no encontrada');
        error.statusCode = 404;
        throw error;
      }

      if (sale.status !== 'cancelada') {
        const error = new Error('Solo se pueden restaurar ventas canceladas');
        error.statusCode = 400;
        throw error;
      }

      for (const item of sale.items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session, runValidators: true }
        );

        if (!product) {
          const error = new Error('Stock insuficiente para restaurar la venta');
          error.statusCode = 400;
          throw error;
        }

        await Inventory.create([{
          product: item.product,
          user: req.user.id,
          type: 'salida',
          quantity: item.quantity,
          reason: 'Restauracion de venta POS',
          reference: sale._id.toString(),
          provider: product.provider || ''
        }], { session });
      }

      sale.status = 'completada';
      await sale.save({ session });
    });

    return res.json(await populateSale(sale._id));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Error al restaurar venta'
    });
  } finally {
    session.endSession();
  }
};

// OBTENER VENTAS DEL DIA
exports.getSalesOfDay = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completada'
    })
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);

    return res.json({ sales, totalSales, totalAmount });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cargar ventas del dia' });
  }
};
