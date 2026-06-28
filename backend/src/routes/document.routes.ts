import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  const docs = await prisma.document.findMany({ 
    include: { client: true, project: true },
    orderBy: { createdAt: 'desc' } 
  });
  res.json(docs);
});

router.post('/', async (req, res) => {
  const data = req.body; 
  
  try {
    const { amount, ...documentData } = data;
    const doc = await prisma.document.create({ data: documentData });
    
    if (data.projectId && data.template) {
      const projectId = data.projectId;
      const type = data.template.toLowerCase();
      
      let newStatus = undefined;
      
      if (type.includes('implementation plan')) {
        newStatus = 'Discuss';
      } else if (type.includes('invoice')) {
        newStatus = 'Waiting';
        await prisma.finance.create({
          data: {
            type: 'INVOICE',
            amount: data.amount ? parseFloat(data.amount) : 0,
            status: 'PENDING',
            projectId: projectId,
            notes: 'Auto-generated from Invoice Document'
          }
        });
      } else if (type.includes('payment receipt')) {
        newStatus = 'On Process';
        await prisma.finance.create({
          data: {
            type: 'PAYMENT_RECEIPT',
            amount: data.amount ? parseFloat(data.amount) : 0,
            status: 'PAID',
            projectId: projectId,
            notes: 'Auto-generated from Payment Receipt'
          }
        });
      } else if (type.includes('handover')) {
        newStatus = '100% Done';
      } else if (type.includes('maintenance')) {
        await prisma.finance.create({
          data: {
            type: 'RECURRING',
            amount: data.amount ? parseFloat(data.amount) : 0,
            status: 'PENDING',
            projectId: projectId,
            notes: 'Auto-generated Maintenance Billing'
          }
        });
      }
      
      if (newStatus) {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: newStatus }
        });
      }
    }
    
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    await prisma.document.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
