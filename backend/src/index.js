require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', service: 'NER Logistics API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NER Logistics API running on port ${PORT}`);
});

module.exports = app;
