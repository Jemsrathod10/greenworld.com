const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET Dashboard Stats
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Basic Counts with error handling for each
    let totalUsers = 0;
    let totalProducts = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    let monthlySales = [];

    // Count users
    try {
      totalUsers = await User.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      // Continue with 0
    }

    // Count products
    try {
      totalProducts = await Product.countDocuments();
    } catch (error) {
      console.error('Error counting products:', error);
      // Continue with 0
    }

    // Count orders
    try {
      totalOrders = await Order.countDocuments();
    } catch (error) {
      console.error('Error counting orders:', error);
      // Continue with 0
    }

    // 2. Total Revenue (Sum of all active orders)
    try {
      const revenueAgg = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]);
      totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    } catch (error) {
      console.error('Error calculating revenue:', error);
      totalRevenue = 0;
    }

    // 3. Monthly Sales Chart
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      monthlySales = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: sixMonthsAgo },
            status: { $ne: 'cancelled' } 
          }
        },
        { 
          $group: {
            _id: { $month: "$createdAt" },
            name: { $first: { $dateToString: { format: "%b", date: "$createdAt" } } },
            sales: { $sum: "$pricing.total" }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Ensure monthlySales is always an array
      if (!Array.isArray(monthlySales)) {
        monthlySales = [];
      }
    } catch (error) {
      console.error('Error calculating monthly sales:', error);
      monthlySales = [];
    }

    // Always send a valid response structure
    res.status(200).json({
      success: true,
      counts: { 
        totalUsers, 
        totalProducts, 
        totalOrders, 
        totalRevenue 
      },
      charts: { 
        monthlySales 
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    
    // Send a proper error response
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      counts: { 
        totalUsers: 0, 
        totalProducts: 0, 
        totalOrders: 0, 
        totalRevenue: 0 
      },
      charts: { 
        monthlySales: [] 
      }
    });
  }
});

module.exports = router;