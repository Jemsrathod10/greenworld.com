const Order = require('../models/Order'); // Ensure filename matches (Order.js or orderModel.js)
const Product = require('../models/Product'); // Ensure filename matches

// @desc    Create new order & Subtract Stock
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // 🛑 1. CHECK STOCK & SUBTRACT
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }

      // Handle stock (some products have stock object, some just number)
      const currentStock = product.stock?.quantity || product.stock || 0;

      if (currentStock < item.qty) {
        return res.status(400).json({ message: `Out of Stock: ${product.name}` });
      }

      // Subtract Stock
      const newStock = currentStock - item.qty;
      
      // Update both formats to be safe
      if (typeof product.stock === 'object') {
        product.stock.quantity = newStock;
      } else {
        product.stock = newStock;
      }
      product.countInStock = newStock; // Update legacy field if it exists

      await product.save();
    }

    // 2. CREATE ORDER
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

module.exports = { addOrderItems, getMyOrders };