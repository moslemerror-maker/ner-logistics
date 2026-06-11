const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const toDate = (v) => (v ? new Date(v) : null);
const toNum = (v) => (v !== '' && v != null ? v : null);

router.get('/', async (req, res) => {
  try {
    const payments = await prisma.neftPayment.findMany({
      include: { officer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ payments });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const payment = await prisma.neftPayment.create({
      data: {
        paymentDate: toDate(b.paymentDate),
        biltyNumber: b.biltyNumber || null,
        vehicleNumber: b.vehicleNumber || null,
        accountNumber: b.accountNumber || null,
        beneficiaryName: b.beneficiaryName || null,
        amount: toNum(b.amount),
        ifscCode: b.ifscCode || null,
        bankName: b.bankName || null,
        remarks: b.remarks || null,
        branchName: b.branchName || null,
        phoneNumber: b.phoneNumber || null,
        officerId: b.officerId ? parseInt(b.officerId) : null,
      },
    });
    res.status(201).json({ payment });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    const payment = await prisma.neftPayment.update({
      where: { id: parseInt(req.params.id) },
      data: {
        paymentDate: toDate(b.paymentDate),
        biltyNumber: b.biltyNumber || null,
        vehicleNumber: b.vehicleNumber || null,
        accountNumber: b.accountNumber || null,
        beneficiaryName: b.beneficiaryName || null,
        amount: toNum(b.amount),
        ifscCode: b.ifscCode || null,
        bankName: b.bankName || null,
        remarks: b.remarks || null,
        branchName: b.branchName || null,
        phoneNumber: b.phoneNumber || null,
        officerId: b.officerId ? parseInt(b.officerId) : null,
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
    await prisma.neftPayment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
