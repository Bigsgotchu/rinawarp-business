const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function verifyToken(token, expectedToken) {
  return token === expectedToken;
}

module.exports = {
  generateToken,
  verifyToken,
};
