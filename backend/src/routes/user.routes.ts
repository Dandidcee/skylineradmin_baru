import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { authenticateToken, requireOwner, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, requireOwner, async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const safeUsers = users.map(u => {
    const { password, ...rest } = u;
    return rest;
  });
  res.json(safeUsers);
});

router.post('/', authenticateToken, requireOwner, async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: role || 'ADMIN', 
        permissions: JSON.stringify(permissions || [])
      }
    });
    
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = req.user.id;
    const { name, password, photoUrl } = req.body;
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (photoUrl !== undefined) dataToUpdate.photoUrl = photoUrl;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });
    
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/:id', authenticateToken, requireOwner, async (req, res) => {
  const id = req.params.id as string;
  const { name, email, password, role, permissions } = req.body;
  
  try {
    const dataToUpdate: any = { name, email, role };
    if (permissions) {
      dataToUpdate.permissions = JSON.stringify(permissions);
    }
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });
    
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
