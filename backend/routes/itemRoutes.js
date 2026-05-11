const express = require('express');
const router = express.Router();
const { addItem, updateItem, deleteItem, reserveItem,unreserveItem,purchaseItem,
} = require('../controllers/itemController');

const { protect } = require('../middleware/authMiddleware');
const { wishlistLockGuard } = require('../middleware/wishlistLockGuard');

// Add — allowed even when shared (new items start as available — safe)
router.post('/:wishlistId/items', protect, addItem);
 
// Edit — blocked when shared (Decorator pattern — guard wraps updateItem)
router.put('/:wishlistId/items/:itemId', protect, wishlistLockGuard, updateItem);
 
// Delete — blocked when shared (Decorator pattern — guard wraps deleteItem)
router.delete('/:wishlistId/items/:itemId', protect, wishlistLockGuard, deleteItem);
 
// Guest routes - reserve, unreserve, mark as purchased
router.put('/items/:itemId/reserve', protect, reserveItem);
router.put('/items/:itemId/unreserve', protect, unreserveItem);
router.put('/items/:itemId/purchase', protect, purchaseItem);

module.exports = router;
