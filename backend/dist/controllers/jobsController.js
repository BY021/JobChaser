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
// Hämta alla jobb (exakt samma kod)
const getAllJobs = async (req, res) => {
    /* ... exakt samma kod som i din server.ts ... */
};
exports.getAllJobs = getAllJobs;
// Skapa nytt jobb (exakt samma kod med decoded.userId)
const createJob = async (req, res) => {
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
                    connect: { id: decoded.userId } // Exakt som i din ursprungliga kod
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
// Spara jobb (exakt samma kod med decoded.userId)
const saveJob = async (req, res) => {
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
                    connect: { id: decoded.userId } // Exakt som i din ursprungliga kod
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
// Avspara jobb (exakt samma kod med decoded.userId)
const unsaveJob = async (req, res) => {
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
                    disconnect: { id: decoded.userId } // Exakt som i din ursprungliga kod
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
