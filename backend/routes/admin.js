const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const router = express.Router();

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      todayOrders: await Order.countDocuments({ createdAt: { $gte: today } }),
      pendingOrders: await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      totalRevenue: await Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      occupiedTables: await Table.countDocuments({ status: 'occupied' })
    };

    stats.totalRevenue = stats.totalRevenue[0]?.total || 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders with filters
router.get('/orders', async (req, res) => {
  try {
    const { status, date, limit = 50 } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .populate('tableId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add menu item
router.post('/menu', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    const savedItem = await menuItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu item
router.put('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete menu item
router.delete('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tables
router.get('/tables', async (req, res) => {
  try {
    const tables = await Table.find().populate('currentOrder').sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new table
router.post('/tables', async (req, res) => {
  try {
    const { tableNumber, capacity, location } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    // Generate unique QR code
    const { v4: uuidv4 } = require('uuid');
    const qrCode = uuidv4();

    const table = new Table({
      tableNumber,
      qrCode,
      capacity: capacity || 4,
      location: location || '',
      status: 'available'
    });

    const savedTable = await table.save();
    res.status(201).json(savedTable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update table
router.put('/tables/:id', async (req, res) => {
  try {
    const { tableNumber, capacity, location, status } = req.body;

    // Check if new table number conflicts with existing tables
    if (tableNumber) {
      const existingTable = await Table.findOne({
        tableNumber,
        _id: { $ne: req.params.id }
      });
      if (existingTable) {
        return res.status(400).json({ message: 'Table number already exists' });
      }
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { tableNumber, capacity, location, status },
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete table
router.delete('/tables/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table has active orders
    if (table.currentOrder) {
      return res.status(400).json({ message: 'Cannot delete table with active orders' });
    }

    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Free a specific table (manual override)
router.patch('/tables/:id/free', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status: 'available', currentOrder: null },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    console.log('✅ Table manually freed:', table.tableNumber);
    res.json({ message: 'Table freed successfully', table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cleanup tables with cancelled/served orders (utility endpoint)
router.post('/tables/cleanup', async (req, res) => {
  try {
    // Find all occupied tables
    const occupiedTables = await Table.find({ status: 'occupied' }).populate('currentOrder');
    
    let freedCount = 0;
    for (const table of occupiedTables) {
      // If no current order or order is cancelled/served, free the table
      if (!table.currentOrder || 
          table.currentOrder.status === 'cancelled' || 
          table.currentOrder.status === 'served') {
        await Table.findByIdAndUpdate(table._id, {
          status: 'available',
          currentOrder: null
        });
        freedCount++;
        console.log('✅ Cleaned up table:', table.tableNumber);
      }
    }

    res.json({ 
      message: `Cleanup complete. ${freedCount} tables freed.`,
      freedCount 
    });
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;