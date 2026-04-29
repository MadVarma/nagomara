const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, getAllOrders, updateOrderStatus, deleteOrder, getAllUsers } = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/all', authenticate, isAdmin, getAllOrders);
router.get('/users', authenticate, isAdmin, getAllUsers);
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);
router.delete('/:id', authenticate, isAdmin, deleteOrder);
router.get('/:id', authenticate, getOrder);

module.exports = router;

