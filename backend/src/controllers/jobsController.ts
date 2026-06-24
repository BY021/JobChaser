import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;

// Hämta alla jobb (med sökning)
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    const allJobs = await prisma.job.findMany({
      include: {
        savedBy: {
          select: { id: true }
        }
      },
      orderBy: {
        postedAt: 'desc'
      }
    });

    // Om ingen sökterm finns, returnera alla jobb
    if (!q) {
      res.json(allJobs);
      return;
    }

    // Filtrera jobb baserat på sökterm
    const searchTerm = q.toString().toLowerCase();
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
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Skapa nytt jobb
export const createJob = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Authorization token missing' });
      return;
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      res.status(403).json({ error: 'User not found' });
      return;
    }

    const { company, position, role, level, contract, location, languages = '', tools = '' } = req.body;

    let logoPath = '';
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const newFileName = `${req.file.filename}${fileExt}`;
      const newPath = path.join(__dirname, '../../uploads', newFileName);
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
};

// Spara jobb
export const saveJob = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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
};

// Ta bort sparade jobb
export const unsaveJob = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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
};