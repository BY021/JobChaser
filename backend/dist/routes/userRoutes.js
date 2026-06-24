"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// GET /api/user/saved-jobs - Hämta användarens sparade jobb
router.get('/saved-jobs', userController_1.getSavedJobs);
// GET /api/user - Hämta användarinfo
router.get('/', userController_1.getUserInfo);
exports.default = router;
