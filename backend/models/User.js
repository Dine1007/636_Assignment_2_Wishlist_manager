// models/User.js
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/hashUtil');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  university: { type: String },
  address:    { type: String },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

module.exports = mongoose.model('User', userSchema);