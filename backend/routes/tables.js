const express = require('express');
const Table = require('../models/Table');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Get table by QR code
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const table = await Table.findOne({ qrCode: req.params.qrCode });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get table by ID
router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('currentOrder');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tables (admin)
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().populate('currentOrder').sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new table (admin)
router.post('/', async (req, res) => {
  try {
    const { tableNumber, capacity, location } = req.body;
    
    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }
    
    // Generate unique QR code
    const qrCode = uuidv4();
    
    const table = new Table({
      tableNumber,
      qrCode,
      capacity,
      location: location || '',
      status: 'available'
    });
    
    const savedTable = await table.save();
    res.status(201).json(savedTable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update table (admin)
router.put('/:id', async (req, res) => {
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

// Delete table (admin)
router.delete('/:id', async (req, res) => {
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

module.exports = router;