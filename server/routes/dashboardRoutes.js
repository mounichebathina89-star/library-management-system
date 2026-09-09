import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin only route
router.get('/stats', authMiddleware, roleMiddleware('admin'), getDashboardStats);

export default router;
