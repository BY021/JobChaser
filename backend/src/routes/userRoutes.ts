import express from 'express';
import { getSavedJobs, getUserInfo } from '../controllers/userController';

const router = express.Router();

// GET /api/user/saved-jobs - Hämta användarens sparade jobb
router.get('/saved-jobs', getSavedJobs);

// GET /api/user - Hämta användarinfo
router.get('/', getUserInfo);

export default router;
