import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken, requireOwner } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// KANBAN PROJECTS
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ 
      include: { 
        client: true, 
        documents: {
          omit: { fileUrl: true, clientSignature: true }
        }, 
        tasks: true, 
        finances: true, 
        revisions: { orderBy: { createdAt: 'asc' } }, 
        maintenanceCosts: { orderBy: { createdAt: 'asc' } } 
      },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const project = await prisma.project.create({ data, include: { client: true, revisions: true, maintenanceCosts: true } });
    
    try {
      const numericPrice = parseFloat(String(data.price || "0").replace(/\D/g, "")) || 0;
      if (numericPrice > 0) {
        await prisma.finance.create({
          data: {
            type: 'PROJECT_FEE',
            amount: numericPrice,
            status: 'PENDING',
            projectId: project.id,
            notes: `Tagihan Proyek Utama: ${project.name}`
          }
        });
      }
    } catch (error) {
      console.error("Gagal membuat auto finance record", error);
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.put('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
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
  try {
    const projects = await prisma.soloProject.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch solo projects" });
  }
});

router.post('/solo', requireOwner, async (req, res) => {
  try {
    const project = await prisma.soloProject.create({ data: req.body });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create solo project" });
  }
});

router.put('/solo/:id', requireOwner, async (req, res) => {
  try {
    const project = await prisma.soloProject.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to update solo project" });
  }
});

router.delete('/solo/:id', requireOwner, async (req, res) => {
  try {
    await prisma.soloProject.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete solo project" });
  }
});

export default router;
