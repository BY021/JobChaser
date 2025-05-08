"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const jobsRoutes_1 = __importDefault(require("./routes/jobsRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
// Middleware (exakt samma)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
// Routes (nu med prefix)
app.use('/api/auth', authRoutes_1.default);
app.use('/api/jobs', jobsRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
// Starta servern
app.listen(3001, () => console.log('Server körs på http://localhost:3001'));
