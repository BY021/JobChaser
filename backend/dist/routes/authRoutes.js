"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;
// Registrering (exakt samma kod)
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });
        res.status(201).json({ message: "Användare skapad!" });
    }
    catch (error) {
        res.status(400).json({ error: "E-post finns redan!" });
    }
});
// Inloggning (exakt samma kod)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return res.status(401).json({ error: "Ogiltiga uppgifter" });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});
exports.default = router;
