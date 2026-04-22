const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product'); 
const User = require('../models/User'); 
const { protect, admin } = require('../middleware/auth'); // ✅ Fix: Import protect and admin

// 1. GET ALL Reviews (Admin Panel)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .populate('reviews.user', 'name email'); 

    let allReviews = [];
    products.forEach(product => {
      if (product.reviews) {
        product.reviews.forEach(review => {
          allReviews.push({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            title: review.title,
            user: review.user, 
            createdAt: review.createdAt,
            product: { 
                _id: product._id, 
                name: product.name,
                image: product.images?.[0]?.url 
            } 
          });
        });
      }
    });

    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: allReviews.length, reviews: allReviews });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 2. GET Reviews for ONE Product (Customer Side)
router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('reviews.user', 'name'); 

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const sortedReviews = product.reviews ? 
      product.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

    res.json({ success: true, reviews: sortedReviews });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. POST Review (Logged in users only)
// ✅ Fix: Changed auth() to protect
router.post('/', protect, async (req, res) => {
  try {
    if (!req.user) {
        throw new Error("Auth Failed: Backend received no user data.");
    }
    
    // Get Data
    const productId = req.body.productId || req.body.product;
    const { rating, comment, title } = req.body;

    if (!productId) throw new Error("Product ID is missing.");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found.");

    // Initialize reviews if missing
    if (!product.reviews) product.reviews = [];

    // Check for duplicate
    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Create Review
    const newReview = {
      user: req.user._id,
      name: req.user.name || "Customer", 
      rating: Number(rating),
      comment: comment,
      title: title || 'Review',
      createdAt: new Date()
    };

    product.reviews.push(newReview);

    // Update Stats
    product.ratingsQuantity = product.reviews.length;
    product.ratingsAverage = 
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: 'Review added', review: newReview });

  } catch (error) {
    console.error("❌ REVIEW ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. DELETE Review (Admin Only)
// ✅ Fix: Changed auth('admin') to protect, admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const reviewId = req.params.id;

    // 1. Find the product that contains this review
    const product = await Product.findOne({ "reviews._id": reviewId });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Review or Product not found' });
    }

    // 2. Filter out the review to delete it
    product.reviews = product.reviews.filter(
      (review) => review._id.toString() !== reviewId
    );

    // 3. Update Stats
    product.ratingsQuantity = product.reviews.length;
    
    if (product.reviews.length > 0) {
      product.ratingsAverage = 
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    } else {
      product.ratingsAverage = 0;
    }

    await product.save();

    res.json({ success: true, message: 'Review deleted successfully' });

  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
});

module.exports = router;