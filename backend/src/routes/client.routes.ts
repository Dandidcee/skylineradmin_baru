import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ 
      include: { documents: true, projects: true, creator: true },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
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
        notes: data.notes || "-",
        creatorId: (req as any).user?.id
      } 
    });
    res.json(client);
  } catch (error) {
    console.error("Failed to create client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const client = await prisma.client.update({ where: { id }, data });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to update client" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    // We should not delete client if it has associated projects, but prisma will throw ForeignKeyConstraint error
    await prisma.client.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') { // Foreign key constraint violation
      res.status(400).json({ error: "Gagal menghapus Klien karena masih ada Proyek atau Dokumen yang terkait." });
    } else {
      res.status(500).json({ error: "Failed to delete client" });
    }
  }
});

export default router;
