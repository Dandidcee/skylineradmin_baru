import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken, requireOwner } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireOwner);

router.get('/', async (req, res) => {
  const projects = await prisma.soloProject.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(projects);
});

router.post('/', async (req, res) => {
  const project = await prisma.soloProject.create({ data: req.body });
  res.json(project);
});

router.put('/:id', async (req, res) => {
  const project = await prisma.soloProject.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(project);
});

router.delete('/:id', async (req, res) => {
  await prisma.soloProject.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

export default router;
