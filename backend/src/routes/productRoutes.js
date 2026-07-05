const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const {
 createProduct,
 getProducts,
 updateProduct,
 deleteProduct
} = require('../controllers/productController.js');
const roleMiddleware = require('../middlewares/roleMiddleware');

// multer setup - store files in backend/uploads with unique names
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', '..', 'uploads'));
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, unique + path.extname(file.originalname));
	}
});

const upload = multer({ storage });

// create product (admin) - accept single file 'image'
router.post('/', authMiddleware, roleMiddleware(['admin']), upload.single('image'), createProduct);
router.get('/', authMiddleware, getProducts);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteProduct);

module.exports = router;