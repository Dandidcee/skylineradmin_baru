import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);



// FINANCES
router.get('/', async (req, res) => {
  try {
    const finances = await prisma.finance.findMany({ include: { project: true }, orderBy: { createdAt: 'desc' } });
    res.json(finances);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch finances" });
  }
});

router.post('/', async (req, res) => {
  try {
    // Default to null if not provided
    if (!req.body.projectId) {
      req.body.projectId = null;
    }
    
    const finance = await prisma.finance.create({ data: req.body });
    
    if (req.body.projectId && (req.body.type === 'PAYMENT_RECEIPT' || req.body.status === 'PAID')) {
      const project = await prisma.project.findUnique({ where: { id: req.body.projectId } });
      if (project && project.status === 'Waiting') {
        await prisma.project.update({
          where: { id: req.body.projectId },
          data: { status: 'On Process' }
        });
      }
    }

    if (req.body.projectId && req.body.type === 'MAINTENANCE_PAYMENT') {
      const activeCosts = await prisma.maintenanceCost.findMany({
        where: { projectId: req.body.projectId, status: 'ACTIVE' }
      });
      
      for (const cost of activeCosts) {
        const newDate = new Date(cost.nextDueDate);
        newDate.setMonth(newDate.getMonth() + 1);
        
        await prisma.maintenanceCost.update({
          where: { id: cost.id },
          data: { nextDueDate: newDate }
        });
      }
    }

    res.json(finance);
  } catch (error) {
    res.status(500).json({ error: "Failed to create finance record" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const finance = await prisma.finance.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(finance);
  } catch (error) {
    res.status(500).json({ error: "Failed to update finance record" });
  }
});

export default router;
