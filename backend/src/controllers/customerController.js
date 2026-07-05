const Customer = require('../models/Customer');

// CREATE
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, city, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    const customer = await Customer.create({
      name: name.trim(),
      email,
      phone,
      address,
      city,
      notes,
      user: req.user.id
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ALL
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, city, notes } = req.body;
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim(),
        email,
        phone,
        address,
        city,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
