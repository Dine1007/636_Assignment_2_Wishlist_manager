// controllers/itemController.js
const itemUtil = require('../utils/itemUtil');

const addItem = async (req, res) => {
  try {
    const item = await itemUtil.addItem(req.params.wishlistId, req.user.id, req.body);
    res.status(201).json(item);
  } catch (error) {
    const status = error.message === 'Wishlist not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await itemUtil.updateItem(req.params.wishlistId, req.params.itemId, req.user.id, req.body);
    res.json(item);
  } catch (error) {
    const status = ['Wishlist not found', 'Item not found'].includes(error.message) ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const result = await itemUtil.deleteItem(req.params.wishlistId, req.params.itemId, req.user.id);
    res.json(result);
  } catch (error) {
    const status = ['Wishlist not found', 'Item not found'].includes(error.message) ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const reserveItem = async (req, res) => {
  try {
    const item = await itemUtil.reserveItem(req.params.itemId, req.user.id);
    res.json(item);
  } catch (error) {
    const status = error.message === 'Item not found' ? 404
      : error.message === 'Owners cannot reserve their own items' ? 403
      : error.message === 'Item is not available for reservation' ? 400
      : 500;
    res.status(status).json({ message: error.message });
  }
};

const unreserveItem = async (req, res) => {
  try {
    const item = await itemUtil.unreserveItem(req.params.itemId, req.user.id);
    res.json(item);
  } catch (error) {
    const status = error.message === 'Item not found' ? 404
      : error.message === 'You can only un-reserve items you reserved' ? 403
      : error.message === 'Item is not currently reserved' ? 400
      : 500;
    res.status(status).json({ message: error.message });
  }
};

const purchaseItem = async (req, res) => {
  try {
    const item = await itemUtil.purchaseItem(req.params.itemId, req.user.id);
    res.json(item);
  } catch (error) {
    const status = error.message === 'Item not found' ? 404
      : error.message === 'You can only mark items you reserved as purchased' ? 403
      : error.message === 'Item must be reserved before marking as purchased' ? 400
      : 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = { addItem, updateItem, deleteItem, reserveItem, unreserveItem, purchaseItem };