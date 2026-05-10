const express = require('express');
const router = express.Router();
const { addItem, updateItem, deleteItem, reserveItem,unreserveItem,purchaseItem,
} = require('../controllers/itemController');

const { protect } = require('../middleware/authMiddleware');

router.post('/:wishlistId/items', protect, addItem);
router.put('/:wishlistId/items/:itemId', protect, updateItem);
router.delete('/:wishlistId/items/:itemId', protect, deleteItem);
router.put('/items/:itemId/reserve', protect, reserveItem);
router.put('/items/:itemId/unreserve', protect, unreserveItem);
router.put('/items/:itemId/purchase', protect, purchaseItem);

module.exports = router;
