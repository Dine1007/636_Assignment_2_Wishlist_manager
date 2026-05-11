const mongoose = require('mongoose');
const crypto = require('crypto');

const wishlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareLink: { type: String, unique: true },
  isShared: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate unique share link before saving
wishlistSchema.pre('save', function (next) {
  if (!this.shareLink) {
    this.shareLink = crypto.randomBytes(8).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
