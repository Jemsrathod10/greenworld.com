const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    LOGIN User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log("-----------------------------------------");
  console.log("🔍 LOGIN ATTEMPT:");
  console.log("📧 Email:", email);
  console.log("🔑 Password Entered:", password);

  try {
    const user = await User.findOne({ email });

    if (!user) {
        console.log("❌ User NOT FOUND in Database.");
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log("✅ User Found:", user.email);
    console.log("💾 Stored Hash:", user.password);

    // Check Password
    const isMatch = await user.matchPassword(password);
    console.log("🤔 Password Match Result:", isMatch);

    if (isMatch) {
      console.log("🎉 LOGIN SUCCESS!");
    res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          role: user.role,
        }
      });
    } else {
      console.log("⛔ Password Did Not Match.");
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.log("💥 SERVER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    REGISTER User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password, 
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;