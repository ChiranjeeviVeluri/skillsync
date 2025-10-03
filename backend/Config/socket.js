const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Check if token is blacklisted
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      if (blacklistedToken) {
        return next(new Error('Token has been invalidated'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.userId || decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userRole})`);
    
    // Join user to their personal room
    socket.join(socket.userId);
    
    // Handle booking room joining
    socket.on('join-booking-room', (bookingId) => {
      socket.join(`booking-${bookingId}`);
      console.log(`📚 User ${socket.userName} joined booking room: ${bookingId}`);
    });
    
    // Handle leaving booking room
    socket.on('leave-booking-room', (bookingId) => {
      socket.leave(`booking-${bookingId}`);
      console.log(`🚪 User ${socket.userName} left booking room: ${bookingId}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };