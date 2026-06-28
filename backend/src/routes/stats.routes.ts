import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  const totalDocuments = await prisma.document.count();
  const generatedThisMonth = await prisma.document.count(); 
  res.json({
    totalDocuments,
    generatedThisMonth,
    templates: 4, 
    storageUsedMb: 12.5
  });
});

export default router;
