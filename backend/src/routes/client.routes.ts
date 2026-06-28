import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  const clients = await prisma.client.findMany({ 
    include: { documents: true, projects: true },
    orderBy: { createdAt: 'desc' } 
  });
  res.json(clients);
});

router.post('/', async (req, res) => {
  const data = req.body;
  const client = await prisma.client.create({ data });
  res.json(client);
});

router.put('/:id', async (req, res) => {
  const id = req.params.id as string;
  const data = req.body;
  const client = await prisma.client.update({ where: { id }, data });
  res.json(client);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id as string;
  await prisma.client.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
