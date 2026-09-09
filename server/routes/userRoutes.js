import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserStatus,
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected routes - all require authentication
router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Admin only routes
router.get('/', roleMiddleware('admin'), getAllUsers);
router.put('/:userId/status', roleMiddleware('admin'), updateUserStatus);

export default router;
