import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;

// Hämta alla jobb
export const getAllJobs = async (req: Request, res: Response) => {
};

// Skapa nytt jobb
export const createJob = async (req: Request, res: Response) => {
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
};

// Ta bort sparade jobb
export const unsaveJob = async (req: Request, res: Response) => {
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
};