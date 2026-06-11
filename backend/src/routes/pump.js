const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const toDate = (v) => (v ? new Date(v) : null);
const toNum = (v) => (v !== '' && v != null ? v : null);

router.get('/', async (req, res) => {
  try {
    const payments = await prisma.pumpPayment.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ payments });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const payment = await prisma.pumpPayment.create({
      data: {
        paymentDate: toDate(b.paymentDate),
        accountNumber: b.accountNumber || null,
        pumpName: b.pumpName || null,
        amount: toNum(b.amount),
        ifscCode: b.ifscCode || null,
        bankName: b.bankName || null,
        location: b.location || null,
        billDated: toDate(b.billDated),
      },
    });
    res.status(201).json({ payment });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    const payment = await prisma.pumpPayment.update({
      where: { id: parseInt(req.params.id) },
      data: {
        paymentDate: toDate(b.paymentDate),
        accountNumber: b.accountNumber || null,
        pumpName: b.pumpName || null,
        amount: toNum(b.amount),
        ifscCode: b.ifscCode || null,
        bankName: b.bankName || null,
        location: b.location || null,
        billDated: toDate(b.billDated),
      },
    });
    res.json({ payment });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.pumpPayment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
