const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/summary', async (req, res) => {
  try {
    const [
      billCount, billFreight,
      neftAgg, pumpAgg, damageAgg,
      clientCount, officerCount,
      dispatchCount, pendingClaims,
      billsByStatus,
    ] = await Promise.all([
      prisma.bill.count(),
      prisma.bill.aggregate({ _sum: { grandTotal: true } }),
      prisma.neftPayment.aggregate({ _sum: { amount: true } }),
      prisma.pumpPayment.aggregate({ _sum: { amount: true } }),
      prisma.damageRecord.aggregate({ _sum: { damageCost: true } }),
      prisma.client.count(),
      prisma.officer.count(),
      prisma.dispatchRecord.count(),
      prisma.damageRecord.count({ where: { claimStatus: 'PENDING' } }),
      prisma.bill.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    res.json({
      billCount,
      totalBilled: billFreight._sum.grandTotal,
      neftTotal: neftAgg._sum.amount,
      pumpTotal: pumpAgg._sum.amount,
      damageCost: damageAgg._sum.damageCost,
      clientCount,
      officerCount,
      dispatchCount,
      pendingClaims,
      billsByStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
