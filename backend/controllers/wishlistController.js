const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');

// Create a new wishlist (Owner)
const createWishlist = async (req, res) => {
  try {
    const { name } = req.body;
    const wishlist = await Wishlist.create({ name, owner: req.user.id });
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all wishlists for the logged-in owner
const getMyWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single wishlist by ID 
const getWishlistById = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    const items = await WishlistItem.find({ wishlist: wishlist._id });
    // Surprise protection: owner always sees all items as "available"
    const safeItems = items.map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      priority: item.priority,
      url: item.url,
      status: 'available',
      wishlist: item.wishlist,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
    res.json({ wishlist, items: safeItems});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update wishlist name (Owner)
const updateWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { name: req.body.name },
      { new: true }
    );
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a wishlist and all its items (Owner)
const deleteWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    await WishlistItem.deleteMany({ wishlist: wishlist._id });
    res.json({ message: 'Wishlist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get shared wishlist by unique link (Guest view - shows REAL status)
const getSharedWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ shareLink: req.params.shareLink }).populate('owner', 'name');
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    const items = await WishlistItem.find({ wishlist: wishlist._id })
      //.populate('reservedBy', 'name')
      //.populate('purchasedBy', 'name');

    res.json({ wishlist, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//share wishlist - sets is shared to true and locks exisiting items
const shareWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    //set isshared to true - triggers wishlistLockGuard to lock existing items
    wishlist.isShared = true;
    await wishlist.save();
    
    res.json({ 
      message: 'Wishlist is now shared and locked.',
      shareLink: wishlist.shareLink,
      isShared: wishlist.isShared,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
