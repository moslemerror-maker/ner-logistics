const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
    res.json({ clients });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', [body('name').trim().notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, gstin, pan, address, plantName, stateCode, isInterstate } = req.body;
    const client = await prisma.client.create({
      data: { name, gstin: gstin || null, pan: pan || null, address: address || null, plantName: plantName || null, stateCode: stateCode || null, isInterstate: !!isInterstate },
    });
    res.status(201).json({ client });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, gstin, pan, address, plantName, stateCode, isInterstate } = req.body;
    const client = await prisma.client.update({
      where: { id: parseInt(req.params.id) },
      data: { name, gstin: gstin || null, pan: pan || null, address: address || null, plantName: plantName || null, stateCode: stateCode || null, isInterstate: !!isInterstate },
    });
    res.json({ client });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
