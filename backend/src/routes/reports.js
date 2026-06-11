const express = require('express');
const XLSX = require('xlsx');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// ─── helpers ────────────────────────────────────────────────────────────────

function mkDateFilter(from, to) {
  if (!from && !to) return undefined;
  const f = {};
  if (from) f.gte = new Date(from);
  if (to) { const d = new Date(to); d.setHours(23, 59, 59, 999); f.lte = d; }
  return f;
}

function fDate(v) {
  return v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
}

function fNum(v) {
  if (v == null || v === '') return '';
  const n = parseFloat(String(v));
  return isNaN(n) ? '' : n;
}

function makeSheet(rows, cols) {
  if (!rows.length) {
    const ws = XLSX.utils.aoa_to_sheet([cols.map(c => c.h)]);
    ws['!cols'] = cols.map(c => ({ wch: c.w || 16 }));
    return ws;
  }
  const data = [cols.map(c => c.h), ...rows.map(r => cols.map(c => c.v(r)))];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = cols.map(c => ({ wch: c.w || 16 }));
  return ws;
}

// ─── column definitions ──────────────────────────────────────────────────────

const BILL_COLS = [
  { h: 'Bill #',        v: r => r.billNumber,               w: 14 },
  { h: 'Bill Date',     v: r => fDate(r.billDate),           w: 14 },
  { h: 'Client',        v: r => r.client?.name || '',        w: 28 },
  { h: 'Financial Year',v: r => r.financialYear,             w: 14 },
  { h: 'Total Freight', v: r => fNum(r.totalFreight),        w: 14 },
  { h: 'IGST',          v: r => fNum(r.igst),                w: 12 },
  { h: 'SGST',          v: r => fNum(r.sgst),                w: 12 },
  { h: 'CGST',          v: r => fNum(r.cgst),                w: 12 },
  { h: 'Grand Total',   v: r => fNum(r.grandTotal),          w: 14 },
  { h: 'Status',        v: r => r.status,                    w: 10 },
];

const BILL_ITEM_COLS = [
  { h: 'Bill #',            v: r => r.bill?.billNumber || '',  w: 14 },
  { h: 'SL No',             v: r => r.slNo,                    w: 7 },
  { h: 'Consignment Note',  v: r => r.consignmentNote || '',   w: 18 },
  { h: 'Loading Date',      v: r => fDate(r.loadingDate),      w: 14 },
  { h: 'Loading Station',   v: r => r.loadingStation || '',    w: 18 },
  { h: 'Delivery Station',  v: r => r.deliveryStation || '',   w: 18 },
  { h: 'Challan No',        v: r => r.challanNo || '',         w: 14 },
  { h: 'Contents',          v: r => r.contents || '',          w: 18 },
  { h: 'Package Type',      v: r => r.packageType || '',       w: 14 },
  { h: 'Truck #',           v: r => r.truckNumber || '',       w: 12 },
  { h: 'Delivery Date',     v: r => fDate(r.deliveryDate),     w: 14 },
  { h: 'Weight (MT)',       v: r => fNum(r.chargedWeightMt),   w: 12 },
  { h: 'Rate/MT',           v: r => fNum(r.ratePerMt),         w: 10 },
  { h: 'Freight Amt',       v: r => fNum(r.freightAmount),     w: 13 },
];

const DISPATCH_COLS = [
  { h: 'Bilty SL No',     v: r => r.biltySLNo || '',          w: 12 },
  { h: 'LR Number',       v: r => r.lrNumber || '',           w: 14 },
  { h: 'Bill Number',     v: r => r.billNumber || '',         w: 14 },
  { h: 'Bill Date',       v: r => fDate(r.billDate),          w: 14 },
  { h: 'Dispatch Date',   v: r => fDate(r.dispatchDate),      w: 14 },
  { h: 'Truck #',         v: r => r.truckNumber || '',        w: 12 },
  { h: 'Loading Point',   v: r => r.loadingPoint || '',       w: 18 },
  { h: 'Destination',     v: r => r.destination || '',        w: 18 },
  { h: 'Weight (MT)',     v: r => fNum(r.weightMt),           w: 12 },
  { h: 'Freight Rate',    v: r => fNum(r.freightRate),        w: 13 },
  { h: 'Total Freight',   v: r => fNum(r.totalFreight),       w: 14 },
  { h: 'Cash Advance',    v: r => fNum(r.cashAdvance),        w: 13 },
  { h: 'Diesel Advance',  v: r => fNum(r.dieselAdvance),      w: 14 },
  { h: 'Online Advance',  v: r => fNum(r.onlineAdvance),      w: 14 },
  { h: 'Total Advance',   v: r => fNum(r.totalAdvance),       w: 14 },
  { h: 'Balance',         v: r => fNum(r.balance),            w: 12 },
  { h: 'Billing Rate',    v: r => fNum(r.billingRate),        w: 13 },
  { h: 'Portal Billing',  v: r => fNum(r.portalBilling),      w: 14 },
  { h: 'Margin',          v: r => fNum(r.margin),             w: 10 },
  { h: 'Pump Name',       v: r => r.pumpName || '',           w: 16 },
  { h: 'Officer',         v: r => r.officer?.name || '',      w: 18 },
  { h: 'Payment Officer', v: r => r.paymentOfficer || '',     w: 16 },
  { h: 'BP Date',         v: r => fDate(r.bpDate),            w: 12 },
  { h: 'Remarks',         v: r => r.remarks || '',            w: 22 },
];

