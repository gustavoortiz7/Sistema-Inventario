const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getCategoriesWithSubCategories
} = require('../controllers/categoryController');

const roleMiddleware = require('../middlewares/roleMiddleware');

// CATEGORÍAS
router.post('/', authMiddleware, roleMiddleware('admin'), createCategory);
router.get('/', authMiddleware, getCategories);
router.get('/hierarchy', authMiddleware, getCategoriesWithSubCategories);
router.get('/:id', authMiddleware, getCategoryById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteCategory);

// SUBCATEGORÍAS
router.post('/sub', authMiddleware, roleMiddleware('admin'), createSubCategory);
router.get('/sub/list', authMiddleware, getSubCategories);
router.get('/sub/:id', authMiddleware, getSubCategoryById);
router.put('/sub/:id', authMiddleware, roleMiddleware('admin'), updateSubCategory);
router.delete('/sub/:id', authMiddleware, roleMiddleware('admin'), deleteSubCategory);

module.exports = router;
