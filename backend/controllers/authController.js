// controllers/authController.js
const authUtil = require('../utils/authUtil');

const registerUser = async (req, res) => {
  try {
    const result = await authUtil.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    const status = error.message === 'User already exists' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const result = await authUtil.loginUser(req.body);
    res.json(result);
  } catch (error) {
    console.log("error",error);
    
    const status = error.message === 'Invalid email or password' ? 401 : 500;
    res.status(status).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await authUtil.getProfile(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    const status = error.message === 'User not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const result = await authUtil.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    const status = error.message === 'User not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };