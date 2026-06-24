import express from 'express';
import { register, login, logout } from '../controllers/authController';

const router = express.Router();

// POST /api/auth/register - Registrera ny användare
router.post('/register', register);

// POST /api/auth/login - Logga in
router.post('/login', login);

// POST /api/auth/logout - Logga ut
router.post('/logout', logout);

export default router;
