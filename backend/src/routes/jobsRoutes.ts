import express from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { getAllJobs, createJob, saveJob, unsaveJob } from '../controllers/jobsController';

const router = express.Router();

// GET /api/jobs - Hämta alla jobb (med sökfunktion)
router.get('/', getAllJobs);

// POST /api/jobs - Skapa nytt jobb (endast admin)
router.post('/', upload.single('logo'), createJob);

// POST /api/jobs/:id/save - Spara ett jobb
router.post('/:id/save', saveJob);

// DELETE /api/jobs/:id/save - Ta bort sparade jobb
router.delete('/:id/save', unsaveJob);

export default router;
