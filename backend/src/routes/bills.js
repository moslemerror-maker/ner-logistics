const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const toDate = (v) => (v ? new Date(v) : null);
const toNum = (v) => (v !== '' && v != null ? v : null);

function buildItemData(item, index) {
  return {
    slNo: parseInt(item.slNo) || index + 1,
    consignmentNote: item.consignmentNote || null,
    loadingDate: toDate(item.loadingDate),
    loadingStation: item.loadingStation || null,
    deliveryStation: item.deliveryStation || null,
    challanNo: item.challanNo || null,
    contents: item.contents || null,
    packageType: item.packageType || null,
    truckNumber: item.truckNumber || null,
    deliveryDate: toDate(item.deliveryDate),
    chargedWeightMt: toNum(item.chargedWeightMt),
    ratePerMt: toNum(item.ratePerMt),
    freightAmount: toNum(item.freightAmount),
  };
}

router.get('/', async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: { client: { select: { id: true, name: true } } },
      orderBy: { billDate: 'desc' },
    });
    res.json({ bills });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { client: true, items: { orderBy: { slNo: 'asc' } } },
    });
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json({ bill });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { items = [], ...b } = req.body;
    const bill = await prisma.bill.create({
      data: {
        billNumber: b.billNumber,
        billDate: new Date(b.billDate),
        clientId: parseInt(b.clientId),
        financialYear: b.financialYear,
        totalFreight: b.totalFreight || 0,
        igst: b.igst || 0,
        sgst: b.sgst || 0,
        cgst: b.cgst || 0,
        grandTotal: b.grandTotal || 0,
        status: b.status || 'DRAFT',
        items: { create: items.map(buildItemData) },
      },
      include: { client: true, items: true },
    });
    res.status(201).json({ bill });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Bill number already exists' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { items = [], ...b } = req.body;
    const bill = await prisma.$transaction(async (tx) => {
      await tx.billItem.deleteMany({ where: { billId: id } });
      return tx.bill.update({
        where: { id },
        data: {
          billNumber: b.billNumber,
          billDate: new Date(b.billDate),
          clientId: parseInt(b.clientId),
          financialYear: b.financialYear,
          totalFreight: b.totalFreight || 0,
          igst: b.igst || 0,
          sgst: b.sgst || 0,
          cgst: b.cgst || 0,
          grandTotal: b.grandTotal || 0,
          status: b.status || 'DRAFT',
          items: { create: items.map(buildItemData) },
        },
        include: { client: true, items: true },
      });
    });
    res.json({ bill });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.bill.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
