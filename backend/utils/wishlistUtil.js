// utils/wishlistUtil.js
const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');

const createWishlist = async (userId, name, dueDate) => {
  const data = { name, owner: userId, dueDate: new Date(dueDate) };
  const wishlist = await Wishlist.create(data);
  return wishlist;
};

const getMyWishlists = async (userId) => {
  return await Wishlist.find({ owner: userId }).sort({ createdAt: -1 });
};

const getWishlistById = async (wishlistId, userId) => {
  const wishlist = await Wishlist.findOne({ _id: wishlistId, owner: userId });
  if (!wishlist) throw new Error('Wishlist not found');

  const items = await WishlistItem.find({ wishlist: wishlist._id });

  // Surprise protection — owner always sees all items as "available"
  const safeItems = items.map(item => ({
    _id:       item._id,
    name:      item.name,
    price:     item.price,
    priority:  item.priority,
    url:       item.url,
    status:    'available',
    wishlist:  item.wishlist,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return { wishlist, items: safeItems };
};

const updateWishlist = async (wishlistId, userId, name, dueDate) => {
  const updateFields = { name };

  if (dueDate !== undefined) {
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) throw new Error('Invalid due date.');
    updateFields.dueDate = parsed;
    updateFields.reminder7DaySent = false;  // reset so reminders fire again
    updateFields.reminder1DaySent = false;
  }
  const wishlist = await Wishlist.findOneAndUpdate(
    { _id: wishlistId, owner: userId },
    updateFields,
    { new: true }
  );
  if (!wishlist) throw new Error('Wishlist not found');
  return wishlist;
};

const deleteWishlist = async (wishlistId, userId) => {
  const wishlist = await Wishlist.findOneAndDelete({ _id: wishlistId, owner: userId });
  if (!wishlist) throw new Error('Wishlist not found');

  await WishlistItem.deleteMany({ wishlist: wishlist._id });
  return { message: 'Wishlist deleted' };
};

const getSharedWishlist = async (shareLink) => {
  const wishlist = await Wishlist.findOne({ shareLink }).populate('owner', 'name');
  if (!wishlist) throw new Error('Wishlist not found');

  const items = await WishlistItem.find({ wishlist: wishlist._id });
  return { wishlist, items };
};

const shareWishlist = async (wishlistId, userId) => {
  const wishlist = await Wishlist.findOne({ _id: wishlistId, owner: userId });
  if (!wishlist) throw new Error('Wishlist not found');

  wishlist.isShared = true;
  await wishlist.save();

  return {
    message:   'Wishlist is now shared and locked.',
    shareLink: wishlist.shareLink,
    isShared:  wishlist.isShared,
  };
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