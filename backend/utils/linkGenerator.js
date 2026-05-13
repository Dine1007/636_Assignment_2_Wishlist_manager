// utils/linkGenerator.js
const crypto = require('crypto');

const generateShareLink = () => {
  return crypto.randomBytes(8).toString('hex');
};

module.exports = { generateShareLink };