const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const adminRoutes = require('./routes/admin');
const rewardsRoutes = require('./routes/rewards');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://restaurantqr-seven.vercel.app"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://restaurantqr-seven.vercel.app"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-qr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-table', (tableId) => {
    socket.join(`table-${tableId}`);
  });
  
  socket.on('join-admin', () => {
    socket.join('admin');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rewards', rewardsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Restaurant QR API is running' });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});