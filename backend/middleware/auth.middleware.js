const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.json({ success: false, message: 'No token provided', data: null });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ success: false, message: 'Invalid token', data: null });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken };