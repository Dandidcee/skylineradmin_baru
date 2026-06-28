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
  try {
    const data = req.body;
    const client = await prisma.client.create({ 
      data: {
        ...data,
        status: data.status || "Baru",
        request: data.request || "-",
        progress: data.progress || "0%",
        notes: data.notes || "-"
      } 
    });
    res.json(client);
  } catch (error) {
    console.error("Failed to create client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
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
