"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = exports.getSavedJobs = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
// Hämta sparade jobb (exakt samma kod)
const getSavedJobs = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'Unauthorized' });
        try {
            const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { savedJobs: true }
            });
            if (!user)
                return res.status(404).json({ error: 'User not found' });
            res.json(user.savedJobs);
        }
        catch (jwtError) {
            if (jwtError instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({ error: 'Token expired' });
            }
            throw jwtError;
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSavedJobs = getSavedJobs;
// Hämta användarinfo (exakt samma kod)
const getUserInfo = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserInfo = getUserInfo;
