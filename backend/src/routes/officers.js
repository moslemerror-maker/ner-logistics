const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const officers = await prisma.officer.findMany({ orderBy: { name: 'asc' } });
    res.json({ officers });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', [body('name').trim().notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const officer = await prisma.officer.create({
      data: { name: req.body.name, role: req.body.role || null, accountReference: req.body.accountReference || null },
    });
    res.status(201).json({ officer });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const officer = await prisma.officer.update({
      where: { id: parseInt(req.params.id) },
      data: { name: req.body.name, role: req.body.role || null, accountReference: req.body.accountReference || null },
    });
    res.json({ officer });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.officer.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