const NEFT_COLS = [
  { h: 'Payment Date',    v: r => fDate(r.paymentDate),       w: 14 },
  { h: 'Bilty #',         v: r => r.biltyNumber || '',        w: 14 },
  { h: 'Vehicle #',       v: r => r.vehicleNumber || '',      w: 13 },
  { h: 'Account #',       v: r => r.accountNumber || '',      w: 18 },
  { h: 'Beneficiary',     v: r => r.beneficiaryName || '',    w: 24 },
  { h: 'Amount',          v: r => fNum(r.amount),             w: 13 },
  { h: 'IFSC Code',       v: r => r.ifscCode || '',           w: 13 },
  { h: 'Bank Name',       v: r => r.bankName || '',           w: 18 },
  { h: 'Branch Name',     v: r => r.branchName || '',         w: 18 },
  { h: 'Phone',           v: r => r.phoneNumber || '',        w: 14 },
  { h: 'Officer',         v: r => r.officer?.name || '',      w: 18 },
  { h: 'Remarks',         v: r => r.remarks || '',            w: 22 },
];

const PUMP_COLS = [
  { h: 'Payment Date',  v: r => fDate(r.paymentDate),  w: 14 },
  { h: 'Account #',     v: r => r.accountNumber || '', w: 18 },
  { h: 'Pump Name',     v: r => r.pumpName || '',      w: 20 },
  { h: 'Amount',        v: r => fNum(r.amount),         w: 13 },
  { h: 'IFSC Code',     v: r => r.ifscCode || '',       w: 13 },
  { h: 'Bank Name',     v: r => r.bankName || '',       w: 18 },
  { h: 'Location',      v: r => r.location || '',       w: 18 },
  { h: 'Bill Dated',    v: r => fDate(r.billDated),     w: 12 },
];

const DAMAGE_COLS = [
  { h: 'Incident Date',      v: r => fDate(r.incidentDate),          w: 14 },
  { h: 'Truck #',            v: r => r.truckNumber || '',             w: 12 },
  { h: 'Loading Point',      v: r => r.loadingPoint || '',            w: 18 },
  { h: 'Destination',        v: r => r.destination || '',             w: 18 },
  { h: 'Total Qty',          v: r => fNum(r.totalQty),                w: 11 },
  { h: 'Damaged Qty',        v: r => fNum(r.damagedQty),              w: 12 },
  { h: 'Advance Loss',       v: r => fNum(r.advanceLoss),             w: 13 },
  { h: 'Damage Cost',        v: r => fNum(r.damageCost),              w: 13 },
  { h: 'Other Expenses',     v: r => fNum(r.otherExpenses),           w: 14 },
  { h: 'Material Tranship',  v: r => fNum(r.materialTranship),        w: 16 },
  { h: 'Cement Sale',        v: r => fNum(r.cementSale),              w: 13 },
  { h: 'Balance',            v: r => fNum(r.balance),                 w: 12 },
  { h: 'Claim Received',     v: r => fNum(r.claimReceived),           w: 14 },
  { h: 'Recovered Officials',v: r => fNum(r.recoveredFromOfficials),  w: 18 },
  { h: 'Loss to Recover',    v: r => fNum(r.lossToRecover),           w: 15 },
  { h: 'Dispatch Officer',   v: r => r.dispatchOfficer || '',         w: 17 },
  { h: 'Incident Type',      v: r => r.incidentType || '',            w: 15 },
  { h: 'Claim Status',       v: r => r.claimStatus,                   w: 13 },
  { h: 'Remarks',            v: r => r.remarks || '',                 w: 22 },
];

// ─── summary route ───────────────────────────────────────────────────────────

