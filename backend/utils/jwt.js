const jwt = require('jsonwebtoken');
const functions = require('firebase-functions');

const getJWTSecret = () => {
  return process.env.JWT_SECRET || 
         (functions.config().jwt && functions.config().jwt.secret) ||
         'your-secret-key-change-in-production';
};

const JWT_SECRET = getJWTSecret();
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Generate JWT token for user
const generateToken = (userId, email, role = 'employee') => {
  const payload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Decode JWT token without verification (useful for debugging)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  JWT_SECRET
};
