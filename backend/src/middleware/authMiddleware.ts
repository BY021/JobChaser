import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;

// Extend Express Request type för att inkludera userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Läs token från HttpOnly cookie istället för Authorization header
    const token = req.cookies?.authToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Autentisering krävs' });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) {
      return res.status(403).json({ error: 'Användare hittades inte' });
    }

    // Lagra userId på request för senare bruk
    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // Rensa cookie om token är utgången
      res.clearCookie('authToken', { path: '/' });
      return res.status(401).json({ error: 'Session utgången' });
    }
    return res.status(401).json({ error: 'Ogiltig autentisering' });
  }
};