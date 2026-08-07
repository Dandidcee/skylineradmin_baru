import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/feedback/public (Public route to fetch approved testimonies)
router.get('/public', async (req, res) => {
  try {
    const feedbacks = await prisma.customerFeedback.findMany({
      where: {
        type: 'Testimoni',
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching public feedbacks:', error);
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

// POST /api/feedback (Public route for customers to submit feedback)
router.post('/', async (req, res) => {
  try {
    const { name, phone, type, message, rating } = req.body;

    if (!name || !type || !message) {
      return res.status(400).json({ error: 'Nama, Jenis (Testimoni/Keluhan), dan Pesan wajib diisi.' });
    }

    const feedback = await prisma.customerFeedback.create({
      data: {
        name,
        phone: phone || null,
        type,
        message,
        rating: rating ? parseInt(rating) : null,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Gagal mengirim formulir' });
  }
});

// GET /api/feedback (Protected route for admin to view feedback)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const feedbacks = await prisma.customerFeedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

// DELETE /api/feedback/:id (Protected route for admin to delete feedback)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id as string;
    await prisma.customerFeedback.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Gagal menghapus data' });
  }
});

// PATCH /api/feedback/:id/approve (Protected route for admin to approve/hide feedback)
router.patch('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { isApproved } = req.body;
    
    const feedback = await prisma.customerFeedback.update({
      where: { id },
      data: { isApproved },
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback approval:', error);
    res.status(500).json({ error: 'Gagal memperbarui status testimoni' });
  }
});

export default router;
