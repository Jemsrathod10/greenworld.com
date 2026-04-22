const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure filename matches (User.js)

// 🛡️ PROTECT: Ensures the user is logged in
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID (handles both 'id' and 'userId' token formats)
      req.user = await User.findById(decoded.id || decoded.userId).select('-password');
      
      if (!req.user) {
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 👑 ADMIN: Ensures the user is an admin
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// ✅ EXPORT FOR 'REQUIRE'
module.exports = { protect, admin };