import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; 

const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = process.env.JWT_SECRET as string;
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 }
});

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

//Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000', //
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));


//Registrering
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });
    res.status(201).json({ message: "Användare skapad!" });
  } catch (error) {
    res.status(400).json({ error: "E-post finns redan!" });
  }
});

//Inloggning
app.post('/api/login', async (req: any, res:any) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Ogiltiga uppgifter" });
  }
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

//Hämta alla jobb
app.get('/api/jobs', async (req: any, res: any) => {
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

    //Filtrera jobb baserat på sökterm
    const filteredJobs = allJobs.filter(job => {
      //Hantera sökterm för arrayer (languages och tools)
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

//Skapa nytt jobb
app.post('/api/jobs', upload.single('logo'), async (req: any, res: any) => {
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

//Spara ett jobb
app.post('/api/jobs/:id/save', async (req: any, res: any) => {
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

//Ta bort ett jobb från sparade jobb
app.post('/api/jobs/:id/unsave', async (req: any, res: any) => {
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

//Hämta användarens sparade jobb
app.get('/api/saved-jobs', async (req: any, res: any) => {
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

//Hämta användarinfo
app.get('/api/user', async (req: any, res: any) => {
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

// Starta servern
app.listen(3001, () => console.log('Server körs på http://localhost:3001'));