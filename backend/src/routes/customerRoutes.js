const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

router.post('/', authMiddleware, createCustomer);
router.get('/', authMiddleware, getCustomers);
router.get('/:id', authMiddleware, getCustomerById);
router.put('/:id', authMiddleware, updateCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);

module.exports = router;
