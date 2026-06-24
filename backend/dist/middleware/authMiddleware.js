"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
const authenticate = async (req, res, next) => {
    try {
        // Läs token från HttpOnly cookie istället för Authorization header
        const token = req.cookies?.authToken;
        if (!token) {
            return res.status(401).json({ error: 'Autentisering krävs' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(403).json({ error: 'Användare hittades inte' });
        }
        // Lagra userId på request för senare bruk
        req.userId = user.id;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            // Rensa cookie om token är utgången
            res.clearCookie('authToken', { path: '/' });
            return res.status(401).json({ error: 'Session utgången' });
        }
        return res.status(401).json({ error: 'Ogiltig autentisering' });
    }
};
exports.authenticate = authenticate;
