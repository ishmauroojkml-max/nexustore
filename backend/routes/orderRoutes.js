import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Get all orders (for admin or orders page)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      phone,
      shippingAddress,
      paymentMethod,
      orderItems,
      itemsPrice,
      shippingFee,
      totalAmount,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items specified' });
    }

    const generatedId = orderId || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = new Order({
      orderId: generatedId,
      customerName: customerName || 'Valued Customer',
      phone: phone || 'N/A',
      shippingAddress: shippingAddress || { street: 'Main Address', city: '' },
      paymentMethod: paymentMethod || 'Cash on Delivery',
      orderItems,
      itemsPrice: Number(itemsPrice || 0),
      shippingFee: Number(shippingFee || 0),
      totalAmount: Number(totalAmount || 0),
      status: 'Pending',
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findOne({ $or: [{ _id: req.params.id }, { orderId: req.params.id }] });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status || order.status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete / Cancel order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ $or: [{ _id: req.params.id }, { orderId: req.params.id }] });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await Order.findByIdAndDelete(order._id);
    res.json({ message: 'Order cancelled / deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