router.get('/summary', async (req, res) => {
  try {
    const [billCount, billFreight, neftAgg, pumpAgg, damageAgg, clientCount, officerCount, dispatchCount, pendingClaims, billsByStatus] = await Promise.all([
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
    res.json({ billCount, totalBilled: billFreight._sum.grandTotal, neftTotal: neftAgg._sum.amount, pumpTotal: pumpAgg._sum.amount, damageCost: damageAgg._sum.damageCost, clientCount, officerCount, dispatchCount, pendingClaims, billsByStatus });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// ─── download route ──────────────────────────────────────────────────────────

router.get('/download', async (req, res) => {
  const { type = 'accumulated', from, to, status, claimStatus, clientId, financialYear, officerId } = req.query;

  try {
    const wb = XLSX.utils.book_new();
    const df = mkDateFilter(from, to);

    // ── Bills ──
    if (type === 'bills' || type === 'accumulated') {
      const where = {
        ...(df && { billDate: df }),
        ...(status && { status }),
        ...(clientId && { clientId: parseInt(clientId) }),
        ...(financialYear && { financialYear }),
      };
      const bills = await prisma.bill.findMany({ where, include: { client: { select: { name: true } } }, orderBy: { billDate: 'asc' } });
      XLSX.utils.book_append_sheet(wb, makeSheet(bills, BILL_COLS), 'Bills');

      if (type === 'accumulated') {
        const items = await prisma.billItem.findMany({
          where: df ? { bill: { billDate: df } } : undefined,
          include: { bill: { select: { billNumber: true } } },
          orderBy: { billId: 'asc' },
        });
        XLSX.utils.book_append_sheet(wb, makeSheet(items, BILL_ITEM_COLS), 'Bill Items');
      }
    }

    // ── Dispatch ──
    if (type === 'dispatch' || type === 'accumulated') {
      const where = {
        ...(df && { dispatchDate: df }),
        ...(officerId && { officerId: parseInt(officerId) }),
      };
      const records = await prisma.dispatchRecord.findMany({ where, include: { officer: { select: { name: true } } }, orderBy: { dispatchDate: 'asc' } });
      XLSX.utils.book_append_sheet(wb, makeSheet(records, DISPATCH_COLS), 'Dispatch');
    }

    // ── NEFT ──
    if (type === 'neft' || type === 'accumulated') {
      const where = {
        ...(df && { paymentDate: df }),
        ...(officerId && { officerId: parseInt(officerId) }),
      };
      const payments = await prisma.neftPayment.findMany({ where, include: { officer: { select: { name: true } } }, orderBy: { paymentDate: 'asc' } });
      XLSX.utils.book_append_sheet(wb, makeSheet(payments, NEFT_COLS), 'NEFT Payments');
    }

    // ── Pump ──
    if (type === 'pump' || type === 'accumulated') {
      const where = { ...(df && { paymentDate: df }) };
      const payments = await prisma.pumpPayment.findMany({ where, orderBy: { paymentDate: 'asc' } });
      XLSX.utils.book_append_sheet(wb, makeSheet(payments, PUMP_COLS), 'Pump Payments');
    }

    // ── Damage ──
    if (type === 'damage' || type === 'accumulated') {
      const where = {
        ...(df && { incidentDate: df }),
        ...(claimStatus && { claimStatus }),
      };
      const records = await prisma.damageRecord.findMany({ where, orderBy: { incidentDate: 'asc' } });
      XLSX.utils.book_append_sheet(wb, makeSheet(records, DAMAGE_COLS), 'Damage & Insurance');
    }

    // ── Summary sheet (accumulated only) ──
    if (type === 'accumulated') {
      const [bf, na, pa, da] = await Promise.all([
        prisma.bill.aggregate({ _sum: { grandTotal: true }, where: df ? { billDate: df } : undefined }),
        prisma.neftPayment.aggregate({ _sum: { amount: true }, where: df ? { paymentDate: df } : undefined }),
        prisma.pumpPayment.aggregate({ _sum: { amount: true }, where: df ? { paymentDate: df } : undefined }),
        prisma.damageRecord.aggregate({ _sum: { damageCost: true }, where: df ? { incidentDate: df } : undefined }),
      ]);

      const summaryRows = [
        ['Report', 'North East Roadways — Accumulated Report'],
        ['Generated', fDate(new Date())],
        ['Date Range', `${from || 'All'} to ${to || 'All'}`],
        [],
        ['Module', 'Total (₹)'],
        ['Bills (Grand Total)', fNum(bf._sum.grandTotal)],
        ['NEFT Payments', fNum(na._sum.amount)],
        ['Pump Payments', fNum(pa._sum.amount)],
        ['Damage Cost', fNum(da._sum.damageCost)],
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
      summaryWs['!cols'] = [{ wch: 28 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      // Move Summary to first position
      wb.SheetNames = ['Summary', ...wb.SheetNames.filter(s => s !== 'Summary')];
    }

    if (wb.SheetNames.length === 0) {
      return res.status(400).json({ error: 'No sheets generated. Check your report type.' });
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const label = type === 'accumulated' ? 'Accumulated' : type.charAt(0).toUpperCase() + type.slice(1);
    const filename = `NER_${label}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
