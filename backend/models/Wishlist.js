// models/Wishlist.js
const mongoose = require('mongoose');
const { generateShareLink } = require('../utils/linkGenerator');

const wishlistSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dueDate:   { type: Date },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareLink: { type: String, unique: true },
  isShared:  { type: Boolean, default: false },
}, { timestamps: true });

wishlistSchema.pre('save', function (next) {
  if (!this.shareLink) {
    this.shareLink = generateShareLink();
  }
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);