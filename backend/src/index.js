require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const officerRoutes = require('./routes/officers');
const billRoutes = require('./routes/bills');
const dispatchRoutes = require('./routes/dispatch');
const neftRoutes = require('./routes/neft');
const pumpRoutes = require('./routes/pump');
const damageRoutes = require('./routes/damage');
const reportRoutes = require('./routes/reports');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', service: 'NER Logistics API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/neft', neftRoutes);
app.use('/api/pump', pumpRoutes);
app.use('/api/damage', damageRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NER Logistics API running on port ${PORT}`);
});

module.exports = app;
