import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
  const { email, password, confirmPassword } = req.body;

  // Validera input
  if (!email || !password || !confirmPassword) {
    res.status(400).json({ error: "Alla fält krävs" });
    return;
  }

  // Validera lösenord format
  if (password.length < 8) {
    res.status(400).json({ error: "Lösenord måste vara minst 8 tecken långt" });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: "Lösenorden matchar inte" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12); // Använd 12 salt rounds för bättre säkerhet
    
    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword,
        role: 'user' // Default role
      }
    });

    // Logga in användaren direkt efter registrering
    const token = jwt.sign({ userId: newUser.id }, SECRET_KEY, { expiresIn: '24h' });
    
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.status(201).json({ 
      message: "Användare skapad och inloggad!",
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
      token
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: "E-postadressen finns redan registrerad" });
    } else {
      res.status(500).json({ error: "Kunde inte skapa användare" });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('authToken', { path: '/' });
  res.json({ message: "Utloggad" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validera input
  if (!email || !password) {
    res.status(400).json({ error: "Email och lösenord krävs" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Ogiltiga uppgifter" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '24h' });
    
    // Sätt HttpOnly cookie istället för att skicka token i response body
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS endast i produktion
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 timmar
      path: '/'
    });

    res.json({ 
      message: "Inloggad",
      user: { id: user.id, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Internt serverfel" });
  }
};