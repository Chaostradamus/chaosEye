// app.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('Server starting... Prisma test:', typeof PrismaClient);

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/players', require('./routes/playerRoutes'));

// Basic health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'NFL Stats Server is running!',
    endpoints: {
      search: 'GET /api/players/search?name=playername',
      player: 'GET /api/players/:id'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/players`);
});