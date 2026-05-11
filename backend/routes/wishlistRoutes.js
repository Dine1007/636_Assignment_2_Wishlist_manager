const express = require('express');
const router = express.Router();
const {
  createWishlist,
  getMyWishlists,
  getWishlistById,
  updateWishlist,
  deleteWishlist,
  getSharedWishlist,
  shareWishlist,

} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// Public route - guest can view shared wishlist WITHOUT login
router.get('/share/:shareLink', getSharedWishlist);

// Protected routes - owner must be logged in
router.post('/', protect, createWishlist);
router.get('/', protect, getMyWishlists);
router.get('/:id', protect, getWishlistById);
router.put('/:id', protect, updateWishlist);
router.delete('/:id', protect, deleteWishlist);

// Share route — sets isShared = true, locks existing items
router.put('/:id/share', protect, shareWishlist);
 // No auth required for shared view

module.exports = router;
