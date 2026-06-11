const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication + super admin
router.use(authenticateToken, requireSuperAdmin);

// List all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user
router.post(
  '/',
  [
    body('username').trim().notEmpty().withMessage('Username is required')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, underscores'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['SUPER_ADMIN', 'ADMIN', 'OPERATOR']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, name, password, role = 'OPERATOR' } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, name, password: hashed, role },
        select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true },
      });
      res.status(201).json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update user (name, role, isActive)
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('role').optional().isIn(['SUPER_ADMIN', 'ADMIN', 'OPERATOR']),
    body('isActive').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const { name, role, isActive } = req.body;

    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(isActive !== undefined && { isActive }),
        },
        select: { id: true, username: true, name: true, role: true, isActive: true },
      });
      res.json({ user });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Change a user's password
router.put(
  '/:id/password',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const hashed = await bcrypt.hash(req.body.password, 10);

    try {
      await prisma.user.update({ where: { id }, data: { password: hashed } });
      res.json({ message: 'Password updated' });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete user (cannot delete yourself)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
