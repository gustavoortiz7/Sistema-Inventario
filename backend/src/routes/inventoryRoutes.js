const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
 addStock,
 removeStock,
 getHistory,
 getProductHistory
} = require('../controllers/inventoryController');

router.post('/in', authMiddleware, addStock);
router.post('/out', authMiddleware, removeStock);
router.get('/history', authMiddleware, getHistory);
router.get('/history/product/:productId', authMiddleware, getProductHistory);

module.exports = router;