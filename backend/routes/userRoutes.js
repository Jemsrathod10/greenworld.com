const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { protect } = require('../middleware/auth'); 

// ✅ નવીનતમ ઉમેરો: પ્રોફાઇલ ડેટા મેળવવા માટે (404 Error ફિક્સ કરવા માટે)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ✅ Toggle Wishlist
router.post('/wishlist/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(productId);
    let message = "";

    if (index === -1) {
      user.wishlist.push(productId);
      message = "Added to Wishlist ❤️";
    } else {
      user.wishlist.splice(index, 1);
      message = "Removed from Wishlist 💔";
    }

    await user.save();
    res.json({ success: true, message, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ✅ Get User Wishlist
router.get('/wishlist', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;