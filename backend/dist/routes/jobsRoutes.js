"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
const upload = (0, multer_1.default)({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
// Exakt samma GET /api/jobs som i server.ts
router.get('/', async (req, res) => {
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
            return (job.company.toLowerCase().includes(searchTerm) ||
                job.position.toLowerCase().includes(searchTerm) ||
                job.role.toLowerCase().includes(searchTerm) ||
                job.level.toLowerCase().includes(searchTerm) ||
                job.location.toLowerCase().includes(searchTerm) ||
                job.contract.toLowerCase().includes(searchTerm) ||
                languages.some((lang) => lang.toLowerCase().includes(searchTerm)) ||
                tools.some((tool) => tool.toLowerCase().includes(searchTerm)));
        });
        res.json(filteredJobs);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Exakt samma POST /api/jobs som i server.ts
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'Authorization token missing' });
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user)
            return res.status(403).json({ error: 'User not found' });
        const { company, position, role, level, contract, location, languages = '', tools = '' } = req.body;
        let logoPath = '';
        if (req.file) {
            const fileExt = path_1.default.extname(req.file.originalname);
            const newFileName = `${req.file.filename}${fileExt}`;
            const newPath = path_1.default.join('uploads', newFileName);
            fs_1.default.renameSync(req.file.path, newPath);
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
                languages: languages ? languages.split(',').map((l) => l.trim()) : [],
                tools: tools ? tools.split(',').map((t) => t.trim()) : [],
                createdBy: {
                    connect: { id: decoded.userId }
                }
            }
        });
        res.status(201).json(newJob);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Exakt samma POST /api/jobs/:id/save som i server.ts
router.post('/:id/save', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Exakt samma POST /api/jobs/:id/unsave som i server.ts
router.post('/:id/unsave', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
