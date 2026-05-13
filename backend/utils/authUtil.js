// utils/authUtil.js
const User = require('../models/User');
const { generateToken } = require('./tokenUtil');
const { comparePassword } = require('./hashUtil');

const registerUser = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('User already exists');

  const user = await User.create({ name, email, password });
  return {
    id:    user.id,
    name:  user.name,
    email: user.email,
    token: generateToken(user.id),
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  return {
    id:    user.id,
    name:  user.name,
    email: user.email,
    token: generateToken(user.id),
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  return {
    name:       user.name,
    email:      user.email,
    university: user.university,
    address:    user.address,
  };
};

const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.name       = updates.name       || user.name;
  user.email      = updates.email      || user.email;
  user.university = updates.university || user.university;
  user.address    = updates.address    || user.address;

  const updatedUser = await user.save();
  return {
    id:         updatedUser.id,
    name:       updatedUser.name,
    email:      updatedUser.email,
    university: updatedUser.university,
    address:    updatedUser.address,
    token:      generateToken(updatedUser.id),
  };
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };