const express = require('express');
const Order = require('../models/Order');
const Table = require('../models/Table');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, items, totalAmount, specialRequests, paymentMethod } = req.body;
    
    // Validation
    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: 'Customer name and phone are required' });
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }
    
    // Verify table exists (handle demo mode and QR codes)
    let table;
    if (tableId === 'demo-table') {
      // For demo mode, use the first available table
      table = await Table.findOne();
      if (!table) {
        return res.status(404).json({ message: 'No tables available' });
      }
    } else {
      // Try to find by ObjectId first
      try {
        table = await Table.findById(tableId);
      } catch (error) {
        // If ObjectId lookup fails, try QR code lookup
        table = await Table.findOne({ qrCode: tableId });
      }
      
      if (!table) {
        return res.status(404).json({ message: 'Table not found' });
      }
    }
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Calculate estimated time based on items
    const estimatedTime = Math.max(15, items.length * 5);
    
    const order = new Order({
      orderNumber,
      tableId: table._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items,
      totalAmount,
      specialRequests: specialRequests || '',
      paymentMethod: paymentMethod || 'cash',
      estimatedTime
    });
    
    const savedOrder = await order.save();
    
    console.log('✅ Order saved successfully:', {
      orderNumber: savedOrder.orderNumber,
      customerName: savedOrder.customerName,
      customerPhone: savedOrder.customerPhone,
      totalAmount: savedOrder.totalAmount,
      itemsCount: savedOrder.items.length
    });
    
    await savedOrder.populate('items.menuItem');
    
    // Update table status
    await Table.findByIdAndUpdate(table._id, { 
      status: 'occupied',
      currentOrder: savedOrder._id 
    });
    
    // Emit to admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('new-order', savedOrder);
    }
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : []
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem')
      .populate('tableId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by order number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.menuItem')
      .populate('tableId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.menuItem').populate('tableId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('✅ Order status updated:', {
      orderNumber: order.orderNumber,
      oldStatus: order.status,
      newStatus: status,
      tableId: order.tableId._id
    });
    
    // Emit status update to customer and admin
    const io = req.app.get('io');
    if (io) {
      io.to(`table-${order.tableId._id}`).emit('order-status-update', order);
      io.to('admin').emit('order-status-update', order);
    }
    
    // Free up the table if order is served or cancelled
    if (status === 'served' || status === 'cancelled') {
      await Table.findByIdAndUpdate(order.tableId._id, {
        status: 'available',
        currentOrder: null
      });
      console.log('✅ Table freed:', order.tableId._id);
    }
    
    res.json(order);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get latest order for table
router.get('/table/:tableId/latest', async (req, res) => {
  try {
    let tableId = req.params.tableId;
    
    // Handle demo-table case
    if (tableId === 'demo-table') {
      const table = await Table.findOne();
      if (table) {
        tableId = table._id;
      }
    }
    
    // Try to find by ObjectId first, then by QR code
    let table;
    try {
      table = await Table.findById(tableId);
    } catch (error) {
      table = await Table.findOne({ qrCode: tableId });
    }
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Find the latest order for this table
    const order = await Order.findOne({ 
      tableId: table._id 
    })
    .populate('items.menuItem')
    .populate('tableId')
    .sort({ createdAt: -1 });
    
    if (!order) {
      return res.status(404).json({ message: 'No orders found for this table' });
    }
    
    console.log('✅ Latest order found for table:', {
      tableId: table._id,
      orderNumber: order.orderNumber,
      status: order.status
    });
    
    res.json(order);
  } catch (error) {
    console.error('❌ Error fetching latest order:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;