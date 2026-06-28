import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken, requireOwner } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// KANBAN PROJECTS
router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({ 
    include: { client: true, documents: true, tasks: true, finances: true, revisions: { orderBy: { createdAt: 'asc' } }, maintenanceCosts: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' } 
  });
  res.json(projects);
});

router.post('/', async (req, res) => {
  const data = req.body;
  const project = await prisma.project.create({ data, include: { client: true, revisions: true, maintenanceCosts: true } });
  res.json(project);
});

router.put('/:id', async (req, res) => {
  const id = req.params.id as string;
  const data = req.body;
  
  const project = await prisma.project.findUnique({ where: { id } });
  if (data.progressPercentage !== undefined && project) {
    const validStatuses = ['On Process', '100% Done', 'Maintenance'];
    if (!validStatuses.includes(project.status) && !validStatuses.includes(data.status)) {
      data.progressPercentage = project.progressPercentage; 
    }
  }

  const updatedProject = await prisma.project.update({ where: { id }, data, include: { client: true, revisions: { orderBy: { createdAt: 'asc' } }, maintenanceCosts: { orderBy: { createdAt: 'asc' } } } });
  res.json(updatedProject);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    await prisma.finance.deleteMany({ where: { projectId: id } });
    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.revision.deleteMany({ where: { projectId: id } });
    await prisma.maintenanceCost.deleteMany({ where: { projectId: id } });
    await prisma.document.updateMany({ where: { projectId: id }, data: { projectId: null } });
    await prisma.project.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project due to relations' });
  }
});

// SOLO PROJECTS
router.get('/solo', requireOwner, async (req, res) => {
  const projects = await prisma.soloProject.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(projects);
});

router.post('/solo', requireOwner, async (req, res) => {
  const project = await prisma.soloProject.create({ data: req.body });
  res.json(project);
});

router.put('/solo/:id', requireOwner, async (req, res) => {
  const project = await prisma.soloProject.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(project);
});

router.delete('/solo/:id', requireOwner, async (req, res) => {
  await prisma.soloProject.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

export default router;
