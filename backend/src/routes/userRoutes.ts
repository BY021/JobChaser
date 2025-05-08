import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;

// GET /api/saved-jobs
router.get('/saved-jobs', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { savedJobs: true }
      });

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json(user.savedJobs);
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      throw jwtError;
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user
router.get('/', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;