const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, checkRole(['Admin']), userController.getUsers);
router.post('/', auth, checkRole(['Admin']), userController.createUser);
router.put('/:id', auth, checkRole(['Admin']), userController.updateUser);
router.delete('/:id', auth, checkRole(['Admin']), userController.deleteUser);

module.exports = router;
