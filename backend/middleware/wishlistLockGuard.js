const Wishlist = require('../models/Wishlist');

const wishlistLockGuard = async (req, res, next) => {
  try {
    const wishlistId = req.params.wishlistId;
    const wishlist = await Wishlist.findOne({
      _id: wishlistId,
      owner: req.user.id,
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    if (wishlist.isShared) {
      return res.status(403).json({
        message: 'This wishlist is shared and locked. Existing items cannot be edited or deleted.',
        code: 'WISHLIST_LOCKED',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { wishlistLockGuard };