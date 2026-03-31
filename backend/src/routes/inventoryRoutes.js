const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
 addStock,
 removeStock,
 getHistory
} = require('../controllers/inventoryController');

router.post('/in', authMiddleware, addStock);
router.post('/out', authMiddleware, removeStock);
router.get('/history', authMiddleware, getHistory);

module.exports = router;