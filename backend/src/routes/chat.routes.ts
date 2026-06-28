import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  const messages = await prisma.chatMessage.findMany({ include: { sender: true }, orderBy: { createdAt: 'asc' } });
  res.json(messages);
});

router.post('/', async (req: AuthRequest, res) => {
  const data = { ...req.body, senderId: req.user.id };
  const msg = await prisma.chatMessage.create({ data, include: { sender: true } });
  res.json(msg);
});

export default router;
