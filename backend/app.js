const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

console.log('Server starting... Prisma test:', typeof PrismaClient);

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server is working WITH Prisma!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});