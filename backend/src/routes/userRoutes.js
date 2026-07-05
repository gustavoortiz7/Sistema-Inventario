const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.get('/', authMiddleware, roleMiddleware(['admin']), getUsers);
router.post('/', authMiddleware, roleMiddleware(['admin']), createUser);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);

module.exports = router;
