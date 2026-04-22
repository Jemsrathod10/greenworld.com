const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Import auth middleware
const { protect, admin } = require('../middleware/auth');

// Logging middleware
router.use((req, res, next) => {
  console.log(`📦 Orders API: ${req.method} ${req.originalUrl}`);
  next();
});

// Helper function to safely process order data
const safeOrderData = (order) => {
  if (!order) return null;
  
  return {
    _id: order._id,
    orderNumber: order.orderNumber || `ORD-${order._id?.toString().slice(-8)}`,
    status: order.status || 'pending',
    createdAt: order.createdAt || order.orderDate || new Date(),
    items: order.items || [],
    pricing: order.pricing || { total: 0, subtotal: 0, tax: 0, shippingCost: 0 },
    payment: order.payment || { method: 'cod', status: 'pending' },
    user: order.user,
    billing: order.billing,
    shipping: order.shipping,
    deliveredDate: order.deliveredDate,
    shippedDate: order.shippedDate,
    cancelledDate: order.cancelledDate
  };
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    console.log('👨‍💼 Admin fetching all orders...');

    // Fetch all orders
    const orders = await Order.find({})
      .populate('user', 'name email firstName lastName')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`📊 Found ${orders.length} orders in database`);

    // Process orders safely
    const processedOrders = orders.map(order => safeOrderData(order));

    res.status(200).json({
      success: true,
      count: processedOrders.length,
      orders: processedOrders
    });

  } catch (error) {
    console.error('❌ Error in GET /orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders: ' + error.message,
      orders: []
    });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    console.log('📋 Fetching orders for user:', req.user?._id);

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        orders: []
      });
    }

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`📦 Found ${orders.length} orders for user`);

    const processedOrders = orders.map(order => safeOrderData(order));

    res.status(200).json({
      success: true,
      count: processedOrders.length,
      orders: processedOrders
    });

  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your orders: ' + error.message,
      orders: []
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .lean()
      .exec();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const processedOrder = safeOrderData(order);

    res.status(200).json({
      success: true,
      order: processedOrder
    });

  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order: ' + error.message
    });
  }
});

