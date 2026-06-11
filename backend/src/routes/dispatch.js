const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const toDate = (v) => (v ? new Date(v) : null);
const toNum = (v) => (v !== '' && v != null ? v : null);

router.get('/', async (req, res) => {
  try {
    const records = await prisma.dispatchRecord.findMany({
      include: { officer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ records });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const record = await prisma.dispatchRecord.create({
      data: {
        biltySLNo: b.biltySLNo || null,
        lrNumber: b.lrNumber || null,
        billNumber: b.billNumber || null,
        billDate: toDate(b.billDate),
        dispatchDate: toDate(b.dispatchDate),
        truckNumber: b.truckNumber || null,
        loadingPoint: b.loadingPoint || null,
        destination: b.destination || null,
        weightMt: toNum(b.weightMt),
        freightRate: toNum(b.freightRate),
        totalFreight: toNum(b.totalFreight),
        cashAdvance: toNum(b.cashAdvance),
        dieselAdvance: toNum(b.dieselAdvance),
        onlineAdvance: toNum(b.onlineAdvance),
        totalAdvance: toNum(b.totalAdvance),
        balance: toNum(b.balance),
        billingRate: toNum(b.billingRate),
        portalBilling: toNum(b.portalBilling),
        margin: toNum(b.margin),
        pumpName: b.pumpName || null,
        officerId: b.officerId ? parseInt(b.officerId) : null,
        paymentOfficer: b.paymentOfficer || null,
        bpDate: toDate(b.bpDate),
        remarks: b.remarks || null,
      },
    });
    res.status(201).json({ record });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    const record = await prisma.dispatchRecord.update({
      where: { id: parseInt(req.params.id) },
      data: {
        biltySLNo: b.biltySLNo || null,
        lrNumber: b.lrNumber || null,
        billNumber: b.billNumber || null,
        billDate: toDate(b.billDate),
        dispatchDate: toDate(b.dispatchDate),
        truckNumber: b.truckNumber || null,
        loadingPoint: b.loadingPoint || null,
        destination: b.destination || null,
        weightMt: toNum(b.weightMt),
        freightRate: toNum(b.freightRate),
        totalFreight: toNum(b.totalFreight),
        cashAdvance: toNum(b.cashAdvance),
        dieselAdvance: toNum(b.dieselAdvance),
        onlineAdvance: toNum(b.onlineAdvance),
        totalAdvance: toNum(b.totalAdvance),
        balance: toNum(b.balance),
        billingRate: toNum(b.billingRate),
        portalBilling: toNum(b.portalBilling),
        margin: toNum(b.margin),
        pumpName: b.pumpName || null,
        officerId: b.officerId ? parseInt(b.officerId) : null,
        paymentOfficer: b.paymentOfficer || null,
        bpDate: toDate(b.bpDate),
        remarks: b.remarks || null,
      },
    });
    res.json({ record });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.dispatchRecord.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
