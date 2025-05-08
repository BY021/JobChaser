import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;
// GET /api/jobs
router.get('/', async (req: any, res: any) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      const allJobs = await prisma.job.findMany({
        include: {
          savedBy: {
            select: { id: true }
          }
        }
      });
      return res.json(allJobs);
    }

    const searchTerm = q.toString().toLowerCase();

    const allJobs = await prisma.job.findMany({
      include: {
        savedBy: {
          select: { id: true }
        }
      }
    });

    const filteredJobs = allJobs.filter(job => {
      const languages = job.languages ? JSON.parse(JSON.stringify(job.languages)) : [];
      const tools = job.tools ? JSON.parse(JSON.stringify(job.tools)) : [];
      
      return (
        job.company.toLowerCase().includes(searchTerm) ||
        job.position.toLowerCase().includes(searchTerm) ||
        job.role.toLowerCase().includes(searchTerm) ||
        job.level.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.contract.toLowerCase().includes(searchTerm) ||
        languages.some((lang: string) => lang.toLowerCase().includes(searchTerm)) ||
        tools.some((tool: string) => tool.toLowerCase().includes(searchTerm))
      );
    });

    res.json(filteredJobs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/jobs
router.post('/', upload.single('logo'), async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization token missing' });

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(403).json({ error: 'User not found' });

    const { company, position, role, level, contract, location, languages = '', tools = '' } = req.body;

    let logoPath = '';
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const newFileName = `${req.file.filename}${fileExt}`;
      const newPath = path.join('uploads', newFileName);
      fs.renameSync(req.file.path, newPath);
      logoPath = `/uploads/${newFileName}`;
    }

    const newJob = await prisma.job.create({
      data: {
        company,
        logo: logoPath,
        position,
        role, 
        level,
        postedAt: new Date(),
        contract,
        location,
        languages: languages ? languages.split(',').map((l: string) => l.trim()) : [],
        tools: tools ? tools.split(',').map((t: string) => t.trim()) : [],
        createdBy: {
          connect: { id: decoded.userId }
        }
      }
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/jobs/:id/save
router.post('/:id/save', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const jobId = parseInt(req.params.id);

    await prisma.job.update({
      where: { id: jobId },
      data: {
        savedBy: {
          connect: { id: decoded.userId }
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/jobs/:id/unsave
router.post('/:id/unsave', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const jobId = parseInt(req.params.id);

    await prisma.job.update({
      where: { id: jobId },
      data: {
        savedBy: {
          disconnect: { id: decoded.userId }
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;