// @desc    Create new order (simple endpoint for checkout)
// @route   POST /api/orders/simple
// @access  Private
router.post('/simple', protect, async (req, res) => {
  try {
    console.log('🛒 Creating new order (simple)...');

    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // ✅ STEP 1: Validate stock availability BEFORE creating order
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name}" not found`
        });
      }

      const availableStock = product.stock?.quantity || 0;
      const requestedQty = item.qty || item.quantity || 1;

      if (availableStock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Sorry! Only ${availableStock} units of "${item.name}" available. You requested ${requestedQty}.`
        });
      }
    }

    // Create order data
    const orderData = {
      user: req.user._id,
      items: orderItems.map(item => ({
        product: item.product || item._id,
        name: item.name,
        price: item.price,
        quantity: item.qty || item.quantity || 1,
        sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        image: item.image || item.images?.[0]?.url || item.images?.[0] || '', // ✅ FIXED
        subtotal: (item.price || 0) * (item.qty || item.quantity || 1)
      })),
      billing: {
        firstName: req.user.firstName || req.user.name?.split(' ')[0] || 'Customer',
        lastName: req.user.lastName || req.user.name?.split(' ')[1] || 'User', // ✅ Addition to fix error
        email: req.user.email,
        phone: req.user.phone || shippingAddress?.phone || '0000000000',
        address: {
          street: shippingAddress?.address || 'N/A',
          city: shippingAddress?.city || 'N/A',
          state: shippingAddress?.state || 'N/A',
          zipCode: shippingAddress?.postalCode || '000000',
          country: shippingAddress?.country || 'India'
        }
      },
      shipping: {
        firstName: req.user.firstName || req.user.name?.split(' ')[0] || 'Customer',
        lastName: req.user.lastName || req.user.name?.split(' ')[1] || 'User', // ✅ Addition to fix error
        address: {
          street: shippingAddress?.address || 'N/A',
          city: shippingAddress?.city || 'N/A',
          state: shippingAddress?.state || 'N/A',
          zipCode: shippingAddress?.postalCode || '000000',
          country: shippingAddress?.country || 'India'
        },
        method: 'standard',
        cost: 0
      },
      payment: {
        method: paymentMethod || 'cod',
        status: 'pending'
      },
      pricing: {
        subtotal: totalPrice || 0,
        tax: 0,
        shippingCost: 0,
        total: totalPrice || 0
      },
      status: 'pending'
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    // ✅ STEP 2: Reduce stock for each product AFTER order is saved
    for (const item of orderItems) {
      try {
        const product = await Product.findById(item.product);
        const qtyToReduce = item.qty || item.quantity || 1;
        const previousStock = product.stock?.quantity || 0;
        const newStock = Math.max(0, previousStock - qtyToReduce);

        // Update product stock
        await Product.findByIdAndUpdate(
          item.product,
          { 
            'stock.quantity': newStock
          },
          { new: true }
        );

        console.log(`✅ Reduced stock for ${item.name}: ${previousStock} → ${newStock} (-${qtyToReduce})`);
      } catch (stockError) {
        console.error(`⚠️ Error updating stock for product ${item.product}:`, stockError);
      }
    }

    console.log('✅ Order created:', savedOrder._id);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        _id: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        status: savedOrder.status,
        total: savedOrder.pricing.total
      }
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order: ' + error.message
    });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    console.log('🛒 Creating new order...');

    const {
      orderItems,
      items,
      shippingAddress,
      shipping,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Use whichever format was provided
    const orderItemsData = items || orderItems;

    if (!orderItemsData || orderItemsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // Create order data
    const orderData = {
      user: req.user._id,
      items: orderItemsData.map(item => ({
        product: item.product || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || item.qty || 1,
        sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        image: item.image || item.images?.[0]?.url || item.images?.[0] || '', // ✅ FIXED
        subtotal: (item.price || 0) * (item.quantity || item.qty || 1)
      })),
      billing: {
        firstName: req.user.firstName || req.user.name?.split(' ')[0] || 'Customer',
        lastName: req.user.lastName || req.user.name?.split(' ')[1] || 'User', // ✅ Addition to fix error
        email: req.user.email,
        phone: req.user.phone || '0000000000',
        address: {
          street: (shippingAddress || shipping)?.address || 'N/A',
          city: (shippingAddress || shipping)?.city || 'N/A',
          state: (shippingAddress || shipping)?.state || 'N/A',
          zipCode: (shippingAddress || shipping)?.postalCode || '000000',
          country: (shippingAddress || shipping)?.country || 'India'
        }
      },
      shipping: {
        firstName: req.user.firstName || req.user.name?.split(' ')[0] || 'Customer',
        lastName: req.user.lastName || req.user.name?.split(' ')[1] || 'User', // ✅ Addition to fix error
        address: {
          street: (shippingAddress || shipping)?.address || 'N/A',
          city: (shippingAddress || shipping)?.city || 'N/A',
          state: (shippingAddress || shipping)?.state || 'N/A',
          zipCode: (shippingAddress || shipping)?.postalCode || '000000',
          country: (shippingAddress || shipping)?.country || 'India'
        },
        method: 'standard',
        cost: shippingPrice || 0
      },
      payment: {
        method: paymentMethod || 'cod',
        status: 'pending'
      },
      pricing: {
        subtotal: itemsPrice || totalPrice || 0,
        tax: taxPrice || 0,
        shippingCost: shippingPrice || 0,
        total: totalPrice || 0
      },
      status: 'pending'
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    console.log('✅ Order created:', savedOrder._id);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: safeOrderData(savedOrder.toObject())
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order: ' + error.message
    });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    console.log(`🔄 Updating order ${req.params.id} status to:`, req.body.status);

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;

    // Update delivery dates based on status
    if (status === 'shipped' && !order.shippedDate) {
      order.shippedDate = new Date();
    }
    if (status === 'delivered') {
      order.deliveredDate = new Date();
    }
    if (status === 'cancelled' && !order.cancelledDate) {
      order.cancelledDate = new Date();
    }

    await order.save();

    console.log('✅ Order status updated successfully');

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: safeOrderData(order.toObject())
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status: ' + error.message
    });
  }
});

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'shipped', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    order.cancelledDate = new Date();
    await order.save();

    console.log('✅ Order cancelled successfully');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: safeOrderData(order.toObject())
    });

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order: ' + error.message
    });
  }
});

module.exports = router;