// utils/itemUtil.js
const WishlistItem = require('../models/WishlistItem');
const Wishlist = require('../models/Wishlist');

const addItem = async (wishlistId, userId, itemData) => {
  const wishlist = await Wishlist.findOne({ _id: wishlistId, owner: userId });
  if (!wishlist) throw new Error('Wishlist not found');

  const { name, price, priority, url } = itemData;
  const item = await WishlistItem.create({
    name,
    price,
    priority,
    url,
    wishlist: wishlist._id,
  });
  return item;
};

const updateItem = async (wishlistId, itemId, userId, updates) => {
  const wishlist = await Wishlist.findOne({ _id: wishlistId, owner: userId });
  if (!wishlist) throw new Error('Wishlist not found');

  const item = await WishlistItem.findOneAndUpdate(
    { _id: itemId, wishlist: wishlist._id },
    updates,
    { new: true }
  );
  if (!item) throw new Error('Item not found');
  return item;
};

const deleteItem = async (wishlistId, itemId, userId) => {
  const wishlist = await Wishlist.findOne({ _id: wishlistId, owner: userId });
  if (!wishlist) throw new Error('Wishlist not found');

  const item = await WishlistItem.findOneAndDelete({ _id: itemId, wishlist: wishlist._id });
  if (!item) throw new Error('Item not found');
  return { message: 'Item deleted' };
};

const reserveItem = async (itemId, userId) => {
  const item = await WishlistItem.findById(itemId);
  if (!item) throw new Error('Item not found');

  const wishlist = await Wishlist.findById(item.wishlist);
  if (wishlist.owner.toString() === userId) {
    throw new Error('Owners cannot reserve their own items');
  }

  if (item.status !== 'available') {
    throw new Error('Item is not available for reservation');
  }

  item.status = 'reserved';
  item.reservedBy = userId;
  await item.save();

  return await WishlistItem.findById(item._id)
    .populate('reservedBy', 'name')
    .populate('purchasedBy', 'name');
};

const unreserveItem = async (itemId, userId) => {
  const item = await WishlistItem.findById(itemId);
  if (!item) throw new Error('Item not found');

  if (item.status !== 'reserved') {
    throw new Error('Item is not currently reserved');
  }

  if (item.reservedBy.toString() !== userId) {
    throw new Error('You can only un-reserve items you reserved');
  }

  item.status = 'available';
  item.reservedBy = null;
  await item.save();
  return item;
};

const purchaseItem = async (itemId, userId) => {
  const item = await WishlistItem.findById(itemId);
  if (!item) throw new Error('Item not found');

  if (item.status !== 'reserved') {
    throw new Error('Item must be reserved before marking as purchased');
  }

  if (item.reservedBy.toString() !== userId) {
    throw new Error('You can only mark items you reserved as purchased');
  }

  item.status = 'purchased';
  item.purchasedBy = userId;
  item.reservedBy = null;
  await item.save();

  return await WishlistItem.findById(item._id)
    .populate('reservedBy', 'name')
    .populate('purchasedBy', 'name');
};

module.exports = { addItem, updateItem, deleteItem, reserveItem, unreserveItem, purchaseItem };