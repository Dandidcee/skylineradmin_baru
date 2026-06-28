import { Router } from 'express';
import prisma from '../config/db';

const router = Router();

// GET public document by ID
router.get('/documents/:id', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        client: {
          select: { name: true, company: true }
        },
        project: {
          select: { name: true }
        }
      }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(doc);
  } catch (error) {
    console.error('Error fetching public document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST signature to a document
router.post('/documents/:id/sign', async (req, res) => {
  try {
    const { signature } = req.body;
    
    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    const doc = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.clientSignature) {
      return res.status(400).json({ error: 'Document is already signed' });
    }

    const updatedDoc = await prisma.document.update({
      where: { id: req.params.id },
      data: { clientSignature: signature }
    });

    res.json(updatedDoc);
  } catch (error) {
    console.error('Error signing document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
