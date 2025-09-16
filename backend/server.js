require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();




// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SkillSync API is running!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO enabled`);
});



