const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createSale,
  getSales,
  getSaleById,
  cancelSale,
  restoreSale,
  getSalesOfDay
} = require('../controllers/saleController');

router.post('/', authMiddleware, createSale);
router.get('/', authMiddleware, getSales);
router.get('/day', authMiddleware, getSalesOfDay);
router.get('/:id', authMiddleware, getSaleById);
router.put('/:id/cancel', authMiddleware, cancelSale);
router.put('/:id/restore', authMiddleware, restoreSale);

module.exports = router;
