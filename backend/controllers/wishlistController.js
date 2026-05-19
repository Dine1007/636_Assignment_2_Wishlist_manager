// controllers/wishlistController.js
const wishlistUtil = require('../utils/wishlistUtil');

const createWishlist = async (req, res) => {
  try {
    const { name, dueDate } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Wishlist name is required.' });
    }
    if (!dueDate) {
      return res.status(400).json({ message: 'Due date is required.' });
    }
    const parsedDue = new Date(dueDate);
    if (Number.isNaN(parsedDue.getTime())) {
      return res.status(400).json({ message: 'Invalid due date.' });
    }
    const wishlist = await wishlistUtil.createWishlist(req.user.id, name.trim(), dueDate);
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyWishlists = async (req, res) => {
  try {
    const wishlists = await wishlistUtil.getMyWishlists(req.user.id);
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWishlistById = async (req, res) => {
  try {
    const result = await wishlistUtil.getWishlistById(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Wishlist not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistUtil.updateWishlist(
      req.params.id,
      req.user.id,
      req.body.name,
      req.body.dueDate,   // ← add this
    );
    res.json(wishlist);
  } catch (error) {
    const status = ['Wishlist not found', 'Invalid due date.'].includes(error.message) ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const result = await wishlistUtil.deleteWishlist(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Wishlist not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const getSharedWishlist = async (req, res) => {
  try {
    const result = await wishlistUtil.getSharedWishlist(req.params.shareLink);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Wishlist not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const shareWishlist = async (req, res) => {
  try {
    const result = await wishlistUtil.shareWishlist(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    const status = error.message === 'Wishlist not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = {
  createWishlist,
  getMyWishlists,
  getWishlistById,
  updateWishlist,
  deleteWishlist,
  getSharedWishlist,
  shareWishlist,
};