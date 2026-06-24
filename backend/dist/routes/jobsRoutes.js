"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const jobsController_1 = require("../controllers/jobsController");
const router = express_1.default.Router();
// GET /api/jobs - Hämta alla jobb (med sökfunktion)
router.get('/', jobsController_1.getAllJobs);
// POST /api/jobs - Skapa nytt jobb (endast admin)
router.post('/', uploadMiddleware_1.upload.single('logo'), jobsController_1.createJob);
// POST /api/jobs/:id/save - Spara ett jobb
router.post('/:id/save', jobsController_1.saveJob);
// DELETE /api/jobs/:id/save - Ta bort sparade jobb
router.delete('/:id/save', jobsController_1.unsaveJob);
exports.default = router;
