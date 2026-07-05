const Product = require('../models/Product');

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const buildProductPayload = (body) => {
  const payload = {};

  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.description !== undefined) payload.description = String(body.description || '').trim();
  if (body.category !== undefined) payload.category = String(body.category || 'General').trim() || 'General';
  if (body.provider !== undefined) payload.provider = String(body.provider || '').trim();
  if (body.providerPhone !== undefined) payload.providerPhone = String(body.providerPhone || '').trim();
  if (body.subCategory !== undefined) payload.subCategory = String(body.subCategory || '').trim();

  if (body.price !== undefined) {
    payload.price = toNumber(body.price);
  }

  if (body.stock !== undefined) {
    payload.stock = toNumber(body.stock);
  }

  return payload;
};

const validateProductPayload = (payload, { requireName = false, requirePrice = false } = {}) => {
  if (requireName && !payload.name) {
    return 'El nombre del producto es requerido';
  }

  if (requirePrice && payload.price === undefined) {
    return 'El precio del producto es requerido';
  }

  if (payload.price !== undefined && (payload.price === null || payload.price < 0)) {
    return 'El precio debe ser un numero mayor o igual a 0';
  }

  if (payload.stock !== undefined && (payload.stock === null || payload.stock < 0)) {
    return 'El stock debe ser un numero mayor o igual a 0';
  }

  return null;
};

// CREAR PRODUCTO
exports.createProduct = async (req, res) => {
  try {
    const payload = {
      ...buildProductPayload(req.body),
      user: req.user.id
    };

    const validationError = validateProductPayload(payload, {
      requireName: true,
      requirePrice: true
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create(payload);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear producto' });
  }
};

// OBTENER PRODUCTOS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Error al cargar productos' });
  }
};

// ACTUALIZAR PRODUCTO
exports.updateProduct = async (req, res) => {
  try {
    const updateData = buildProductPayload(req.body);
    const validationError = validateProductPayload(updateData);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// ELIMINAR PRODUCTO
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json({ message: 'Producto eliminado' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar producto' });
  }
};
