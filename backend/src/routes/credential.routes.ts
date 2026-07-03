import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// GET all credentials
router.get('/', async (req, res) => {
  try {
    const credentials = await prisma.credential.findMany({
      include: {
        client: true,
        project: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// POST new credential
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const credential = await prisma.credential.create({
      data,
      include: { client: true, project: true }
    });
    res.json(credential);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create credential' });
  }
});

// PUT update credential
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const credential = await prisma.credential.update({
      where: { id },
      data,
      include: { client: true, project: true }
    });
    res.json(credential);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update credential' });
  }
});

// DELETE credential
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    await prisma.credential.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete credential' });
  }
});

export default router;
