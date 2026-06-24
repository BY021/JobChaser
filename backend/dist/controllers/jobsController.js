"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsaveJob = exports.saveJob = exports.createJob = exports.getAllJobs = void 0;
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
// Hämta alla jobb (med sökning)
const getAllJobs = async (req, res) => {
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
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllJobs = getAllJobs;
// Skapa nytt jobb
const createJob = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Authorization token missing' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(403).json({ error: 'User not found' });
            return;
        }
        const { company, position, role, level, contract, location, languages = '', tools = '' } = req.body;
        let logoPath = '';
        if (req.file) {
            const fileExt = path_1.default.extname(req.file.originalname);
            const newFileName = `${req.file.filename}${fileExt}`;
            const newPath = path_1.default.join(__dirname, '../../uploads', newFileName);
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
};
exports.createJob = createJob;
// Spara jobb
const saveJob = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
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
};
exports.saveJob = saveJob;
// Ta bort sparade jobb
const unsaveJob = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
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
};
exports.unsaveJob = unsaveJob;
