const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const toDate = (v) => (v ? new Date(v) : null);
const toNum = (v) => (v !== '' && v != null ? v : null);

router.get('/', async (req, res) => {
  try {
    const records = await prisma.damageRecord.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ records });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const record = await prisma.damageRecord.create({
      data: {
        incidentDate: toDate(b.incidentDate),
        truckNumber: b.truckNumber || null,
        loadingPoint: b.loadingPoint || null,
        destination: b.destination || null,
        totalQty: toNum(b.totalQty),
        damagedQty: toNum(b.damagedQty),
        advanceLoss: toNum(b.advanceLoss),
        damageCost: toNum(b.damageCost),
        otherExpenses: toNum(b.otherExpenses),
        materialTranship: toNum(b.materialTranship),
        cementSale: toNum(b.cementSale),
        balance: toNum(b.balance),
        claimReceived: toNum(b.claimReceived),
        recoveredFromOfficials: toNum(b.recoveredFromOfficials),
        lossToRecover: toNum(b.lossToRecover),
        dispatchOfficer: b.dispatchOfficer || null,
        incidentType: b.incidentType || null,
        claimStatus: b.claimStatus || 'PENDING',
        remarks: b.remarks || null,
      },
    });
    res.status(201).json({ record });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    const record = await prisma.damageRecord.update({
      where: { id: parseInt(req.params.id) },
      data: {
        incidentDate: toDate(b.incidentDate),
        truckNumber: b.truckNumber || null,
        loadingPoint: b.loadingPoint || null,
        destination: b.destination || null,
        totalQty: toNum(b.totalQty),
        damagedQty: toNum(b.damagedQty),
        advanceLoss: toNum(b.advanceLoss),
        damageCost: toNum(b.damageCost),
        otherExpenses: toNum(b.otherExpenses),
        materialTranship: toNum(b.materialTranship),
        cementSale: toNum(b.cementSale),
        balance: toNum(b.balance),
        claimReceived: toNum(b.claimReceived),
        recoveredFromOfficials: toNum(b.recoveredFromOfficials),
        lossToRecover: toNum(b.lossToRecover),
        dispatchOfficer: b.dispatchOfficer || null,
        incidentType: b.incidentType || null,
        claimStatus: b.claimStatus || 'PENDING',
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
    await prisma.damageRecord.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
