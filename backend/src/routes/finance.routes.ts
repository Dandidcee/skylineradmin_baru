import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);



// FINANCES
router.get('/', async (req, res) => {
  const finances = await prisma.finance.findMany({ include: { project: true }, orderBy: { createdAt: 'desc' } });
  res.json(finances);
});

router.post('/', async (req, res) => {
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
});

router.put('/:id', async (req, res) => {
  const finance = await prisma.finance.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(finance);
});

export default router;
