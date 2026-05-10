const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  url: { type: String, default: '' },
  wishlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist', required: true },
  status: { type: String, enum: ['available', 'reserved', 'purchased'], default: 'available' },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    
}, { timestamps: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);
