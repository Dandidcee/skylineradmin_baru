import { Router } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { createHash } from 'crypto';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const docs = await prisma.document.findMany({ 
      select: {
        id: true,
        title: true,
        template: true,
        status: true,
        sizeKb: true,
        createdAt: true,
        clientId: true,
        projectId: true,
        creatorId: true,
        clientSignature: true,
        client: { select: { id: true, name: true, company: true } },
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' } 
    });

    // ETag dari fingerprint: id + status + clientSignature (cukup untuk deteksi perubahan)
    const fingerprint = docs.map(d => `${d.id}:${d.status}:${d.clientSignature ?? ''}`).join('|');
    const etag = `"${createHash('md5').update(fingerprint).digest('hex')}"`;

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, no-cache');
    res.json(docs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id/file', async (req, res) => {
  const id = req.params.id as string;
  try {
    const doc = await prisma.document.findUnique({
      where: { id },
      select: { fileUrl: true, clientSignature: true }
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document file' });
  }
});

router.post('/', async (req, res) => {
  const data = req.body; 
  
  try {
    const existingDoc = await prisma.document.findFirst({
      where: { title: data.title, template: data.template }
    });
    if (existingDoc) {
      return res.status(409).json({ error: `Dokumen dengan No/Judul ${data.title} dan template ${data.template} sudah ada!` });
    }

    const { amount, ...documentData } = data;
    const doc = await prisma.document.create({ 
      data: {
        ...documentData,
        creatorId: (req as any).user?.id
      } 
    });
    
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

router.put('/:id', async (req, res) => {
  const id = req.params.id as string;
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const updated = await prisma.document.update({
      where: { id },
      data: { title }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document' });
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
