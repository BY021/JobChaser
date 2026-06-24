"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.logout = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
const register = async (req, res) => {
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 12); // Använd 12 salt rounds för bättre säkerhet
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'user' // Default role
            }
        });
        // Logga in användaren direkt efter registrering
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, SECRET_KEY, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Register error:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ error: "E-postadressen finns redan registrerad" });
        }
        else {
            res.status(500).json({ error: "Kunde inte skapa användare" });
        }
    }
};
exports.register = register;
const logout = async (req, res) => {
    res.clearCookie('authToken', { path: '/' });
    res.json({ message: "Utloggad" });
};
exports.logout = logout;
const login = async (req, res) => {
    const { email, password } = req.body;
    // Validera input
    if (!email || !password) {
        res.status(400).json({ error: "Email och lösenord krävs" });
        return;
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ error: "Ogiltiga uppgifter" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Internt serverfel" });
    }
};
exports.login = login;
