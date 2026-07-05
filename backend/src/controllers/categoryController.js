const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// ===== CATEGORÍAS =====

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      user: req.user.id
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('createCategory error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name: name?.trim(), description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar todas las subcategorías asociadas
    await SubCategory.deleteMany({ category: id });

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== SUBCATEGORÍAS =====

exports.createSubCategory = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre de la subcategoría es requerido' });
    }

    if (!category) {
      return res.status(400).json({ message: 'La categoría es requerida' });
    }

    // Verificar que la categoría existe
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const subCategory = await SubCategory.create({
      name: name.trim(),
      description: description || '',
      category,
      user: req.user.id
    });

    res.status(201).json(subCategory);
  } catch (error) {
    console.error('createSubCategory error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = {};

    if (categoryId) {
      query.category = categoryId;
    }

    const subCategories = await SubCategory.find(query)
      .populate('category')
      .sort({ createdAt: -1 });

    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id).populate('category');

    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }

    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;

    const subCategory = await SubCategory.findByIdAndUpdate(
      id,
      { name: name?.trim(), description, category },
      { new: true, runValidators: true }
    ).populate('category');

    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }

    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }

    res.json({ message: 'Subcategoría eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== OBTENER CATEGORÍAS CON SUBCATEGORÍAS =====

exports.getCategoriesWithSubCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    const result = await Promise.all(
      categories.map(async (cat) => {
        const subCategories = await SubCategory.find({ category: cat._id }).sort({ name: 1 });
        return {
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          subCategories
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
